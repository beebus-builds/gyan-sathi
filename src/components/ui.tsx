import Link from "next/link";
import type { ReactNode } from "react";

/* Untitled UI–style badge with dot */
export function Badge({ children, tone = "brand" }: { children: ReactNode; tone?: "brand" | "neutral" | "amber" }) {
  const tones: Record<string, string> = {
    brand: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    neutral: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    amber: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${tones[tone]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {children}
    </span>
  );
}

/* Button hierarchy: primary / secondary / ghost (Untitled + MUI) */
export function Button({
  children,
  href,
  onClick,
  variant = "primary",
  className = "",
  type,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  type?: "button" | "submit";
}) {
  const base =
    "pressable btn-shine inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-colors";
  const styles: Record<string, string> = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400",
    secondary:
      "border border-[var(--border)] bg-[var(--card)] hover:border-emerald-500/60 hover:bg-emerald-50 dark:hover:bg-zinc-800",
    ghost: "hover:bg-zinc-100 dark:hover:bg-zinc-800 px-3 py-2",
  };
  const cls = `${base} ${styles[variant]} ${className}`;
  if (href)
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  return (
    <button type={type ?? "button"} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

/* Bento card (Shuffle bento + MUI Card anatomy: header/content/actions) */
export function Bento({
  children,
  className = "",
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return <div className={`bento ${hover ? "bento-hover" : ""} p-5 ${className}`}>{children}</div>;
}

export function CardHeader({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) {
  return (
    <div>
      {eyebrow && <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{eyebrow}</p>}
      <h3 className="mt-1 font-bold leading-snug">{title}</h3>
      {sub && <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{sub}</p>}
    </div>
  );
}

/* MUI-style stat with delta (for tracker/dashboard/hero) */
export function Stat({ value, label, delta }: { value: string; label: string; delta?: string }) {
  return (
    <div className="bento p-4 text-center">
      <p className="text-2xl font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">{value}</p>
      <p className="mt-0.5 text-xs text-zinc-500">{label}</p>
      {delta && <p className="mt-1 inline-block rounded-full bg-emerald-100 px-2 text-[11px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">{delta}</p>}
    </div>
  );
}

/* Section heading (Shuffle marketplace section pattern) */
export function SectionHeading({ eyebrow, title, sub, action }: { eyebrow?: string; title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">{eyebrow}</p>}
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight">{title}</h2>
        {sub && <p className="mt-1 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

/* Filter pills (Untitled filters + Nuxt UTabs pattern) */
export function Pills<T extends string>({
  options,
  value,
  onPick,
}: {
  options: readonly T[];
  value: T;
  onPick: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="filters">
      {options.map((o) => (
        <button
          key={o}
          role="tab"
          aria-selected={value === o}
          onClick={() => onPick(o)}
          className={`pressable rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
            value === o ? "bg-emerald-600 text-white" : "border border-[var(--border)] hover:border-emerald-500/60"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/* Search input with icon (Nuxt UI UInput pattern) */
export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="flex min-w-56 flex-1 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 focus-within:border-emerald-500">
      <span aria-hidden>⌕</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
      />
      {value && (
        <button onClick={() => onChange("")} aria-label="Clear search" className="text-zinc-400 hover:text-zinc-600">
          ×
        </button>
      )}
    </label>
  );
}

/* Empty state (Untitled UI pattern) */
export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="bento flex flex-col items-center p-10 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-2xl dark:bg-emerald-900/40">◌</div>
      <p className="mt-3 font-bold">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-sm text-zinc-500">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* Progress bar with label (MUI LinearProgress, accessible) */
export function Progress({ value, label }: { value: number; label?: string }) {
  return (
    <div>
      {label && (
        <div className="flex justify-between text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">{label}</span>
          <b className="tabular-nums">{value}%</b>
        </div>
      )}
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-[width] duration-500" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
