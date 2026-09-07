import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProgram } from "@/data/programs";
import { Badge, Bento } from "@/components/ui";

export async function generateMetadata({ params }: { params: Promise<{ programId: string }> }): Promise<Metadata> {
  const { programId } = await params;
  const p = getProgram(programId);
  if (!p)
    return { title: "Program not found", description: "This TU study program could not be found on GyanSathi." };
  const title = `${p.short} Syllabus — All 8 Semesters, Subjects & Units`;
  const description = `${p.short} (${p.name}) at Tribhuvan University, Nepal: ${p.duration}, ${p.totalCredits} credits. Semester-wise subjects with codes, credits and units, plus eligibility: ${p.eligibility}`;
  return { title, description, openGraph: { title: `${title} | GyanSathi`, description } };
}

export default async function ProgramDetail({ params }: { params: Promise<{ programId: string }> }) {
  const { programId } = await params;
  const p = getProgram(programId);
  if (!p) notFound();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-zinc-500">
        <Link href="/" className="hover:text-emerald-600">Home</Link>
        <span aria-hidden> / </span>
        <Link href="/programs" className="hover:text-emerald-600">Programs</Link>
        <span aria-hidden> / </span>
        <span aria-current="page" className="font-bold text-zinc-800 dark:text-zinc-200">{p.short}</span>
      </nav>

      <Bento className="mt-3 p-6 md:p-8">
        <Badge>{p.faculty}</Badge>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">{p.short} — {p.name}</h1>
        <p className="mt-2 text-sm font-bold tabular-nums">{p.duration} · {p.totalCredits} credits</p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed">{p.description}</p>
        <p className="mt-2 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400"><b>Eligibility:</b> {p.eligibility}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {p.references.map((r) => (
            <a key={r.url} href={r.url} target="_blank" rel="noreferrer" className="pressable rounded-full border border-[var(--border)] px-3 py-1 text-xs font-bold text-emerald-700 hover:border-emerald-500/60 dark:text-emerald-400">
              {r.label} ↗
            </a>
          ))}
        </div>
      </Bento>

      {/* Sticky semester jump — Nuxt UI / docs pattern */}
      <div className="sticky top-[65px] z-30 -mx-4 mt-6 overflow-x-auto bg-[var(--background)]/95 px-4 py-2 backdrop-blur">
        <div className="flex gap-1.5">
          {p.semesters.map((s) => (
            <a key={s.num} href={`#sem-${s.num}`} className="pressable whitespace-nowrap rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-xs font-bold hover:border-emerald-500/60">
              Sem {s.num}
            </a>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {p.semesters.map((s) => (
          <section key={s.num} id={`sem-${s.num}`} className="bento scroll-mt-32">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-xl font-extrabold">Semester {s.num} — {s.label}</h2>
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-bold tabular-nums dark:bg-zinc-800">{s.subjects.length} subjects</span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {s.subjects.map((sub) => (
                <div key={sub.code} className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
                  <p className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {sub.code} · {sub.credits} cr
                    {sub.elective && <span className="rounded-full bg-amber-100 px-2 py-px text-[10px] text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">Elective</span>}
                  </p>
                  <p className="mt-0.5 font-bold">{sub.title}</p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{sub.description}</p>
                  <ol className="mt-2 list-decimal space-y-0.5 pl-5 text-sm">
                    {sub.units.map((u) => <li key={u}>{u}</li>)}
                  </ol>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
