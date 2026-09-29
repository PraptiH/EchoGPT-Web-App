import type { Metadata } from "next";
import { SopStudio } from "@/components/sop-studio";

export const metadata: Metadata = { title: "Statement of purpose" };

export default function Page() {
  return <SopStudio />;
}
