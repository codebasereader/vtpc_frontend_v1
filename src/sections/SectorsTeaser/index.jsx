import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { selectLanguage } from '../../redux/slices/localeSlice'
import { home } from '../../language/home'

export default function SectorsTeaser() {
  const language = useSelector(selectLanguage)
  const t = home.sectorsTeaser

  return (
    <section className="bg-white px-4 py-12 md:px-8">
      <h2 className="text-center text-2xl font-bold text-brand-dark md:text-3xl">{t.title[language]}</h2>
      <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {t.sectors.map((sector) => (
          <Link
            key={sector.name.en}
            to={ROUTES.EXPORTER_CORNER}
            className="group overflow-hidden rounded-[5px] bg-white shadow-[0_0_10px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)]"
          >
            <div className="h-32 overflow-hidden">
              <img
                src={sector.image}
                alt=""
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <p className="p-4 text-center text-sm font-semibold text-brand-primary">{sector.name[language]}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
