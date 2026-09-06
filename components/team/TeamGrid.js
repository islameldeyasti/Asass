import TeamCard from './TeamCard';

export default function TeamGrid({members, locale, variant = 'default'}) {
  if (!members?.length) return null;
  return (
    <div className={`tm-grid tm-grid-${variant === 'leadership' ? 'leadership' : 'team'}`}>
      {members.map((member, index) => (
        <TeamCard key={member.id} member={member} locale={locale} index={index} />
      ))}
    </div>
  );
}
