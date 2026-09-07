"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge, Bento, EmptyState, SearchInput } from "@/components/ui";

interface Post { id: number; q: string; tag: string; votes: number; answers: string[]; ts: number; }

const seed: Post[] = [
  { id: 1, q: "In C, why does `a++ + ++a` give undefined behaviour? TU asked this twice.", tag: "C Programming", votes: 12, answers: ["Because C doesn't define order of side-effects between sequence points — the compiler may evaluate in any order. Cite C11 §6.5."], ts: Date.now() },
  { id: 2, q: "DBMS: R(A,B,C) with A→B, B→C — normalize to 3NF?", tag: "DBMS", votes: 8, answers: ["Decompose into R1(A,B) and R2(B,C). A stays key of R1, B key of R2. Removes transitive A→C."], ts: Date.now() },
];

const tags = ["All", "C Programming", "DBMS", "DSA", "OS", "Networks", "Java", "Web", "Other"];

export default function ForumPage() {
  const [posts, setPosts] = useState<Post[]>(() => {
    if (typeof window === "undefined") return seed;
    try {
      const raw = localStorage.getItem("tu-forum");
      if (raw) return JSON.parse(raw);
    } catch { /* keep seed */ }
    return seed;
  });
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("C Programming");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"Top" | "New">("Top");
  const [ans, setAns] = useState<Record<number, string>>({});
  const [voted, setVoted] = useState<Record<number, 1 | -1>>({});

  useEffect(() => {
    try { localStorage.setItem("tu-forum", JSON.stringify(posts)); } catch { /* ignore */ }
  }, [posts]);

  const ask = () => {
    const text = q.trim().slice(0, 300);
    if (!text) return;
    setPosts((p) => [{ id: Date.now(), q: text, tag, votes: 0, answers: [], ts: Date.now() }, ...p]);
    setQ("");
  };
  const vote = (id: number, d: 1 | -1) => {
    if (voted[id] === d) return; // one vote per direction (Untitled-style anti-spam)
    setVoted((v) => ({ ...v, [id]: d }));
    setPosts((p) => p.map((x) => (x.id === id ? { ...x, votes: x.votes + d } : x)));
  };
  const reply = (id: number) => {
    const t = (ans[id] || "").trim().slice(0, 600);
    if (!t) return;
    setPosts((p) => p.map((x) => (x.id === id ? { ...x, answers: [...x.answers, t] } : x)));
    setAns((a) => ({ ...a, [id]: "" }));
  };

  const visible = useMemo(() => {
    const f = posts.filter((p) => (filter === "All" || p.tag === filter) && p.q.toLowerCase().includes(search.toLowerCase()));
    return [...f].sort((a, b) => (sort === "Top" ? b.votes - a.votes : b.ts - a.ts));
  }, [posts, filter, search, sort]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Badge>Doubt forum · browser-saved</Badge>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">Ask. Answer. Upvote.</h1>
      <Bento className="mt-4">
        <div className="flex flex-wrap gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && ask()} maxLength={300} placeholder="Ask e.g. SJF vs Round Robin with example?" className="min-w-60 flex-1 rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-emerald-500" aria-label="Ask a question" />
          <select value={tag} onChange={(e) => setTag(e.target.value)} className="rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm" aria-label="Tag">
            {tags.filter((t) => t !== "All").map((t) => <option key={t}>{t}</option>)}
          </select>
          <button onClick={ask} disabled={!q.trim()} className="btn-shine rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-40">Ask ({q.length}/300)</button>
        </div>
      </Bento>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <SearchInput value={search} onChange={setSearch} placeholder="Search doubts…" />
        <div className="flex gap-1 rounded-full border border-[var(--border)] p-1">
          {(["Top", "New"] as const).map((s) => (
            <button key={s} onClick={() => setSort(s)} aria-pressed={sort === s} className={`rounded-full px-3 py-1 text-xs font-bold ${sort === s ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : ""}`}>{s}</button>
          ))}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <button key={t} onClick={() => setFilter(t)} aria-pressed={filter === t} className={`rounded-full px-3 py-1 text-xs font-bold ${filter === t ? "bg-emerald-600 text-white" : "border border-[var(--border)]"}`}>{t}</button>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {visible.length === 0 && <EmptyState title="No doubts here yet" hint="Be the first to ask in this tag." />}
        {visible.map((p) => (
          <article key={p.id} className="bento">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge tone="neutral">{p.tag}</Badge>
                <h2 className="mt-1 font-bold">{p.q}</h2>
                <p className="text-xs text-zinc-500">{new Date(p.ts).toLocaleDateString()} · {p.answers.length} answers</p>
              </div>
              <div className="flex items-center gap-1" aria-label={`${p.votes} votes`}>
                <button onClick={() => vote(p.id, 1)} aria-label="Upvote" className="pressable rounded-lg border border-[var(--border)] px-2 py-1">▲</button>
                <span className="w-8 text-center text-sm font-extrabold tabular-nums">{p.votes}</span>
                <button onClick={() => vote(p.id, -1)} aria-label="Downvote" className="pressable rounded-lg border border-[var(--border)] px-2 py-1">▼</button>
              </div>
            </div>
            <div className="mt-2 space-y-1.5">
              {p.answers.map((a, i) => <p key={i} className="rounded-lg bg-zinc-50 p-2.5 text-sm dark:bg-zinc-800/60">💡 {a}</p>)}
              {p.answers.length === 0 && <p className="text-sm text-zinc-500">No answers yet — be the first!</p>}
            </div>
            <div className="mt-2 flex gap-2">
              <input value={ans[p.id] || ""} onChange={(e) => setAns({ ...ans, [p.id]: e.target.value })} onKeyDown={(e) => e.key === "Enter" && reply(p.id)} placeholder="Write an answer…" className="flex-1 rounded-lg border border-[var(--border)] bg-transparent px-3 py-1.5 text-sm outline-none focus:border-emerald-500" aria-label={`Answer: ${p.q}`} />
              <button onClick={() => reply(p.id)} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm font-bold hover:border-emerald-500/60">Reply</button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
