"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/programs", label: "Programs" },
  { href: "/notes", label: "Notes" },
  { href: "/questions", label: "Questions" },
  { href: "/quiz", label: "Quiz" },
  { href: "/forum", label: "Forum" },
  { href: "/tracker", label: "Tracker" },
  { href: "/chat", label: "AI Chat" },
];

function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem("tu-theme");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("tu-theme", next);
  };
  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="pressable grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] text-base hover:border-emerald-500/60"
    >
      {theme === "dark" ? "☀" : "◐"}
    </button>
  );
}

export default function Navbar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2" aria-label="GyanSathi home">
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-emerald-600 text-sm font-extrabold text-white">GS<span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white dark:ring-zinc-950" aria-hidden /></span>
          <span className="leading-tight">
            <span className="block text-sm font-extrabold tracking-tight">GyanSathi</span>
            <span className="block text-[11px] text-zinc-500">CSIT · BIT · BCA — notes, quiz, forum</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {links.map((l) => {
            const active = path === l.href || (l.href !== "/" && path.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/quiz" className="btn-shine pressable hidden rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 sm:inline-block">
            Mock Test
          </Link>
          <button className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] lg:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle menu">
            {open ? "×" : "☰"}
          </button>
        </div>
      </div>
      {open && (
        <nav className="grid gap-1 px-4 pb-3 lg:hidden" aria-label="Mobile">
          {links.map((l) => {
            const active = path === l.href || (l.href !== "/" && path.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold ${active ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950" : "border-[var(--border)]"}`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
