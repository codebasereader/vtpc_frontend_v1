function DataList({ title, items, suffix = '%' }) {
  return (
    <div className="rounded-[5px] bg-white p-5.75 shadow-[0_0_10px_rgba(0,0,0,0.05)]">
      <h4 className="text-xs font-semibold uppercase text-brand-primary">{title}</h4>
      <ul className="mt-3 space-y-2.5">
        {items.map((item) => (
          <li
            key={item.name}
            className="flex justify-between border-b border-brand-divider pb-2.5 last:mb-0 last:border-none last:pb-0"
          >
            <span>{item.name}</span>
            <span className="text-brand-primary">
              {item.percentage}
              {suffix}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function DistrictPanel({ district }) {
  if (!district) {
    return <p className="p-6 text-center text-gray-600">Select a district on the map to view its export data.</p>
  }

  const hasData = district.totalExportValueCr != null

  return (
    <div className="flex max-h-119 flex-col gap-3.75 overflow-y-auto pr-3">
      <div>
        <h3 className="text-2xl font-semibold text-brand-primary">{district.name}</h3>
        {district.tagline.en && <p className="text-brand-dark">{district.tagline.en}</p>}
      </div>

      {!hasData ? (
        <p className="rounded-[5px] bg-white p-5.75 text-gray-600 shadow-[0_0_10px_rgba(0,0,0,0.05)]">
          Export data for {district.name} is not available yet.
        </p>
      ) : (
        <>
          <div className="flex items-center justify-between rounded-[5px] bg-white p-5.75 shadow-[0_0_10px_rgba(0,0,0,0.05)]">
            <h4 className="text-sm font-light uppercase">Total Exports Value (INR, in Crores)</h4>
            <p className="text-2xl font-semibold text-brand-primary">{district.totalExportValueCr}</p>
          </div>
          <DataList title="Country" items={district.countries} />
          <DataList title="Products" items={district.products} />
          <DataList title="Sector" items={district.sectors} />
        </>
      )}
    </div>
  )
}
