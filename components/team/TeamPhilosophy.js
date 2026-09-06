import Image from 'next/image';

export default function TeamPhilosophy({locale, image}) {
  const ar = locale === 'ar';
  if (!image) return null;

  return (
    <section className="tm-philosophy">
      <div className="tm-shell tm-philosophy-grid">
        <div className="tm-philosophy-copy">
          <p className="tm-kicker">
            <i />
            {ar ? 'هندسة مشتركة' : 'Engineering Together'}
          </p>
          <h2>
            {ar ? (
              <>
                تخصصات متعددة.
                <br />
                فريق منسّق واحد.
              </>
            ) : (
              <>
                Different disciplines.
                <br />
                One coordinated team.
              </>
            )}
          </h2>
          <p>
            {ar
              ? 'يعمل مهندسو أساس عبر العمارة والإنشاءات والكهروميكانيك وإدارة المشاريع ضمن مسار تنسيق واحد من الفكرة إلى التسليم.'
              : 'ASAS engineers work across architecture, structure, MEP and project management as one coordinated path from concept to delivery.'}
          </p>
        </div>
        <div className="tm-philosophy-media">
          <Image src={image} alt="" fill sizes="(max-width:900px) 100vw, 48vw" />
        </div>
      </div>
    </section>
  );
}
