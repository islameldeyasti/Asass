import {resolveChatReply} from '@/lib/chat/reply';
import {chatKnowledge} from '@/data/chat-knowledge';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const body = await request.json();
    const locale = body?.locale === 'ar' ? 'ar' : 'en';
    const message = String(body?.message || '').trim();
    const history = Array.isArray(body?.history) ? body.history : [];

    if (!message) {
      return Response.json(
        {
          reply: chatKnowledge.greeting[locale === 'ar' ? 'ar' : 'en'],
          source: 'greeting',
          suggestions: chatKnowledge.suggestions[locale === 'ar' ? 'ar' : 'en'],
        },
        {status: 200},
      );
    }

    if (message.length > 2000) {
      return Response.json(
        {error: locale === 'ar' ? 'الرسالة طويلة جداً.' : 'Message is too long.'},
        {status: 400},
      );
    }

    const result = await resolveChatReply({message, locale, history});

    return Response.json({
      reply: result.reply,
      source: result.source,
      suggestions: chatKnowledge.suggestions[locale === 'ar' ? 'ar' : 'en'],
    });
  } catch (error) {
    console.error('[api/chat]', error);
    return Response.json(
      {error: 'Unable to process chat message.'},
      {status: 500},
    );
  }
}
