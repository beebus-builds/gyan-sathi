import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TU CSIT, BIT & BCA Notes — Unit-wise Directory",
  description:
    "Search every Tribhuvan University IT subject by code or title — CSC265 DBMS, C Programming, Java, OS, Networks — with unit lists and 2-minute revision summaries for CSIT, BIT and BCA students in Nepal.",
  openGraph: {
    title: "TU CSIT, BIT & BCA Notes — Unit-wise Directory | GyanSathi",
    description:
      "Find any TU IT subject in seconds: codes, credits, unit maps and quick revision summaries for CSIT, BIT and BCA.",
  },
};

export default function NotesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
