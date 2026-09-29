import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSelector } from 'react-redux'
import {
  HeartHandshake,
  Megaphone,
  Landmark,
  ShieldCheck,
  Award,
  Target,
  Compass,
  ShipWheel,
  Handshake,
  Building2,
  ClipboardList,
  Scale,
  MapPin,
  Phone,
  Mail,
  UserRound,
  FileText,
  ArrowUpRight,
} from 'lucide-react'
import { getStaff } from '../../../api/staffApi'
import { getOffices } from '../../../api/officesApi'
import { selectLanguage } from '../../../redux/slices/localeSlice'
import { about as t } from '../../../language/about'

const HERO_IMAGE = '/assets/images/about-page/hero-about.png'
const LOCATE_US_IMAGE = '/assets/images/about-page/loacte-us.png'

const HERO_CARD_ICONS = {
  exporterHandholding: HeartHandshake,
  advocacy: Megaphone,
  sezImpetus: Building2,
  nodalAgency: Landmark,
  giPromotion: Award,
}

const WHAT_WE_DO_ICONS = {
  promoteExportsSez: ShipWheel,
  coordinateStrategy: Handshake,
  developExportHubs: Building2,
  implementTies: ClipboardList,
  giPolicy: ShieldCheck,
  wtoIpr: Scale,
}

