import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TU Board & Model Question Bank — CSIT, BIT, BCA",
  description:
    "Practice Tribhuvan University board and model questions with marks distribution — C Programming, DSA, DBMS, OOP, Java, Networks — plus TU exam tips on step marks, diagrams and hand-written code.",
  openGraph: {
    title: "TU Board & Model Question Bank — CSIT, BIT, BCA | GyanSathi",
    description:
      "Board + model sets with marks: what TU asks, how marks split, and how to answer for full step marks.",
  },
};

export default function QuestionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
