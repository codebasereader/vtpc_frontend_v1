import Image from "@/components/AppImage";

const brandLogos = [
  { src: "/logos/new/coffee_board.webp", alt: "Coffee Board" },
  { src: "/logos/new/cauvery.webp", alt: "Cauvery" },
  { src: "/logos/new/mysore_silk.jpg", alt: "Mysore Silk (KSIC)" },
  { src: "/logos/new/mysore_sandal_soap.webp", alt: "Mysore Sandal Soap" },
  { src: "/logos/new/priyadharshini.jpg", alt: "Priyadharshini Handlooms" },
  { src: "/logos/new/lidkar.png", alt: "Lidkar" },
];

function MarqueeTrack({ variant }) {
  const frameClassName =
    variant === "pill"
      ? "relative h-16 w-full sm:h-20 md:h-24"
      : "relative h-14 w-full sm:h-16 md:h-20";

  return (
    <div className="logo-marquee-track flex items-center">
      {[...brandLogos, ...brandLogos].map((logo, index) => (
        <div
          key={`${logo.src}-${index}`}
          className="w-[calc(100cqw/4)] shrink-0 px-2 sm:px-3"
        >
          <div className={frameClassName}>
            <Image
              src={logo.src}
              alt={logo.alt}
              fill
              sizes="(min-width: 768px) 140px, 100px"
              quality={80}
              className="object-contain"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function MarqueeCard({ children, className = "" }) {
  return (
    <div
      className={`md:mb-0 mb-30 relative overflow-hidden border-b-[3px] border-[#ee5a3c] bg-white [container-type:inline-size] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_3px_0_0_rgba(238,90,60,0.25),0_8px_18px_rgba(7,71,96,0.14)] ${className}`}
    >
      <div className="[mask-image:linear-gradient(to_right,transparent_0%,black_12%,black_88%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_12%,black_88%,transparent_100%)]">
        {children}
      </div>
    </div>
  );
}

/** @param {{ variant?: "plain" | "pill" }} props */
export default function LogoMarquee({ variant = "plain" }) {
  if (variant === "pill") {
    return (
      <div className="relative z-20 mx-auto md:mt-8 w-full max-w-sm sm:mt-10 sm:max-w-lg md:max-w-2xl lg:max-w-3xl">
        <MarqueeCard className="rounded-2xl py-1 md:rounded-3xl ">
          <MarqueeTrack variant="pill" />
        </MarqueeCard>
      </div>
    );
  }

  return (
    <div className="relative z-20 mx-auto md:mt-8 w-full max-w-sm sm:mt-10 sm:max-w-lg md:max-w-2xl lg:max-w-3xl">
      <MarqueeCard className="rounded-2xl py-1 md:rounded-full ">
        <MarqueeTrack variant="plain" />
      </MarqueeCard>
    </div>
  );
}
