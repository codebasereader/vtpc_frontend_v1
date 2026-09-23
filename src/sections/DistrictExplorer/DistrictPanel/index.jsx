import { useSelector } from 'react-redux'
import { selectLanguage } from '../../../redux/slices/localeSlice'
import { home } from '../../../language/home'
import { getBilingualText } from '../../../lib/bilingual'

function DataList({ title, items, suffix = '%' }) {
  return (
    <div className="border-t border-gray-100 pt-4 first:border-none first:pt-0">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-brand-primary">{title}</h4>
      <ul className="mt-3 space-y-2.5">
        {items.map((item) => (
          <li key={item.name} className="flex justify-between text-sm">
            <span className="text-gray-600">{item.name}</span>
            <span className="font-medium text-brand-dark">
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
  const language = useSelector(selectLanguage)
  const t = home.districtExplorer

  if (!district) {
    return (
      <div className="flex items-center justify-center rounded-2xl bg-white p-8 text-center text-gray-600 shadow-[0_8px_24px_rgba(15,40,80,0.06)]">
        {t.selectPrompt[language]}
      </div>
    )
  }

  const hasData = district.totalExportValueCr != null
  const tagline = getBilingualText(district.tagline, language) || getBilingualText(district.tagline, 'en')

  return (
    <div className="flex max-h-119 flex-col gap-4 overflow-y-auto rounded-2xl bg-white p-5.75 shadow-[0_8px_24px_rgba(15,40,80,0.06)] md:p-6">
      <div>
        <h3 className="text-2xl font-bold text-brand-navy-dark">{district.name}</h3>
        {tagline && <p className="mt-1 text-sm text-gray-600">{tagline}</p>}
      </div>

      {!hasData ? (
        <p className="border-t border-gray-100 pt-4 text-sm text-gray-600">
          {t.noDataFor[language].replace('{district}', district.name)}
        </p>
      ) : (
        <>
          <div className="flex items-center justify-between rounded-xl bg-brand-page px-4 py-3">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {t.totalExportsValue[language]}
            </span>
            <span className="text-xl font-bold text-brand-primary">{district.totalExportValueCr}</span>
          </div>
          <DataList title={t.country[language]} items={district.countries} />
          <DataList title={t.products[language]} items={district.products} />
          <DataList title={t.sector[language]} items={district.sectors} />
        </>
      )}
    </div>
  )
}
