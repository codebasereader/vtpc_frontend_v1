import { Outlet } from 'react-router-dom'
import { BarChart3, Globe2, ShieldCheck } from 'lucide-react'

const HIGHLIGHTS = [
  { icon: Globe2, text: 'Manage every page of the VTPC website in English and Kannada' },
  { icon: BarChart3, text: 'Publish quarterly export data for Market Intelligence' },
  { icon: ShieldCheck, text: 'Role-based access with a full audit trail' },
]

export default function AuthLayout() {
  return (
    <div className="font-admin relative min-h-screen overflow-hidden bg-brand-navy-dark">
      <img
        src="/assets/images/login-bg.webp"
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-dark/90 via-brand-navy-dark/55 to-brand-primary/25" />

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-6xl items-center gap-12 px-4 py-10 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
        <aside className="hidden text-white lg:block">
          <span className="inline-block rounded-2xl bg-white/95 px-5 py-3 shadow-lg">
            <img src="/assets/Logo.png" alt="VTPC Karnataka" className="h-16 object-contain" />
          </span>
          <p className="mt-8 text-sm font-semibold tracking-[0.2em] text-brand-rose uppercase">VTPC Admin</p>
          <h1 className="mt-3 text-4xl leading-tight font-bold">
            Visvesvaraya Trade
            <br />
            Promotion Centre
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/85">
            The content management portal for Karnataka&rsquo;s export promotion website.
          </p>
          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-white/90">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
                  <Icon size={18} aria-hidden="true" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </aside>

        <main className="mx-auto w-full max-w-md">
          <div className="mb-6 flex items-center justify-between gap-3 text-white lg:hidden">
            <span className="inline-block rounded-xl bg-white/95 px-3 py-2 shadow-lg">
              <img src="/assets/Logo.png" alt="VTPC Karnataka" className="h-10 object-contain" />
            </span>
            <p className="text-xs font-semibold tracking-[0.18em] text-brand-rose uppercase">VTPC Admin</p>
          </div>

          <div className="overflow-hidden rounded-2xl bg-white/95 shadow-[0_24px_60px_rgba(8,24,56,0.45)] backdrop-blur">
            <div className="h-1.5 bg-gradient-to-r from-brand-primary via-brand-orange to-brand-gold" />
            <div className="p-8 sm:p-9">
              <Outlet />
            </div>
          </div>
          <p className="mt-5 text-center text-xs text-white/75">
            &copy; {new Date().getFullYear()} Government of Karnataka &middot; VTPC
          </p>
        </main>
      </div>
    </div>
  )
}
