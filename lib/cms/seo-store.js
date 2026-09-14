import {access, mkdir, readFile, writeFile} from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data', 'cms');
const DATA_FILE = path.join(DATA_DIR, 'seo.json');
const SEED_FILE = path.join(process.cwd(), 'content', 'cms', 'seo.json');

export function defaultSeoSettings() {
  return {
    siteNameEn: 'ASAS Engineering & Project Management Consultancy',
    siteNameAr: 'أساس للاستشارات الهندسية وإدارة المشاريع',
    defaultTitleEn: 'ASAS Engineering | Abu Dhabi',
    defaultTitleAr: 'أساس للهندسة | أبوظبي',
    defaultDescriptionEn:
      'ASAS Engineering & Project Management Consultancy — architecture, structure, MEP, supervision and project management in Abu Dhabi.',
    defaultDescriptionAr:
      'أساس للاستشارات الهندسية وإدارة المشاريع — عمارة وإنشاءات وMEP وإشراف وإدارة مشاريع في أبوظبي.',
    defaultOgImage: '/assets/asas/og-default.jpg',
    canonicalBase: 'https://www.asasengg.ae',
    titleTemplateEn: '%page% | ASAS Engineering',
    titleTemplateAr: '%page% | أساس للهندسة',
    twitterHandle: '',
    twitterCardType: 'summary_large_image',
    googleAnalyticsId: '',
    googleTagManagerId: '',
    searchConsoleVerification: '',
    metaPixelId: '',
    robotsIndex: true,
    robotsFollow: true,
    organizationJsonLd: true,
    updatedAt: new Date().toISOString(),
  };
}

async function readJsonObject(filePath) {
  try {
    const raw = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function ensureStore() {
  await mkdir(DATA_DIR, {recursive: true});
  try {
    await access(DATA_FILE);
  } catch {
    let seed = null;
    seed = await readJsonObject(SEED_FILE);
    const payload = `${JSON.stringify(seed || defaultSeoSettings(), null, 2)}\n`;
    await writeFile(DATA_FILE, payload, 'utf8');
  }
}

export async function getSeoSettings() {
  let data = await readJsonObject(DATA_FILE);
  if (!data) data = await readJsonObject(SEED_FILE);
  return {...defaultSeoSettings(), ...(data || {})};
}

export async function updateSeoSettings(patch = {}) {
  await ensureStore();
  const current = await getSeoSettings();
  const next = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  // Coerce booleans
  next.robotsIndex = Boolean(next.robotsIndex);
  next.robotsFollow = Boolean(next.robotsFollow);
  next.organizationJsonLd = Boolean(next.organizationJsonLd);

  const payload = `${JSON.stringify(next, null, 2)}\n`;
  await writeFile(DATA_FILE, payload, 'utf8');
  await mkdir(path.dirname(SEED_FILE), {recursive: true});
  await writeFile(SEED_FILE, payload, 'utf8');
  return next;
}
