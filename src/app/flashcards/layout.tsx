import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TU IT Flashcards — DBMS, OS, Networks, C, OOP, DSA",
  description:
    "Free flip-card decks for TU CSIT, BIT and BCA exams: DBMS normalization, OS scheduling, subnetting, C pointers, OOP viva lines and DSA Big-O — with shuffle and self-scoring.",
  openGraph: {
    title: "TU IT Flashcards — DBMS, OS, Networks, C, OOP, DSA | GyanSathi",
    description:
      "Active-recall flip cards for TU IT exams: flip, self-score, shuffle. No login needed.",
  },
};

export default function FlashcardsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
