import {redirect, notFound} from 'next/navigation';
import {
  buildPublicCardPath,
  ensureCardPublicId,
  normalizeDigitalCard,
} from '@/lib/cms/corporate/employee-cards';
import {allocateCardPublicId, getTeamMemberBySlug, updateTeamMember} from '@/lib/team/store';

export const dynamic = 'force-dynamic';

/**
 * Legacy pretty slug route → stable /c/[publicId]
 */
export default async function LegacyCardRedirect({params}) {
  const {slug} = await params;
  const member = await getTeamMemberBySlug(slug, {includeDrafts: true});
  if (!member) notFound();

  let card = normalizeDigitalCard(member.digital_card);
  if (!card.publicId) {
    const publicId = await allocateCardPublicId();
    card = ensureCardPublicId({...card, publicId});
    try {
      await updateTeamMember(member.id, {digital_card: card});
    } catch {
      // If write fails (read-only), still redirect with allocated id for this request only.
    }
  }

  redirect(buildPublicCardPath(card.publicId));
}
