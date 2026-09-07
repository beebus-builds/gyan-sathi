"use client";

import { useEffect, useRef, useState } from "react";
import { botReply } from "@/lib/chatbot";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [log, setLog] = useState<{ role: "user" | "bot"; text: string }[]>([
    { role: "bot", text: "Namaste! I'm Sathi — ask me about CSIT/BIT/BCA subjects, eligibility, or topics like normalization, subnetting, OOP." },
  ]);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [log, open]);

  const send = (text?: string) => {
    const msg = (text ?? input).trim().slice(0, 500);
    if (!msg) return;
    const reply = botReply(msg);
    setLog((l) => [...l, { role: "user", text: msg }, { role: "bot", text: reply }]);
    setInput("");
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="btn-shine pressable fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-emerald-600 text-2xl text-white shadow-lg hover:bg-emerald-700"
        aria-label={open ? "Close Sathi chatbot" : "Open Sathi chatbot"}
        aria-expanded={open}
      >
        {open ? "×" : "✦"}
      </button>
      {open && (
        <div className="fixed bottom-20 right-5 z-50 flex h-[480px] w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl" role="dialog" aria-label="Chat with Sathi">
          <div className="bg-emerald-600 px-4 py-3 text-white">
            <p className="text-sm font-bold">Sathi ✦ <span className="font-normal opacity-80">by GyanSathi</span></p>
            <p className="text-xs opacity-90">Custom-coded · works offline · CSIT/BIT/BCA</p>
          </div>
          <div className="nice-scroll flex-1 space-y-2 overflow-y-auto p-3 text-sm" role="log" aria-live="polite">
            {log.map((m, i) => (
              <div key={i} className={m.role === "user" ? "ml-8 rounded-2xl rounded-br-md bg-emerald-600 px-3 py-2 text-white" : "mr-8 whitespace-pre-line rounded-2xl rounded-bl-md bg-zinc-100 px-3 py-2 dark:bg-zinc-800"}>
                {m.text}
              </div>
            ))}
            <div ref={bottom} />
          </div>
          <div className="flex flex-wrap gap-1 border-t border-[var(--border)] p-2">
            {["CSIT 4th sem subjects", "BIT eligibility", "Explain normalization"].map((s) => (
              <button key={s} onClick={() => send(s)} className="rounded-full border border-[var(--border)] px-2 py-1 text-xs hover:border-emerald-500/60">
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2 p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask e.g. subnetting help…"
              aria-label="Ask Sathi"
              className="flex-1 rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
            <button onClick={() => send()} className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white">
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
