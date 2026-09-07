"use client";

import { useMemo, useState } from "react";
import { pastQuestions } from "@/data/pastQuestions";
import { Badge, Bento, EmptyState, SearchInput } from "@/components/ui";

export default function QuestionsPage() {
  const [q, setQ] = useState("");
  const [prog, setProg] = useState("All");
  const rows = useMemo(
    () =>
      pastQuestions.filter((p) => {
        const hit = (p.subject + " " + p.code + " " + p.year).toLowerCase().includes(q.toLowerCase());
        return hit && (prog === "All" || p.program.includes(prog) || p.program.includes("/"));
      }),
    [q, prog]
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Badge>Board + model bank</Badge>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">Practice TU&apos;s real pattern.</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Write answers by hand, timed. Marks in brackets are exactly how TU splits step marks.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <SearchInput value={q} onChange={setQ} placeholder="Filter e.g. DBMS, CSC265, 2080…" />
        {["All", "CSIT", "BIT", "BCA"].map((p) => (
          <button key={p} onClick={() => setProg(p)} aria-pressed={prog === p} className={`pressable rounded-full px-4 py-2 text-sm font-semibold ${prog === p ? "bg-emerald-600 text-white" : "border border-[var(--border)]"}`}>
            {p}
          </button>
        ))}
      </div>
      {rows.length === 0 && (
        <div className="mt-4"><EmptyState title="No sets match" hint="Clear the filter or try a subject code." /></div>
      )}
      <div className="mt-4 space-y-4">
        {rows.map((p) => (
          <article key={p.id} className="bento">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={p.type === "Board" ? "brand" : "amber"}>{p.type}</Badge>
              <h2 className="font-extrabold">{p.subject} ({p.code})</h2>
              <span className="text-sm text-zinc-500">{p.program} · {p.year}</span>
            </div>
            <ul className="mt-3 space-y-2">
              {p.questions.map((x, i) => (
                <li key={i} className="rounded-xl bg-zinc-50 p-3 text-sm dark:bg-zinc-800/60">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">[{x.marks}] </span>{x.text}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <Bento className="mt-6">
        <p className="text-sm font-bold">TU exam tips</p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Attempt all: step marks for diagrams, formulas and partial code. Finish 5-yr papers before new topics.</p>
      </Bento>
    </main>
  );
}
