import { brands, getBrandBySlug, getBrandSlugs, getCraftCategoryBySlug, getCraftCategorySlugs } from "@/utils/data";
import { absoluteUrl, getSiteUrl } from "@/utils/site";

export default function sitemap() {
  const now = new Date();

  return [
    {
      url: getSiteUrl(),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/our-story"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/our-brands"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
      images: brands.map((brand) => absoluteUrl(brand.image)),
    },
    ...getBrandSlugs().map((slug) => {
      const brand = getBrandBySlug(slug);

      return {
        url: absoluteUrl(`/our-brands/${slug}`),
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
        images: brand?.heroImage ? [absoluteUrl(brand.heroImage)] : undefined,
      };
    }),
    ...getCraftCategorySlugs().map((slug) => {
      const category = getCraftCategoryBySlug(slug);

      return {
        url: absoluteUrl(
          `/our-brands/${category.parentSlug}/${category.slug}`,
        ),
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
        images: category?.heroImage
          ? [absoluteUrl(category.heroImage)]
          : undefined,
      };
    }),
  ];
}

export const dynamic = "force-static";
