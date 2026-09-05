const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function IconShell({children, title, size = 28}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : 'presentation'}
      style={{display: 'block'}}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

/** Overlapping discipline sheets with a review check — optically centered */
export function IconCrossCheck({size}) {
  return (
    <IconShell size={size} title="Cross-discipline checking">
      <rect x="6.5" y="6" width="12.5" height="16.5" rx="1.5" {...base} />
      <path d="M11.5 6V5.5A1.5 1.5 0 0 1 13 4h11a1.5 1.5 0 0 1 1.5 1.5v16.5A1.5 1.5 0 0 1 24 23.5h-4" {...base} />
      <path d="M9.5 12h6.5M9.5 15.5h5" {...base} />
      <path d="M11 22.5 13.5 25l5-5.5" {...base} strokeWidth="2" />
    </IconShell>
  );
}

/** Calendar with progress bar and check — optically centered */
export function IconTimelyReport({size}) {
  return (
    <IconShell size={size} title="Timely reporting">
      <rect x="5.5" y="7.5" width="21" height="18" rx="2" {...base} />
      <path d="M5.5 12.5h21" {...base} />
      <path d="M11 5.5v4M21 5.5v4" {...base} />
      <path d="M9.5 18.5h5.5" {...base} strokeWidth="2.25" />
      <path d="M17.5 17 19.5 19l4-4" {...base} strokeWidth="2" />
    </IconShell>
  );
}

/** Design → tender → build cycle with stage nodes — optically centered */
export function IconProjectCycle({size}) {
  return (
    <IconShell size={size} title="Integrated project cycle">
      <circle cx="16" cy="16" r="9.25" {...base} />
      <path d="M16 6.75v4M16 21.25v4M6.75 16h4M21.25 16h4" {...base} strokeWidth="1.35" opacity=".55" />
      <circle cx="16" cy="6.75" r="1.85" fill="currentColor" stroke="none" />
      <circle cx="24" cy="19.5" r="1.85" fill="currentColor" stroke="none" />
      <circle cx="8" cy="19.5" r="1.85" fill="currentColor" stroke="none" />
      <path d="M18 8c2.8 1.1 4.6 3.8 4.4 6.8" {...base} />
      <path d="M22.3 20.8c-1.9 2.5-5.1 3.6-8.2 2.9" {...base} />
      <path d="M8.9 17.8c.4-3.1 2.6-5.6 5.5-6.5" {...base} />
      <path d="M19.8 8.7l1.5-2 1 2.3" {...base} />
    </IconShell>
  );
}

/** Project file + commitment seal — optically centered */
export function IconRecordsCommitment({size}) {
  return (
    <IconShell size={size} title="Records and commitment">
      <path d="M8.5 5.5h9.5L23.5 11v14.5a1.5 1.5 0 0 1-1.5 1.5h-13.5A1.5 1.5 0 0 1 7 25.5v-18a1.5 1.5 0 0 1 1.5-1.5Z" {...base} />
      <path d="M18 5.5V11h5.5" {...base} />
      <path d="M10.5 14.5h7M10.5 17.5h5" {...base} />
      <path d="M15.5 20c-3 0-4.8 1.5-4.8 2.8 0 .35.4.6.9.6h7.8c.5 0 .9-.25.9-.6 0-1.3-1.8-2.8-4.8-2.8Z" {...base} />
      <path d="M15.5 16.6a2 2 0 1 0 .001 4 2 2 0 0 0 0-4Z" {...base} />
      <path d="M21.8 14v2.9l1.9 1 1.9-1V14l-1.9-1-1.9 1Z" {...base} />
      <path d="M21.8 15.7 23.7 16.7 25.6 15.7" {...base} strokeWidth="1.35" />
    </IconShell>
  );
}

export const whyIcons = [
  IconCrossCheck,
  IconTimelyReport,
  IconProjectCycle,
  IconRecordsCommitment,
];
