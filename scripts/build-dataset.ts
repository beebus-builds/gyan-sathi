/**
 * GyanSathi dataset builder — Stage 1 of the custom-LLM track.
 * Turns the app's own curated TU data (MCQs, flashcards, exam topics,
 * syllabus, past papers, formula sheets) into an Alpaca-style
 * instruction-tuning JSONL set with a deterministic 95/5 train/val split.
 *
 * Run:  npm run dataset
 * Reads: src/data/*, src/lib/chatbot.ts (SATHI_TOPICS, SATHI_FORMULAS)
 * Writes: datasets/tu-instruct-train.jsonl + datasets/tu-instruct-val.jsonl
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { mcqs, entranceMcqs } from "../src/data/mcqs";
import { flashDecks } from "../src/data/flashcards";
import { pastQuestions } from "../src/data/pastQuestions";
import { allSubjects, programs } from "../src/data/programs";
import { SATHI_TOPICS, SATHI_FORMULAS } from "../src/lib/chatbot";

interface Pair {
  instruction: string;
  input: string;
  output: string;
}

const pairs: Pair[] = [];
const add = (instruction: string, input: string, output: string) => {
  if (instruction.trim() && output.trim()) pairs.push({ instruction: instruction.trim(), input: input.trim(), output: output.trim() });
};

const LETTERS = ["A", "B", "C", "D"];

/* ---- 1. MCQs: answer + explain (2 pairs each) ---- */
for (const m of [...mcqs, ...entranceMcqs]) {
  const opts = m.options.map((o, i) => `${LETTERS[i]}) ${o}`).join("\n");
  add(
    "Answer this Tribhuvan University exam MCQ. Reply with the option letter and a one-line reason.",
    `${m.question}\n${opts}`,
    `Answer: ${LETTERS[m.answer]}. ${m.explanation}`
  );
  add(
    `Explain the concept tested by this ${m.subject} MCQ for a TU exam:`,
    m.question,
    `${m.explanation} (Correct option: ${LETTERS[m.answer]} — ${m.options[m.answer]}.)`
  );
}

/* ---- 2. Flashcards: viva answer + definition (2 pairs each) ---- */
for (const deck of flashDecks) {
  for (const c of deck.cards) {
    add(`Answer in one line for a TU ${deck.subject} viva: ${c.front}`, "", c.back);
    add(`Give a 30-second examiner-style answer: ${c.front}`, "", `${c.back} [${deck.subject}]`);
  }
}

/* ---- 3. Exam topics: full explainer + viva extraction ---- */
for (const t of SATHI_TOPICS) {
  add(
    `Explain ${t.label} for a Tribhuvan University IT exam, with definitions, a worked example, and likely viva questions.`,
    "",
    t.body
  );
  const vivaLines = t.body.split("\n").filter((l) => /viva/i.test(l.trim()));
  add(
    `Give probable TU viva questions on ${t.label}.`,
    "",
    vivaLines.length
      ? vivaLines.join("\n")
      : `Define ${t.label} in one line. Give one example. State one trade-off.`
  );
}

/* ---- 4. Syllabus: units + description (2 pairs per subject) ---- */
for (const r of allSubjects()) {
  add(
    `What are the units of ${r.subject.code} (${r.subject.title})?`,
    "",
    `${r.subject.code} — ${r.subject.title} (${r.program}, Semester ${r.semester}, ${r.subject.credits} credits) covers:\n` +
      r.subject.units.map((u, i) => `${i + 1}. ${u}`).join("\n")
  );
  add(
    `Describe the TU subject ${r.subject.code} — ${r.subject.title}.`,
    "",
    `${r.subject.description} It is taught in Semester ${r.semester} of ${r.program} (${r.subject.credits} credits).`
  );
}

/* ---- 5. Past papers: board sets + answer scaffolds ---- */
for (const s of pastQuestions) {
  const formatted = `[${s.type} · ${s.year}] ${s.subject} (${s.code}), ${s.program}:\n` +
    s.questions.map((q) => `• [${q.marks}] ${q.text}`).join("\n");
  add(`Give important/board questions for ${s.code} (${s.subject}).`, "", formatted);
  for (const q of s.questions) {
    add(
      `Suggest how to answer this ${q.marks}-mark TU question: ${q.text}`,
      "",
      `Answer framework for [${q.marks}]: start with a one-line definition, add a labelled diagram or table, write 4–6 to-the-point steps, include one worked example with sample input/output, and close with one line. TU awards step marks for diagrams, formulas and partial code — never leave it blank.`
    );
  }
}

