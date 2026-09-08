"use client";

import { useEffect, useMemo, useState } from "react";
import { programs } from "@/data/programs";
import { Badge, Bento, Progress } from "@/components/ui";

export default function TrackerPage() {
  const [prog, setProg] = useState("csit");
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem("tu-tracker");
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return {};
  });

  useEffect(() => {
    try { localStorage.setItem("tu-tracker", JSON.stringify(checked)); } catch { /* ignore */ }
  }, [checked]);

  const p = programs.find((x) => x.id === prog)!;
  const all = useMemo(() => p.semesters.flatMap((s) => s.subjects.flatMap((sub) => sub.units.map((u) => `${sub.code}::${u}`))), [p]);
  const doneCount = all.filter((k) => checked[`${p.id}::${k}`]).length;
  const pct = all.length ? Math.round((doneCount / all.length) * 100) : 0;

  const toggle = (key: string) => setChecked((c) => ({ ...c, [`${p.id}::${key}`]: !c[`${p.id}::${key}`] }));
  const resetProg = () => {
    setChecked((c) => {
      const n = { ...c };
      all.forEach((k) => delete n[`${p.id}::${k}`]);
      return n;
    });
  };
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(checked, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "tu-tracker.json";
    a.click();
  };
  const importJson = (f: File | undefined) => {
    if (!f) return;
    f.text().then((t) => {
      try {
        const o = JSON.parse(t);
        if (o && typeof o === "object") setChecked((c) => ({ ...c, ...o }));
      } catch { /* ignore bad file */ }
    });
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Badge>Syllabus tracker · saved in browser</Badge>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">Check off units. Stay on track.</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {programs.map((x) => (
          <button key={x.id} onClick={() => setProg(x.id)} aria-pressed={prog === x.id} className={`pressable rounded-full px-4 py-2 text-sm font-bold ${prog === x.id ? "bg-emerald-600 text-white" : "border border-[var(--border)]"}`}>
            {x.short}
          </button>
        ))}
        <span className="flex-1" />
        <button onClick={exportJson} className="rounded-full border border-[var(--border)] px-4 py-2 text-sm">⤓ Export</button>
        <label className="cursor-pointer rounded-full border border-[var(--border)] px-4 py-2 text-sm">
          ⤒ Import
          <input type="file" accept="application/json" className="hidden" onChange={(e) => importJson(e.target.files?.[0])} aria-label="Import tracker JSON" />
        </label>
        <button onClick={resetProg} className="rounded-full border border-[var(--border)] px-4 py-2 text-sm">Reset {p.short}</button>
      </div>
      <Bento className="mt-4">
        <Progress value={pct} label={`${doneCount}/${all.length} units done`} />
        <p className="mt-2 text-xs text-zinc-500">Tip: finish chapters 1–3 first — TU sets 40%+ from foundations. Then drill 25 MCQs/day on the Quiz page.</p>
      </Bento>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {p.semesters.map((s) => {
          const keys = s.subjects.flatMap((sub) => sub.units.map((u) => `${sub.code}::${u}`));
          const done = keys.filter((k) => checked[`${p.id}::${k}`]).length;
          const sp = Math.round((done / keys.length) * 100);
          return (
            <section key={s.num} className="bento">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-extrabold">Sem {s.num} — {s.label}</h2>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-bold tabular-nums dark:bg-zinc-800">{sp}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <div className="h-full bg-emerald-500 transition-[width] duration-500" style={{ width: `${sp}%` }} />
              </div>
              {s.subjects.map((sub) => (
                <details key={sub.code} className="mt-2 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
                  <summary className="cursor-pointer text-sm font-bold">{sub.code} — {sub.title}</summary>
                  <ul className="mt-2 space-y-1">
                    {sub.units.map((u) => {
                      const key = `${sub.code}::${u}`;
                      const on = !!checked[`${p.id}::${key}`];
                      return (
                        <li key={u}>
                          <label className="flex cursor-pointer items-center gap-2 text-sm">
                            <input type="checkbox" checked={on} onChange={() => toggle(key)} className="h-4 w-4 accent-emerald-600" />
                            <span className={on ? "text-zinc-400 line-through" : ""}>{u}</span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </details>
              ))}
            </section>
          );
        })}
      </div>
    </main>
  );
}
