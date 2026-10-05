import Image from "@/components/AppImage";
import Link from "next/link";
import Header from "@/components/Header";
// import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/utils/seo";

const desktopCornerImages = [
  {
    src: "/images/our-story-top.png",
    width: 653,
    height: 489,
    className:
      "pointer-events-none absolute top-0 right-0 z-0 hidden h-auto w-[28vw] max-w-xl select-none md:block",
  },
  {
    src: "/images/our-story-bottom.svg",
    width: 654,
    height: 243,
    className:
      "pointer-events-none absolute bottom-0 left-0 z-0 hidden h-auto w-[28vw] max-w-xl select-none md:block",
  },
];

export default function OurStoryContent() {
  return (
    <div className="flex min-h-screen flex-col bg-peach font-serif">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", href: "/" },
          { name: "Our Story", href: "/our-story" },
        ])}
      />
      <Header activePage="story" />

      <main
        id="main-content"
        className="relative flex min-h-0 flex-1 flex-col bg-peach"
      >
        {desktopCornerImages.map((image) => (
          <Image
            key={image.src}
            src={image.src}
            alt=""
            aria-hidden={true}
            width={image.width}
            height={image.height}
            unoptimized={true}
            className={image.className}
          />
        ))}

        <Image
          src="/images/our-story-bottom.svg"
          alt=""
          aria-hidden={true}
          width={654}
          height={243}
          unoptimized={true}
          className="pointer-events-none absolute right-0 bottom-0 left-0 z-0 h-auto w-full select-none md:hidden"
        />

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 md:px-8 lg:px-10">
          <Breadcrumb
            className="shrink-0 pt-6 pb-2 md:pt-8 md:pb-4"
            items={[
              { name: "Home", href: "/" },
              { name: "Our Story", href: "/our-story" },
            ]}
          />

          <section className="mx-auto flex max-w-3xl flex-col items-center pb-16 pt-4 text-center md:max-w-4xl md:flex-1 md:justify-center md:pb-8 md:pt-0 lg:max-w-5xl">
            <div className="mb-3 flex flex-col items-center ">
              <Image
                src="/images/story-crown.svg"
                alt=""
                aria-hidden={true}
                width={32}
                height={32}
                unoptimized={true}
                className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8"
              />
              <p className="text-[12px] font-medium tracking-[0.2em] text-navy/70 uppercase md:text-[13px]">
                Our Story
              </p>
            </div>

            <h1 className="text-[28px] leading-[1.15] font-semibold text-navy md:text-[40px] lg:text-[48px]">
              Welcome to Kala Loka.
            </h1>

            <p className="mt-4 max-w-2xl text-[16px] leading-[1.45] font-medium text-navy md:mt-5 md:max-w-3xl md:text-[22px] lg:max-w-4xl">
              Step into Kala Loka, where the timeless artistry of Karnataka comes
              alive. Kala Loka celebrates the soul of Karnataka, its heritage,
              culture, and unparalleled craftsmanship. Here, every artifact tells
              a story of tradition.
            </p>

            <p className="mt-4 max-w-2xl text-[14px] leading-[1.6] text-navy/75 md:mt-5 md:max-w-3xl md:text-[16px] lg:max-w-4xl">
              From Karnataka&apos;s intricately crafted leather goods and exquisite
              handicrafts to the rich aroma of Karnataka&apos;s coffee, the
              luxurious drape of Mysore Silk, the iconic fragrances of Mysore
              Sandal products, and the vibrant charm of Karnataka&apos;s handlooms,
              Kala Loka is home to 6 legacy brands. It&apos;s a representation and
              blend of Karnataka&apos;s exquisite GI-tagged and other artisanal
              heritage products.
            </p>

            <p className="mt-4 max-w-xl text-[14px] leading-[1.6] text-navy/75 md:mt-5 md:max-w-2xl md:text-[16px] lg:max-w-3xl">
              This place is an invitation to journey through Karnataka&apos;s rich
              history and magnificent artisanal crafts.
            </p>

            <div className="mt-6 flex w-full max-w-md flex-col items-center gap-3 md:mt-8 md:max-w-xl md:flex-row md:justify-center md:gap-4 lg:max-w-2xl">
              <Link
                href="/our-brands"
                className="inline-flex h-11 w-full items-center justify-center rounded-full bg-coral px-8 text-[14px] font-medium text-white transition-colors hover:bg-[#d94e33] md:h-12 md:w-auto md:px-10 md:text-[15px]"
              >
                Explore the brands
              </Link>
              <Link
                href="/"
                className="inline-flex h-11 w-full items-center justify-center rounded-full border border-coral bg-white px-8 text-[14px] font-medium text-navy transition-colors hover:bg-peach md:h-12 md:w-auto md:px-10 md:text-[15px]"
              >
                Back to home
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* <Footer /> */}
    </div>
  );
}
