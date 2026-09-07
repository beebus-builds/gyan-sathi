import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TU Syllabus Tracker — CSIT, BIT, BCA Progress",
  description:
    "Track your Tribhuvan University syllabus unit by unit: check off CSIT, BIT or BCA subjects per semester, see per-semester completion % and export your progress. Free, no login.",
  openGraph: {
    title: "TU Syllabus Tracker — CSIT, BIT, BCA Progress | GyanSathi",
    description:
      "Check off TU syllabus units per semester, watch completion % grow, export progress.",
  },
};

export default function TrackerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
