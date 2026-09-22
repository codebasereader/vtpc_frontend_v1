export default function KarnatakaHighlights({ highlights }) {
  if (highlights.length === 0) return null

  return (
    <section className="bg-white px-4 py-12 md:px-8">
      <h2 className="text-center text-2xl font-bold text-brand-dark md:text-3xl">
        Explore Unlimited Trade Prospects Worldwide
      </h2>
      <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {highlights.map((item) => (
          <div key={item.title} className="rounded-[5px] bg-white p-6 shadow-[0_0_10px_rgba(0,0,0,0.05)]">
            <h3 className="text-lg font-semibold text-brand-primary">{item.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
