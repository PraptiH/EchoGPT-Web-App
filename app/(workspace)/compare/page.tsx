import type { Metadata } from "next";
import { CompareStudio } from "@/components/compare-studio";

export const metadata: Metadata = { title: "Compare" };

export default function Page() {
  return <CompareStudio />;
}
