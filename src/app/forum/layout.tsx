import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TU IT Doubt Forum — Ask C, DBMS, DSA & OS Questions",
  description:
    "Ask doubts and get answers from fellow TU CSIT, BIT and BCA students in Nepal: C programming, DBMS normalization, DSA, OS, networks and Java — no login needed, saved in your browser.",
  openGraph: {
    title: "TU IT Doubt Forum — Ask C, DBMS, DSA & OS Questions | GyanSathi",
    description:
      "Ask, answer and upvote TU IT doubts: C, DBMS, DSA, OS, networks, Java. No login needed.",
  },
};

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  return children;
}
