import {geminiProvider} from '@/lib/ai/providers/gemini';
import {AI_ASSISTANT_CONFIG} from '@/lib/ai/config';

const providers = {
  gemini: geminiProvider,
};

export function getAIProvider(name = AI_ASSISTANT_CONFIG.provider) {
  return providers[name] || geminiProvider;
}
