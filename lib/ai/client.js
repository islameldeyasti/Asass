import {AI_ASSISTANT_CONFIG} from '@/lib/ai/config';
import {newConversationId} from '@/lib/ai/sanitize';

const SESSION_KEY = 'asas_ai_conversation_id';

export function getOrCreateConversationId() {
  if (typeof window === 'undefined') return newConversationId();
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = newConversationId();
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return newConversationId();
  }
}

export async function fetchAiConfig() {
  const res = await fetch('/api/ai/config', {method: 'GET'});
  if (!res.ok) return null;
  return res.json();
}

export async function sendAiChatMessage({
  message,
  history = [],
  conversationId,
  siteLocale = 'en',
  signal,
}) {
  const controller = signal ? null : new AbortController();
  const timeout = AI_ASSISTANT_CONFIG.requestTimeoutMs || 45000;
  const timer = controller ? setTimeout(() => controller.abort(), timeout) : null;

  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({message, history, conversationId, siteLocale}),
      signal: signal || controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error || 'request_failed');
      err.status = res.status;
      throw err;
    }
    return data;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function requestLiveToken({conversationId, history = [], siteLocale = 'en'}) {
  const res = await fetch('/api/ai/live-token', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({conversationId, history, siteLocale}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'live_token_failed');
    err.code = data.code || 'live_token_failed';
    err.status = res.status;
    throw err;
  }
  return data;
}
