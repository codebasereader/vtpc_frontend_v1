import Link from "next/link";

export default function NavLink({ href, label, isHome, isActive, onClick }) {
  const base =
    "inline-flex h-11 w-full items-center justify-center rounded-full px-6 text-[15px] font-medium whitespace-nowrap transition-colors md:h-11 md:w-auto md:px-5 lg:px-7";

  if (isHome) {
    return (
      <Link
        href={href}
        onClick={onClick}
        aria-current={isActive ? "page" : undefined}
        className={`${base} bg-coral text-white hover:bg-[#d94e33]`}
      >
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={`${base} border bg-white text-navy hover:bg-peach ${
        isActive ? "border-coral" : "border-navy/20"
      }`}
    >
      {label}
    </Link>
  );
}
