"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { mcqs, entranceMcqs, type MCQ } from "@/data/mcqs";
import { Badge, Bento, EmptyState, Pills, Progress } from "@/components/ui";

type Bank = "Semester MCQs" | "Entrance MCQs";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface ShuffledQ {
  mcq: MCQ;
  options: { text: string; correct: boolean }[];
}

// Pure helper (module scope — no setState): also fixes the old all-index-0 answer bias
function makeOrder(list: MCQ[], subj: string): ShuffledQ[] {
  const filtered = subj === "All" ? list : list.filter((m) => m.subject === subj);
  return shuffle(filtered).map((mcq) => ({
    mcq,
    options: shuffle(mcq.options.map((text, i) => ({ text, correct: i === mcq.answer }))),
  }));
}

export default function QuizPage() {
  const [bank, setBank] = useState<Bank>("Semester MCQs");
  const [subject, setSubject] = useState<string>("All");
  const [order, setOrder] = useState<ShuffledQ[]>(() => makeOrder(mcqs, "All"));
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const timer = useRef<number | null>(null);
  const [history, setHistory] = useState<{ ts: number; bank: string; subject: string; score: number; total: number }[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("tu-quiz-history") || "[]");
    } catch { return []; }
  });

  const raw = bank === "Semester MCQs" ? mcqs : entranceMcqs;
  const subjects = useMemo(() => ["All", ...Array.from(new Set(raw.map((m) => m.subject)))], [raw]);

  const resetWith = (list: MCQ[], subj: string) => {
    setOrder(makeOrder(list, subj));
    setIdx(0);
    setPicked(null);
    setScore(0);
    setAnswers({});
    setFinished(false);
  };

  const pickBank = (v: Bank) => {
    setBank(v);
    setSubject("All");
    resetWith(v === "Semester MCQs" ? mcqs : entranceMcqs, "All");
  };

  const pickSubject = (s: string) => {
    setSubject(s);
    resetWith(raw, s);
  };

  // clean timer on unmount / bank change (fixes window.__t leak)
  useEffect(() => {
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, []);

  const startTimed = () => {
    if (timer.current) window.clearInterval(timer.current);
    setTimeLeft(15 * 60);
    timer.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t === null) return null;
        if (t <= 1) {
          if (timer.current) window.clearInterval(timer.current);
          setFinished(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const q = order[idx];

  const answer = (i: number) => {
    if (picked !== null || !q) return;
    setPicked(i);
    if (q.options[i].correct) setScore((s) => s + 1);
    setAnswers((a) => ({ ...a, [q.mcq.id]: i }));
  };

  const saveResult = () => {
    try {
      const prev = JSON.parse(localStorage.getItem("tu-quiz-history") || "[]");
      prev.unshift({ ts: Date.now(), bank, subject, score, total: order.length });
      const next = prev.slice(0, 10);
      localStorage.setItem("tu-quiz-history", JSON.stringify(next));
      setHistory(next);
    } catch { /* ignore */ }
  };

  const clearHistory = () => {
    try { localStorage.removeItem("tu-quiz-history"); } catch { /* ignore */ }
    setHistory([]);
  };

  const weak = (() => {
    const by: Record<string, { got: number; n: number }> = {};
    for (const h of history) {
      if (!h.total) continue;
      by[h.subject] ??= { got: 0, n: 0 };
      by[h.subject].got += h.score / h.total;
      by[h.subject].n += 1;
    }
    let worst: { s: string; pct: number } | null = null;
    for (const [s, v] of Object.entries(by)) {
      const pct = Math.round((v.got / v.n) * 100);
      if (!worst || pct < worst.pct) worst = { s, pct };
    }
    return worst;
  })();

  if (!q)
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState title="No questions in this filter" hint="Try another subject." action={<button onClick={() => setSubject("All")} className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-bold text-white">Reset filter</button>} />
      </main>
    );

  const attempted = Object.keys(answers).length;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Badge>Mock test · instant scoring</Badge>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">Quiz, rebuilt.</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Shuffled options, subject filters, clean timer, review + history. Entrance set included.</p>

      <div className="mt-4 space-y-3">
        <Pills options={["Semester MCQs", "Entrance MCQs"] as const} value={bank} onPick={pickBank} />
        <div className="flex flex-wrap gap-2">
          {subjects.map((s) => (
            <button key={s} onClick={() => pickSubject(s)} className={`pressable rounded-full px-3 py-1 text-xs font-bold ${subject === s ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "border border-[var(--border)]"}`}>
              {s}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={startTimed} className="pressable rounded-full border border-[var(--border)] px-4 py-2 text-sm font-bold" aria-live="polite">
            {timeLeft === null ? "Start 15:00 timer" : `⏱ ${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`}
          </button>
          <button onClick={() => resetWith(raw, subject)} className="pressable rounded-full border border-[var(--border)] px-4 py-2 text-sm">⤨ Shuffle</button>
          <button onClick={() => { setFinished(true); saveResult(); }} className="pressable rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white">Finish & save</button>
        </div>
      </div>

      <div className="mt-4">
        <Progress value={order.length ? Math.round((attempted / order.length) * 100) : 0} label={`Score ${score} · Attempted ${attempted}/${order.length} · Q${idx + 1}`} />
      </div>

      {!finished ? (
        <Bento className="reveal mt-3">
          <p className="text-xs font-bold text-emerald-600">{q.mcq.subject} · {q.mcq.program}</p>
          <h2 className="mt-1 text-lg font-bold">{q.mcq.question}</h2>
          <div className="mt-3 space-y-2">
            {q.options.map((op, i) => {
              const isAns = picked !== null && op.correct;
              const isWrong = picked === i && !op.correct;
              return (
                <button
                  key={i}
                  onClick={() => answer(i)}
                  disabled={picked !== null}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm transition-colors pressable ${
                    isAns ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950" : isWrong ? "border-red-500 bg-red-50 dark:bg-red-950/40" : "border-[var(--border)] hover:border-emerald-500/60 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  <b className="mr-2 inline-grid h-6 w-6 place-items-center rounded-full bg-zinc-100 text-xs dark:bg-zinc-800">{String.fromCharCode(65 + i)}</b>
                  {op.text}
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <div className="mt-3 rounded-xl bg-amber-50 p-3 text-sm dark:bg-zinc-800" role="status">
              <b>{q.options[picked].correct ? "Correct ✓" : "Not quite."}</b> {q.mcq.explanation}
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <button onClick={() => { setPicked(answers[order[(idx + 1) % order.length]?.mcq.id] ?? null); setIdx((v) => (v + 1) % order.length); }} className="btn-shine rounded-full bg-emerald-600 px-5 py-2 text-sm font-bold text-white">Next →</button>
            <button onClick={() => resetWith(raw, subject)} className="rounded-full border border-[var(--border)] px-5 py-2 text-sm">Reset</button>
          </div>
        </Bento>
      ) : (
        <Bento className="reveal mt-3 text-center">
          <p className="text-4xl font-extrabold tabular-nums">{score}/{order.length}</p>
          <p className="mt-1 text-sm text-zinc-500">{score / order.length >= 0.7 ? "TU-ready. Keep drilling weak subjects." : "Revise units, then re-shuffle and retry."}</p>
          <div className="mt-4 flex justify-center gap-2">
            <button onClick={() => resetWith(raw, subject)} className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-bold text-white">Retry shuffled</button>
            <button onClick={() => setFinished(false)} className="rounded-full border border-[var(--border)] px-5 py-2 text-sm">Review answers</button>
          </div>
        </Bento>
      )}

      {history.length > 0 && (
        <Bento className="mt-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-extrabold">Past mocks ({history.length})</p>
            <button onClick={clearHistory} className="rounded-full border border-[var(--border)] px-3 py-1 text-xs">Clear</button>
          </div>
          {weak && (
            <p className="mt-2 rounded-xl bg-amber-50 p-2.5 text-sm dark:bg-zinc-800">
              Weakest area: <b>{weak.s} ({weak.pct}%)</b>{" "}
              <button onClick={() => pickSubject(weak.s)} className="font-bold text-emerald-600">Drill it →</button>
            </p>
          )}
          <ul className="mt-2 space-y-1.5">
            {history.map((h, i) => (
              <li key={`${h.ts}-${i}`} className="flex items-center justify-between gap-2 rounded-lg bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-800/60">
                <span className="font-semibold">{h.bank} · {h.subject}</span>
                <span className="tabular-nums text-zinc-500">{new Date(h.ts).toLocaleDateString()} · <b className="text-zinc-900 dark:text-zinc-100">{h.score}/{h.total}</b></span>
              </li>
            ))}
          </ul>
        </Bento>
      )}
    </main>
  );
}
