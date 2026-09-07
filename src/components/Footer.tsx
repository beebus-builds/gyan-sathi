import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-[var(--border)]">
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-10 md:grid-cols-4">
        <div className="bento md:col-span-2">
          <p className="font-extrabold">GyanSathi <span className="font-normal text-zinc-500">· gyan = knowledge, sathi = companion</span></p>
          <p className="mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
            Student-built study hub for Tribhuvan University IT programs. Real syllabus structure for BSc CSIT,
            BIT and BCA — with notes directory, past questions, MCQ practice, syllabus tracker, doubt forum and
            an offline-coded chatbot.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ["/programs", "Syllabus"],
              ["/quiz", "Mock test"],
              ["/tracker", "Tracker"],
              ["/chat", "Ask AI"],
            ].map(([h, l]) => (
              <Link key={h} href={h} className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-bold hover:border-emerald-500/60">
                {l} →
              </Link>
            ))}
          </div>
        </div>
        <div className="bento">
          <p className="text-sm font-bold">Programs</p>
          <ul className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <li>BSc CSIT — 126 credits, IOST</li>
            <li>BIT — 120 credits, IOST</li>
            <li>BCA — Humanities, TU</li>
          </ul>
        </div>
        <div className="bento">
          <p className="text-sm font-bold">Study protocol</p>
          <ul className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <li>Solve 5 yrs board papers first</li>
            <li>Hand-write code daily</li>
            <li>Diagrams carry step marks</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--border)] py-4 text-center text-xs text-zinc-500">
        Built for TU IT students · v2 Bold Minimal + Bento · Verify electives with your campus
      </div>
    </footer>
  );
}
