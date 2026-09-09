import {AI_ASSISTANT_CONFIG} from '@/lib/ai/config';

/**
 * External search / tool layer — disabled by default.
 * Browser cannot enable or bypass these restrictions.
 */
export async function maybeExternalSearch({query, conversationId, language}) {
  const policy = AI_ASSISTANT_CONFIG.externalSearch;

  if (!policy?.enabled) {
    return {
      used: false,
      reason: 'disabled',
      results: [],
    };
  }

  // Reserved for future restricted search providers.
  void query;
  void conversationId;
  void language;
  void policy.maxSearchesPerConversation;
  void policy.allowedDomains;
  void policy.blockedDomains;

  return {
    used: false,
    reason: 'not_implemented',
    results: [],
  };
}
