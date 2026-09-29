import type { Metadata } from "next";
import { JobsStudio } from "@/components/jobs-studio";

export const metadata: Metadata = { title: "Job insight" };

export default function Page() {
  return <JobsStudio />;
}
