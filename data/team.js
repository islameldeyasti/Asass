/**
 * Public Team data helpers.
 * Content is managed via /admin/team (file-backed store).
 * Do not hardcode people in page components — query these helpers.
 */

import {
  localizeMember,
  sortTeamMembers,
  teamDepartments,
} from '@/lib/team/schema';
import {
  getTeamMemberBySlug as storeGetBySlug,
  listTeamMembers,
} from '@/lib/team/store';

export {teamDepartments, localizeMember, sortTeamMembers};

export async function getPublishedTeamMembers() {
  return listTeamMembers({includeDrafts: false});
}

function hasRealPortrait(member) {
  const src = member?.profile_image || '';
  if (!src) return false;
  if (/\.svg($|\?)/i.test(src)) return false;
  if (/\/images\/team\/demo-/i.test(src)) return false;
  return true;
}

export async function getFeaturedTeamMembers({limit = 6} = {}) {
  const members = await getPublishedTeamMembers();
  const featured = members.filter((member) => member.featured);
  const source = featured.length ? featured : members;
  return source.slice(0, limit);
}

/** Homepage: featured first, real portraits preferred, then display_order. */
export async function getHomepageTeamMembers({limit = 4} = {}) {
  const members = await getPublishedTeamMembers();
  const featured = members.filter((member) => member.featured);
  const source = featured.length ? featured : members;
  const withPhoto = source.filter(hasRealPortrait);
  const withoutPhoto = source.filter((member) => !hasRealPortrait(member));
  return [...withPhoto, ...withoutPhoto].slice(0, limit);
}

export async function getLeadershipTeamMembers() {
  const members = await getPublishedTeamMembers();
  return members.filter((member) => member.leadership);
}

export async function getTeamMemberBySlug(slug) {
  return storeGetBySlug(slug, {includeDrafts: false});
}

export async function getRelatedTeamMembers(member, {limit = 3} = {}) {
  if (!member) return [];
  const members = await getPublishedTeamMembers();
  const sameDept = members.filter(
    (item) => item.id !== member.id && item.department_id && item.department_id === member.department_id,
  );
  const leadership = members.filter((item) => item.id !== member.id && item.leadership);
  const rest = members.filter((item) => item.id !== member.id);
  const picked = [];
  const pushUnique = (list) => {
    list.forEach((item) => {
      if (picked.length >= limit) return;
      if (!picked.some((existing) => existing.id === item.id)) picked.push(item);
    });
  };
  pushUnique(sameDept);
  pushUnique(leadership);
  pushUnique(rest);
  return picked.slice(0, limit);
}

export {getActiveTeamFilters} from '@/lib/team/schema';
