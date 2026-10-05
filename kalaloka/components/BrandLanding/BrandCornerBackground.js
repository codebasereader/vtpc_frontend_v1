import Image from "@/components/AppImage";

const bottomCornerImage = {
  src: "/images/corner-bottom-left.svg",
  width: 654,
  height: 243,
  className:
    "pointer-events-none absolute bottom-0 left-0 z-0 h-auto w-[50vw] max-w-2xl select-none md:w-[32vw]",
};

const topCornerClassNames = {
  top: "pointer-events-none absolute top-0 right-0 z-0 h-auto w-[45vw] max-w-xl select-none md:w-[28vw]",
  afterBanner:
    "pointer-events-none absolute top-[380px] right-0 z-0 h-auto w-[45vw] max-w-xl select-none md:top-[420px] md:w-[28vw]",
};

const circleBaseClassName =
  "pointer-events-none absolute top-1/2 z-0 h-auto w-[40vw] max-w-[280px] -translate-y-1/2 select-none md:w-[22vw]";

const circlePlacementClassNames = {
  center: `${circleBaseClassName} left-1/2 -translate-x-1/2`,
  left: `${circleBaseClassName} left-0`,
  right: `${circleBaseClassName} right-0`,
};

export function getCircleSideFromSlug(slug) {
  if (!slug) return "left";

  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) {
    hash += slug.charCodeAt(i);
  }

  return hash % 2 === 0 ? "left" : "right";
}

export default function BrandCornerBackground({
  children,
  circlePlacement = null,
  /** "top" for listing pages without a banner; "afterBanner" for brand product pages */
  topCornerPlacement = "top",
}) {
  const circleClassName = circlePlacement
    ? circlePlacementClassNames[circlePlacement]
    : null;
  const topCornerClassName =
    topCornerClassNames[topCornerPlacement] || topCornerClassNames.top;

  return (
    <div className="relative">
      <Image
        src="/images/corner-top-right.svg"
        alt=""
        aria-hidden={true}
        width={653}
        height={489}
        unoptimized={true}
        className={topCornerClassName}
      />
      <Image
        src={bottomCornerImage.src}
        alt=""
        aria-hidden={true}
        width={bottomCornerImage.width}
        height={bottomCornerImage.height}
        unoptimized={true}
        className={bottomCornerImage.className}
      />
      {circleClassName ? (
        <Image
          src="/images/full-circle.svg"
          alt=""
          aria-hidden={true}
          width={530}
          height={530}
          unoptimized={true}
          className={circleClassName}
        />
      ) : null}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
