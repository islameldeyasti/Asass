/**
 * Central AI Assistant configuration (safe for client imports).
 * Secrets stay in process.env — never here.
 */

export const AI_ASSISTANT_CONFIG = {
  enabled: true,
  provider: 'gemini',
  assistantName: {
    en: 'ASAS AI Assistant',
    ar: 'مساعد أساس الذكي',
  },
  fabLabel: {
    en: 'Ask AI',
    ar: 'اسأل المساعد',
  },
  defaultGreeting: {
    en: "Hi — I'm the AI assistant. You can type your question or start a live voice conversation about anything on the website.",
    ar: 'أهلًا — أنا المساعد الذكي. تقدر تكتب لي أو تبدأ محادثة صوتية وتسألني عن أي شيء يخص الموقع.',
  },
  disclaimer: {
    en: 'Responses may include automated information based on verified website data.',
    ar: 'قد تتضمن الردود معلومات آلية مبنية على بيانات الموقع الموثقة.',
  },
  textChatEnabled: true,
  liveVoiceEnabled: true,
  voiceDictationEnabled: true,
  voiceOutputEnabled: true,
  internalKnowledgeEnabled: true,
  autoLanguageDetection: true,
  showSources: true,
  maxHistoryMessages: 12,
  maxMessageLength: 3000,
  maxTextMessagesPerSession: 30,
  maxVoiceSessionMinutes: 5,
  requestTimeoutMs: 45000,
  externalSearch: {
    enabled: false,
    maxSearchesPerConversation: 2,
    maxSearchesPerVisitor: 5,
    allowedDomains: [],
    blockedDomains: [],
  },
  modules: {
    whatsapp: false,
    leadCollection: false,
    crm: false,
    booking: false,
    rag: false,
    adminDashboard: false,
    liveVoice: true,
  },
};

/** Server-only defaults — read via getServerAiEnv(). */
export function getServerAiEnv() {
  return {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    geminiTextModel: process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash',
    geminiLiveModel:
      process.env.GEMINI_LIVE_MODEL || 'gemini-2.5-flash-native-audio-preview-12-2025',
    voiceEnabled: process.env.VOICE_ENABLED !== 'false',
    maxVoiceSessionMinutes: Number(process.env.MAX_VOICE_SESSION_MINUTES || 5),
    maxTextMessagesPerSession: Number(process.env.MAX_TEXT_MESSAGES_PER_SESSION || 30),
    maxMessageLength: Number(process.env.MAX_MESSAGE_LENGTH || 3000),
  };
}

/** Public config returned by /api/ai/config (no secrets). */
export function getPublicAiConfig() {
  const env = getServerAiEnv();
  return {
    enabled: AI_ASSISTANT_CONFIG.enabled,
    textChatEnabled: AI_ASSISTANT_CONFIG.textChatEnabled,
    liveVoiceEnabled: AI_ASSISTANT_CONFIG.liveVoiceEnabled && env.voiceEnabled,
    geminiConfigured: Boolean(env.geminiApiKey),
    maxVoiceSessionMinutes: env.maxVoiceSessionMinutes,
    maxTextMessagesPerSession: env.maxTextMessagesPerSession,
    maxMessageLength: env.maxMessageLength,
    provider: AI_ASSISTANT_CONFIG.provider,
  };
}

export function getQuickActions(language = 'en') {
  if (language === 'ar') {
    return ['ما الخدمات التي تقدمونها؟', 'أين يقع المكتب؟', 'كيف أبدأ مشروعاً؟', 'بيانات التواصل'];
  }
  return ['What services do you offer?', 'Where is your office?', 'How do I start a project?', 'Contact details'];
}

