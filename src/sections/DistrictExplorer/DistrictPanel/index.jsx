import { useSelector } from 'react-redux'
import { selectLanguage } from '../../../redux/slices/localeSlice'
import { home } from '../../../language/home'
import { getBilingualText } from '../../../lib/bilingual'

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
  const language = useSelector(selectLanguage)
  const t = home.districtExplorer

  if (!district) {
    return <p className="p-6 text-center text-gray-600">{t.selectPrompt[language]}</p>
  }

  const hasData = district.totalExportValueCr != null
  const tagline = getBilingualText(district.tagline, language) || getBilingualText(district.tagline, 'en')

  return (
    <div className="flex max-h-119 flex-col gap-3.75 overflow-y-auto pr-3">
      <div>
        <h3 className="text-2xl font-semibold text-brand-primary">{district.name}</h3>
        {tagline && <p className="text-brand-dark">{tagline}</p>}
      </div>

      {!hasData ? (
        <p className="rounded-[5px] bg-white p-5.75 text-gray-600 shadow-[0_0_10px_rgba(0,0,0,0.05)]">
          {t.noDataFor[language].replace('{district}', district.name)}
        </p>
      ) : (
        <>
          <div className="flex items-center justify-between rounded-[5px] bg-white p-5.75 shadow-[0_0_10px_rgba(0,0,0,0.05)]">
            <h4 className="text-sm font-light uppercase">{t.totalExportsValue[language]}</h4>
            <p className="text-2xl font-semibold text-brand-primary">{district.totalExportValueCr}</p>
          </div>
          <DataList title={t.country[language]} items={district.countries} />
          <DataList title={t.products[language]} items={district.products} />
          <DataList title={t.sector[language]} items={district.sectors} />
        </>
      )}
    </div>
  )
}
