import Image from "@/components/AppImage";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-navy">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center px-5 py-16 md:px-8 md:py-10">
        <Link href="/" className="flex flex-col items-center">
          <Image
            src="/footer-logo.svg"
            alt="Kala Loka — Treasures of Karnataka"
            width={280}
            height={80}
            unoptimized={true}
            className="h-12 w-auto md:h-16 lg:h-20"
          />
        </Link>
      </div>
    </footer>
  );
}
