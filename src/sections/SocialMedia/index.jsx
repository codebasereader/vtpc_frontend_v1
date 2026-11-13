import { useSelector } from 'react-redux'
import { ArrowUpRight } from 'lucide-react'
import { selectLanguage } from '../../redux/slices/localeSlice'
import { home } from '../../language/home'
import { SOCIAL_LINKS } from '../../constants/socialLinks'

export default function SocialMedia() {
  const language = useSelector(selectLanguage)
  const t = home.socialMedia

  return (
    <section className="bg-white px-4 py-14 md:px-8 md:py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-brand-navy-dark md:text-4xl lg:text-[2.75rem] lg:leading-tight">
          {t.title[language]}
        </h2>
        <p className="mt-3 max-w-2xl text-base text-gray-600 md:text-lg">{t.description[language]}</p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SOCIAL_LINKS.map((social) => (
            <a
              key={social.key}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-brand-divider bg-white p-6 shadow-[0_8px_24px_rgba(15,40,80,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(15,40,80,0.12)]"
            >
              <img src={social.icon} alt="" className="h-14 w-14 shrink-0 object-contain" loading="lazy" />
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-bold text-brand-navy-dark">{social.name}</span>
                <span className="block truncate text-sm text-gray-600">{social.handle}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-primary">
                {t.follow[language]}
                <ArrowUpRight size={16} aria-hidden="true" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
