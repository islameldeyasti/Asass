import {chatKnowledge, buildSystemPrompt} from '@/data/chat-knowledge';

function normalize(text = '') {
  return String(text)
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Local knowledge-base reply (works without an API key). */
export function localChatReply(message, locale = 'en') {
  const ar = locale === 'ar';
  const q = normalize(message);
  if (!q) {
    return chatKnowledge.greeting[ar ? 'ar' : 'en'];
  }

  let best = null;
  let bestScore = 0;

  for (const faq of chatKnowledge.faqs) {
    const keys = faq.keywords[ar ? 'ar' : 'en'] || [];
    let score = 0;
    for (const key of keys) {
      const k = normalize(key);
      if (!k) continue;
      if (q.includes(k)) score += k.length > 4 ? 2 : 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = faq;
    }
  }

  if (best && bestScore > 0) {
    return best.answer[ar ? 'ar' : 'en'];
  }

  return chatKnowledge.fallback[ar ? 'ar' : 'en'];
}

/**
 * Optional OpenAI-compatible chat completion.
 * Set OPENAI_API_KEY (and optionally OPENAI_MODEL, OPENAI_BASE_URL).
 */
export async function llmChatReply({message, locale = 'en', history = []}) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.ASAS_CHAT_API_KEY;
  if (!apiKey) return null;

  const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  const messages = [
    {role: 'system', content: buildSystemPrompt(locale)},
    ...history.slice(-8).map((item) => ({
      role: item.role === 'assistant' ? 'assistant' : 'user',
      content: String(item.content || '').slice(0, 2000),
    })),
    {role: 'user', content: String(message || '').slice(0, 2000)},
  ];

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      max_tokens: 450,
      messages,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Chat provider error ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  return text || null;
}

export async function resolveChatReply({message, locale = 'en', history = []}) {
  try {
    const llm = await llmChatReply({message, locale, history});
    if (llm) {
      return {reply: llm, source: 'llm'};
    }
  } catch (error) {
    console.error('[asas-chat]', error.message || error);
  }

  return {
    reply: localChatReply(message, locale),
    source: 'knowledge',
  };
}
