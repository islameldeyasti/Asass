'use client';

import dynamic from 'next/dynamic';
import AIErrorBoundary from './AIErrorBoundary';

/** Lazy-load AI assistant so it does not block initial page JS. */
const AIWidget = dynamic(() => import('@/components/ai-assistant/AIWidget'), {
  ssr: false,
  loading: () => null,
});

export default function AIAssistantMount({locale}) {
  return (
    <AIErrorBoundary>
      <AIWidget locale={locale} />
    </AIErrorBoundary>
  );
}
