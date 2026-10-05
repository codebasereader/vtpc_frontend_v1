import Image from "@/components/AppImage";
import Link from "next/link";
import MobileNav from "@/components/MobileNav";
import NavLink from "@/components/NavLink";

const navItems = [
  { href: "/", label: "Home", key: "home" },
  { href: "/our-story", label: "Our Story", key: "story" },
  { href: "/our-brands", label: "Our Brands", key: "brands" },
  { href: "/about-gi-tags", label: "About GI Tags", key: "gi" },
];

export default function Header({ activePage = "home" }) {
  return (
    <header className="relative sticky top-0 z-30 w-full bg-white">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-3 items-center px-5 py-4 md:flex md:justify-between md:px-8 md:py-5 lg:px-10">
        <span className="md:hidden" aria-hidden="true" />

        <Link
          href="/"
          className="justify-self-center md:justify-self-start"
        >
          <Image
            src="/header-logo.svg"
            alt="Kala Loka home"
            width={180}
            height={48}
            unoptimized={true}
            className="h-6 w-auto md:h-10"
          />
        </Link>

        <MobileNav navItems={navItems} activePage={activePage} />

        <nav aria-label="Primary" className="hidden items-center gap-2 md:flex lg:gap-3">
          {navItems.map((item) => (
            <NavLink
              key={item.key}
              href={item.href}
              label={item.label}
              isHome={item.key === "home"}
              isActive={activePage === item.key}
            />
          ))}
        </nav>
      </div>
    </header>
  );
}
