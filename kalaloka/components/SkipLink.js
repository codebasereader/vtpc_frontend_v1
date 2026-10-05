export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-coral focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-white"
    >
      Skip to content
    </a>
  );
}
