import type { Metadata } from "next";
import { TasksBoard } from "@/components/tasks-board";

export const metadata: Metadata = { title: "Tasks" };

export default function Page() {
  return <TasksBoard />;
}
