'use client';

import Image from 'next/image';
import {useTheme} from './ThemeProvider';
import {DEFAULT_BRANDING} from '@/lib/cms/branding';

/**
 * Theme-aware ASAS mark for header/footer.
 * Prefers CMS branding URLs when provided.
 * @param {'auto'|'light'|'dark'} appearance
 */
export default function ThemeLogo({
  width = 62,
  height = 62,
  priority = false,
  className = '',
  alt = 'ASAS',
  appearance = 'auto',
  lightSrc,
  darkSrc,
}) {
  const {resolved} = useTheme();
  const mode =
    appearance === 'auto' ? resolved : appearance === 'dark' ? 'dark' : 'light';
  const light = lightSrc || DEFAULT_BRANDING.lightLogo;
  const dark = darkSrc || DEFAULT_BRANDING.darkLogo;
  const src = mode === 'dark' ? dark : light;

  return (
    <Image
      key={src}
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
      style={{objectFit: 'contain'}}
    />
  );
}
