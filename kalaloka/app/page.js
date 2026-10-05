import Banner from "@/components/HomeComponents/Banner";
import JsonLd from "@/components/JsonLd";
import { brands } from "@/utils/data";
import { brandsItemListJsonLd } from "@/utils/seo";

export default function Home() {
  return (
    <>
      <JsonLd data={brandsItemListJsonLd(brands)} />
      <Banner />
    </>
  );
}
