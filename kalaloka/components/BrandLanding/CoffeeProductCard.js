import Image from "@/components/AppImage";

function toSrc(path) {
  if (!path) return "";
  if (path.startsWith("/") || path.startsWith("http")) return path;
  return `/${path}`;
}

export default function CoffeeProductCard({ product }) {
  const image = toSrc(product.image || product.images?.[0]);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_8px_28px_rgba(7,71,96,0.08)]">
      {image ? (
        <Image
          src={image}
          alt={product.name}
          width={800}
          height={800}
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          quality={75}
          className="h-auto w-full"
        />
      ) : null}

      <div className="flex flex-1 flex-col px-4 pt-2 pb-4 md:px-5 md:pb-5">
        <h3 className="text-[15px] leading-snug font-semibold text-navy md:text-[16px]">
          {product.name}
        </h3>
        {product.description ? (
          <p className="mt-1.5 text-justify text-[13px] leading-[1.55] text-navy/65 md:text-[14px]">
            {product.description}
          </p>
        ) : null}
        <div className="mt-2 space-y-0.5 text-[13px] leading-normal text-navy/70">
          {product.origin ? <p>Origin: {product.origin}</p> : null}
          {product.bean ? <p>Bean: {product.bean}</p> : null}
          {product.process ? <p>Process: {product.process}</p> : null}
          {product.roast ? <p>Roast profile: {product.roast}</p> : null}
          {product.tastingNotes ? (
            <p>Tasting notes: {product.tastingNotes}</p>
          ) : null}
        </div>
        {product.price ? (
          <p className="mt-auto pt-3 text-[15px] font-semibold text-navy md:text-[16px]">
            Price: {product.price}
          </p>
        ) : null}
      </div>
    </article>
  );
}
