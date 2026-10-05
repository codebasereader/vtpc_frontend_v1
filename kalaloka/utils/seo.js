import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, absoluteUrl } from "@/utils/site";

export function pageMetadata({
  title,
  description,
  path = "/",
  image,
  type = "website",
}) {
  const url = path;
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      type,
      siteName: SITE_NAME,
      locale: "en_IN",
      ...(image
        ? {
            images: [
              {
                url: image,
                alt: fullTitle,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}

export function organizationJsonLd() {
  const url = absoluteUrl("/");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}/#organization`,
        name: SITE_NAME,
        alternateName: SITE_TAGLINE,
        url,
        logo: absoluteUrl("/header-logo.png"),
        description: SITE_DESCRIPTION,
        areaServed: {
          "@type": "AdministrativeArea",
          name: "Karnataka",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        publisher: {
          "@id": `${url}/#organization`,
        },
        inLanguage: "en-IN",
      },
    ],
  };
}

export function breadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.href || "/"),
    })),
  };
}

export function brandsItemListJsonLd(brands) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Kala Loka brands",
    itemListElement: brands.map((brand, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: brand.title,
      url: absoluteUrl(`/our-brands/${brand.slug}`),
      image: absoluteUrl(brand.image),
      description: brand.description,
    })),
  };
}

export function brandPageJsonLd(brand) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: brand.title,
    description: brand.tagline,
    url: absoluteUrl(`/our-brands/${brand.slug}`),
    image: absoluteUrl(brand.heroImage),
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
  };
}
