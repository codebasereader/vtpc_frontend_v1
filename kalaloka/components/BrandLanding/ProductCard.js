"use client";

import { useRef, useState } from "react";
import Image from "@/components/AppImage";

function toSrc(path) {
  if (!path) return "";
  if (path.startsWith("/") || path.startsWith("http")) return path;
  return `/${path}`;
}

export default function ProductCard({ product }) {
  const images = (product.images || []).map(toSrc).filter(Boolean);
  const [index, setIndex] = useState(0);
  const startX = useRef(0);
  const hasCarousel = images.length > 1;

  function goTo(direction) {
    setIndex((currentIndex) => {
      const next = currentIndex + direction;
      if (next < 0) return images.length - 1;
      if (next >= images.length) return 0;
      return next;
    });
  }

  function onTouchStart(event) {
    startX.current = event.touches[0].clientX;
  }

  function onTouchEnd(event) {
    if (!hasCarousel) return;
    const delta = event.changedTouches[0].clientX - startX.current;
    if (delta > 40) goTo(-1);
    if (delta < -40) goTo(1);
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white">
      <div
        className="relative aspect-square overflow-hidden bg-[#ececec]"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {images.map((src, imageIndex) => (
            <div
              key={`${src}-${imageIndex}`}
              className="relative h-full w-full shrink-0 p-6"
            >
              <Image
                src={src}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                quality={75}
                className="object-contain"
              />
            </div>
          ))}
        </div>

        {hasCarousel ? (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => goTo(-1)}
              className="absolute top-1/2 left-3 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy shadow-sm md:h-9 md:w-9"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => goTo(1)}
              className="absolute top-1/2 right-3 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy shadow-sm md:h-9 md:w-9"
            >
              ›
            </button>
          </>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-5 py-5 text-center md:px-6 md:py-6">
        <h3 className="text-[18px] font-semibold text-navy md:text-[20px]">
          {product.name}
        </h3>
        <p className="mt-2 min-h-[58px] text-justify text-[13px] leading-[1.55] text-navy/65 md:text-[14px]">
          {product.description}
        </p>
        {product.price ? (
          <p className="mt-4 text-[15px] font-semibold text-navy md:text-[16px]">
            Price: {product.price}
          </p>
        ) : null}
      </div>
    </article>
  );
}
