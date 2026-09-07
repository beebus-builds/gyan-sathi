import Link from "next/link";
import type { Metadata } from "next";
import { programs } from "@/data/programs";
import { mcqs } from "@/data/mcqs";
import { Badge, Bento, Button, SectionHeading, Stat } from "@/components/ui";

export const metadata: Metadata = {
  title: "GyanSathi — TU CSIT, BIT & BCA Notes, Questions & Quiz",
  description:
    "GyanSathi is a free study hub for Tribhuvan University IT students in Nepal: real BSc CSIT, BIT and BCA syllabus, unit-wise notes, board questions, timed MCQ mocks, tracker, forum and offline chatbot Sathi.",
  openGraph: {
    title: "GyanSathi — TU CSIT, BIT & BCA Notes, Questions & Quiz",
    description:
      "Real TU syllabus, chapter-wise notes, board questions, timed MCQ mocks, tracker, forum and offline chatbot for CSIT, BIT and BCA students in Nepal.",
  },
};

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4">
      {/* Hero — Bold Minimal: oversized type + single accent + command search */}
      <section className="grid gap-4 py-10 md:grid-cols-5 md:py-14">
        <div className="bento reveal flex flex-col justify-center p-8 md:col-span-3">
          <Badge>For Tribhuvan University IT students</Badge>
          <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
            One smarter hub for <span className="text-emerald-600 dark:text-emerald-400">CSIT · BIT · BCA</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-zinc-600 dark:text-zinc-400 md:text-lg">
            Real TU syllabus, chapter-wise notes, board questions, timed MCQ mocks, syllabus tracker and doubt
            forum — plus an offline chatbot. Built for low-bandwidth, mobile-first night study.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/programs">Explore syllabus</Button>
            <Button href="/quiz" variant="secondary">Take a mock test ({mcqs.length} MCQs)</Button>
            <Button href="/chat" variant="secondary">Ask the chatbot ✦</Button>
          </div>
          <form action="/notes" className="mt-6 flex max-w-md items-center gap-2 rounded-full border border-[var(--border)] p-1.5 pl-4">
            <span aria-hidden>⌕</span>
            <input name="q" placeholder="Search DBMS, CSC265, Java…  (↵)" className="w-full bg-transparent text-sm outline-none" aria-label="Search notes" />
            <button className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-bold text-white dark:bg-white dark:text-zinc-900">Search</button>
          </form>
        </div>
        <div className="grid gap-4 md:col-span-2">
          <Bento className="reveal">
            <p className="text-sm font-extrabold">What you get in v2</p>
            <ul className="mt-3 space-y-2 text-sm">
              {[
                "Semester-wise subjects with codes, credits & units",
                "Notes directory + quick revision summaries",
                "Board + model bank with marks distribution",
                "Shuffled timed quiz with review + history",
                "Forum + syllabus tracker (browser-saved)",
                "Sathi — zero API key chatbot",
              ].map((t) => (
                <li key={t} className="flex gap-2"><span className="text-emerald-600">✓</span><span>{t}</span></li>
              ))}
            </ul>
          </Bento>
          <div className="grid grid-cols-3 gap-4">
            <Stat value="3" label="programs" />
            <Stat value="24" label="semesters" />
            <Stat value="120+" label="subjects" delta="syllabus-mapped" />
          </div>
        </div>
      </section>

      {/* Programs — Shuffle-style bento showcase */}
      <section className="py-6">
        <SectionHeading eyebrow="Syllabus" title="Choose your program" sub="Real TU structure. Pick a program, then semester, then subject." action={<Link href="/programs" className="text-sm font-bold text-emerald-600">All programs →</Link>} />
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {programs.map((p) => (
            <Link key={p.id} href={`/programs/${p.id}`} className="bento bento-hover block">
              <Badge>{p.faculty.split("·")[0]}</Badge>
              <h3 className="mt-2 text-xl font-extrabold">{p.short}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{p.name}</p>
              <p className="mt-2 text-sm font-semibold">{p.duration} · {p.totalCredits} credits</p>
              <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{p.description}</p>
              <span className="mt-3 inline-block text-sm font-bold text-emerald-600">Open syllabus →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Features — bento grid, asymmetric (MUI dashboard + Dribbble edtech) */}
      <section className="py-6">
        <SectionHeading eyebrow="Study OS" title="Everything in one grid" sub="Scan, tap, study. Each tile is one job — like Untitled UI cards, not walls of text." />
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          {[
            { t: "Notes & syllabus", d: "Every code, unit list and 2-min revision summary.", h: "/notes", c: "Open notes", big: true },
            { t: "Questions bank", d: "Board + model sets with marks.", h: "/questions", c: "Practice" },
            { t: "Exam prep quiz", d: "Shuffled, timed, with explanations.", h: "/quiz", c: "Start quiz" },
            { t: "Doubt forum", d: "Ask, answer, upvote in browser.", h: "/forum", c: "Visit forum" },
            { t: "Syllabus tracker", d: "Check off units, see % completion.", h: "/tracker", c: "Track" },
            { t: "Smart chatbot", d: "Plain English / Nepali-mix answers.", h: "/chat", c: "Chat now", big: true },
          ].map((f) => (
            <div key={f.t} className={`bento bento-hover ${f.big ? "md:col-span-2" : ""}`}>
              <h3 className="font-extrabold">{f.t}</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{f.d}</p>
              <Link href={f.h} className="mt-3 inline-block text-sm font-bold text-emerald-600">{f.c} →</Link>
            </div>
          ))}
        </div>
      </section>

      {/* Protocol strip — SiteInspire minimal conversion block */}
      <section className="bento mt-6 flex flex-col items-start justify-between gap-4 p-6 md:flex-row md:items-center">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">TU exam protocol</p>
          <p className="mt-1 text-lg font-extrabold">5 yrs papers → hand-written code → diagrams → 25 MCQs/day</p>
        </div>
        <div className="flex gap-3">
          <Button href="/questions">Question bank</Button>
          <Button href="/tracker" variant="secondary">Track syllabus</Button>
        </div>
      </section>
    </main>
  );
}
