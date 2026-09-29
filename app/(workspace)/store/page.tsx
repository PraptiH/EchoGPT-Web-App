import type { Metadata } from "next";
import { StoreGrid } from "@/components/store-grid";

export const metadata: Metadata = { title: "Store" };

export default function Page() {
  return <StoreGrid />;
}
