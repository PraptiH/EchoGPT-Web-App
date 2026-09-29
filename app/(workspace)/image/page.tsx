import type { Metadata } from "next";
import { ImageStudio } from "@/components/image-studio";

export const metadata: Metadata = { title: "Images" };

export default function Page() {
  return <ImageStudio />;
}
