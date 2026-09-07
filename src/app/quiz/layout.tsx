import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TU IT MCQ Mock Test with Answers — CSIT, BIT, BCA",
  description:
    "Free timed MCQ mock tests for TU IT students in Nepal: semester subjects (C, DBMS, OS, Networks, DSA) plus the CSIT/BIT entrance set — instant scoring, explanations and shuffled retakes.",
  openGraph: {
    title: "TU IT MCQ Mock Test with Answers — CSIT, BIT, BCA | GyanSathi",
    description:
      "Shuffled, timed MCQ practice with instant scoring and explanations — semester bank plus entrance set.",
  },
};

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return children;
}
