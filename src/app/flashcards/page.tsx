"use client";

import { useEffect, useMemo, useState } from "react";
import { flashDecks } from "@/data/flashcards";
import { Badge, Bento, Progress } from "@/components/ui";

export default function FlashcardsPage() {
  const [deckId, setDeckId] = useState("dbms");
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [order, setOrder] = useState<number[]>(() => flashDecks[0].cards.map((_, i) => i));
  const [known, setKnown] = useState<Record<string, number>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem("tu-flash-known");
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return {};
  });

  const deck = flashDecks.find((d) => d.id === deckId)!;
  const cards = useMemo(() => order.map((i) => deck.cards[i]), [order, deck]);

  const pickDeck = (id: string) => {
    const d = flashDecks.find((x) => x.id === id)!;
    setDeckId(id);
    setOrder(d.cards.map((_, i) => i));
    setIdx(0);
    setFlipped(false);
  };

  useEffect(() => {
    try { localStorage.setItem("tu-flash-known", JSON.stringify(known)); } catch { /* ignore */ }
  }, [known]);

  const card = cards[idx];
  // Use the original card index (order[idx]), not the display position,
  // so self-scores survive shuffling.
  const key = `${deckId}:${order[idx]}`;

  const go = (d: number) => {
    setFlipped(false);
    setIdx((v) => (v + d + cards.length) % cards.length);
  };
  const mark = (knew: boolean) => {
    setKnown((k) => ({ ...k, [key]: knew ? 1 : 0 }));
    go(1);
  };

  const deckKnown = deck.cards.filter((_, i) => known[`${deckId}:${i}`] === 1).length;

  if (!card) return null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Badge>Active recall · flip cards</Badge>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">Flashcards.</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Read the front, say the answer aloud, flip to check. Mark honestly — spaced reps beat re-reading.</p>

      <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Decks">
        {flashDecks.map((d) => (
          <button key={d.id} role="tab" aria-selected={deckId === d.id} onClick={() => pickDeck(d.id)} className={`pressable rounded-full px-4 py-1.5 text-sm font-bold ${deckId === d.id ? "bg-emerald-600 text-white" : "border border-[var(--border)]"}`}>
            {d.label} · {d.cards.length}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <Progress value={deck.cards.length ? Math.round((deckKnown / deck.cards.length) * 100) : 0} label={`${deck.subject} · card ${idx + 1}/${cards.length} · ${deckKnown} known`} />
      </div>

      {/* Flip card — click to flip, keyboard accessible */}
      <button
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? "Card back shown. Activate to see front." : "Card front shown. Activate to flip."}
        className="mt-4 block w-full text-left"
      >
        <div className="mx-auto min-h-64 [perspective:1200px]">
          <div className="relative min-h-64 transition-transform duration-300 [transform-style:preserve-3d]" style={{ transform: flipped ? "rotateY(180deg)" : "none" }}>
            <Bento className="absolute inset-0 grid place-items-center p-8 text-center [backface-visibility:hidden]">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Recall</p>
                <p className="mt-2 text-xl font-extrabold md:text-2xl">{card.front}</p>
                <p className="mt-3 text-xs text-zinc-400">tap to flip ⟲</p>
              </div>
            </Bento>
            <Bento className="absolute inset-0 grid place-items-center border-emerald-500/50 bg-emerald-50 p-8 text-center [backface-visibility:hidden] [transform:rotateY(180deg)] dark:bg-emerald-950/40">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Answer</p>
                <p className="mt-2 text-lg font-bold md:text-xl">{card.back}</p>
              </div>
            </Bento>
          </div>
        </div>
      </button>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <button onClick={() => go(-1)} className="pressable rounded-full border border-[var(--border)] px-5 py-2 text-sm font-bold" aria-label="Previous card">← Prev</button>
        <button onClick={() => setFlipped((f) => !f)} className="pressable rounded-full border border-[var(--border)] px-5 py-2 text-sm font-bold">Flip</button>
        <button onClick={() => go(1)} className="pressable rounded-full border border-[var(--border)] px-5 py-2 text-sm font-bold" aria-label="Next card">Next →</button>
        <button onClick={() => { setOrder((o) => [...o].sort(() => Math.random() - 0.5)); setIdx(0); setFlipped(false); }} className="pressable rounded-full border border-[var(--border)] px-5 py-2 text-sm">⤨ Shuffle</button>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <button onClick={() => mark(false)} className="pressable rounded-full border border-red-300 px-5 py-2 text-sm font-bold text-red-600 dark:border-red-900">Missed it</button>
        <button onClick={() => mark(true)} className="btn-shine rounded-full bg-emerald-600 px-5 py-2 text-sm font-bold text-white">Knew it ✓</button>
      </div>
    </main>
  );
}
