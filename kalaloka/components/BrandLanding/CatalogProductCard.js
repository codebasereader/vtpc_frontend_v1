import Image from "@/components/AppImage";

function toSrc(path) {
  if (!path) return "";
  const src = path.startsWith("/") || path.startsWith("http") ? path : `/${path}`;
  return encodeURI(src);
}

function isHiddenDetail(line) {
  const text = String(line).trim();
  if (/^(product code|care|colou?r|weight)\s*:/i.test(text)) return true;
  if (/size may be vary/i.test(text)) return true;
  return false;
}

export default function CatalogProductCard({ product }) {
  const image = toSrc(product.image || product.images?.[0]);
  const details = (product.details || []).filter((line) => !isHiddenDetail(line));

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_8px_28px_rgba(7,71,96,0.08)]">
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

      <div className="flex flex-1 flex-col px-5 pt-4 pb-5 md:px-6 md:pt-5 md:pb-6">
        <h3 className="text-[16px] leading-snug font-semibold text-navy md:text-[18px]">
          {product.name}
        </h3>
        {product.description ? (
          <p className="mt-2 text-justify text-[13px] leading-[1.55] text-navy/65 md:text-[14px]">
            {product.description}
          </p>
        ) : null}
        {details.length ? (
          <div className="mt-2 space-y-0.5 text-[13px] leading-normal text-navy/70 md:text-[14px]">
            {details.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        ) : null}
        {product.price ? (
          <p className="pt-3 text-[15px] font-semibold text-navy md:text-[16px]">
            Price: {product.price}
          </p>
        ) : null}
      </div>
    </article>
  );
}
