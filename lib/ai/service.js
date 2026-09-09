import {AI_ASSISTANT_CONFIG, getServerAiEnv} from '@/lib/ai/config';
import {detectLanguage} from '@/lib/ai/language';
import {
  buildKnowledgeContext,
  searchInternalKnowledge,
  unavailableReply,
} from '@/lib/ai/knowledge';
import {getQuickActions} from '@/lib/ai/config';
import {maybeExternalSearch} from '@/lib/ai/tools';
import {sanitizeHistory, sanitizeMessage} from '@/lib/ai/sanitize';
import {getAIProvider} from '@/lib/ai/providers';

function localGroundedReply({language, hits, confidence}) {
  if (confidence >= 0.4 && hits[0]) {
    return {
      message: hits[0].excerpt,
      language,
      sourceType: 'website',
      sources: hits.slice(0, 3).map((hit) => ({id: hit.id, title: hit.title, type: hit.type})),
      suggestions: getQuickActions(language),
    };
  }

  return {
    message: unavailableReply(language),
    language,
    sourceType: 'general',
    sources: [],
    suggestions: getQuickActions(language),
  };
}

export async function runAiChat({
  message: rawMessage,
  history: rawHistory = [],
  conversationId,
  siteLocale = 'en',
}) {
  const env = getServerAiEnv();
  const maxLen = env.maxMessageLength || AI_ASSISTANT_CONFIG.maxMessageLength;
  const message = sanitizeMessage(rawMessage).slice(0, maxLen);
  const history = sanitizeHistory(rawHistory, AI_ASSISTANT_CONFIG.maxHistoryMessages);
  const language = detectLanguage(message, siteLocale === 'ar' ? 'ar' : 'en');

  if (!message) {
    return {
      message: AI_ASSISTANT_CONFIG.defaultGreeting[language === 'ar' ? 'ar' : 'en'],
      language,
      sourceType: 'website',
      sources: [],
      suggestions: getQuickActions(language),
      conversationId,
    };
  }

  const {hits, confidence} = searchInternalKnowledge(message, language);
  const knowledgeContext = buildKnowledgeContext(hits, language);

  if (confidence < 0.4) {
    await maybeExternalSearch({query: message, conversationId, language});
  }

  const provider = getAIProvider();
  try {
    if (provider.isConfigured()) {
      const llm = await provider.chat({
        message,
        history,
        language,
        knowledgeContext,
      });
      if (llm) {
        return {
          message: llm,
          language,
          sourceType: confidence >= 0.4 ? 'website' : 'general',
          sources: hits.slice(0, 3).map((hit) => ({id: hit.id, title: hit.title, type: hit.type})),
          suggestions: getQuickActions(language),
          conversationId,
          provider: provider.id,
        };
      }
    }
  } catch (error) {
    console.error('[ai-service]', error?.message || error);
  }

  const local = localGroundedReply({language, hits, confidence});
  return {...local, conversationId, provider: 'knowledge'};
}
