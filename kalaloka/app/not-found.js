import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "Page not found",
  description: "This page does not exist on Kala Loka.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-peach">
      <Header />
      <main
        id="main-content"
        className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-5 py-20 text-center"
      >
        <p className="text-[13px] tracking-[0.2em] text-navy/60 uppercase">
          404
        </p>
        <h1 className="mt-3 text-[32px] font-semibold text-navy md:text-[40px]">
          Page not found
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-navy/70">
          The page you are looking for is not in the Kala Loka catalog.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full bg-coral px-8 text-[14px] font-medium text-white hover:bg-[#d94e33]"
          >
            Back to Home
          </Link>
          <Link
            href="/our-brands"
            className="inline-flex h-11 items-center justify-center rounded-full border border-coral bg-white px-8 text-[14px] font-medium text-navy hover:bg-peach"
          >
            Our Brands
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
