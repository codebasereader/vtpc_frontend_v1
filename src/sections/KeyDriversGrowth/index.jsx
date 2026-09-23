import { BarChart3, Settings, Factory, Leaf, TrendingUp } from 'lucide-react'

const IMG = '/assets/images/key-drivers-for-growth'

const DRIVERS = [
  {
    title: 'First in attracting investment intentions since 2016',
    subtitle: 'A preferred destination for investors worldwide.',
    image: `${IMG}/Layer%203.png`,
  },
  {
    title: 'Fourth largest skilled workforce',
    subtitle: 'A young, talented and future-ready talent pool.',
    image: `${IMG}/Skilled%20Manager.png`,
  },
  {
    title: "World's 4th largest technology cluster in Bengaluru",
    subtitle: 'Home to global tech leaders and startups.',
    image: `${IMG}/Technology%20(1).png`,
  },
  {
    title: 'Most Innovative State',
    subtitle: 'A culture of innovation driving sustainable growth.',
    image: `${IMG}/State.png`,
  },
  {
    title: 'First in IT and ITeS Exports',
    subtitle: 'Global hub for technology and innovation.',
    image: `${IMG}/Technology.png`,
  },
  {
    title: 'Second in attracting FDI (FY 2023–2024)',
    subtitle: 'Strong investor confidence and a business-friendly ecosystem.',
    image: `${IMG}/investment%20deal.png`,
  },
  {
    title: 'Presence of 400 out of Fortune 500 companies',
    subtitle: 'A thriving base of global enterprises.',
    image: `${IMG}/Companies.png`,
  },
]

const SECTORS = [
  {
    label: 'Services (Tertiary)',
    value: 65.4,
    color: 'bg-[#ecb044]',
    icon: Settings,
  },
  {
    label: 'Industry (Secondary)',
    value: 20.9,
    color: 'bg-brand-primary',
    icon: Factory,
  },
  {
    label: 'Agriculture (Primary)',
    value: 13.7,
    color: 'bg-brand-navy',
    icon: Leaf,
  },
]

const MAX_SECTOR = Math.max(...SECTORS.map((s) => s.value))

export default function KeyDriversGrowth() {
  return (
    <section className="bg-[#eef3f8] px-4 py-14 md:px-8 md:py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-brand-navy-dark md:text-4xl">
          Key Drivers for{' '}
          <span className="bg-gradient-to-r from-brand-primary to-brand-orange bg-clip-text text-transparent">
            Growth
          </span>
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-600 md:text-base">
          A strong ecosystem, skilled talent and global connectivity make Karnataka a preferred
          destination for investment, innovation and trade.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.85fr)] lg:items-stretch">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {DRIVERS.map(({ title, subtitle, image }) => (
              <article
                key={title}
                className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-[0_8px_24px_rgba(15,40,80,0.06)]"
              >
                <img
                  src={image}
                  alt=""
                  className="h-11 w-11 shrink-0 object-contain"
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold leading-snug text-brand-navy-dark">{title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">{subtitle}</p>
                </div>
              </article>
            ))}
          </div>

          <aside className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_rgba(15,40,80,0.06)]">
            <div className="flex flex-1 flex-col p-5 md:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-medium tracking-wide text-gray-500 uppercase">
                    Karnataka&apos;s Economic Strength
                  </p>
                  <p className="mt-1 text-lg font-bold text-brand-dark md:text-xl">
                    GSDP – <span className="text-brand-primary">INR 2,269,995 cr</span>
                  </p>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-500">
                  <BarChart3 size={18} aria-hidden="true" />
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-gray-500">
                A diversified economy with strong contributions from services, industry and
                agriculture.
              </p>

              <div className="mt-8 flex flex-1 items-end justify-between gap-3 px-1 sm:gap-4">
                {SECTORS.map(({ label, value, color, icon: Icon }) => {
                  const barHeight = `${Math.max((value / MAX_SECTOR) * 100, 18)}%`
                  return (
                    <div key={label} className="flex min-w-0 flex-1 flex-col items-center">
                      <span className="mb-2 text-sm font-bold text-brand-dark">{value}%</span>
                      <div className="flex h-44 w-full items-end justify-center sm:h-52">
                        <div
                          className={`relative flex w-[72%] max-w-[4.5rem] items-end justify-center rounded-t-xl ${color}`}
                          style={{ height: barHeight }}
                        >
                          <span className="absolute bottom-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white">
                            <Icon size={16} aria-hidden="true" />
                          </span>
                        </div>
                      </div>
                      <p className="mt-3 text-center text-[11px] leading-tight font-medium text-gray-600">
                        {label}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-3 border-t border-gray-100 bg-[#f7f8fa] px-5 py-3 sm:flex-row sm:items-center sm:justify-between md:px-6">
              <p className="flex items-start gap-2 text-xs text-gray-600">
                <TrendingUp size={16} className="mt-0.5 shrink-0 text-brand-primary" aria-hidden="true" />
                <span>A resilient and growing economy creating opportunities for a better tomorrow.</span>
              </p>
              <p className="shrink-0 border-gray-200 text-xs font-medium text-gray-500 sm:border-l sm:pl-4">
                Economic Survey 2023 – 24
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
