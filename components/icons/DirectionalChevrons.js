/**
 * Shared directional chevrons for prev/next controls.
 * Icons mirror for Arabic so "next" points toward reading-forward.
 * Pair with normal flex — do NOT also force scaleX on these SVGs.
 */
import {ChevronLeft, ChevronRight} from 'lucide-react';

export function PrevChevron({ar, size = 16, ...rest}) {
  const Icon = ar ? ChevronRight : ChevronLeft;
  return <Icon size={size} aria-hidden="true" {...rest} />;
}

export function NextChevron({ar, size = 16, ...rest}) {
  const Icon = ar ? ChevronLeft : ChevronRight;
  return <Icon size={size} aria-hidden="true" {...rest} />;
}
