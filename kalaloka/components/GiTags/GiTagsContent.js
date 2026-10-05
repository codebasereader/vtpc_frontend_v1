import { withBase } from "@/utils/basePath";
import Image from "@/components/AppImage";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/utils/seo";

const PDF_HREF = "/docs/Guidelines_for_usage_of_GI_Logo.pdf";

const giBasket = [
  { sector: "Agricultural GIs", count: "24" },
  { sector: "Handicraft GIs", count: "17" },
  { sector: "Manufactured Goods", count: "03" },
  { sector: "Food Stuffs", count: "01" },
  { sector: "GI Logos", count: "4" },
];

const registeredGis = [
  ["Mysore Silk", "Handicraft"],
  ["Bidriware", "Handicraft"],
  ["Channapatna toys and dolls", "Handicraft"],
  ["Mysore Rosewood Inlay", "Handicraft"],
  ["Kasuti Embroidery", "Handicraft"],
  ["Mysore Traditional paintings", "Handicraft"],
  ["Ilkal Sarees", "Handicraft"],
  ["Ganjifa Cards of Mysore", "Handicraft"],
  ["Navalgund Durries", "Handicraft"],
  ["Karnataka Bronzeware", "Handicraft"],
  ["Molkalmuru Sarees", "Handicraft"],
  ["Sandur Lambani Embroidery", "Handicraft"],
  ["Kinhal Toys", "Handicraft"],
  ["Guledgudd Khana", "Handicraft"],
  ["Udupi Sarees", "Handicraft"],
  ["Kolhapuri Chappal", "Handicraft"],
  ["Patteda Anchu Saree & Fabrics", "Handicraft"],
  ["Monsooned Malabar Arabica Coffee", "Agricultural"],
  ["Monsooned Malabar Robusta Coffee", "Agricultural"],
  ["Coorg Arabica Coffee", "Agricultural"],
  ["Chikamagalur Arabica Coffee", "Agricultural"],
  ["Bababudangiris Arabica Coffee", "Agricultural"],
  ["Sirsi Supari", "Agricultural"],
  ["Gulbarga Tur Dal", "Agricultural"],
  ["Coorg Orange", "Agricultural"],
  ["Mysore Betel leaves", "Agricultural"],
  ["Nanjangud Banana", "Agricultural"],
  ["Mysore Mallige", "Agricultural"],
  ["Udupi Mallige", "Agricultural"],
  ["Hadagali Mallige", "Agricultural"],
  ["Malabar Pepper", "Agricultural"],
  ["Coorg Green Cardamom", "Agricultural"],
  ["Byadagi Chilli", "Agricultural"],
  ["Udupi Mattu Gulla Brinjal", "Agricultural"],
  ["Devanahalli Pomello", "Agricultural"],
  ["Appemidi Mango", "Agricultural"],
  ["Kamalapur Red Banana", "Agricultural"],
  ["Bangalore Blue Grapes", "Agricultural"],
  ["Bangalore Rose Onion", "Agricultural"],
  ["Kari Ishad Mango", "Agricultural"],
  ["Indi Lime", "Agricultural"],
  ["Mysore Sandal Soap", "Manufactured"],
  ["Mysore Sandalwood Oil", "Manufactured"],
  ["Mysore Agarbathi", "Manufactured"],
  ["Dharwad Pedha", "Food Stuff"],
  ["Karnataka Bronzeware", "Handicraft"],
  ["Ganjifa Cards of Mysore", "Handicraft"],
  ["Navalgund Durries", "Handicraft"],
  ["Mysore Silk", "Handicraft"],
];

function SectionHeading({ children }) {
  return (
    <h2 className="mt-10 text-[22px] leading-snug font-semibold text-navy md:mt-12 md:text-[26px]">
      {children}
    </h2>
  );
}

