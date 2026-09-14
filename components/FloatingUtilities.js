import FloatingSocialBar from '@/components/FloatingSocialBar';
import ScrollToTopButton from '@/components/ScrollToTopButton';

/**
 * Global floating utilities (left socials + right scroll-to-top).
 * Right stack (top → bottom): Scroll → ThemeFab → WhatsApp.
 */
export default function FloatingUtilities({locale = 'en'}) {
  return (
    <>
      <FloatingSocialBar locale={locale} />
      <ScrollToTopButton locale={locale} />
    </>
  );
}
