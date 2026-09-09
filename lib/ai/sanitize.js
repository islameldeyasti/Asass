import {AI_ASSISTANT_CONFIG} from '@/lib/ai/config';

export function sanitizeMessage(raw) {
  const text = String(raw || '')
    .replace(/\u0000/g, '')
    .trim();
  const max = AI_ASSISTANT_CONFIG.maxMessageLength || 2000;
  return text.slice(0, max);
}

export function sanitizeHistory(history = [], maxMessages = AI_ASSISTANT_CONFIG.maxHistoryMessages) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((item) => item && (item.role === 'user' || item.role === 'assistant'))
    .slice(-Math.max(2, maxMessages || 12))
    .map((item) => ({
      role: item.role === 'assistant' ? 'assistant' : 'user',
      content: sanitizeMessage(item.content),
    }))
    .filter((item) => item.content);
}

export function newConversationId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `conv_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
