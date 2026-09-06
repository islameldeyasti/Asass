import TeamCard from './TeamCard';

export default function RelatedTeam({members, locale}) {
  const ar = locale === 'ar';
  if (!members?.length) return null;

  return (
    <section className="tm-section tm-related">
      <div className="tm-shell">
        <p className="tm-kicker">
          <i />
          {ar ? 'المزيد من الفريق' : 'Meet More of the Team'}
        </p>
        <h2>{ar ? 'تعرّف على المزيد من الفريق' : 'Meet more of the team'}</h2>
        <div className="tm-grid tm-grid-related">
          {members.map((member, index) => (
            <TeamCard key={member.id} member={member} locale={locale} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
