import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { Menu } from "lucide-react";
import { ROUTES } from "../../../constants/routes";
import { selectLanguage } from "../../../redux/slices/localeSlice";
import { common } from "../../../language/common";
import RtiDropdown from "../RtiDropdown";
import LanguageToggle from "../../LanguageToggle";

const DGCIS_URL = "https://ftddp.dgciskol.gov.in/dgcis/";

// Ordered left-to-right: Home, About Us, Events, Exporter Corner, DGCIS,
// Geographical Indications, then RTI/Downloads/Kalaloka rendered after.
const NAV_ITEMS = [
  { key: "home", to: ROUTES.HOME },
  { key: "aboutUs", to: ROUTES.ABOUT_US },
  { key: "events", to: ROUTES.EVENTS },
  { key: "exporterCorner", to: ROUTES.EXPORTER_CORNER },
  { key: "dgcis", href: DGCIS_URL },
  { key: "geographicalIndications", to: ROUTES.GEOGRAPHICAL_INDICATIONS },
];

const KALALOKA_LOGO = "/assets/kalaloka-logo.svg";

const navLinkClass = ({ isActive }) =>
  `py-3 text-base font-medium ${isActive ? "text-white" : "text-white/90 hover:text-white"}`;

export default function NavBar({ isMobileMenuOpen, onToggleMobileMenu }) {
  const language = useSelector(selectLanguage);

  return (
    <div className="flex items-center justify-between gap-2 bg-brand-primary px-4 md:gap-4 md:px-8">
      <div className="hidden items-center gap-5 md:mr-auto md:flex lg:gap-6">
        {NAV_ITEMS.map((item) =>
          item.href ? (
            <a
              key={item.key}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="py-3 text-base font-medium text-white/90 hover:text-white"
            >
              {common.nav[item.key][language]}
            </a>
          ) : (
            <NavLink key={item.key} to={item.to} className={navLinkClass}>
              {common.nav[item.key][language]}
            </NavLink>
          ),
        )}
        <RtiDropdown />
        <NavLink to={ROUTES.DOWNLOADS} className={navLinkClass}>
          {common.nav.downloads[language]}
        </NavLink>
        {/* Kala Loka is a separate site: a plain link (full page load) that opens in a new tab. */}
        <a
          href={ROUTES.KALALOKA}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={common.nav.kalaloka[language]}
          className="my-1.5 flex items-center rounded-md bg-white px-3 py-1.5 shadow-sm transition-transform hover:scale-105"
        >
          {/* The logo's colours are dark, so it sits on a white tile against the red bar. */}
          <img src={KALALOKA_LOGO} alt="" className="h-6 w-auto" />
        </a>
      </div>

      <div className="shrink-0">
        <LanguageToggle />
      </div>

      {/* Phones: Kala Loka sits in the red strip itself (centred between the language toggle and
          the menu button) instead of inside the drawer. */}
      <a
        href={ROUTES.KALALOKA}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={common.nav.kalaloka[language]}
        className="my-1.5 flex min-w-0 flex-1 justify-center md:hidden"
      >
        <span className="flex shrink-0 items-center rounded-md bg-white px-2 py-1 shadow-sm max-[340px]:px-1.5">
          <img src={KALALOKA_LOGO} alt="" className="h-4 w-auto max-w-none max-[340px]:h-3 min-[400px]:h-5" />
        </span>
      </a>

      <button
        type="button"
        onClick={onToggleMobileMenu}
        aria-expanded={isMobileMenuOpen}
        aria-label={common.header.openMenu[language]}
        className="p-2.5 text-white md:hidden"
      >
        <Menu size={22} />
      </button>
    </div>
  );
}
