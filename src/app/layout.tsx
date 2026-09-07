import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "GyanSathi — TU CSIT, BIT & BCA Notes, Questions & Quiz",
    template: "%s | GyanSathi",
  },
  description:
    "GyanSathi is a free study hub for Tribhuvan University IT students in Nepal: BSc CSIT, BIT and BCA syllabus, chapter-wise notes, board questions, MCQ mock tests, syllabus tracker, doubt forum and offline chatbot Sathi.",
  keywords: [
    "TU CSIT notes Nepal",
    "BSc CSIT syllabus Tribhuvan University",
    "BIT syllabus Nepal IOST",
    "BCA notes TU Nepal",
    "TU board questions CSIT",
    "CSIT entrance preparation",
    "DBMS normalization TU",
    "GyanSathi",
  ],
  authors: [{ name: "GyanSathi" }],
  openGraph: {
    type: "website",
    siteName: "GyanSathi",
    title: "GyanSathi — TU CSIT, BIT & BCA Notes, Questions & Quiz",
    description:
      "Free study hub for Tribhuvan University IT students in Nepal: syllabus, notes, board questions, MCQ mocks, tracker, forum and offline chatbot Sathi.",
  },
  twitter: {
    card: "summary_large_image",
    title: "GyanSathi — TU CSIT, BIT & BCA Notes, Questions & Quiz",
    description:
      "Free study hub for TU IT students in Nepal: syllabus, notes, board questions, MCQ mocks, tracker, forum and offline chatbot Sathi.",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('tu-theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t}else if(matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.dataset.theme='dark'}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