export default function GiTagsContent() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "About GI Tags", href: "/about-gi-tags" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-peach font-serif">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Header activePage="gi" />

      <main id="main-content" className="relative flex min-h-0 flex-1 flex-col">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
          <Image
            src="/images/corner-top-right.svg"
            alt=""
            width={653}
            height={489}
            unoptimized={true}
            className="absolute top-0 right-0 h-auto w-[48vw] max-w-xl select-none md:w-[28vw]"
          />
          <Image
            src="/images/gi-circles.svg"
            alt=""
            width={530}
            height={530}
            unoptimized={true}
            className="absolute top-[28%] left-0 h-auto w-[52vw] max-w-[340px] -translate-x-1/2 -rotate-12 select-none md:w-[26vw]"
          />
          <Image
            src="/images/gi-circles.svg"
            alt=""
            width={530}
            height={530}
            unoptimized={true}
            className="absolute top-[52%] right-0 h-auto w-[52vw] max-w-[340px] translate-x-1/2 rotate-12 select-none md:w-[26vw]"
          />
          <Image
            src="/images/corner-bottom-left.svg"
            alt=""
            width={654}
            height={243}
            unoptimized={true}
            className="absolute bottom-0 left-0 h-auto w-[55vw] max-w-2xl select-none md:w-[32vw]"
          />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 md:px-8 lg:px-10">
          <Breadcrumb className="shrink-0 pt-6 pb-2 md:pt-8 md:pb-4" items={crumbs} />
        </div>

        <article className="relative z-10 mx-auto w-full max-w-3xl px-5 pb-16 md:max-w-4xl md:px-8 md:pb-20 lg:px-10">
          <div className="flex flex-col items-center pt-4 text-center md:pt-6">
            <Image
              src="/images/gi.webp"
              alt="Geographical Indication logo — अतुल्य भारत की अमूल्य निधि, Invaluable Treasures of Incredible India"
              width={320}
              height={360}
              priority
              quality={90}
              className="h-auto w-40 object-contain md:w-52"
            />
            <h1 className="mt-6 text-[28px] leading-[1.15] font-semibold text-navy md:text-[40px] lg:text-[44px]">
              About GI Tags
            </h1>
          </div>

          <SectionHeading>What is a Geographical Indication (GI)?</SectionHeading>
          <p className="mt-3 text-[15px] leading-[1.7] text-navy/80 md:text-[16px]">
            GI identifies goods with unique qualities linked to their geographic
            origin, influenced by factors like soil, climate, and local skills.
          </p>

          <SectionHeading>What is a GI?</SectionHeading>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-[1.7] text-navy/80 md:text-[16px]">
            <li>
              It is an indication which identifies goods across the following
              segments: agricultural, handicraft, natural, manufactured or food
              stuffs originating or manufactured in the territory of a country,
              region or locality.
            </li>
            <li>
              Importantly, the said quality, reputation or other characteristic
              of such goods is essentially attributable to its Geographical
              origin.
            </li>
            <li>
              In India, GIs are governed by the Geographical Indications of
              Goods (Registration and Protection) Act 1999, a sui generis
              legislation enacted by India, consequent to joining the WTO-TRIPS
              agreement.
            </li>
          </ul>

          <SectionHeading>GIs of Karnataka: Fact File</SectionHeading>
          <p className="mt-3 text-[15px] font-medium text-navy md:text-[16px]">
            Did you know?
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-[1.7] text-navy/80 md:text-[16px]">
            <li>
              <strong>Home to exquisite products in India</strong>: 45 GI tags and 4 GI logos
            </li>
            <li>
              Pioneer in launching GI Policy in the country in 2019 to promote
              and protect artisanal products
            </li>
            <li>
              <strong>Karnataka, the GI Coffee Hub of India</strong> , prides in hosting 5 out of
              7 nationwide registered GI coffee varieties
            </li>
            <li>
              <strong>The Palace City of Mysore</strong>, known for its ancient and royal
              history, splendour and gaiety, is the GI Hub of Karnataka and
              leads with 9 GI tagged products
            </li>
            <li>
              <strong>Mysore Silk</strong> holds the distinction of being the
              State&apos;s first registered GI
            </li>
            <li>
              <strong>Mysore Sandal Soap</strong>, world acclaimed, celebrates more
              than a century&apos;s rich heritage and aromatic excellence
            </li>
            <li>
              <strong>Dharwad Pedha</strong> is the first registered GI in the food
              segment in India and Karnataka
            </li>
          </ul>

          <SectionHeading>Composition of the GI Basket of Karnataka</SectionHeading>
          <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-[0_8px_28px_rgba(7,71,96,0.08)]">
            <table className="w-full min-w-[320px] border-collapse text-left text-[14px] text-navy md:text-[15px]">
              <caption className="sr-only">
                GI sector composition for Karnataka
              </caption>
              <thead>
                <tr className="bg-navy text-white">
                  <th scope="col" className="px-4 py-3 font-semibold md:px-5">
                    S.No.
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold md:px-5">
                    GI Sector / Segment
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold md:px-5">
                    Numbers
                  </th>
                </tr>
              </thead>
              <tbody>
                {giBasket.map((row, index) => (
                  <tr
                    key={row.sector}
                    className="border-t border-navy/10 even:bg-peach/40"
                  >
                    <td className="px-4 py-2.5 md:px-5">{index + 1}.</td>
                    <td className="px-4 py-2.5 md:px-5">{row.sector}</td>
                    <td className="px-4 py-2.5 md:px-5">{row.count}</td>
                  </tr>
                ))}
                <tr className="border-t border-navy/15 bg-peach/70 font-semibold">
                  <td className="px-4 py-2.5 md:px-5" colSpan={2}>
                    TOTAL
                  </td>
                  <td className="px-4 py-2.5 md:px-5">49</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[13px] leading-[1.6] text-navy/70 md:text-[14px]">
            GI Logos have been granted for Mysore Silk, Navalgund Durries,
            Karnataka Bronze and Ganjifa Cards of Mysore.
          </p>

          <SectionHeading>
            List of Registered Geographical Indications of Karnataka
          </SectionHeading>
          <p className="mt-2 text-[13px] text-navy/65 md:text-[14px]">
            As on date. Source:{" "}
            <a
              href="https://www.ipindia.gov.in"
              className="underline decoration-navy/30 underline-offset-2 hover:text-navy"
              target="_blank"
              rel="noreferrer"
            >
              www.ipindia.gov.in
            </a>
          </p>
          <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-[0_8px_28px_rgba(7,71,96,0.08)]">
            <table className="w-full min-w-[420px] border-collapse text-left text-[14px] text-navy md:text-[15px]">
              <caption className="sr-only">
                Registered Geographical Indications of Karnataka
              </caption>
              <thead>
                <tr className="bg-navy text-white">
                  <th scope="col" className="px-4 py-3 font-semibold md:px-5">
                    Sl.No.
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold md:px-5">
                    Geographical Indication
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold md:px-5">
                    Classification / Sector
                  </th>
                </tr>
              </thead>
              <tbody>
                {registeredGis.map(([name, sector], index) => (
                  <tr
                    key={`${name}-${index}`}
                    className="border-t border-navy/10 even:bg-peach/40"
                  >
                    <td className="px-4 py-2.5 md:px-5">{index + 1}.</td>
                    <td className="px-4 py-2.5 md:px-5">{name}</td>
                    <td className="px-4 py-2.5 md:px-5">{sector}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-10 flex flex-col items-center gap-3 md:mt-12 md:flex-row md:justify-center md:gap-4">
            <a
              href={withBase(PDF_HREF)}
              download
              className="inline-flex h-11 w-full items-center justify-center rounded-full bg-coral px-8 text-[14px] font-medium text-white transition-colors hover:bg-[#d94e33] md:h-12 md:w-auto md:px-10 md:text-[15px]"
            >
              Download GI Logo Guidelines
            </a>
            <Link
              href="/"
              className="inline-flex h-11 w-full items-center justify-center rounded-full border border-coral bg-white px-8 text-[14px] font-medium text-navy transition-colors hover:bg-peach md:h-12 md:w-auto md:px-10 md:text-[15px]"
            >
              Back to home
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
