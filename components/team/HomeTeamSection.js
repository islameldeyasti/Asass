'use client';

import Image from 'next/image';
import Link from 'next/link';
import {ArrowRight, ArrowUpRight} from 'lucide-react';
import {motion, useReducedMotion} from 'motion/react';
import {roleImages} from '@/data/image-manifest';
import TeamCard from './TeamCard';

const EASE = [0.16, 1, 0.3, 1];

export default function HomeTeamSection({members, locale}) {
  const ar = locale === 'ar';
  const reduced = useReducedMotion();
  const list = Array.isArray(members) ? members.slice(0, 4) : [];
  if (!list.length) return null;
  const sideImage = roleImages.HOME_TEAM;

  return (
    <section className="tm tm-home" id="team" aria-labelledby="home-team-heading">
      <div className="tm-shell">
        <div className="tm-home-top">
          <motion.div
            className="tm-home-copy"
            initial={reduced ? false : {opacity: 0, y: 18}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, amount: 0.4}}
            transition={{duration: 0.65, ease: EASE}}
          >
            <p className="tm-kicker">
              <i />
              {ar ? 'فريقنا' : 'Our Team'}
            </p>
            <h2 id="home-team-heading">
              {ar ? (
                <>
                  الأشخاص خلف
                  <br />
                  العمل.
                </>
              ) : (
                <>
                  The people behind
                  <br />
                  the work.
                </>
              )}
            </h2>
            <p>
              {ar
                ? 'مهندسون ومتخصصون وقادة مشاريع يعملون كتخصصات منسّقة ضمن مكتب أساس للاستشارات الهندسية وإدارة المشاريع في أبوظبي.'
                : 'Engineers, specialists and project leaders working as coordinated disciplines inside the ASAS Abu Dhabi office.'}
            </p>
            <Link className="tm-text-link" href={`/${locale}/team`}>
              {ar ? 'تعرّف على الفريق' : 'Meet the Team'}
              <ArrowRight size={15} className={ar ? 'tm-flip' : ''} />
            </Link>
          </motion.div>

          {sideImage && (
            <motion.div
              className="tm-home-aside"
              initial={reduced ? false : {opacity: 0, y: 18}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true, amount: 0.35}}
              transition={{duration: 0.7, delay: 0.08, ease: EASE}}
            >
              <div className="tm-home-aside-media">
                <Image
                  src={sideImage}
                  alt=""
                  fill
                  sizes="(max-width:900px) 100vw, 38vw"
                  style={{objectPosition: '48% 35%'}}
                />
                <span className="tm-home-aside-tag">{ar ? 'أساس للاستشارات الهندسية وإدارة المشاريع · أبوظبي' : 'ASAS · Abu Dhabi'}</span>
              </div>
              <Link className="tm-home-aside-link" href={`/${locale}/team`}>
                {ar ? 'عرض كل الفريق' : 'View full team'}
                <ArrowUpRight size={14} className={ar ? 'tm-flip' : ''} />
              </Link>
            </motion.div>
          )}
        </div>

        <div className="tm-grid tm-grid-home">
          {list.map((member, index) => (
            <TeamCard key={member.id} member={member} locale={locale} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
