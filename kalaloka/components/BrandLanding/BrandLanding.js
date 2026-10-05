import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BrandHero from "@/components/BrandLanding/BrandHero";
import BrandIntroCard from "@/components/BrandLanding/BrandIntroCard";
import ProductSection from "@/components/BrandLanding/ProductSection";
import CoffeeBoardSection from "@/components/BrandLanding/CoffeeBoardSection";
import CatalogProductSection from "@/components/BrandLanding/CatalogProductSection";
import BrandPageFooter from "@/components/BrandLanding/BrandPageFooter";
import BrandCornerBackground, {
  getCircleSideFromSlug,
} from "@/components/BrandLanding/BrandCornerBackground";
import JsonLd from "@/components/JsonLd";
import { brandPageJsonLd, breadcrumbJsonLd } from "@/utils/seo";

export default function BrandLanding({ brand }) {
  return (
    <div className="min-h-screen bg-peach font-serif">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", href: "/" },
          { name: "Our Brands", href: "/our-brands" },
          { name: brand.title, href: `/our-brands/${brand.slug}` },
        ])}
      />
      <JsonLd data={brandPageJsonLd(brand)} />
      <Header activePage="brands" />

      <main id="main-content">
        <BrandCornerBackground
          circlePlacement={getCircleSideFromSlug(brand.slug)}
          topCornerPlacement="afterBanner"
        >
          <BrandHero
            title={brand.title}
            tagline={brand.tagline}
            heroImage={brand.heroImage}
            variant={brand.heroVariant}
          />

          <BrandIntroCard
            paragraphs={brand.intro.paragraphs}
            extra={brand.intro.extra}
          />

          {brand.productSections.map((section) => {
            if (section.layout === "coffee-board") {
              return <CoffeeBoardSection key={section.id} section={section} />;
            }

            if (section.layout === "catalog") {
              return (
                <CatalogProductSection key={section.id} section={section} />
              );
            }

            return (
              <ProductSection
                key={section.id}
                title={section.title}
                subtitle={section.subtitle}
                products={section.products}
                layout={section.layout}
              />
            );
          })}

          <BrandPageFooter currentBrandSlug={brand.slug} />
        </BrandCornerBackground>
      </main>


      <Footer />
    </div>
  );
}
