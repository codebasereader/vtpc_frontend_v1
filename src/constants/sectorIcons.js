import {
  Pill,
  Zap,
  Shirt,
  Car,
  FlaskConical,
  Rocket,
  Eye,
  Wheat,
  Layers,
  Cpu,
  Factory,
  Gem,
  Plane,
  Cog,
  Leaf,
  Coffee,
  Hammer,
  Truck,
} from 'lucide-react'

// Icon keys stored on a focus sector (`icon` field). Keep keys stable —
// they are saved in the database.
export const SECTOR_ICON_OPTIONS = [
  { key: 'pill', label: 'Pharma', Icon: Pill },
  { key: 'zap', label: 'Electrical', Icon: Zap },
  { key: 'shirt', label: 'Garments', Icon: Shirt },
  { key: 'car', label: 'Automobile', Icon: Car },
  { key: 'flask', label: 'Chemicals', Icon: FlaskConical },
  { key: 'rocket', label: 'Aerospace', Icon: Rocket },
  { key: 'eye', label: 'Optical / Medical', Icon: Eye },
  { key: 'wheat', label: 'Food / Agri', Icon: Wheat },
  { key: 'cpu', label: 'Electronics / IT', Icon: Cpu },
  { key: 'factory', label: 'Manufacturing', Icon: Factory },
  { key: 'gem', label: 'Gems / Jewellery', Icon: Gem },
  { key: 'plane', label: 'Aviation', Icon: Plane },
  { key: 'cog', label: 'Machinery', Icon: Cog },
  { key: 'leaf', label: 'Organic / Plantation', Icon: Leaf },
  { key: 'coffee', label: 'Coffee / Beverages', Icon: Coffee },
  { key: 'hammer', label: 'Handicrafts', Icon: Hammer },
  { key: 'truck', label: 'Logistics', Icon: Truck },
  { key: 'layers', label: 'Other', Icon: Layers },
]

const ICONS_BY_KEY = Object.fromEntries(SECTOR_ICON_OPTIONS.map((option) => [option.key, option.Icon]))

// Sectors seeded before the `icon` field existed fall back to a slug match.
const ICON_KEY_BY_SLUG = {
  'pharmaceutical-biotech': 'pill',
  'electrical-machinery-equipment': 'zap',
  'ready-made-garments': 'shirt',
  automobile: 'car',
  'organic-chemicals': 'flask',
  aerospace: 'rocket',
  'optical-and-medical': 'eye',
  'food-products': 'wheat',
}

export function getSectorIcon(sector) {
  return ICONS_BY_KEY[sector.icon] || ICONS_BY_KEY[ICON_KEY_BY_SLUG[sector.id]] || Layers
}

// Sort by `order` (missing → last), keeping the API order for ties.
export function sortSectors(sectors) {
  return sectors
    .map((sector, index) => ({ sector, index }))
    .sort((a, b) => (a.sector.order ?? Infinity) - (b.sector.order ?? Infinity) || a.index - b.index)
    .map(({ sector }) => sector)
}
