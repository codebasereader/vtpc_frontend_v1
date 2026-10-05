"use client";

import { useState } from "react";
import Image from "@/components/AppImage";
import CoffeeProductCard from "@/components/BrandLanding/CoffeeProductCard";

export default function CoffeeBoardSection({ section }) {
  const [open, setOpen] = useState(false);
  const allProducts = section.products ?? [];
  const initialCount = 6;
  const visible = open ? allProducts : allProducts.slice(0, initialCount);
  const hasMore = allProducts.length > initialCount;
  const banner = section.banner ?? {};

  return (
    <section className={section.heading ? "pt-14 pb-6 md:pt-16 lg:pt-20" : "pt-10 pb-6 md:pt-12 lg:pt-14"}>
      {section.heading ? (
        <h2 className="mx-auto mb-8 w-full max-w-7xl px-5 text-center text-[24px] font-semibold text-navy md:mb-10 md:px-8 md:text-[32px] lg:px-10 lg:text-[36px]">
          {section.heading}
        </h2>
      ) : null}

      <div className="relative w-full overflow-hidden">
        <div className="grid md:grid-cols-[6fr_4fr]">
          <div className="order-2 flex flex-col justify-center bg-navy px-5 py-10 text-white md:order-1 md:min-h-65 md:px-8 lg:px-10">
            <h3 className="text-[22px] leading-snug font-semibold md:text-[28px] lg:text-[32px]">
              {banner.title}
            </h3>
            {banner.description ? (
              <p className="mt-4 max-w-md text-[13px] leading-[1.7] text-white/70 md:text-[15px]">
                {banner.description}
              </p>
            ) : null}
          </div>
          <div className="relative order-1 min-h-52 bg-[#1a3a48] md:order-2 md:min-h-65">
            {banner.image ? (
              <Image
                src={banner.image}
                alt={banner.title || section.heading}
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                quality={75}
                className="object-cover"
              />
            ) : null}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 w-full max-w-7xl px-5 md:mt-10 md:px-8 lg:px-10">
        <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
          {visible.map((product) => (
            <CoffeeProductCard key={product.id} product={product} />
          ))}
        </div>

        {hasMore && !open ? (
          <div className="mt-10 flex justify-center md:mt-12">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex h-10 items-center justify-center rounded-full border border-coral px-8 text-[14px] font-medium text-coral transition-colors hover:bg-white md:h-11 md:px-10 md:text-[15px]"
            >
              View more products
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
