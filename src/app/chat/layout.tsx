import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sathi — Free TU IT Chatbot for CSIT, BIT & BCA",
  description:
    "Ask Sathi, GyanSathi's free offline chatbot for TU IT students: syllabus lookup, CSIT/BIT/BCA eligibility, normalization, subnetting, OOP viva answers and entrance prep — no API key needed.",
  openGraph: {
    title: "Sathi — Free TU IT Chatbot for CSIT, BIT & BCA | GyanSathi",
    description:
      "Free offline TU IT assistant: subjects, eligibility, topic explainers and entrance plans.",
  },
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return children;
}
