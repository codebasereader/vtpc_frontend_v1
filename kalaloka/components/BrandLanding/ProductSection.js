import ProductCard from "@/components/BrandLanding/ProductCard";
import CategoryCard from "@/components/BrandLanding/CategoryCard";

export default function ProductSection({
  title,
  subtitle,
  products = [],
  layout = "products",
}) {
  const isCategories = layout === "categories";

  return (
    <section className="mx-auto w-full max-w-7xl px-5 pt-16 pb-6 md:px-8 md:pt-20 lg:px-10 lg:pt-24">
      <div className="mb-8 flex flex-col gap-2 border-b border-navy/15 pb-4 md:mb-10 md:flex-row md:items-end md:justify-between">
        <h2 className="text-[24px] font-semibold text-navy md:text-[28px] lg:text-[32px]">
          {title}
        </h2>
        {subtitle ? (
          <p className="text-[13px] text-navy/60 md:text-[15px]">{subtitle}</p>
        ) : null}
      </div>

      <div
        className={
          isCategories
            ? "grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3"
            : "grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3"
        }
      >
        {products.map((product) =>
          isCategories ? (
            <CategoryCard key={product.id} product={product} />
          ) : (
            <ProductCard key={product.id} product={product} />
          ),
        )}
      </div>
    </section>
  );
}
