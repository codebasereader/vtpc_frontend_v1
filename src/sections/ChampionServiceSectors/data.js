import {
  GraduationCap,
  Globe2,
  HeartPulse,
  Clapperboard,
  Cog,
  Truck,
} from 'lucide-react'

const IMG = '/assets/images/delve-service-sectors'

// Non-textual metadata only — all copy (titles, labels, summaries, items)
// lives in src/language/championServiceSectors.js, keyed by the same
// `id` / `key` values used here. `accent`/`accentBorder`/`accentText` are
// full literal Tailwind class strings (not built via template interpolation)
// so the JIT scanner picks them up from this file's source text.
export const PILLAR_META = [
  { key: 'process', image: `${IMG}/Process.png`, badge: 'bg-[#fde4e4]', accentBorder: 'border-t-[#e0475a]', accentText: 'text-[#e0475a]', accentDot: 'bg-[#e0475a]' },
  { key: 'infrastructure', image: `${IMG}/Infrastructure.png`, badge: 'bg-[#e4eefc]', accentBorder: 'border-t-[#2f6fed]', accentText: 'text-[#2f6fed]', accentDot: 'bg-[#2f6fed]' },
  { key: 'sector', image: `${IMG}/Private%20sector.png`, badge: 'bg-[#e4f7ea]', accentBorder: 'border-t-[#2f9e5a]', accentText: 'text-[#2f9e5a]', accentDot: 'bg-[#2f9e5a]' },
  { key: 'mindset', image: `${IMG}/FormIcon2.png`, badge: 'bg-[#efe6fb]', accentBorder: 'border-t-[#8b5cf6]', accentText: 'text-[#8b5cf6]', accentDot: 'bg-[#8b5cf6]' },
  { key: 'standards', image: `${IMG}/FormIcon1.png`, badge: 'bg-[#fff0e0]', accentBorder: 'border-t-[#e67a2e]', accentText: 'text-[#e67a2e]', accentDot: 'bg-[#e67a2e]' },
]

export const SECTORS = [
  { id: 'education', icon: GraduationCap, badge: 'bg-[#e4eefc]', accentText: 'text-[#2f6fed]' },
  { id: 'remittance', icon: Globe2, badge: 'bg-[#e4f7ea]', accentText: 'text-[#2f9e5a]' },
  { id: 'health', icon: HeartPulse, badge: 'bg-[#fde4e4]', accentText: 'text-[#e0475a]' },
  { id: 'media', icon: Clapperboard, badge: 'bg-[#efe6fb]', accentText: 'text-[#8b5cf6]' },
  { id: 'construction', icon: Cog, badge: 'bg-[#fdf1de]', accentText: 'text-[#ecb044]' },
  { id: 'transport', icon: Truck, badge: 'bg-[#fff0e0]', accentText: 'text-[#e67a2e]' },
]
