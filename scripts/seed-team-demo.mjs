/**
 * Idempotent Team demo seeder.
 * Usage: npm run seed:team
 *
 * Upserts demo members by slug. Does not delete existing non-demo records.
 */

import fs from 'fs/promises';
import path from 'path';
import {fileURLToPath, pathToFileURL} from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataFile = path.join(root, '.data', 'team', 'members.json');
const seedFile = path.join(root, 'content', 'team', 'members.json');

function slugify(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function asString(value) {
  return typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim();
}

function asBool(value) {
  return value === true || value === 'true' || value === '1' || value === 1;
}

function asList(value) {
  if (Array.isArray(value)) return value.map((item) => asString(item)).filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function normalize(input = {}, {generateId = false} = {}) {
  const now = new Date().toISOString();
  const nameEn = asString(input.name_en || input.name);
  const slugSource = asString(input.slug) || nameEn;
  const id =
    asString(input.id) ||
    (generateId ? `tm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}` : '');

  return {
    id,
    slug: slugify(slugSource),
    name_en: nameEn,
    name_ar: asString(input.name_ar),
    job_title_en: asString(input.job_title_en || input.job_title),
    job_title_ar: asString(input.job_title_ar),
    department_id: asString(input.department_id),
    department_en: asString(input.department_en),
    department_ar: asString(input.department_ar),
    short_bio_en: asString(input.short_bio_en || input.short_bio),
    short_bio_ar: asString(input.short_bio_ar),
    full_bio_en: asString(input.full_bio_en || input.full_bio),
    full_bio_ar: asString(input.full_bio_ar),
    profile_image: asString(input.profile_image),
    profile_image_focal: asString(input.profile_image_focal) || '50% 30%',
    secondary_image: asString(input.secondary_image),
    email: asString(input.email),
    phone: asString(input.phone),
    linkedin_url: asString(input.linkedin_url),
    social_links: Array.isArray(input.social_links) ? input.social_links : [],
    years_experience: asString(input.years_experience),
    nationality: asString(input.nationality),
    education_en: asList(input.education_en),
    education_ar: asList(input.education_ar),
    qualifications_en: asList(input.qualifications_en),
    qualifications_ar: asList(input.qualifications_ar),
    certifications_en: asList(input.certifications_en),
    certifications_ar: asList(input.certifications_ar),
    expertise_en: asList(input.expertise_en),
    expertise_ar: asList(input.expertise_ar),
    notable_projects: asList(input.notable_projects),
    quote_en: asString(input.quote_en),
    quote_ar: asString(input.quote_ar),
    featured: asBool(input.featured),
    leadership: asBool(input.leadership),
    display_order: Number.isFinite(Number(input.display_order)) ? Number(input.display_order) : 100,
    status: input.status === 'draft' ? 'draft' : 'published',
    seo_title_en: asString(input.seo_title_en),
    seo_title_ar: asString(input.seo_title_ar),
    seo_description_en: asString(input.seo_description_en),
    seo_description_ar: asString(input.seo_description_ar),
    created_at: asString(input.created_at) || now,
    updated_at: now,
  };
}

function sortMembers(members) {
  return [...members].sort((a, b) => {
    const orderA = Number(a.display_order) || 100;
    const orderB = Number(b.display_order) || 100;
    if (orderA !== orderB) return orderA - orderB;
    const rank = (m) => (m.leadership ? 0 : m.featured ? 1 : 2);
    const rankDiff = rank(a) - rank(b);
    if (rankDiff !== 0) return rankDiff;
    return String(a.name_en || '').localeCompare(String(b.name_en || ''));
  });
}

async function readAll() {
  for (const file of [dataFile, seedFile]) {
    try {
      const raw = await fs.readFile(file, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed.map((item) => normalize(item));
      if (Array.isArray(parsed)) return [];
    } catch {
      // continue
    }
  }
  return [];
}

async function writeAll(members) {
  const sorted = sortMembers(members.map((item) => normalize(item)));
  const payload = `${JSON.stringify(sorted, null, 2)}\n`;
  await fs.mkdir(path.dirname(dataFile), {recursive: true});
  await fs.writeFile(dataFile, payload, 'utf8');
  await fs.mkdir(path.dirname(seedFile), {recursive: true});
  await fs.writeFile(seedFile, payload, 'utf8');
  return sorted;
}

async function main() {
  const {DEMO_TEAM_MEMBERS} = await import(pathToFileURL(path.join(root, 'content/team/demo-members.js')).href);
  const members = await readAll();
  let created = 0;
  let updated = 0;

  for (const demo of DEMO_TEAM_MEMBERS) {
    const incoming = normalize(
      {
        ...demo,
        id: `demo_${demo.slug.replace(/-/g, '_')}`,
      },
      {generateId: true},
    );
    const index = members.findIndex((item) => item.slug === incoming.slug);
    if (index >= 0) {
      const current = members[index];
      members[index] = normalize({
        ...current,
        ...incoming,
        id: current.id,
        created_at: current.created_at,
      });
      updated += 1;
      console.log(`updated: ${incoming.slug}`);
    } else {
      members.push(incoming);
      created += 1;
      console.log(`created: ${incoming.slug}`);
    }
  }

  const sorted = await writeAll(members);
  const published = sorted.filter((member) => member.status === 'published');
  const featured = published.filter((member) => member.featured);

  console.log(
    JSON.stringify(
      {
        created,
        updated,
        published: published.length,
        featured: featured.length,
        homepagePreview: featured.slice(0, 6).map((member) => member.slug),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
