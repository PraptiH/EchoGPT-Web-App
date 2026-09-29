import type { Metadata } from "next";
import { ConnectorsPanel } from "@/components/connectors-panel";

export const metadata: Metadata = { title: "Connectors" };

export default function Page() {
  return <ConnectorsPanel />;
}
