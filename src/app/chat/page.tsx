"use client";

import { useEffect, useRef, useState } from "react";
import { botReply } from "@/lib/chatbot";
import { Badge, Bento } from "@/components/ui";

const suggestions = ["Quiz me on OS", "Flashcards: DBMS", "Important questions: DBMS", "Plan Networks 7 days", "Viva: OOP", "CSIT 4th sem subjects"];

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [log, setLog] = useState<{ role: "user" | "bot"; text: string }[]>([
    { role: "bot", text: "Namaste! I'm Sathi — GyanSathi's exam-prep buddy. I drill MCQs, fire viva questions, pull board sets and build day-wise plans from the real TU syllabus.\n\nTry: `Quiz me on OS` · `Viva: DBMS` · `Important questions: CSC265` · `Plan Networks 7 days`" },
  ]);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [log]);

  const send = (text?: string) => {
    const msg = (text ?? input).trim().slice(0, 500);
    if (!msg) return;
    setLog((l) => [...l, { role: "user", text: msg }, { role: "bot", text: botReply(msg) }]);
    setInput("");
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Badge>Sathi · offline · no API key</Badge>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">Sathi ✦ <span className="text-base font-semibold text-zinc-500">by GyanSathi</span></h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Keyword intents + real syllabus lookup from <code>src/data/programs.ts</code>. Works offline after load.</p>
      <div className="mt-4 flex flex-wrap gap-1.5" aria-label="Suggested questions">
        {suggestions.map((s) => (
          <button key={s} onClick={() => send(s)} className="pressable rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold hover:border-emerald-500/60">{s}</button>
        ))}
      </div>
      <Bento className="mt-4 flex h-[460px] flex-col overflow-hidden p-0">
        <div className="nice-scroll flex-1 space-y-2.5 overflow-y-auto p-4" role="log" aria-live="polite" aria-label="Chat with Sathi">
          {log.map((m, i) => (
            <div key={i} className={m.role === "user" ? "reveal ml-10 rounded-2xl rounded-br-md bg-emerald-600 px-3.5 py-2.5 text-sm text-white" : "reveal mr-10 whitespace-pre-line rounded-2xl rounded-bl-md bg-zinc-100 px-3.5 py-2.5 text-sm dark:bg-zinc-800"}>
              {m.text}
            </div>
          ))}
          <div ref={bottom} />
        </div>
        <div className="flex gap-2 border-t border-[var(--border)] p-3">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} maxLength={500} placeholder="Ask about any TU IT subject or topic…" className="flex-1 rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-emerald-500" aria-label="Ask Sathi" />
          <button onClick={() => send()} disabled={!input.trim()} className="btn-shine rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-40">Send</button>
        </div>
      </Bento>
      <p className="mt-3 text-xs text-zinc-500">Tip: ask like <code>CSIT 4th sem subjects</code> or <code>Explain normalization</code> for the best answers.</p>
    </main>
  );
}
