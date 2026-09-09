import {runAiChat} from '@/lib/ai/service';
import {AI_ASSISTANT_CONFIG, getServerAiEnv} from '@/lib/ai/config';
import {sanitizeMessage} from '@/lib/ai/sanitize';
import {detectLanguage} from '@/lib/ai/language';

export const runtime = 'nodejs';

const buckets = new Map();

function rateLimit(key, limit = 40, windowMs = 60_000) {
  const now = Date.now();
  const entry = buckets.get(key) || {count: 0, reset: now + windowMs};
  if (now > entry.reset) {
    entry.count = 0;
    entry.reset = now + windowMs;
  }
  entry.count += 1;
  buckets.set(key, entry);
  return entry.count <= limit;
}

export async function POST(request) {
  try {
    if (!AI_ASSISTANT_CONFIG.enabled || !AI_ASSISTANT_CONFIG.textChatEnabled) {
      return Response.json({error: 'AI text chat disabled.'}, {status: 503});
    }

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'anon';

    if (!rateLimit(`ai-chat:${ip}`)) {
      return Response.json({error: 'Too many requests. Please wait a moment.'}, {status: 429});
    }

    const body = await request.json().catch(() => ({}));
    const siteLocale = body?.siteLocale === 'ar' ? 'ar' : 'en';
    const rawMessage = String(body?.message || '');
    const env = getServerAiEnv();
    const maxLen = env.maxMessageLength || AI_ASSISTANT_CONFIG.maxMessageLength;

    if (rawMessage.length > maxLen) {
      const language = detectLanguage(rawMessage, siteLocale);
      return Response.json(
        {error: language === 'ar' ? 'الرسالة طويلة جداً.' : 'Message is too long.'},
        {status: 400},
      );
    }

    const message = sanitizeMessage(rawMessage);
    const conversationId = String(body?.conversationId || '').slice(0, 80) || undefined;
    const history = Array.isArray(body?.history) ? body.history : [];

    // Frontend cannot override model / tools / search — ignored if sent.
    void body?.model;
    void body?.systemPrompt;
    void body?.externalSearch;

    const result = await runAiChat({
      message,
      history,
      conversationId,
      siteLocale,
    });

    return Response.json({
      message: result.message,
      language: result.language,
      sourceType: result.sourceType,
      sources: result.sources || [],
      suggestions: result.suggestions || [],
      conversationId: result.conversationId || conversationId || null,
      provider: result.provider || null,
    });
  } catch (error) {
    console.error('[api/ai/chat]', error);
    return Response.json({error: 'Unable to process AI message.'}, {status: 500});
  }
}
