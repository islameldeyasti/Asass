'use client';

import {useMemo, useState} from 'react';
import {AnimatePresence, motion, useReducedMotion} from 'motion/react';
import TeamFilter from './TeamFilter';
import TeamGrid from './TeamGrid';
import {getActiveTeamFilters} from '@/lib/team/schema';

const EASE = [0.16, 1, 0.3, 1];

function matchesFilter(member, filter) {
  if (filter === 'all') return true;
  if (filter === 'leadership') return Boolean(member.leadership);
  return member.department_id === filter;
}

export default function TeamListing({members, locale}) {
  const ar = locale === 'ar';
  const reduced = useReducedMotion();
  const [filter, setFilter] = useState('all');
  const filters = useMemo(() => getActiveTeamFilters(members), [members]);

  const leadership = useMemo(
    () => members.filter((member) => member.leadership && matchesFilter(member, filter)),
    [members, filter],
  );
  const rest = useMemo(
    () => members.filter((member) => !member.leadership && matchesFilter(member, filter)),
    [members, filter],
  );

  if (!members.length) {
    return null;
  }

  return (
    <div className="tm-listing">
      <TeamFilter filters={filters} active={filter} onChange={setFilter} locale={locale} />

      <AnimatePresence mode="popLayout">
        {leadership.length > 0 && (
          <motion.section
            key={`lead-${filter}`}
            className="tm-block"
            initial={reduced ? false : {opacity: 0, y: 16}}
            animate={{opacity: 1, y: 0}}
            exit={reduced ? undefined : {opacity: 0, y: 8}}
            transition={{duration: 0.4, ease: EASE}}
          >
            <div className="tm-block-head">
              <p className="tm-kicker">
                <i />
                {ar ? 'القيادة' : 'Leadership'}
              </p>
              <h2>{ar ? 'قيادة أساس للاستشارات الهندسية وإدارة المشاريع' : 'ASAS Leadership'}</h2>
            </div>
            <TeamGrid members={leadership} locale={locale} variant="leadership" />
          </motion.section>
        )}

        {rest.length > 0 && (
          <motion.section
            key={`team-${filter}`}
            className="tm-block"
            initial={reduced ? false : {opacity: 0, y: 16}}
            animate={{opacity: 1, y: 0}}
            exit={reduced ? undefined : {opacity: 0, y: 8}}
            transition={{duration: 0.4, delay: 0.05, ease: EASE}}
          >
            <div className="tm-block-head">
              <p className="tm-kicker">
                <i />
                {ar ? 'الفريق' : 'Team'}
              </p>
              <h2>{ar ? 'المهندسون والمتخصصون' : 'Engineers & specialists'}</h2>
            </div>
            <TeamGrid members={rest} locale={locale} variant="team" />
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
