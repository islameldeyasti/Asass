import Link from 'next/link';
import Image from 'next/image';
import {ArrowUpRight} from 'lucide-react';
import {Container} from '@/components/UI';
import {ActionButton, ActionGroup} from '@/components/ActionButton';
import {
  categoryLabel,
  formatPostDate,
  getPosts,
} from '@/data/blog';
import {roleImages} from '@/data/image-manifest';

export async function generateMetadata({params}) {
  const {locale} = await params;
  return {
    title: locale === 'ar' ? 'مدونة أساس | رؤى هندسية' : 'ASAS Blog | Engineering Insights',
    description:
      locale === 'ar'
        ? 'مقالات ورؤى من أساس للاستشارات الهندسية وإدارة المشاريع حول التصميم والتنسيق والتنفيذ في أبوظبي.'
        : 'Articles and insights from ASAS Engineering on design, coordination and delivery in Abu Dhabi.',
  };
}

export default async function BlogPage({params}) {
  const {locale} = await params;
  const ar = locale === 'ar';
  const posts = getPosts();

  return (
    <div className="blog-page">
      <section className="blog-hero">
        <div className="blog-hero-photo" aria-hidden="true">
          <Image src={roleImages.ABOUT_HERO} alt="" fill priority sizes="100vw" />
        </div>
        <div className="blog-hero-veil" aria-hidden="true" />
        <Container>
          <span className="breadcrumb">
            {ar ? 'أساس' : 'ASAS'} / {ar ? 'المدونة' : 'Blog'}
          </span>
          <p className="blog-kicker">{ar ? 'رؤى ومقالات' : 'Insights & articles'}</p>
          <h1>{ar ? 'مدونة أساس الهندسية' : 'The ASAS Engineering Blog'}</h1>
          <p>
            {ar
              ? 'ملاحظات عملية حول التصميم المنسق والتنفيذ والإشراف من فريق أساس في أبوظبي.'
              : 'Practical notes on coordinated design, delivery and supervision from the ASAS team in Abu Dhabi.'}
          </p>
        </Container>
      </section>

      <section className="blog-grid-section">
        <Container>
          <div className="blog-grid">
            {posts.map((post, index) => (
              <article key={post.slug} className={`blog-card${index === 0 ? ' is-featured' : ''}`}>
                <Link href={`/${locale}/blog/${post.slug}`} className="blog-card-link">
                  <div className="blog-card-media">
                    <Image
                      src={post.cover}
                      alt=""
                      fill
                      sizes={index === 0 ? '(max-width: 900px) 100vw, 66vw' : '(max-width: 900px) 100vw, 33vw'}
                    />
                  </div>
                  <div className="blog-card-copy">
                    <div className="blog-card-meta">
                      <span>{categoryLabel(post.category, locale)}</span>
                      <time dateTime={post.date}>{formatPostDate(post.date, locale)}</time>
                    </div>
                    <h2>{ar ? post.titleAr : post.title}</h2>
                    <p>{ar ? post.excerptAr : post.excerpt}</p>
                    <span className="blog-card-cta">
                      {ar ? 'اقرأ المقال' : 'Read article'}
                      <ArrowUpRight size={16} className={ar ? 'reverse-arrow' : ''} />
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="blog-cta asas-cta-band">
        <div className="blog-cta-media" aria-hidden="true">
          <Image src={roleImages.ENQUIRY_HERO} alt="" fill sizes="100vw" />
        </div>
        <div className="blog-cta-veil" aria-hidden="true" />
        <Container>
          <div className="blog-cta-inner">
            <p className="blog-kicker light">{ar ? 'الخطوة التالية' : 'Next step'}</p>
            <h2>{ar ? 'هل تخطط لمشروع جديد؟' : 'Planning a new project?'}</h2>
            <p>
              {ar
                ? 'تحدث مع فريق أساس حول التصميم والإشراف وإدارة المشروع.'
                : 'Talk with the ASAS team about design, supervision and project management.'}
            </p>
            <ActionGroup>
              <ActionButton variant="primary" href={`/${locale}/project-enquiry`} icon="arrow-up">
                {ar ? 'ابدأ مشروعاً' : 'Start a Project'}
              </ActionButton>
              <ActionButton variant="outline" href={`/${locale}/contact`} icon="arrow-up">
                {ar ? 'تواصل معنا' : 'Contact Us'}
              </ActionButton>
            </ActionGroup>
          </div>
        </Container>
      </section>
    </div>
  );
}
