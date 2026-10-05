import Image from "@/components/AppImage";
import Breadcrumb from "@/components/Breadcrumb";

export default function BrandHero({
  title,
  tagline,
  heroImage,
  variant = "default",
  breadcrumbItems,
}) {
  const isCentered = variant === "centered";
  const isLight = variant === "light";
  const isBottom = variant === "bottom";
  const crumbs =
    breadcrumbItems ||
    [
      { name: "Home", href: "/" },
      { name: "Our Brands", href: "/our-brands" },
      { name: title },
    ];

  return (
    <section className="relative h-95 overflow-hidden md:h-105">
      <Image
        src={heroImage}
        alt={`${title}${tagline ? ` — ${tagline}` : ""}`}
        fill
        preload
        sizes="100vw"
        quality={75}
        className="object-cover object-left"
      />
      {isLight ? null : (
        <div
          className={`absolute inset-0 ${
            isCentered
              ? "bg-black/45"
              : isBottom
                ? "bg-gradient-to-t from-black/50 via-black/20 to-black/10"
                : "bg-black/30"
          }`}
        />
      )}

      <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col px-5 md:px-8 lg:px-10">
        <Breadcrumb
          light={!isLight}
          className="shrink-0 pt-6 md:pt-8"
          items={crumbs}
        />

        {isLight ? (
          <div className="flex flex-1 items-end pb-10 md:pb-12">
            <h1 className="sr-only">{title}</h1>
          </div>
        ) : isBottom ? (
          <div className="flex flex-1 items-end pb-24 md:pb-32 lg:pb-28">
            <h1 className="max-w-3xl text-[32px] leading-[1.15] font-semibold text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] md:text-[48px] lg:text-[56px]">
              {title}
            </h1>
          </div>
        ) : (
          <div className="flex flex-1 items-center">
            <div className="max-w-xl text-white md:max-w-2xl lg:max-w-3xl">
              <h1 className="text-[32px] leading-[1.15] font-semibold md:text-[48px] lg:text-[56px]">
                {title}
              </h1>
              {tagline ? (
                <p className="mt-3 text-[16px] leading-[1.45] text-white/90 md:mt-4 md:text-[20px] lg:text-[22px]">
                  {tagline}
                </p>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
