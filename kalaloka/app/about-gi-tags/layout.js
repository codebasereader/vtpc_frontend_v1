import { pageMetadata } from "@/utils/seo";

export const metadata = pageMetadata({
  title: "About GI Tags",
  description:
    "Geographical Indications identify goods whose quality, reputation or other characteristics are essentially attributable to their geographic origin. Karnataka is home to 45 GI tags and 4 GI logos.",
  path: "/about-gi-tags",
  image: "/images/gi.webp",
});

export default function AboutGiTagsLayout({ children }) {
  return children;
}
