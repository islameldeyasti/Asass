import 'server-only';

import {normalizeBranding} from './branding';
import {getSettings} from './content-service';

export async function getBranding() {
  try {
    const settings = await getSettings();
    return normalizeBranding(settings?.branding);
  } catch {
    return normalizeBranding();
  }
}