/* ---- 6. Formula sheets (2 phrasings each) ---- */
const FORMULA_NAMES = ["subnetting", "complexity / Big-O", "statistics", "discrete structures", "number systems"];
SATHI_FORMULAS.forEach((f, i) => {
  const name = FORMULA_NAMES[i] ?? `topic ${i + 1}`;
  add(`Give a quick formula sheet for ${name} (TU exam).`, "", f.body);
  add(`I need a last-night cheat sheet for ${name}.`, "", f.body);
});

/* ---- 7. Study plans from real units (sample of subjects) ---- */
const planSamples = ["CSC265", "CSC264", "CSC263", "CSC115", "CSC211", "CSC166"];
for (const code of planSamples) {
  const hit = allSubjects().find((r) => r.subject.code === code);
  if (!hit) continue;
  const units = hit.subject.units;
  add(
    `Make a 7-day study plan for ${hit.subject.code} (${hit.subject.title}).`,
    "",
    `7-day plan for ${hit.subject.code} — ${hit.subject.title}:\n` +
      units.map((u, i) => `Day ${i + 1}: ${u} — one diagram + one hand-written example.`).join("\n") +
      `\nDay 6: timed past-paper set. Day 7: full revision + 25-MCQ drill.`
  );
}

/* ---- 8. Program knowledge ---- */
for (const p of programs) {
  add(
    `What is the eligibility for ${p.short} at Tribhuvan University?`,
    "",
    `${p.short} (${p.name}): ${p.eligibility} It runs ${p.duration} totalling ${p.totalCredits} credits under ${p.faculty}.`
  );
}
add(
  "Compare BSc CSIT vs BIT vs BCA at Tribhuvan University.",
  "",
  "BSc CSIT (IOST, 126 credits): deepest CS theory — TOC, Compiler, Cryptography; best for core software/research. BIT (IOST, 120 credits, any +2 stream): applied IT + business mix. BCA (Humanities): lab-heavy app dev — Java, .NET, mobile. All share C, DSA, DBMS, OS, Networks, Web and Java."
);
add("What can Sathi help me with?", "", "MCQ drills (quiz me on a subject), viva questions, board/important questions, day-wise study plans from the real syllabus, formula sheets, syllabus lookup and flashcards.");
add("How should I write TU exam answers?", "", "Structure every answer: one-line definition, labelled diagram or table, 4–6 points, one worked example, one-line conclusion. Attempt all questions — step marks reward partial work.");

/* ---- validate, dedupe, deterministic split ---- */
const seen = new Set<string>();
const clean = pairs.filter((p) => {
  const k = `${p.instruction}\n${p.input}`;
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
});

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(2079);
const shuffled = [...clean];
for (let i = shuffled.length - 1; i > 0; i--) {
  const j = Math.floor(rand() * (i + 1));
  [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
}
const valCount = Math.max(1, Math.round(shuffled.length * 0.05));
const val = shuffled.slice(0, valCount);
const train = shuffled.slice(valCount);

const outDir = join(process.cwd(), "datasets");
mkdirSync(outDir, { recursive: true });
const toJsonl = (rows: Pair[]) => rows.map((r) => JSON.stringify(r)).join("\n") + "\n";
writeFileSync(join(outDir, "tu-instruct-train.jsonl"), toJsonl(train));
writeFileSync(join(outDir, "tu-instruct-val.jsonl"), toJsonl(val));

const byType = {
  mcq: (mcqs.length + entranceMcqs.length) * 2,
  flashcard: flashDecks.reduce((n, d) => n + d.cards.length, 0) * 2,
  topics: SATHI_TOPICS.length * 2,
  syllabus: allSubjects().length * 2,
};
console.log(`tu-instruct: raw=${pairs.length} deduped=${clean.length} train=${train.length} val=${val.length}`);
console.log(`sources: ${JSON.stringify({ ...byType, pastSets: pastQuestions.length, formulas: SATHI_FORMULAS.length * 2 })}`);
