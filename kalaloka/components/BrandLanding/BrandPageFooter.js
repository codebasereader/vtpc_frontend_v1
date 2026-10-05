import Image from "@/components/AppImage";
import Link from "next/link";
import { brands } from "@/utils/data";

function toLink(item) {
  if (!item) return null;

  return {
    href: item.href || `/our-brands/${item.slug}`,
    title: item.title || item.name,
  };
}

function BrandListItem({ brand, isActive }) {
  const href = `/our-brands/${brand.slug}`;
  const className = `flex items-center gap-3 rounded-2xl px-2.5 py-2 text-left transition-colors md:gap-4 md:px-3 md:py-2.5 ${
    isActive
      ? "bg-coral text-white"
      : "bg-white text-navy hover:bg-[#f4f4f4] hover:text-coral"
  }`;

  const content = (
    <>
      <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-[#f3eee8] md:h-16 md:w-24">
        <Image
          src={brand.image}
          alt=""
          fill
          sizes="96px"
          quality={70}
          className="object-cover"
        />
      </span>
      <span className="min-w-0 flex-1 text-[14px] leading-snug font-medium md:text-[16px]">
        {brand.title}
      </span>
      <span aria-hidden="true" className="shrink-0 text-[16px] md:text-[18px]">
        →
      </span>
    </>
  );

  if (isActive) {
    return (
      <span aria-current="page" className={className}>
        {content}
      </span>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

export default function BrandPageFooter({
  currentBrandSlug,
  adjacent,
  navLabel = "Other brands",
}) {
  const prev = toLink(adjacent?.prev);
  const next = toLink(adjacent?.next);
  const showBrandList = Boolean(currentBrandSlug);

  const brandPillClassName =
    "inline-flex h-11 shrink-0 items-center justify-center gap-1 rounded-full border border-coral bg-white px-3 text-[12px] font-medium whitespace-nowrap text-navy transition-colors hover:bg-peach md:h-12 md:gap-1.5 md:px-6 md:text-[15px]";

  const actionPillClassName =
    "inline-flex h-11 shrink-0 items-center justify-center whitespace-nowrap px-5 text-[13px] font-medium md:h-12 md:px-8 md:text-[15px]";

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-3 px-5 pt-10 pb-16 md:gap-4 md:px-8 md:pt-14 md:pb-20 lg:px-10">
      {showBrandList ? (
        <>
          <div aria-hidden="true" className="h-px w-full bg-navy/15" />
          <h2 className="w-full pt-2 text-center text-[22px] font-semibold text-navy md:pt-4 md:text-[28px]">
            Our Brands
          </h2>
          <nav
            aria-label={navLabel}
            className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4"
          >
            {brands.map((brand) => (
              <BrandListItem
                key={brand.slug}
                brand={brand}
                isActive={brand.slug === currentBrandSlug}
              />
            ))}
          </nav>
          <Link
            href="/"
            className={`${actionPillClassName} mt-2 rounded-full border border-coral bg-white text-navy transition-colors hover:bg-peach md:mt-4`}
          >
            Back to Home
          </Link>
        </>
      ) : (
        <>
          {prev || next ? (
            <nav
              aria-label={navLabel}
              className="flex w-full flex-row flex-nowrap items-center justify-between gap-2"
            >
              {prev ? (
                <Link href={prev.href} className={brandPillClassName}>
                  <span aria-hidden="true">←</span>
                  {prev.title}
                </Link>
              ) : (
                <span aria-hidden="true" />
              )}
              {next ? (
                <Link href={next.href} className={brandPillClassName}>
                  {next.title}
                  <span aria-hidden="true">→</span>
                </Link>
              ) : (
                <span aria-hidden="true" />
              )}
            </nav>
          ) : null}
          <Link
            href="/"
            className={`${actionPillClassName} mt-2 rounded-full border border-coral bg-white text-navy transition-colors hover:bg-peach md:mt-4`}
          >
            Back to Home
          </Link>
        </>
      )}
    </div>
  );
}
