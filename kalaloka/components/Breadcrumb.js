import Link from "next/link";

export default function Breadcrumb({ items, className = "", light = false }) {
  const muted = light ? "text-white/75" : "text-navy/60";
  const current = light ? "text-white" : "text-navy";
  const hover = light ? "hover:text-white" : "hover:text-navy";

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className={`flex flex-wrap items-center gap-x-1 text-[13px] md:text-[14px] ${muted}`}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.name}-${index}`} className="flex items-center gap-x-1">
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              {item.href && !isLast ? (
                <Link href={item.href} className={`transition-colors ${hover}`}>
                  {item.name}
                </Link>
              ) : (
                <span className={current} aria-current="page">
                  {item.name}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
