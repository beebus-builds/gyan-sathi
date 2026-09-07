"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { allSubjects } from "@/data/programs";
import { Suspense } from "react";
import { Badge, Bento, EmptyState, SearchInput } from "@/components/ui";

function NotesInner() {
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [prog, setProg] = useState("All");
  const rows = useMemo(() => {
    return allSubjects().filter((r) => {
      const hit = (r.subject.code + " " + r.subject.title).toLowerCase().includes(q.toLowerCase());
      return hit && (prog === "All" || r.program === prog);
    });
  }, [q, prog]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Badge>Notes directory · {rows.length} subjects</Badge>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">Find any unit in seconds.</h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
        Unit-wise map + 2-min revision summary. Full PDFs live with reference partners — use per-program links.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <SearchInput value={q} onChange={setQ} placeholder="Search e.g. DBMS, CSC265, Java…" />
        {["All", "BSc CSIT", "BIT", "BCA"].map((p) => (
          <button key={p} onClick={() => setProg(p)} aria-pressed={prog === p} className={`pressable rounded-full px-4 py-2 text-sm font-semibold ${prog === p ? "bg-emerald-600 text-white" : "border border-[var(--border)]"}`}>
            {p}
          </button>
        ))}
      </div>
      {rows.length === 0 ? (
        <div className="mt-4"><EmptyState title="No subjects found" hint="Try a code like CSC265 or a keyword like Networks." /></div>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {rows.map((r) => (
            <article key={`${r.program}-${r.subject.code}`} className="bento bento-hover">
              <p className="text-xs font-bold text-emerald-600">{r.program} · Sem {r.semester} · {r.subject.code} · {r.subject.credits}cr</p>
              <h2 className="mt-0.5 font-extrabold">{r.subject.title}</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{r.subject.description}</p>
              <details className="mt-2 text-sm">
                <summary className="cursor-pointer font-bold text-emerald-700 dark:text-emerald-400">Units + how to revise</summary>
                <ol className="mt-1 list-decimal space-y-0.5 pl-5">
                  {r.subject.units.map((u) => <li key={u}>{u}</li>)}
                </ol>
                <p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs dark:bg-zinc-800">
                  Revise: 1 diagram + 1 hand-written example per unit. TU gives step marks for labelled diagrams.
                </p>
              </details>
            </article>
          ))}
        </div>
      )}
      <Bento className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm"><b>Reference partners:</b> HamroCSIT · bitinfoNepal · BCANepalTU — always verify with tuiost.edu.np.</p>
        <Link href="/programs" className="text-sm font-bold text-emerald-600">Browse syllabus →</Link>
      </Bento>
    </main>
  );
}

export default function NotesPage() {
  return (
    <Suspense>
      <NotesInner />
    </Suspense>
  );
}
