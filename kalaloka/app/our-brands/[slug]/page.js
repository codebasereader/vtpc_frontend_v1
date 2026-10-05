import { notFound } from "next/navigation";
import BrandLanding from "@/components/BrandLanding/BrandLanding";
import { brands, getBrandBySlug, getBrandSlugs } from "@/utils/data";
import { pageMetadata } from "@/utils/seo";

export function generateStaticParams() {
  return getBrandSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);
  const listing = brands.find((item) => item.slug === slug);

  if (!brand) {
    return { title: "Brand" };
  }

  return pageMetadata({
    title: brand.title,
    description: listing?.description || brand.tagline,
    path: `/our-brands/${slug}`,
    image: brand.heroImage || listing?.image,
  });
}

export default async function BrandPage({ params }) {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);

  if (!brand) {
    notFound();
  }

  return <BrandLanding brand={brand} />;
}
