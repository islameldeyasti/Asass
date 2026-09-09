import Image from 'next/image';
import {ArrowDown} from 'lucide-react';
import {ctaBandImages, roleImages} from '@/data/image-manifest';
import {getPublishedTeamMembers} from '@/data/team';
import TeamListing from '@/components/team/TeamListing';
import TeamPhilosophy from '@/components/team/TeamPhilosophy';
import TeamEnquiryCta from '@/components/team/TeamEnquiryCta';
import {ActionButton} from '@/components/ActionButton';

export const dynamic = 'force-dynamic';

export async function generateMetadata({params}) {
  const {locale} = await params;
  const ar = locale === 'ar';
  return {
    title: ar
      ? 'فريقنا | أساس للاستشارات الهندسية وإدارة المشاريع'
      : 'Our Team | ASAS Engineering & Project Management Consultancy',
    description: ar
      ? 'تعرّف على فريق أساس للاستشارات الهندسية وإدارة المشاريع في أبوظبي عبر التخصصات الهندسية وإدارة المشاريع.'
      : 'Meet the ASAS team in Abu Dhabi across engineering disciplines and project leadership.',
  };
}

export default async function TeamPage({params}) {
  const {locale} = await params;
  const ar = locale === 'ar';
  const members = await getPublishedTeamMembers();
  const heroImage = roleImages.TEAM_HERO;
  const philosophyImage =
    roleImages.TEAM_PHILOSOPHY;

  return (
    <div className="tm">
      <section className="tm-page-hero">
        <div className="tm-page-hero-media" aria-hidden="true">
          {heroImage && (
            <Image src={heroImage} alt="" fill priority sizes="100vw" style={{objectPosition: '55% 38%'}} />
          )}
        </div>
        <div className="tm-page-hero-veil" aria-hidden="true" />
        <svg className="tm-page-hero-blueprint" viewBox="0 0 240 400" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M24 20 V380 M60 50 V350 M96 80 V320" />
            <path d="M24 140 H180 M24 220 H150" />
            <circle cx="24" cy="140" r="3" fill="#a02315" stroke="none" />
          </g>
        </svg>
        <div className="tm-shell tm-page-hero-inner">
          <div className="tm-page-hero-copy">
            <p className="tm-kicker light">
              <i />
              {ar ? 'أساس للاستشارات الهندسية وإدارة المشاريع / الفريق' : 'ASAS / Team'}
            </p>
            <h1>
              {ar ? (
                <>
                  الهندسة
                  <br />
                  جهد فريق.
                </>
              ) : (
                <>
                  Engineering is
                  <br />
                  a team effort.
                </>
              )}
            </h1>
            <p>
              {ar
                ? 'متخصصون عبر العمارة والإنشاءات والكهروميكانيك وإدارة المشاريع والإشراف — ضمن مكتب استشاري واحد في أبوظبي.'
                : 'Specialists across architecture, structure, MEP, project management and supervision — working as one Abu Dhabi consultancy.'}
            </p>
            <ActionButton variant="primary" href="#team-directory" icon={false}>
              {ar ? 'استكشف الفريق' : 'Explore the Team'}
            </ActionButton>
          </div>
          <ul className="tm-page-hero-words" aria-hidden="true">
            <li>{ar ? 'صمّم' : 'Design'}</li>
            <li>{ar ? 'هندس' : 'Engineer'}</li>
            <li>{ar ? 'نسّق' : 'Coordinate'}</li>
            <li>{ar ? 'سلّم' : 'Deliver'}</li>
          </ul>
        </div>
      </section>

      <section className="tm-section tm-directory" id="team-directory">
        <div className="tm-shell">
          <TeamListing members={members} locale={locale} />
        </div>
      </section>

      <TeamPhilosophy locale={locale} image={philosophyImage} />
      <TeamEnquiryCta locale={locale} image={{src: ctaBandImages.team, crop: '50% 35%'}} />
    </div>
  );
}
