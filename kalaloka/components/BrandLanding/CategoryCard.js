import Image from "@/components/AppImage";
import Link from "next/link";

function toSrc(path) {
  if (!path) return "";
  if (path.startsWith("/") || path.startsWith("http")) return path;
  return `/${path}`;
}

export default function CategoryCard({ product }) {
  const image = toSrc(product.image || product.images?.[0]);
  const href = product.href;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-navy">
      <div className="w-full overflow-hidden bg-[#f3eee8]">
        {image ? (
          href ? (
            <Link href={href} className="block">
              <Image
                src={image}
                alt={product.name}
                width={800}
                height={500}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                quality={75}
                className="h-auto w-full"
              />
            </Link>
          ) : (
            <Image
              src={image}
              alt={product.name}
              width={800}
              height={500}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              quality={75}
              className="h-auto w-full"
            />
          )
        ) : null}
      </div>

      <div className="flex flex-1 flex-col items-center px-5 pt-5 pb-6 text-center md:px-6 md:pt-6 md:pb-7">
        <h3 className="text-[18px] leading-snug font-semibold text-white md:text-[20px]">
          {href ? (
            <Link href={href} className="transition-colors hover:text-peach">
              {product.name}
            </Link>
          ) : (
            product.name
          )}
        </h3>
        <div className="mt-2 mb-5 flex-1 text-[13px] leading-[1.55] text-white/80 md:text-[14px]">
          {product.descriptionLead ? (
            <p className="font-bold text-white">{product.descriptionLead}</p>
          ) : null}
          {product.description ? (
            <p className={product.descriptionLead ? "mt-1.5" : undefined}>
              {product.description}
            </p>
          ) : null}
        </div>
        {href ? (
          <Link
            href={href}
            className="inline-flex h-10 items-center justify-center rounded-full bg-white px-6 text-[13px] font-medium text-navy transition-colors hover:bg-peach md:h-11 md:px-7 md:text-[14px]"
          >
            Explore Products
          </Link>
        ) : (
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-full bg-white px-6 text-[13px] font-medium text-navy transition-colors hover:bg-peach md:h-11 md:px-7 md:text-[14px]"
          >
            Explore Products
          </button>
        )}
      </div>
    </article>
  );
}
