"use client";

import { useEffect, useState } from "react";
import NavLink from "@/components/NavLink";

export default function MobileNav({ navItems, activePage }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 w-10 items-center justify-center justify-self-end text-navy md:hidden"
      >
        {open ? (
          <span className="relative block h-4 w-5">
            <span className="absolute top-1/2 left-0 h-[1.5px] w-full -translate-y-1/2 rotate-45 bg-navy" />
            <span className="absolute top-1/2 left-0 h-[1.5px] w-full -translate-y-1/2 -rotate-45 bg-navy" />
          </span>
        ) : (
          <span className="flex flex-col gap-[5px]">
            <span className="block h-[1.5px] w-5 bg-navy" />
            <span className="block h-[1.5px] w-5 bg-navy" />
            <span className="block h-[1.5px] w-5 bg-navy" />
          </span>
        )}
      </button>

      {open ? (
        <div
          id="mobile-nav"
          className="absolute top-full right-0 left-0 z-20 border-t border-navy/10 bg-white px-5 py-6 md:hidden"
        >
          <nav aria-label="Mobile" className="flex flex-col gap-3">
            {navItems.map((item) => (
              <NavLink
                key={item.key}
                href={item.href}
                label={item.label}
                isHome={item.key === "home"}
                isActive={activePage === item.key}
                onClick={() => setOpen(false)}
              />
            ))}
          </nav>
        </div>
      ) : null}
    </>
  );
}
