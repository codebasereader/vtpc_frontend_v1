"use client";

import { useState } from "react";

export default function BrandIntroCard({ paragraphs = [], extra = [] }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="relative z-10 mx-auto -mt-16 w-full max-w-3xl px-5 md:-mt-24 md:max-w-6xl md:px-8 lg:-mt-20 lg:px-10">
      <div className="rounded-2xl bg-white px-6 py-8 shadow-[0_12px_40px_rgba(7,71,96,0.1)] md:px-12 md:py-10 lg:px-16 lg:py-12">
        <div className="space-y-4 text-center text-[14px] leading-[1.75] text-navy/80 md:text-[16px] lg:text-[17px]">
          {paragraphs.map((text) => (
            <p key={text}>{text}</p>
          ))}
          {open
            ? extra.map((text) => (
                <p key={text}>{text}</p>
              ))
            : null}
        </div>

        {extra.length > 0 ? (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="inline-flex h-10 items-center justify-center rounded-full border border-coral px-8 text-[14px] font-medium text-coral transition-colors hover:bg-peach md:h-11 md:px-10 md:text-[15px]"
            >
              {open ? "View less" : "View more"}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
