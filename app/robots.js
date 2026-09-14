export default async function robots() {
  const {getSeoSettings} = await import('@/lib/cms/seo-store');
  const seo = await getSeoSettings();
  const base = (seo.canonicalBase || 'https://www.asasengg.ae').replace(/\/$/, '');

  if (seo.robotsIndex === false) {
    return {
      rules: {userAgent: '*', disallow: '/'},
      sitemap: `${base}/sitemap.xml`,
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/api/admin'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base.replace(/^https?:\/\//, ''),
  };
}
