import { pageMetadata } from "@/utils/seo";

export const metadata = pageMetadata({
  title: "Our Story",
  description:
    "Welcome to Kala Loka — celebrating the soul of Karnataka, its heritage, culture, and unparalleled craftsmanship across six GI-tagged legacy brands.",
  path: "/our-story",
});

export default function OurStoryLayout({ children }) {
  return children;
}
