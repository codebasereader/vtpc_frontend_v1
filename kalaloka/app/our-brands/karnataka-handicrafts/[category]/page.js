import { notFound } from "next/navigation";
import BronzewareContent from "@/components/HandicraftsCategory/BronzewareContent";
import {
  getCraftCategoryBySlug,
  getCraftCategorySlugs,
} from "@/utils/data";
import { pageMetadata } from "@/utils/seo";

export function generateStaticParams() {
  return getCraftCategorySlugs().map((category) => ({ category }));
}

export async function generateMetadata({ params }) {
  const { category: slug } = await params;
  const category = getCraftCategoryBySlug(slug);

  if (!category) {
    return { title: "Craft" };
  }

  return pageMetadata({
    title: category.title,
    description: category.tagline,
    path: `/our-brands/${category.parentSlug}/${category.slug}`,
    image: category.products?.[0]?.images?.[0] || category.heroImage,
  });
}

export default async function CraftCategoryPage({ params }) {
  const { category: slug } = await params;
  const category = getCraftCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  return <BronzewareContent category={category} />;
}