export default function AboutUs() {
  const language = useSelector(selectLanguage)

  const [staff, setStaff] = useState([])
  const [offices, setOffices] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    Promise.all([getStaff(), getOffices()])
      .then(([staffData, officesData]) => {
        if (!isMounted) return
        setStaff(staffData)
        setOffices(officesData)
      })
      .catch(() => {
        if (isMounted) {
          setStaff([])
          setOffices([])
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const orgChain = useMemo(
    () =>
      staff
        .filter((item) => item.group === 'org-chart' && (item.order ?? 0) <= 3)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [staff],
  )
  const orgSiblings = useMemo(
    () =>
      staff
        .filter((item) => item.group === 'org-chart' && (item.order ?? 0) > 3)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [staff],
  )
  const council = useMemo(
    () =>
      staff
        .filter((item) => item.group === 'governing-council')
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [staff],
  )

  const [firstOffice, ...restOffices] = offices

  return (
    <>
      <Helmet>
        <title>{t.pageTitle[language]} — VTPC Karnataka</title>
        <meta name="description" content={t.hero.description[language]} />
      </Helmet>

      {/* Hero */}
      <section
        className="relative bg-cover bg-center px-4 py-16 md:px-8 md:py-24"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy-dark/90 via-brand-navy-dark/70 to-brand-navy-dark/30" />
        <div className="relative mx-auto max-w-6xl">
          <h1 className="max-w-2xl text-3xl font-extrabold text-white md:text-4xl lg:text-[2.75rem] lg:leading-tight">
            {t.hero.heading[language]}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/90 md:text-lg">
            {t.hero.description[language]}
          </p>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {t.hero.cards.map((card) => {
              const Icon = HERO_CARD_ICONS[card.key]
              return (
                <div
                  key={card.key}
                  className="flex flex-col items-center gap-2 rounded-xl bg-white/10 p-4 text-center backdrop-blur-sm ring-1 ring-white/15 transition-colors hover:bg-white/15"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gold/90 text-brand-navy-dark">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <p className="text-sm font-semibold text-white">{card.title[language]}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="bg-brand-page px-4 py-16 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          <div className="rounded-2xl border-t-4 border-brand-primary bg-white p-7 shadow-[0_8px_24px_rgba(15,40,80,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(15,40,80,0.1)]">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-surface text-brand-primary">
              <Target size={22} aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-xl font-bold text-brand-navy-dark">{t.visionMission.vision.label[language]}</h2>
            <p className="mt-2 text-base leading-relaxed text-gray-600">{t.visionMission.vision.text[language]}</p>
          </div>

          <div className="rounded-2xl border-t-4 border-brand-navy bg-white p-7 shadow-[0_8px_24px_rgba(15,40,80,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(15,40,80,0.1)]">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-page text-brand-navy">
              <Compass size={22} aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-xl font-bold text-brand-navy-dark">
              {t.visionMission.mission.label[language]}
            </h2>
            <ul className="mt-2 flex flex-col gap-2">
              {t.visionMission.mission.items.map((item, index) => (
                <li key={index} className="flex gap-2 text-base leading-relaxed text-gray-600">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-navy" />
                  {item[language]}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="relative overflow-hidden bg-brand-navy-dark px-4 py-16 md:px-8 md:pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3">
            <span className="h-8 w-1.5 rounded-full bg-brand-primary" />
            <h2 className="text-2xl font-bold text-white md:text-3xl">{t.whatWeDo.heading[language]}</h2>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {t.whatWeDo.cards.map((card) => {
              const Icon = WHAT_WE_DO_ICONS[card.key]
              return (
                <div
                  key={card.key}
                  className="group flex flex-col gap-3 rounded-2xl bg-white/95 p-6 shadow-[0_10px_28px_rgba(0,0,0,0.18)] ring-1 ring-white/40 transition-all hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,0,0,0.24)]"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-surface text-brand-primary transition-colors group-hover:bg-brand-primary group-hover:text-white">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <h3 className="text-base font-bold text-brand-navy-dark">{card.title[language]}</h3>
                  <p className="flex-1 text-sm leading-relaxed text-gray-600">{card.description[language]}</p>

                  {card.pdf && (
                    <a
                      href={card.pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-page px-3 py-1.5 text-xs font-semibold text-brand-primary transition-colors hover:bg-brand-surface"
                    >
                      <FileText size={14} aria-hidden="true" />
                      {t.viewPdf[language]}
                      <ArrowUpRight size={12} aria-hidden="true" />
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Organization Chart */}
      <section className="relative overflow-hidden bg-white px-4 py-16 md:px-8 md:py-20">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-brand-page to-transparent"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-4xl">
          <div className="flex flex-col items-center text-center">
            <span className="text-xs font-bold tracking-[0.2em] text-brand-primary uppercase">VTPC</span>
            <h2 className="mt-2 text-2xl font-bold text-brand-navy-dark md:text-3xl">
              {t.orgChart.heading[language]}
            </h2>
            <span className="mt-3 h-1 w-14 rounded-full bg-brand-primary" />
          </div>

          {isLoading && <p className="mt-10 text-center text-gray-600">{t.loading[language]}</p>}

          {!isLoading && orgChain.length === 0 && <p className="mt-10 text-center text-gray-500">—</p>}

          {!isLoading && orgChain.length > 0 && (
            <div className="mt-14 flex flex-col items-center">
              {orgChain.map((member, index) => (
                <div key={member.id} className="flex flex-col items-center">
                  <OrgNode member={member} highlight={index === 0} />
                  {index < orgChain.length - 1 && <Connector />}
                </div>
              ))}

              {orgSiblings.length > 0 && (
                <>
                  <Connector />
                  <div className="relative inline-flex flex-wrap justify-center gap-x-12 gap-y-10">
                    {orgSiblings.length > 1 && (
                      <div
                        className="pointer-events-none absolute top-0 right-28 left-28 hidden h-px bg-brand-primary/30 sm:block"
                        aria-hidden="true"
                      />
                    )}
                    {orgSiblings.map((member) => (
                      <div key={member.id} className="relative flex flex-col items-center pt-8">
                        <div
                          className="absolute top-0 left-1/2 h-8 w-px -translate-x-1/2 bg-brand-primary/30"
                          aria-hidden="true"
                        />
                        <OrgNode member={member} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Governing Council */}
      <section className="bg-brand-page px-4 py-16 md:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-brand-navy-dark md:text-3xl">
            {t.governingCouncil.heading[language]}
          </h2>

          {isLoading && <p className="mt-10 text-center text-gray-600">{t.loading[language]}</p>}

          {!isLoading && council.length > 0 && (
            <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_rgba(15,40,80,0.06)]">
              <table className="hidden w-full text-left sm:table">
                <thead>
                  <tr className="bg-brand-primary text-white">
                    <th className="px-5 py-3.5 text-sm font-semibold">{t.governingCouncil.slNoColumn[language]}</th>
                    <th className="px-5 py-3.5 text-sm font-semibold">
                      {t.governingCouncil.memberColumn[language]}
                    </th>
                    <th className="px-5 py-3.5 text-sm font-semibold">
                      {t.governingCouncil.designationColumn[language]}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {council.map((member, index) => (
                    <tr
                      key={member.id}
                      className={`transition-colors hover:bg-brand-surface/60 ${
                        index % 2 === 1 ? 'bg-brand-page/60' : 'bg-white'
                      }`}
                    >
                      <td className="px-5 py-4 text-sm font-semibold text-brand-navy-dark">{member.order}</td>
                      <td className="px-5 py-4 text-sm text-gray-700">{member.name}</td>
                      <td className="px-5 py-4 text-sm font-medium text-brand-primary">{member.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <ul className="flex flex-col divide-y divide-brand-divider sm:hidden">
                {council.map((member) => (
                  <li key={member.id} className="flex gap-3 p-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-page text-xs font-semibold text-brand-navy-dark">
                      {member.order}
                    </span>
                    <div>
                      <p className="text-sm text-gray-700">{member.name}</p>
                      <p className="mt-0.5 text-sm font-medium text-brand-primary">{member.role}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Where to Find Us — heading treatment matches Home's "Explore Trade
          Prospects" section: a full-width tinted banner image sits behind
          the content, with a large title + description anchored at the top
          via normal flow (not squeezed to the image edge). */}
      <section className="relative overflow-hidden bg-brand-navy-dark pb-16 md:pb-20">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-0 aspect-[16/10] w-full overflow-hidden sm:aspect-[2/1] lg:aspect-[16/6]"
          aria-hidden="true"
        >
          <img src={LOCATE_US_IMAGE} alt="" className="h-full w-full object-cover object-[75%_center]" />
          <div className="absolute inset-0 bg-brand-primary/55" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-navy-dark" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 pt-14 md:px-8 md:pt-16">
          <h2 className="max-w-2xl text-3xl font-bold text-white md:text-4xl lg:text-[2.75rem] lg:leading-tight">
            {t.locateUs.heading[language]}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/95 md:text-lg">
            {t.locateUs.description[language]}
          </p>

          {isLoading && <p className="mt-8 text-white/80">{t.loading[language]}</p>}

          {!isLoading && offices.length > 0 && (
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {firstOffice && <OfficeCard office={firstOffice} className="sm:col-span-2 lg:col-span-4" />}
              {restOffices.map((office) => (
                <OfficeCard key={office.id} office={office} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

function Connector() {
  return (
    <div className="relative h-9 w-px" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/40 to-brand-primary/10" />
      <span className="absolute -left-[3px] bottom-0 h-2 w-2 rounded-full bg-brand-primary/50" />
    </div>
  )
}

function OrgNode({ member, highlight = false }) {
  return (
    <div
      className={`group flex w-56 flex-col items-center gap-2 rounded-2xl border p-5 text-center shadow-[0_6px_18px_rgba(15,40,80,0.08)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(15,40,80,0.14)] ${
        highlight
          ? 'border-brand-primary/20 bg-gradient-to-b from-brand-surface to-white'
          : 'border-brand-divider bg-white'
      }`}
    >
      <span
        className={`flex items-center justify-center overflow-hidden rounded-full text-white ring-4 ring-brand-gold/15 ${
          highlight ? 'h-16 w-16 bg-brand-primary' : 'h-14 w-14 bg-brand-gold'
        }`}
      >
        {member.photo ? (
          <img src={member.photo} alt="" className="h-full w-full object-cover" />
        ) : (
          <UserRound size={highlight ? 30 : 26} aria-hidden="true" />
        )}
      </span>
      <p className="text-sm font-bold text-brand-navy-dark">{member.name}</p>
      <p className="whitespace-pre-line text-xs leading-snug text-gray-600">{member.role}</p>
    </div>
  )
}

function OfficeCard({ office, className = '' }) {
  return (
    <div
      className={`rounded-xl bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur-sm transition-colors hover:bg-white/15 ${className}`}
    >
      <p className="flex items-center gap-2 text-sm font-bold text-white">
        <MapPin size={16} className="shrink-0 text-brand-gold" aria-hidden="true" />
        {office.name}
      </p>
      {office.address?.en && <p className="mt-2 text-sm leading-relaxed text-white/80">{office.address.en}</p>}
      {office.phone && (
        <p className="mt-2 flex items-center gap-2 text-sm text-white/80">
          <Phone size={14} className="shrink-0 text-brand-gold" aria-hidden="true" />
          {office.phone}
        </p>
      )}
      {office.email && (
        <p className="mt-1 flex items-center gap-2 text-sm text-white/80">
          <Mail size={14} className="shrink-0 text-brand-gold" aria-hidden="true" />
          {office.email}
        </p>
      )}
    </div>
  )
}
