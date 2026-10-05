import { Merriweather } from "next/font/google";
import SkipLink from "@/components/SkipLink";
import JsonLd from "@/components/JsonLd";
import { organizationJsonLd } from "@/utils/seo";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, getSiteUrl } from "@/utils/site";
import { withBase } from "@/utils/basePath";
import "./globals.css";

const merriweather = Merriweather({
  subsets: ["latin"],
  variable: "--font-merriweather",
  display: "swap",
  preload: true,
});

export const metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  icons: {
    icon: withBase("/icon.png"),
    apple: withBase("/apple-icon.png"),
  },
  keywords: [
    "Kala Loka",
    "Karnataka",
    "GI tagged",
    "Mysore Silk",
    "Mysore Sandal",
    "Channapatna Toys & Dolls",
    "Bidriware",
    "Karnataka coffee",
    "handlooms",
    "handicrafts",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "shopping",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: "/",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: `${SITE_NAME} — ${SITE_TAGLINE}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#f6e1df",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en-IN"
      className={`${merriweather.variable} h-full antialiased`}
    >
      <body className={`${merriweather.className} min-h-full bg-peach font-serif text-navy`}>
        <JsonLd data={organizationJsonLd()} />
        <SkipLink />
        {children}
      </body>
    </html>
  );
}