export const AI_UI_COPY = {
  en: {
    open: 'Open AI assistant',
    close: 'Close AI assistant',
    minimize: 'Minimize',
    placeholder: 'Ask about services, office, or projects…',
    send: 'Send',
    modeChat: 'Chat',
    modeTalk: 'Talk',
    startVoice: 'Start Voice Conversation',
    endVoice: 'End Conversation',
    connecting: 'Connecting…',
    listening: 'Listening…',
    thinking: 'Thinking…',
    speaking: 'AI is speaking…',
    paused: 'Paused',
    disconnected: 'Disconnected',
    speakNaturally: 'Speak naturally',
    voiceLimit:
      'The voice session has reached its current limit. You can continue chatting with me by text.',
    voiceError:
      'There was a problem with the voice connection. Please try starting the conversation again.',
    micRequired: 'Microphone access is required to start the voice conversation.',
    micDenied: 'Microphone access is required to start the voice conversation.',
    micUnavailable: 'No microphone is available on this device.',
    liveUnsupported: 'Live voice is not supported in this browser. You can still use text chat.',
    geminiMissing:
      'Live voice needs GEMINI_API_KEY on the server. Add it to Frontend/.env.local and restart.',
    transcript: 'Transcript',
    hideTranscript: 'Hide transcript',
    showTranscript: 'Show transcript',
    you: 'You',
    ai: 'AI',
    dictation: 'Voice input',
    dictationStop: 'Stop listening',
    speak: 'Play response',
    stopSpeak: 'Stop playback',
    retry: 'Retry',
    error: 'Something went wrong while sending your message. Please try again.',
    sourceWebsite: 'Source: Website',
    sourceGeneral: 'Source: General guidance',
    sourceExternal: 'Source: External',
    online: 'Online',
  },
  ar: {
    open: 'فتح المساعد الذكي',
    close: 'إغلاق المساعد الذكي',
    minimize: 'تصغير',
    placeholder: 'اسأل عن الخدمات أو المكتب أو المشاريع…',
    send: 'إرسال',
    modeChat: 'دردشة',
    modeTalk: 'تحدث',
    startVoice: 'ابدأ محادثة صوتية',
    endVoice: 'إنهاء المحادثة',
    connecting: 'جارٍ الاتصال…',
    listening: 'جارٍ الاستماع…',
    thinking: 'جارٍ التفكير…',
    speaking: 'المساعد يتحدث…',
    paused: 'متوقف مؤقتاً',
    disconnected: 'انقطع الاتصال',
    speakNaturally: 'تحدث بشكل طبيعي',
    voiceLimit:
      'المحادثة الصوتية وصلت للحد المسموح حاليًا. تقدر تكمل معايا بالكتابة.',
    voiceError: 'حصلت مشكلة في الاتصال الصوتي. جرب تبدأ المحادثة مرة تانية.',
    micRequired: 'محتاجين إذن استخدام الميكروفون علشان نبدأ المحادثة الصوتية.',
    micDenied: 'محتاجين إذن استخدام الميكروفون علشان نبدأ المحادثة الصوتية.',
    micUnavailable: 'لا يوجد ميكروفون متاح على هذا الجهاز.',
    liveUnsupported: 'المحادثة الصوتية غير مدعومة في هذا المتصفح. يمكنك استخدام الدردشة النصية.',
    geminiMissing:
      'المحادثة الصوتية تحتاج GEMINI_API_KEY على الخادم. أضفه في Frontend/.env.local ثم أعد التشغيل.',
    transcript: 'النص',
    hideTranscript: 'إخفاء النص',
    showTranscript: 'إظهار النص',
    you: 'أنت',
    ai: 'المساعد',
    dictation: 'إدخال صوتي',
    dictationStop: 'إيقاف الاستماع',
    speak: 'تشغيل الرد',
    stopSpeak: 'إيقاف التشغيل',
    retry: 'إعادة المحاولة',
    error: 'حصلت مشكلة بسيطة أثناء إرسال الرسالة. حاول مرة أخرى.',
    sourceWebsite: 'المصدر: الموقع',
    sourceGeneral: 'المصدر: إرشاد عام',
    sourceExternal: 'المصدر: خارجي',
    online: 'متصل',
  },
};
