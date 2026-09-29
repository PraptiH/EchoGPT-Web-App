import type { Metadata } from "next";
import { VideoStudio } from "@/components/video-studio";

export const metadata: Metadata = { title: "Video" };

export default function Page() {
  return <VideoStudio />;
}
