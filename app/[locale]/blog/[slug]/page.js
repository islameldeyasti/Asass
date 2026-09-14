import Link from 'next/link';
import Image from 'next/image';
import {notFound} from 'next/navigation';
import {ArrowUpRight} from 'lucide-react';
import {Container} from '@/components/UI';
import {ActionButton, ActionGroup} from '@/components/ActionButton';
import {
  categoryLabel,
  formatPostDate,
} from '@/data/blog';
import {
  getPublicBlogPostBySlug,
  getPublicBlogPosts,
  getPublicRelatedBlogPosts,
} from '@/lib/cms/public-data';
import {buildRouteMetadata} from '@/lib/cms/seo/build-metadata';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const posts = await getPublicBlogPosts();
  return posts.flatMap((post) => [
    {locale: 'en', slug: post.slug},
    {locale: 'ar', slug: post.slug},
  ]);
}

export async function generateMetadata({params}) {
  const {locale, slug} = await params;
  const post = await getPublicBlogPostBySlug(slug);
  if (!post) return {title: 'Blog'};
  return buildRouteMetadata({
    locale,
    path: `blog/${slug}`,
    type: 'blog',
    fallbackTitle: post.title,
    fallbackTitleAr: post.titleAr,
    fallbackDescription: post.excerpt || post.description || '',
    fallbackDescriptionAr: post.excerptAr || post.descriptionAr || '',
    fallbackImage: post.cover || post.image || '',
    schemaType: 'Article',
  });
}


export default async function BlogPostPage({params}) {
  const {locale, slug} = await params;
  const ar = locale === 'ar';
  const post = await getPublicBlogPostBySlug(slug);
  if (!post) notFound();

  const related = await getPublicRelatedBlogPosts(slug, {limit: 3});
  const paragraphs = ar ? post.bodyAr : post.body;

  return (
    <div className="blog-page blog-post-page">
      <section className="blog-post-hero">
        <div className="blog-post-hero-photo" aria-hidden="true">
          <Image src={post.cover} alt="" fill priority sizes="100vw" />
        </div>
        <div className="blog-post-hero-veil" aria-hidden="true" />
        <Container>
          <span className="breadcrumb">
            <Link href={`/${locale}/blog`}>{ar ? 'المدونة' : 'Blog'}</Link>
            {' / '}
            {categoryLabel(post.category, locale)}
          </span>
          <p className="blog-kicker">{categoryLabel(post.category, locale)}</p>
          <h1>{ar ? post.titleAr : post.title}</h1>
          <p className="blog-post-date">
            <time dateTime={post.date}>{formatPostDate(post.date, locale)}</time>
          </p>
        </Container>
      </section>

      <article className="blog-post-body">
        <Container>
          <div className="blog-post-prose">
            {(paragraphs || []).map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
          </div>

          <div className="blog-post-actions">
            <ActionGroup>
              <ActionButton variant="primary" href={`/${locale}/project-enquiry`} icon="arrow-up">
                {ar ? 'ابدأ مشروعاً' : 'Start a Project'}
              </ActionButton>
              <ActionButton variant="outline" href={`/${locale}/blog`} icon="arrow-up">
                {ar ? 'كل المقالات' : 'All articles'}
              </ActionButton>
            </ActionGroup>
          </div>
        </Container>
      </article>

      {related.length ? (
        <section className="blog-related">
          <Container>
            <p className="blog-kicker">{ar ? 'اقرأ أيضاً' : 'Keep reading'}</p>
            <h2>{ar ? 'مقالات ذات صلة' : 'Related articles'}</h2>
            <div className="blog-related-grid">
              {related.map((item) => (
                <Link key={item.slug} href={`/${locale}/blog/${item.slug}`} className="blog-related-card">
                  <div className="blog-related-media">
                    <Image src={item.cover} alt="" fill sizes="(max-width: 900px) 100vw, 33vw" />
                  </div>
                  <div className="blog-related-copy">
                    <span>{categoryLabel(item.category, locale)}</span>
                    <strong>{ar ? item.titleAr : item.title}</strong>
                    <em>
                      {ar ? 'اقرأ' : 'Read'}
                      <ArrowUpRight size={14} className={ar ? 'reverse-arrow' : ''} />
                    </em>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      ) : null}
    </div>
  );
}
