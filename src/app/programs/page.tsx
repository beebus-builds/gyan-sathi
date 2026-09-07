import Link from "next/link";
import type { Metadata } from "next";
import { programs } from "@/data/programs";
import { Badge, Bento, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "TU IT Programs & Syllabus — CSIT, BIT, BCA",
  description:
    "Compare Tribhuvan University IT degrees in Nepal: BSc CSIT (126 credits, IOST), BIT (120 credits) and BCA — eligibility, entrance info and semester-wise subjects with codes, credits and units.",
  openGraph: {
    title: "TU IT Programs & Syllabus — CSIT, BIT, BCA | GyanSathi",
    description:
      "BSc CSIT vs BIT vs BCA at Tribhuvan University: eligibility, entrance, credits and full semester-wise syllabus with subject codes and units.",
  },
};

export default function ProgramsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Badge>Tribhuvan University · Nepal</Badge>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">Programs & full syllabus.</h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">Real TU structure. Pick a program, jump to a semester, open any subject — codes, credits, units.</p>

      {/* Comparison strip — Untitled UI table pattern, bento cards */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {programs.map((p) => (
          <Bento key={p.id} hover className="flex flex-col">
            <Badge>{p.faculty.split("·")[0].trim()}</Badge>
            <h2 className="mt-2 text-xl font-extrabold">{p.short}</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{p.name}</p>
            <p className="mt-2 text-sm font-bold tabular-nums">{p.duration} · {p.totalCredits} credits</p>
            <p className="mt-2 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">{p.eligibility}</p>
            <div className="mt-3 grid grid-cols-4 gap-1.5" aria-label={`${p.short} semesters`}>
              {p.semesters.map((s) => (
                <Link key={s.num} href={`/programs/${p.id}#sem-${s.num}`} className="pressable rounded-lg border border-[var(--border)] px-1 py-1.5 text-center text-xs font-bold hover:border-emerald-500/60 hover:bg-emerald-50 dark:hover:bg-zinc-800">
                  S{s.num}
                </Link>
              ))}
            </div>
            <Link href={`/programs/${p.id}`} className="btn-shine mt-4 inline-block rounded-full bg-emerald-600 px-4 py-2 text-center text-sm font-bold text-white hover:bg-emerald-700">
              Open {p.short} →
            </Link>
          </Bento>
        ))}
      </div>

      <SectionHeading eyebrow="Not sure?" title="CSIT vs BIT vs BCA" sub="All three share C, DSA, DBMS, OS, Networks, Web and Java. Pick by background + goal." />
      <Bento className="mt-3 text-sm leading-relaxed">
        <p><b>BSc CSIT</b> (IOST, 126 cr) — deepest theory: TOC, Compiler, Cryptography. Best for core software / research.</p>
        <p className="mt-1"><b>BIT</b> (IOST, 120 cr, any stream) — applied IT + business mix. Best from a non-science background.</p>
        <p className="mt-1"><b>BCA</b> (Humanities) — lab-heavy app dev: Java, .NET, mobile. Best for hands-on builders.</p>
      </Bento>
    </main>
  );
}
