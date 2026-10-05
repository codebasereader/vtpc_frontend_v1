import { useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { X } from "lucide-react";
import { useSelector } from "react-redux";
import { ROUTES } from "../../../constants/routes";
import { selectLanguage } from "../../../redux/slices/localeSlice";
import { common } from "../../../language/common";

const DGCIS_URL = "https://ftddp.dgciskol.gov.in/dgcis/";

// Ordered: Home, About Us, Events, Exporter Corner, DGCIS, Geographical
// Indications, then RTI/Downloads/Kalaloka rendered after.
const NAV_ITEMS = [
  { key: "home", to: ROUTES.HOME },
  { key: "aboutUs", to: ROUTES.ABOUT_US },
  { key: "events", to: ROUTES.EVENTS },
  { key: "exporterCorner", to: ROUTES.EXPORTER_CORNER },
  { key: "dgcis", href: DGCIS_URL },
  { key: "geographicalIndications", to: ROUTES.GEOGRAPHICAL_INDICATIONS },
];

const RTI_LINKS = [
  {
    key: "login",
    href: "https://rtionline.karnataka.gov.in/index.php?lan=M",
    external: true,
  },
  {
    key: "manual",
    href: "https://ceg.karnataka.gov.in/assets/front/pdf/rti%20manual/RTI%20Manual%20English.pdf",
    external: true,
  },
  {
    key: "online",
    href: "https://rtionline.karnataka.gov.in/index.php?lan=E",
    external: true,
  },
  { key: "section4_1A", href: ROUTES.DOWNLOADS, external: false },
  { key: "section4_1B", href: ROUTES.DOWNLOADS, external: false },
];

export default function MobileNavPanel({ isOpen, onNavigate }) {
  const language = useSelector(selectLanguage);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onNavigate();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onNavigate]);

  return (
    <div className="md:hidden">
      <div
        onClick={onNavigate}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <aside
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={`fixed inset-y-0 right-0 z-50 flex h-dvh w-full flex-col bg-white transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-end border-b border-brand-divider px-4 py-3">
          <button
            type="button"
            onClick={onNavigate}
            aria-label={common.header.closeMenu[language]}
            className="rounded-full p-2 text-brand-dark hover:bg-brand-page"
          >
            <X size={26} />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-3">
          {NAV_ITEMS.map((item) =>
            item.href ? (
              <a
                key={item.key}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-md px-2 py-2.5 text-base font-medium text-brand-dark"
              >
                {common.nav[item.key][language]}
              </a>
            ) : (
              <NavLink
                key={item.key}
                to={item.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `rounded-md px-2 py-2.5 text-base font-medium ${isActive ? "text-brand-primary" : "text-brand-dark"}`
                }
              >
                {common.nav[item.key][language]}
              </NavLink>
            ),
          )}

          <p className="mt-2 px-2 text-sm font-semibold tracking-wide text-gray-400">
            {common.nav.rti[language]}
          </p>
          {RTI_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.key}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-md px-2 py-2 pl-4 text-base text-brand-dark"
              >
                {common.rti[link.key][language]}
              </a>
            ) : (
              <Link
                key={link.key}
                to={link.href}
                onClick={onNavigate}
                className="rounded-md px-2 py-2 pl-4 text-base text-brand-dark"
              >
                {common.rti[link.key][language]}
              </Link>
            ),
          )}

          <NavLink
            to={ROUTES.DOWNLOADS}
            onClick={onNavigate}
            className={({ isActive }) =>
              `mt-2 rounded-md px-2 py-2.5 text-base font-medium ${isActive ? "text-brand-primary" : "text-brand-dark"}`
            }
          >
            {common.nav.downloads[language]}
          </NavLink>

          {/* Kalaloka — nav label reserved, destination not provided yet. */}
          <span
            className="rounded-md px-2 py-2.5 text-base font-medium text-gray-400"
            aria-disabled="true"
          >
            {common.nav.kalaloka[language]}
          </span>
        </nav>
      </aside>
    </div>
  );
}
