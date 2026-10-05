import Image from "@/components/AppImage";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import BrandCornerBackground from "@/components/BrandLanding/BrandCornerBackground";
import JsonLd from "@/components/JsonLd";
import { brands } from "@/utils/data";
import { brandsItemListJsonLd, breadcrumbJsonLd } from "@/utils/seo";

export default function BrandsContent() {
  return (
    <div className="flex min-h-screen flex-col bg-peach font-serif">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", href: "/" },
          { name: "Our Brands", href: "/our-brands" },
        ])}
      />
      <JsonLd data={brandsItemListJsonLd(brands)} />
      <Header activePage="brands" />

      <main id="main-content" className="flex-1">
        <BrandCornerBackground circlePlacement="center" topCornerPlacement="top">
          <div className="mx-auto flex w-full max-w-7xl flex-col px-5 pt-6 pb-16 md:px-8 md:pt-8 md:pb-20 lg:px-10 lg:pb-24">
            <Breadcrumb
              className="mb-8 md:mb-10"
              items={[
                { name: "Home", href: "/" },
                { name: "Our Brands", href: "/our-brands" },
              ]}
            />

            <h1 className="mb-10 text-center text-[28px] leading-[1.2] font-semibold text-navy md:mb-14 md:text-[40px] lg:mb-16 lg:text-[48px]">
              Six brands. One catalog.
            </h1>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
              {brands.map((brand, index) => (
                <article
                  key={brand.slug}
                  className="flex flex-col overflow-hidden rounded-2xl bg-white"
                >
                  <Link
                    href={`/our-brands/${brand.slug}`}
                    className="block w-full overflow-hidden bg-[#f3eee8]"
                  >
                    <Image
                      src={brand.image}
                      alt={brand.title}
                      width={800}
                      height={500}
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      quality={75}
                      preload={index === 0}
                      className="h-auto w-full"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col items-center px-6 pt-6 pb-8 text-center md:px-8 md:pt-7 md:pb-9">
                    <h2 className="text-[20px] font-semibold text-navy md:text-[22px] lg:text-[24px]">
                      <Link
                        href={`/our-brands/${brand.slug}`}
                        className="transition-colors hover:text-coral"
                      >
                        {brand.title}
                      </Link>
                    </h2>
                    <p className="mt-3 mb-6 max-w-xs text-[14px] leading-[1.55] text-navy/70 md:text-[15px]">
                      {brand.description}
                    </p>
                    <Link
                      href={`/our-brands/${brand.slug}`}
                      className="mt-auto inline-flex h-10 items-center justify-center rounded-full bg-navy px-7 text-[14px] font-medium text-white transition-colors hover:bg-[#05384c] md:h-11 md:px-8 md:text-[15px]"
                    >
                      Explore Brand
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-12 flex justify-center md:mt-16">
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center rounded-full border border-coral bg-white px-10 text-[14px] font-medium text-navy transition-colors hover:bg-peach md:h-12 md:px-12 md:text-[15px]"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </BrandCornerBackground>
      </main>

      <Footer />
    </div>
  );
}
