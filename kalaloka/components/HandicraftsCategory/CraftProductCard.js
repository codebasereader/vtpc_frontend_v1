"use client";

import { useRef, useState } from "react";
import Image from "@/components/AppImage";

function toSrc(path) {
  if (!path) return "";
  if (path.startsWith("/") || path.startsWith("http")) return path;
  return `/${path}`;
}

function getMaterial(product) {
  if (product.material) return product.material;

  const line = (product.details || []).find((item) =>
    /^material\s*:/i.test(item),
  );

  return line ? line.replace(/^material\s*:\s*/i, "") : "";
}

export default function CraftProductCard({ product }) {
  const images = [
    ...new Set((product.images || []).map(toSrc).filter(Boolean)),
  ];
  const material = getMaterial(product);
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
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_8px_28px_rgba(7,71,96,0.08)]">
      <div
        className="relative aspect-[4/5] overflow-hidden bg-white"
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
              className="relative h-full w-full shrink-0 p-5 md:p-6"
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
              className="absolute top-1/2 left-2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-[22px] leading-none text-navy/35 transition-colors hover:text-navy md:left-3"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => goTo(1)}
              className="absolute top-1/2 right-2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-[22px] leading-none text-navy/35 transition-colors hover:text-navy md:right-3"
            >
              ›
            </button>
          </>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-5 pt-4 pb-5 md:px-6 md:pt-5 md:pb-6">
        <h3 className="text-[17px] font-semibold text-navy md:text-[18px]">
          {product.name}
        </h3>
        {product.description ? (
          <p className="mt-2 text-justify text-[13px] leading-[1.55] text-navy/60 md:text-[14px]">
            {product.description}
          </p>
        ) : null}
        {material ? (
          <p className="mt-3 text-[13px] leading-normal text-navy/70 md:text-[14px]">
            Material: {material}
          </p>
        ) : null}
      </div>
    </article>
  );
}
