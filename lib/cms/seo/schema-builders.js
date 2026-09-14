/**
 * JSON-LD builders for common ASAS schema types.
 */

function absUrl(base, path = '') {
  const root = String(base || 'https://www.asasengg.ae').replace(/\/+$/, '');
  const cleaned = String(path || '').replace(/^\/+/, '');
  return cleaned ? `${root}/${cleaned}` : root;
}

export function buildOrganizationJsonLd(settings = {}, company = {}, branding = {}) {
  const base = settings.canonicalBase || `https://${company.website || 'www.asasengg.ae'}`;
  const name = settings.siteNameEn || company.name || 'ASAS Engineering';
  const logoPath =
    branding.primaryLogo ||
    branding.lightLogo ||
    settings.defaultOgImage ||
    '/brand/asas-logo-light.png';
  const logo = absUrl(base, logoPath);

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    alternateName: settings.siteNameAr || company.nameAr || undefined,
    url: String(base).replace(/\/+$/, ''),
    logo,
    email: company.email || undefined,
    telephone: company.phone || undefined,
    foundingDate: company.year || undefined,
    address: company.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: company.address,
          addressLocality: company.city || 'Abu Dhabi',
          addressCountry: 'AE',
        }
      : undefined,
    sameAs: Array.isArray(settings.sameAs) ? settings.sameAs.filter(Boolean) : undefined,
  };
}

export function buildWebSiteJsonLd(base = 'https://www.asasengg.ae') {
  const url = String(base).replace(/\/+$/, '');
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ASAS Engineering',
    url,
    inLanguage: ['en', 'ar'],
    potentialAction: {
      '@type': 'SearchAction',
      target: `${url}/en/blog?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * @param {Array<{name: string, url: string}>} items
 */
export function buildBreadcrumbJsonLd(items = []) {
  const list = Array.isArray(items) ? items.filter((item) => item?.name && item?.url) : [];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: list.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildServiceJsonLd({
  name,
  nameAr,
  description,
  descriptionAr,
  url,
  providerName = 'ASAS Engineering & Project Management Consultancy',
  areaServed = 'AE',
  image,
} = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    alternateName: nameAr || undefined,
    description: description || descriptionAr || undefined,
    url,
    image: image || undefined,
    provider: {
      '@type': 'Organization',
      name: providerName,
    },
    areaServed,
  };
}

export function buildArticleJsonLd({
  headline,
  headlineAr,
  description,
  descriptionAr,
  url,
  image,
  datePublished,
  dateModified,
  authorName = 'ASAS Engineering',
  publisherName = 'ASAS Engineering & Project Management Consultancy',
  publisherLogo,
} = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: headline || headlineAr,
    alternateName: headlineAr && headlineAr !== headline ? headlineAr : undefined,
    description: description || descriptionAr || undefined,
    url,
    image: image ? [image] : undefined,
    datePublished: datePublished || undefined,
    dateModified: dateModified || datePublished || undefined,
    author: {
      '@type': 'Organization',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: publisherName,
      logo: publisherLogo
        ? {'@type': 'ImageObject', url: publisherLogo}
        : undefined,
    },
    mainEntityOfPage: url
      ? {'@type': 'WebPage', '@id': url}
      : undefined,
  };
}

export function buildPersonJsonLd({
  name,
  nameAr,
  jobTitle,
  jobTitleAr,
  url,
  image,
  worksFor = 'ASAS Engineering & Project Management Consultancy',
  description,
  email,
  sameAs = [],
} = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    alternateName: nameAr || undefined,
    jobTitle: jobTitle || jobTitleAr || undefined,
    url,
    image: image || undefined,
    description: description || undefined,
    email: email || undefined,
    worksFor: {
      '@type': 'Organization',
      name: worksFor,
    },
    sameAs: Array.isArray(sameAs) && sameAs.length ? sameAs : undefined,
  };
}

export function buildJobPostingJsonLd({
  title,
  titleAr,
  description,
  descriptionAr,
  url,
  datePosted,
  validThrough,
  employmentType = 'FULL_TIME',
  hiringOrganization = 'ASAS Engineering & Project Management Consultancy',
  jobLocation = 'Abu Dhabi, AE',
  identifier,
} = {}) {
  const locationParts = String(jobLocation || '').split(',').map((part) => part.trim());
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: title || titleAr,
    description: description || descriptionAr || undefined,
    url,
    datePosted: datePosted || undefined,
    validThrough: validThrough || undefined,
    employmentType,
    identifier: identifier
      ? {'@type': 'PropertyValue', name: hiringOrganization, value: identifier}
      : undefined,
    hiringOrganization: {
      '@type': 'Organization',
      name: hiringOrganization,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: locationParts[0] || 'Abu Dhabi',
        addressCountry: locationParts[1] || 'AE',
      },
    },
  };
}
