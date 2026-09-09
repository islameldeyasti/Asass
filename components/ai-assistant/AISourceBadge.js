'use client';

import {dirForLanguage} from '@/lib/ai/language';
import {AI_UI_COPY} from '@/lib/ai/config';

export default function AISourceBadge({sourceType, language = 'en'}) {
  if (!sourceType || sourceType === 'general') {
    const t = AI_UI_COPY[language === 'ar' ? 'ar' : 'en'];
    return <span className="asas-ai-source asas-ai-source--general">{t.sourceGeneral}</span>;
  }
  const t = AI_UI_COPY[language === 'ar' ? 'ar' : 'en'];
  const label =
    sourceType === 'external'
      ? t.sourceExternal
      : t.sourceWebsite;
  return (
    <span className={`asas-ai-source asas-ai-source--${sourceType}`} dir={dirForLanguage(language)}>
      {label}
    </span>
  );
}
