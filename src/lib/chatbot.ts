import { allSubjects, programs } from "@/data/programs";

/**
 * Custom rule-based TU IT assistant — fully hand-coded, no external AI API.
 * Matches intents via keywords, searches the real syllabus data above,
 * and returns grounded answers with subject codes + semester info.
 */

export interface ChatMessage {
  role: "user" | "bot";
  text: string;
}

const norm = (s: string) => s.toLowerCase();

export function botReply(input: string): string {
  const q = norm(input).trim();
  if (!q) return "Ask me anything — e.g. 'CSIT 4th sem subjects', 'DBMS normalization', 'BIT eligibility', 'subnetting help'.";

  // greetings
  if (/^(hi|hello|hey|namaste|namaskar)\b/.test(q))
    return "Namaste! I'm **Sathi** — GyanSathi's offline-coded study buddy for CSIT, BIT & BCA.\n\nTry:\n• `CSIT 1st sem subjects`\n• `BIT eligibility`\n• `Explain normalization`\n• `OOP viva questions`\n• `Entrance prep plan`";

  // program overviews
  for (const p of programs) {
    if (q.includes(p.id) || q.includes(p.short.toLowerCase()) || q.includes(norm(p.name))) {
      if (q.includes("eligib") || q.includes("admission") || q.includes("entrance") || q.includes("who can")) {
        return `**${p.short} — Eligibility & Admission**\n${p.eligibility}\n\nFaculty: ${p.faculty}\nDuration: ${p.duration} · ${p.totalCredits} credits.\n\nReference: ${p.references.map((r) => `${r.label} (${r.url})`).join(" · ")}`;
      }
      const semMatch = q.match(/(1st|2nd|3rd|[4-8]th|first|second|third|fourth|fifth|sixth|seventh|eighth|\b[1-8]\b).*sem/);
      if (semMatch || q.includes("subject") || q.includes("syllabus") || q.includes("semester")) {
        const n = parseSem(q);
        if (n) {
          const sem = p.semesters.find((s) => s.num === n);
          if (sem)
            return `**${p.short} Semester ${n} — ${sem.label}**\n` +
              sem.subjects.map((s) => `• **${s.code}** — ${s.title} (${s.credits} cr${s.elective ? ", elective" : ""})\n  ${s.description}`).join("\n");
        }
        return `**${p.short} — all 8 semesters**\n` +
          p.semesters.map((s) => `Sem ${s.num}: ${s.subjects.map((x) => x.title).join(", ")}`).join("\n") +
          `\n\nAsk e.g. \`${p.id} 4th sem subjects\` for detail.`;
      }
      return `**${p.short} — ${p.name}**\n${p.description}\n\n${p.duration} · ${p.totalCredits} credits · ${p.faculty}\nEligibility: ${p.eligibility}`;
    }
  }

  // compare programs
  if (q.includes("difference") && (q.includes("csit") || q.includes("bit") || q.includes("bca")) || q.includes("which is better") || q.includes("csit vs")) {
    return "**CSIT vs BIT vs BCA (TU)**\n\n• **BSc CSIT** (IOST, 126 cr): deepest CS theory — TOC, Compiler, Cryptography, electives. Best for core software / research / abroad.\n• **BIT** (IOST, 120 cr, any stream): applied IT + business/society mix. Best if you came from management/any stream.\n• **BCA** (Humanities, 126 cr): application & lab heavy — Java, .NET, mobile, GIS. Best for hands-on app dev.\n\nAll three share C, DSA, DBMS, OS, Networks, Web, Java. Pick by background + goal, not hype.";
  }

  // subject search across all programs
  const hits = allSubjects().filter(
    (r) =>
      q.includes(norm(r.subject.code)) ||
      norm(r.subject.title).split(" ").some((w) => w.length > 3 && q.includes(w)) ||
      norm(r.subject.title).includes(q.slice(0, 12))
  );
  if (hits.length > 0 && hits.length <= 8) {
    const h = hits[0];
    return `**${h.subject.code} — ${h.subject.title}** (${h.program}, Sem ${h.semester})\n${h.subject.description}\n\nUnits:\n` +
      h.subject.units.map((u, i) => `${i + 1}. ${u}`).join("\n") +
      `\n\nWant MCQs or past questions on this? Open the **Quiz** or **Questions** page.`;
  }

  // topic explainers (hand-coded mini-notes)
  if (q.includes("normal")) return "**Normalization (DBMS) — 2-min revision**\n\n• 1NF: atomic values, no repeating groups.\n• 2NF: 1NF + no partial dependency (non-key depends on full key).\n• 3NF: 2NF + no transitive dependency (non-key → non-key).\n• BCNF: every determinant is a candidate key.\n\nTrick TU asks: *'R(A,B,C), A→B, B→C — which NF?'* → 2NF only (transitive A→C via B), decompose to R1(A,B), R2(B,C) for 3NF.";
  if (q.includes("subnet") || q.includes("/24") || q.includes("ip address")) return "**Subnetting quick method**\n\nUsable hosts = 2^(32−prefix) − 2.\n• /24 → 254 hosts, mask 255.255.255.0\n• /26 → 62 hosts (4 subnets of a /24)\n• /30 → 2 hosts (point-to-point links)\n\nSteps for TU numericals: 1) block size = 256 − mask octet, 2) list network addresses, 3) first = network+1, last = broadcast−1.";
  if (q.includes("pointer")) return "**C Pointers — viva pack**\n\n• `int *p` stores address; `*p` dereferences.\n• `malloc(n*sizeof(int))` allocates heap; always `free()` it.\n• Dangling pointer = points to freed memory → set `p = NULL` after free.\n• `a[i] == *(a+i)` — array-pointer equivalence (asked almost every year).";
  if (q.includes("oop") || q.includes("polymorph") || q.includes("inheritance")) return "**OOP 4 pillars (with one-line examples)**\n\n1. Encapsulation — bundle data+methods (`private balance` + `deposit()`).\n2. Abstraction — hide complexity (`interface Drawable { draw(); }`).\n3. Inheritance — reuse (`class Dog extends Animal`).\n4. Polymorphism — same call, different behaviour (`draw()` on Circle vs Square; overloading vs overriding).\n\nTU favourite: *abstract class vs interface* — single vs multiple inheritance, constructor support, when to use which.";
  if (q.includes("tcp") || (q.includes("osi") )) return "**Networks — OSI vs TCP/IP**\n\nOSI 7: Physical→DataLink→Network→Transport→Session→Presentation→Application.\nTCP/IP 4: Link→Internet→Transport→Application.\n\nTCP = reliable (handshake, ACK, retransmit) — web, email, files.\nUDP = fast, no guarantee — video calls, DNS, gaming.";
  if (q.includes("process") || q.includes("scheduling") || q.includes("deadlock")) return "**OS — must-know set**\n\n• Scheduling: FCFS (convoy effect), SJF (optimal avg wait, starves), Round Robin (time quantum), Priority + aging.\n• Deadlock 4 conditions: mutual exclusion, hold&wait, no preemption, circular wait → prevent by breaking any one.\n• Paging vs segmentation; thrashing = excessive page faults.";
  if (q.includes("entrance")) return "**CSIT/BIT Entrance plan (TU IOST)**\n\n• 100 MCQs, ~2 hrs: Math (40ish), Physics, English, CS/IQ.\n• Need 35%+ to pass; top colleges need much higher merit.\n• 30-day plan: Week 1 Math formulas + 200 MCQs; Week 2 Physics + English; Week 3 CS fundamentals + mock tests; Week 4 timed full mocks (use our **Quiz** page).\n• Revise: logs, trig, vectors, Kirchhoff, articles/prepositions, number systems, C output questions.";
  if (q.includes("project") || q.includes("internship")) return "**Project & Internship tips**\n\n• CSIT Sem 7 project (3 cr) + Sem 8 internship (6 cr); BIT Sem 7 project + Sem 8 internship; BCA Project III (6 cr).\n• Pick MERN / Django / Flutter + real client problem. Keep scope small but complete: auth + CRUD + report + deployment.\n• Docs TU checks: proposal → SRS/UML → implementation → testing → conclusion. Start docs in week 1, not week 12!";
  if (q.includes("routine") || q.includes("study plan") || q.includes("how to study") || q.includes("plan")) return "**4-week semester rescue plan**\n\nWeek 1: Syllabus mapping — list all units, mark repeated board topics.\nWeek 2: One subject/day hand-written notes + code.\nWeek 3: Past papers (timed, 3 hrs) + fix weak units.\nWeek 4: Formula/diagram book + daily 25-MCQ drills on the Quiz page.\n\nGolden rule: never skip chapters 1–3 of any subject — TU sets 40%+ from foundations.";
  if (q.includes("thank")) return "You’re welcome! Good luck — TU rewards consistent hand practice. Ask me another topic anytime.";
  if (q.includes("who made") || q.includes("creator") || q.includes("developer")) return "I’m a hand-coded rule-based assistant built into this student hub (no external AI API) — my answers come from the real TU CSIT/BIT/BCA syllabus data in this app.";

  // fallback: suggest closest subjects
  const keywords = q.split(/\s+/).filter((w) => w.length > 3).slice(0, 4);
  const sug = allSubjects()
    .filter((r) => keywords.some((k) => norm(r.subject.title).includes(k) || norm(r.subject.code).includes(k)))
    .slice(0, 3);
  if (sug.length)
    return `I don’t have a full note on “${input}” yet, but it looks related to:\n` +
      sug.map((s) => `• **${s.subject.code}** — ${s.subject.title} (${s.program} Sem ${s.semester})`).join("\n") +
      `\n\nTry asking like: \`Explain ${sug[0].subject.title}\` or open **Notes / Quiz / Questions** pages.`;
  return `Hmm, I’m a small offline-coded bot, so I answer best on TU syllabus topics.\n\nTry:\n• \`CSIT 4th sem subjects\`\n• \`BIT eligibility\`\n• \`Explain normalization\`\n• \`Subnetting help\`\n• \`OOP viva questions\`\n• \`Entrance prep plan\``;
}

function parseSem(q: string): number | null {
  const map: Record<string, number> = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, "1st": 1, "2nd": 2, "3rd": 3, "4th": 4, "5th": 5, "6th": 6, "7th": 7, "8th": 8 };
  for (const k of Object.keys(map)) if (q.includes(k)) return map[k];
  const m = q.match(/\b([1-8])\b/);
  return m ? parseInt(m[1]) : null;
}
