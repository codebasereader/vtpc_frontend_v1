import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BrandHero from "@/components/BrandLanding/BrandHero";
import BrandPageFooter from "@/components/BrandLanding/BrandPageFooter";
import BrandCornerBackground, {
  getCircleSideFromSlug,
} from "@/components/BrandLanding/BrandCornerBackground";
import BrandIntroCard from "@/components/BrandLanding/BrandIntroCard";
import CraftProductCard from "@/components/HandicraftsCategory/CraftProductCard";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/utils/seo";
import { getAdjacentCraftCategories } from "@/utils/data";
import { absoluteUrl } from "@/utils/site";

export default function BronzewareContent({ category }) {
  const parentHref = `/our-brands/${category.parentSlug}`;

  return (
    <div className="min-h-screen bg-peach font-serif">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", href: "/" },
          { name: category.parentTitle, href: parentHref },
          {
            name: category.title,
            href: `${parentHref}/${category.slug}`,
          },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: category.title,
          description: category.tagline,
          url: absoluteUrl(`${parentHref}/${category.slug}`),
          image: absoluteUrl(category.heroImage),
        }}
      />

      <Header activePage="brands" />

      <main id="main-content">
        <BrandCornerBackground
          circlePlacement={getCircleSideFromSlug(category.slug)}
          topCornerPlacement="afterBanner"
        >
          <BrandHero
            title={category.title}
            tagline={category.tagline}
            heroImage={category.heroImage}
            breadcrumbItems={[
              { name: "Home", href: "/" },
              { name: category.parentTitle, href: parentHref },
              { name: category.title },
            ]}
          />

          {category.intro ? (
            <BrandIntroCard
              paragraphs={category.intro.paragraphs}
              extra={category.intro.extra}
            />
          ) : null}

          <section className="mx-auto w-full max-w-7xl px-5 pt-8 pb-6 md:px-8 md:pt-10 lg:px-10 lg:pt-12">
            <Link
              href={parentHref}
              className="inline-flex items-center gap-1.5 text-[14px] font-medium text-navy transition-colors hover:text-coral md:text-[15px]"
            >
              <span aria-hidden="true">←</span>
              Back to {category.parentTitle}
            </Link>

            {category.products?.length ? (
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mt-10 md:gap-8 lg:grid-cols-3">
                {category.products.map((product) => (
                  <CraftProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : null}
          </section>

          <BrandPageFooter
            adjacent={getAdjacentCraftCategories(category.slug)}
            navLabel="Other crafts"
          />
        </BrandCornerBackground>
      </main>

      <Footer />
    </div>
  );
}
