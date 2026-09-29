'use client';

import {useEffect, useState} from 'react';
import {createPortal} from 'react-dom';

/** Renders overlays on document.body so they cannot stack inside transformed admin chrome. */
export default function AdminPortal({children}) {
  const [target, setTarget] = useState(null);
  useEffect(() => {
    setTarget(
      document.querySelector('.admin-ar[data-theme], .admin-en[data-theme]') || document.body,
    );
  }, []);
  if (!target) return null;
  return createPortal(children, target);
}
