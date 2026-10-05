import Image from "@/components/AppImage";
import Link from "next/link";
import LogoMarquee from "@/components/HomeComponents/LogoMarquee";

/** Switch logo marquee style: "plain" (no background) | "pill" (full white bar) */
const LOGO_MARQUEE_VARIANT = "pill";

export default function Banner() {
  const desktopCornerImages = [
    {
      src: "/images/corner-top-right.svg",
      width: 653,
      height: 489,
      className:
        "pointer-events-none absolute top-0 right-0 z-0 hidden h-auto w-[28vw] max-w-xl select-none md:block",
    },
    {
      src: "/images/corner-bottom-left.svg",
      width: 654,
      height: 243,
      className:
        "pointer-events-none absolute bottom-0 left-0 z-0 hidden h-auto w-[32vw] max-w-2xl select-none md:block",
    },
  ];

  return (
    <main
      id="main-content"
      className="relative min-h-[600px] bg-peach font-serif md:min-h-screen md:overflow-hidden"
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
        src="/images/mobile-corner-bottom.svg"
        alt=""
        aria-hidden={true}
        width={654}
        height={243}
        unoptimized={true}
        className="pointer-events-none absolute right-0 bottom-0 left-0 z-0 h-auto w-full select-none md:hidden"
      />

      <Image
        src="/images/logo.png"
        alt="Kala Loka — Treasures of Karnataka"
        width={578}
        height={413}
        preload
        sizes="(min-width: 768px) 320px, 240px"
        quality={75}
        className="pointer-events-none absolute top-0 left-1/2 z-10 h-auto w-60 -translate-x-1/2 md:w-80 lg:w-80"
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center">
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-5 pt-42 pb-10 md:max-w-4xl md:px-8 md:pt-40 md:pb-12 lg:max-w-5xl lg:pt-52 lg:pb-28">
          <section className="flex flex-1 flex-col items-center justify-center text-center">
            <h1 className="text-[26px] leading-[1.22] font-semibold tracking-[-0.015em] text-navy sm:text-[36px] sm:leading-[1.2] md:text-[46px] lg:text-[48px]">
              A living catalog of Karnataka&apos;s finest <br />
              GI-tagged treasures.
            </h1>
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-navy/75 sm:mt-6 sm:max-w-2xl sm:text-lg md:max-w-3xl">
              Six legacy government brands of coffee, handicrafts, silk,
              sandalwood, handlooms and leather and more — each with its own
              story and genesis.
            </p>

            <div className="mt-6 flex w-full max-w-sm flex-col items-stretch gap-2.5 sm:mt-9 sm:max-w-3xl sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3 md:gap-4">
              <Link
                href="/our-brands"
                className="inline-flex h-11 items-center justify-center rounded-full bg-coral px-4 text-[13px] font-medium tracking-wide text-white transition-colors hover:bg-[#d94e33] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral sm:h-[52px] sm:px-8 sm:text-[15px] md:px-9"
              >
                Explore the brands
              </Link>
              <Link
                href="/our-story"
                className="inline-flex h-11 items-center justify-center rounded-full border border-coral bg-white px-4 text-[13px] font-medium tracking-wide text-navy transition-colors hover:bg-peach focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral sm:h-[52px] sm:px-8 sm:text-[15px] md:px-9"
              >
                Read Our Story
              </Link>
              <Link
                href="/about-gi-tags"
                className="inline-flex h-11 items-center justify-center rounded-full border border-coral bg-white px-4 text-[13px] font-medium tracking-wide text-navy transition-colors hover:bg-peach focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral sm:h-[52px] sm:px-8 sm:text-[15px] md:px-9"
              >
                About GI Tags
              </Link>
            </div>
          </section>

          <LogoMarquee variant={LOGO_MARQUEE_VARIANT} />
        </div>
      </div>
    </main>
  );
}
