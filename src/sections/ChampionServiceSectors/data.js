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
// `id` / `key` values used here.
export const PILLAR_META = [
  { key: 'process', image: `${IMG}/Process.png`, badge: 'bg-[#fde4e4]' },
  { key: 'infrastructure', image: `${IMG}/Infrastructure.png`, badge: 'bg-[#e4eefc]' },
  { key: 'sector', image: `${IMG}/Private%20sector.png`, badge: 'bg-[#e4f7ea]' },
  { key: 'mindset', image: `${IMG}/FormIcon2.png`, badge: 'bg-[#efe6fb]' },
  { key: 'standards', image: `${IMG}/FormIcon1.png`, badge: 'bg-[#fff0e0]' },
]

export const SECTORS = [
  { id: 'education', icon: GraduationCap },
  { id: 'remittance', icon: Globe2 },
  { id: 'health', icon: HeartPulse },
  { id: 'media', icon: Clapperboard },
  { id: 'construction', icon: Cog },
  { id: 'transport', icon: Truck },
]
