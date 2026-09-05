import Link from 'next/link';import{ArrowUpRight}from'lucide-react';
export function Container({children,className=''}){return <div className={`container ${className}`}>{children}</div>}
export function Eyebrow({children}){return <p className="eyebrow"><i/> {children}</p>}
export function SectionTitle({eyebrow,title,copy}){return <div className="section-title">{eyebrow&&<Eyebrow>{eyebrow}</Eyebrow>}<h2>{title}</h2>{copy&&<p>{copy}</p>}</div>}
export function ArrowLink({href,children}){return <Link className="arrow-link" href={href}>{children}<ArrowUpRight size={18}/></Link>}
export function CTA({locale,title='Planning a New Project?'}){const ar=locale==='ar';return <section className="project-cta"><Container><Eyebrow>{ar?'ابدأ محادثة':'START A CONVERSATION'}</Eyebrow><h2>{ar?'هل تخطط لمشروع جديد؟':title}</h2><p>{ar?'فريقنا الهندسي جاهز لفهم متطلبات مشروعك.':'Our engineering team is ready to understand your requirements.'}</p><Link className="button light-btn" href={`/${locale}/project-enquiry`}>{ar?'أرسل استفسار مشروع':'Submit a Project Enquiry'} <ArrowUpRight size={17}/></Link></Container></section>}
