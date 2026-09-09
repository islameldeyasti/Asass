'use client';

import Image from 'next/image';
import {useTheme} from './ThemeProvider';

/** Light mode: color mark. Dark mode / navy brand surfaces: white mark. */
const LIGHT_SRC = '/brand/asas-logo-light.png';
const DARK_SRC = '/brand/asas-logo-dark.png';

/**
 * Theme-aware ASAS mark for header/footer.
 * @param {'auto'|'light'|'dark'} appearance
 *   auto = follow theme; dark = white mark (navy brand bands / footer);
 *   light = color mark
 */
export default function ThemeLogo({
  width = 62,
  height = 62,
  priority = false,
  className = '',
  alt = 'ASAS',
  appearance = 'auto',
}) {
  const {resolved} = useTheme();
  const mode =
    appearance === 'auto' ? resolved : appearance === 'dark' ? 'dark' : 'light';
  const src = mode === 'dark' ? DARK_SRC : LIGHT_SRC;

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
