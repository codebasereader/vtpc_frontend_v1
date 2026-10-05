import Image from "next/image";
import { withBase } from "@/utils/basePath";

// Drop-in replacement for next/image that is safe under a base path.
export default function AppImage({ src, ...props }) {
  return <Image src={withBase(src)} {...props} />;
}
