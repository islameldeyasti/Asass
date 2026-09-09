import FloatingSocialBar from '@/components/FloatingSocialBar';
import ScrollToTopButton from '@/components/ScrollToTopButton';

/**
 * Global floating utilities (left socials + right scroll-to-top).
 * WhatsApp + ThemeFab remain separate siblings; CSS stacks the right column.
 */
export default function FloatingUtilities({locale = 'en'}) {
  return (
    <>
      <FloatingSocialBar locale={locale} />
      <ScrollToTopButton locale={locale} />
    </>
  );
}
