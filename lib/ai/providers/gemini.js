import {GoogleGenAI} from '@google/genai';
import {AIProvider} from '@/lib/ai/providers/AIProvider';
import {getServerAiEnv} from '@/lib/ai/config';
import {buildLiveSystemPrompt, buildSystemPrompt} from '@/lib/ai/prompt';
import {buildKnowledgeContext, searchInternalKnowledge} from '@/lib/ai/knowledge';

function getClient() {
  const {geminiApiKey} = getServerAiEnv();
  if (!geminiApiKey) return null;
  return new GoogleGenAI({apiKey: geminiApiKey});
}

export class GeminiProvider extends AIProvider {
  get id() {
    return 'gemini';
  }

  isConfigured() {
    return Boolean(getServerAiEnv().geminiApiKey);
  }

  async chat({message, history = [], language = 'en', knowledgeContext = ''}) {
    const client = getClient();
    if (!client) return null;

    const {geminiTextModel} = getServerAiEnv();
    const system = buildSystemPrompt({language, knowledgeContext, mode: 'text'});

    const contents = [];
    for (const item of history) {
      contents.push({
        role: item.role === 'assistant' ? 'model' : 'user',
        parts: [{text: String(item.content || '')}],
      });
    }
    contents.push({role: 'user', parts: [{text: message}]});

    const response = await client.models.generateContent({
      model: geminiTextModel,
      contents,
      config: {
        systemInstruction: system,
        temperature: 0.3,
        maxOutputTokens: 700,
      },
    });

    const text =
      response?.text?.trim?.() ||
      String(response?.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();
    return text || null;
  }

  /**
   * Short-lived Live credential. Permanent GEMINI_API_KEY never leaves the server.
   * System instruction is returned so the browser can complete setup without the API key.
   */
  async createLiveToken({conversationId, siteLocale = 'en', history = []} = {}) {
    const env = getServerAiEnv();
    if (!env.geminiApiKey) {
      const err = new Error('GEMINI_API_KEY is not configured');
      err.code = 'missing_key';
      throw err;
    }

    const client = new GoogleGenAI({
      apiKey: env.geminiApiKey,
      httpOptions: {apiVersion: 'v1alpha'},
    });

    const {hits} = searchInternalKnowledge(
      history
        .slice(-4)
        .map((h) => h.content)
        .join(' ') || 'ASAS services contact office',
      siteLocale === 'ar' ? 'ar' : 'en',
      6,
    );
    const knowledgeContext = buildKnowledgeContext(hits, siteLocale === 'ar' ? 'ar' : 'en');
    const systemInstruction = buildLiveSystemPrompt(knowledgeContext);

    const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const newSessionExpireTime = new Date(Date.now() + 2 * 60 * 1000);

    // Keep token creation simple — locking every Live field often drops the browser WS.
    let token;
    try {
      token = await client.authTokens.create({
        config: {
          uses: 1,
          expireTime,
          newSessionExpireTime,
        },
      });
    } catch (error) {
      // Fallback REST (v1alpha) if SDK shape differs.
      const res = await fetch('https://generativelanguage.googleapis.com/v1alpha/auth_tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': env.geminiApiKey,
        },
        body: JSON.stringify({
          uses: 1,
          expireTime,
          newSessionExpireTime: newSessionExpireTime.toISOString(),
        }),
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        throw new Error(`Live token failed (${res.status}): ${detail.slice(0, 180)}`);
      }
      token = await res.json();
    }

    const tokenName = token?.name;
    if (!tokenName) {
      throw new Error('Failed to create Gemini live token');
    }

    return {
      token: tokenName,
      model: env.geminiLiveModel,
      // Constrained Live sockets are most reliable on v1beta with access_token.
      apiVersion: 'v1beta',
      expireTime,
      maxSessionMinutes: env.maxVoiceSessionMinutes,
      conversationId: conversationId || null,
      systemInstruction,
      seedHistory: history.slice(-6).map((item) => ({
        role: item.role === 'assistant' ? 'model' : 'user',
        parts: [{text: String(item.content || '').slice(0, 1200)}],
      })),
    };
  }
}

export const geminiProvider = new GeminiProvider();
