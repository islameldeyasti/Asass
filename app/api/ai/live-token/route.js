import {AI_ASSISTANT_CONFIG, getPublicAiConfig, getServerAiEnv} from '@/lib/ai/config';
import {getAIProvider} from '@/lib/ai/providers';
import {sanitizeHistory} from '@/lib/ai/sanitize';

export const runtime = 'nodejs';

const buckets = new Map();

function rateLimit(key, limit = 12, windowMs = 60_000) {
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
    const publicConfig = getPublicAiConfig();
    if (!AI_ASSISTANT_CONFIG.enabled || !publicConfig.liveVoiceEnabled) {
      return Response.json({error: 'Live voice is disabled.', code: 'disabled'}, {status: 503});
    }

    const env = getServerAiEnv();
    if (!env.geminiApiKey) {
      return Response.json(
        {
          error: 'GEMINI_API_KEY is not configured on the server.',
          code: 'missing_key',
        },
        {status: 503},
      );
    }

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'anon';

    if (!rateLimit(`ai-live:${ip}`)) {
      return Response.json({error: 'Too many voice session requests.', code: 'rate_limit'}, {status: 429});
    }

    const body = await request.json().catch(() => ({}));
    const siteLocale = body?.siteLocale === 'ar' ? 'ar' : 'en';
    const conversationId = String(body?.conversationId || '').slice(0, 80) || undefined;
    const history = sanitizeHistory(body?.history || [], 8);

    // Ignore client attempts to choose model / prompts / tools.
    void body?.model;
    void body?.systemPrompt;
    void body?.tools;

    const provider = getAIProvider('gemini');
    const session = await provider.createLiveToken({
      conversationId,
      siteLocale,
      history,
    });

    return Response.json({
      token: session.token,
      model: session.model,
      apiVersion: session.apiVersion,
      expireTime: session.expireTime,
      maxSessionMinutes: session.maxSessionMinutes,
      conversationId: session.conversationId || conversationId || null,
      systemInstruction: session.systemInstruction || '',
      seedHistory: session.seedHistory || [],
    });
  } catch (error) {
    console.error('[api/ai/live-token]', error);
    const code = error?.code === 'missing_key' ? 'missing_key' : 'live_token_failed';
    return Response.json(
      {
        error: error?.message || 'Unable to create live voice session.',
        code,
      },
      {status: code === 'missing_key' ? 503 : 500},
    );
  }
}
