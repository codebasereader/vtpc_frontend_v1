import CatalogProductCard from "@/components/BrandLanding/CatalogProductCard";

export default function CatalogProductSection({ section }) {
  const products = section.products ?? [];

  return (
    <section className="mx-auto w-full max-w-7xl px-5 pt-10 pb-6 md:px-8 md:pt-12 lg:px-10 lg:pt-14">
      <div className="grid grid-cols-1 gap-x-5 gap-y-6 md:grid-cols-2 md:gap-x-6 md:gap-y-8 lg:grid-cols-3">
        {products.map((product) => (
          <CatalogProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
