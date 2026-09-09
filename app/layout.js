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
import './fonts-arabic.css';
import './arabic-rtl.css';
import {ThemeProvider} from '@/components/theme/ThemeProvider';
import {THEME_BOOT_SCRIPT} from '@/lib/theme';
import {LOCALE_HTML_BOOT} from '@/lib/i18n/locale-boot';

export const metadata = {
  title: 'ASAS Engineering & Project Management Consultancy',
  description:
    'Abu Dhabi consultancy for architectural, structural, civil and electromechanical design, quantities and cost, project management and construction supervision.',
  icons: {
    icon: [
      {url: '/favicon.ico', sizes: 'any'},
      {url: '/brand/asas-mark-header.png', type: 'image/png'},
    ],
    apple: '/brand/asas-mark-header.png',
  },
  openGraph: {
    title: 'ASAS Engineering & Project Management Consultancy',
    description: 'Engineering consultancy founded in Abu Dhabi in 2009.',
    type: 'website',
    images: [{url: '/brand/asas-mark-header.png'}],
  },
};

export default function RootLayout({children}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{__html: THEME_BOOT_SCRIPT}} />
        {/* Reads /en|/ar from path before paint — pairs with locale layout sync */}
        <script dangerouslySetInnerHTML={{__html: LOCALE_HTML_BOOT}} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
