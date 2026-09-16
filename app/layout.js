import './globals.css';
import './brand.css';
import './motion-safety.css';
import './target-composition.css';
import './final-visual-fixes.css';
import './home-rebuild.css';
import './english-focus.css';
import './selected-work.css';
import './selected-work-fixes.css';
import './route-dossier.css';
import './wireframe-structure.css';
import './homepage-complete.css';
import './homepage-visual-qa.css';
import './homepage-revision.css';
import './homepage-image-hover.css';
import './homepage-trust.css';
import './homepage-stats.css';
import './services-index.css';
import './projects-index.css';
import './hero-slider.css';
import './typography-scale.css';
import './motion-system.css';
import './contact-page.css';
import './careers-page.css';
import './sectors-index.css';
import './downloads-index.css';
import './enquiry-page.css';
import './about-page.css';
import './mobile-fixes.css';
import './asas-brand.css';
import './asas-actions.css';
import './premium-chrome.css';
import './premium-footer.css';
import './premium-sectors.css';
import './premium-project-detail.css';
import './premium-projects.css';
import './premium-services.css';
import './premium-service-detail.css';
import './premium-sector-detail.css';
import './premium-company-profile.css';
import './premium-portfolio.css';
import './premium-team.css';
import './anchor-scroll.css';
import './asas-image-system.css';
import './internal-hero.css';
import './mobile-system.css';
import './theme-tokens.css';
import './theme-surfaces.css';
import './floating-utilities.css';
import './chatbot.css';
import './ai-assistant.css';
import './gallery-page.css';
import './videos-page.css';
import './blog-page.css';
import './fonts-arabic.css';
import './arabic-rtl.css';
import {ThemeProvider} from '@/components/theme/ThemeProvider';
import {THEME_BOOT_SCRIPT} from '@/lib/theme';
import {LOCALE_HTML_BOOT} from '@/lib/i18n/locale-boot';
import {getCmsRootMetadata} from '@/lib/cms/site-metadata';
import {getBranding} from '@/lib/cms/branding-server';
import Script from 'next/script';

export async function generateMetadata() {
  const [cms, branding] = await Promise.all([getCmsRootMetadata(), getBranding()]);
  const favicon = branding.favicon || '/favicon.ico';
  const apple = branding.appleTouchIcon || '/brand/asas-mark-header.png';
  return {
    ...cms,
    icons: {
      icon: [
        {url: favicon, sizes: 'any'},
        {url: apple, type: 'image/png'},
      ],
      apple,
    },
  };
}

export default function RootLayout({children}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script
          id="asas-theme-boot"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{__html: THEME_BOOT_SCRIPT}}
        />
        {/* Reads /en|/ar from path before paint — pairs with locale layout sync */}
        <Script
          id="asas-locale-boot"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{__html: LOCALE_HTML_BOOT}}
        />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
