import {notFound} from 'next/navigation';
import {company} from '@/data/company';
import {projects} from '@/data/projects';
import {
  getRelatedTeamMembers,
  getTeamMemberBySlug,
  localizeMember,
} from '@/data/team';
import TeamMemberHero from '@/components/team/TeamMemberHero';
import TeamExpertise from '@/components/team/TeamExpertise';
import TeamProjects from '@/components/team/TeamProjects';
import RelatedTeam from '@/components/team/RelatedTeam';
import TeamEnquiryCta from '@/components/team/TeamEnquiryCta';

export const dynamic = 'force-dynamic';

export async function generateMetadata({params}) {
  const {locale, slug} = await params;
  const member = await getTeamMemberBySlug(slug);
  if (!member) return {title: 'Team'};
  const local = localizeMember(member, locale);
  const title =
    local.seoTitle ||
    `${local.name} | ${local.jobTitle} | ASAS`;
  const description = local.seoDescription || local.shortBio || company.shortDescription;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: member.profile_image ? [{url: member.profile_image}] : undefined,
    },
  };
}

function BioBlocks({text}) {
  if (!text) return null;
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => <p key={block.slice(0, 48)}>{block}</p>);
}

function CredentialList({title, items}) {
  if (!items?.length) return null;
  return (
    <div className="tm-credential">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default async function TeamMemberPage({params}) {
  const {locale, slug} = await params;
  const ar = locale === 'ar';
  const member = await getTeamMemberBySlug(slug);
  if (!member) notFound();

  const local = localizeMember(member, locale);
  const related = await getRelatedTeamMembers(member, {limit: 3});
  const selectedProjects = (member.notable_projects || [])
    .map((projectSlug) => projects.find((project) => project.slug === projectSlug))
    .filter(Boolean)
    .slice(0, 4);

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: local.name,
    jobTitle: local.jobTitle,
    worksFor: {
      '@type': 'Organization',
      name: company.name,
      url: `https://${company.website}`,
    },
    image: member.profile_image || undefined,
    url: `https://${company.website}/${locale}/team/${member.slug}`,
    email: member.email || undefined,
    telephone: member.phone || undefined,
    sameAs: [member.linkedin_url, ...(member.social_links || []).map((item) => item.url)].filter(Boolean),
  };

  const hasCredentials =
    local.education?.length || local.qualifications?.length || local.certifications?.length;

  return (
    <div className="tm">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(personSchema)}} />
      <TeamMemberHero member={member} locale={locale} />

      {(local.fullBio || local.quote) && (
        <section className="tm-section tm-bio">
          <div className="tm-shell tm-bio-grid">
            <div>
              <p className="tm-kicker">
                <i />
                {ar ? 'نبذة' : 'About'}
              </p>
              <h2>{ar ? 'السيرة' : 'Biography'}</h2>
            </div>
            <div className="tm-bio-body">
              <BioBlocks text={local.fullBio || local.shortBio} />
              {local.quote && <blockquote className="tm-quote">“{local.quote}”</blockquote>}
            </div>
          </div>
        </section>
      )}

      <TeamExpertise items={local.expertise} locale={locale} />

      {hasCredentials && (
        <section className="tm-section tm-credentials">
          <div className="tm-shell tm-credentials-grid">
            <div>
              <p className="tm-kicker">
                <i />
                {ar ? 'المؤهلات' : 'Credentials'}
              </p>
              <h2>{ar ? 'التعليم والمؤهلات' : 'Experience & Qualifications'}</h2>
            </div>
            <div className="tm-credentials-list">
              <CredentialList title={ar ? 'التعليم' : 'Education'} items={local.education} />
              <CredentialList title={ar ? 'المؤهلات' : 'Qualifications'} items={local.qualifications} />
              <CredentialList title={ar ? 'الشهادات' : 'Certifications'} items={local.certifications} />
            </div>
          </div>
        </section>
      )}

      <TeamProjects projects={selectedProjects} locale={locale} />
      <RelatedTeam members={related} locale={locale} />
      <TeamEnquiryCta locale={locale} />
    </div>
  );
}
