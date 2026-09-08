/**
 * Stage-2 eval harness: MCQ accuracy for Sathi, rule-based or fine-tuned.
 *
 * Scores the "answer this MCQ" pairs from the Stage-1 dataset:
 *   npm run eval                        -> baseline (offline botReply), all splits
 *   npm run eval -- --split val         -> validation split only
 *   npm run eval -- --backend api --endpoint http://localhost:11434/v1 --model sathi
 *                                       -> any OpenAI-compatible endpoint (Ollama / vLLM)
 *                                         serving the fine-tuned model, same prompt shape
 *                                         as ml/sft.py's ALPACA_TEMPLATE.
 *
 * Exit code is always 0 (this is a report, not a gate). Use --json for CI logs.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { botReply } from "../src/lib/chatbot";
import { mcqs, entranceMcqs } from "../src/data/mcqs";

interface Pair { instruction: string; input: string; output: string; }

const args = Object.fromEntries(
  process.argv.slice(2).map((a, i, arr) =>
    a.startsWith("--") ? [a.slice(2), arr[i + 1]?.startsWith("--") ? "true" : arr[i + 1] ?? "true"] : []
  ).filter((e) => e.length)
) as Record<string, string>;

const split = args.split ?? "all";           // val | train | all
const backend = args.backend ?? "baseline";  // baseline | api
const endpoint = args.endpoint ?? "http://localhost:11434/v1";
const model = args.model ?? "sathi";
const limit = args.limit ? parseInt(args.limit) : Infinity;
const showMisses = args["show-misses"] ? parseInt(args["show-misses"]) : 5;

const MCQ_PREFIX = "Answer this Tribhuvan University exam MCQ";

function load(splitName: string): Pair[] {
  const raw = readFileSync(join(process.cwd(), "datasets", `tu-instruct-${splitName}.jsonl`), "utf-8");
  return raw.split("\n").filter(Boolean).map((l) => JSON.parse(l));
}

const files = split === "all" ? ["train", "val"] : [split];
let pairs: Pair[];
try {
  pairs = files.flatMap(load);
} catch {
  console.error("datasets/*.jsonl not found — run `npm run dataset` first.");
  process.exit(1);
}
const mcqPairs = pairs.filter((p) => p.instruction.startsWith(MCQ_PREFIX)).slice(0, limit);
if (!mcqPairs.length) {
  console.error("No MCQ answer pairs found in the selected split.");
  process.exit(1);
}

// Attach subject by matching the question back to the MCQ bank.
const bank = [...mcqs, ...entranceMcqs];
const subjectOf = (input: string) => {
  const firstLine = input.split("\n")[0];
  return bank.find((m) => m.question === firstLine)?.subject ?? "unknown";
};
const expectedOf = (output: string) => output.match(/Answer:\s*([A-D])/)?.[1] ?? "?";

const ALPACA = (p: Pair) =>
  `### Instruction:\n${p.instruction}\n\n### Input:\n${p.input}\n\n### Response:\n`;

async function completeApi(prompt: string): Promise<string> {
  const res = await fetch(`${endpoint.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: 200,
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

function extractLetter(reply: string): string {
  const m = reply.match(/Answer:\s*([A-D])|^\s*\(?([A-D])\)?[\).\s]/m);
  return m?.[1] ?? m?.[2] ?? "?";
}

const perSubject: Record<string, { n: number; ok: number }> = {};
const misses: { want: string; got: string; q: string }[] = [];
let ok = 0;

async function main() {
for (const p of mcqPairs) {
  const want = expectedOf(p.output);
  // Baseline answers from the raw question the way a student would paste it;
  // API backend gets the exact training prompt shape.
  const reply = backend === "api" ? await completeApi(ALPACA(p)) : botReply(p.input);
  const got = extractLetter(reply);
  const subj = subjectOf(p.input);
  perSubject[subj] ??= { n: 0, ok: 0 };
  perSubject[subj].n++;
  if (got === want) {
    ok++;
    perSubject[subj].ok++;
  } else if (misses.length < 200) {
    misses.push({ want, got, q: p.input.split("\n")[0].slice(0, 90) });
  }
}

const acc = ok / mcqPairs.length;
const summary = {
  backend: backend === "api" ? `${endpoint} (${model})` : "baseline botReply",
  split,
  n: mcqPairs.length,
  correct: ok,
  accuracy: Math.round(acc * 1000) / 1000,
  perSubject: Object.fromEntries(
    Object.entries(perSubject).map(([s, v]) => [s, { ...v, acc: Math.round((v.ok / v.n) * 1000) / 1000 }])
  ),
};

if (args.json) {
  console.log(JSON.stringify(summary, null, 2));
} else {
  console.log(`sathi eval — ${summary.backend} — split=${split} — n=${summary.n}`);
  console.log(`accuracy: ${summary.correct}/${summary.n} = ${(acc * 100).toFixed(1)}%`);
  console.log("per-subject:");
  for (const [s, v] of Object.entries(summary.perSubject).sort((a, b) => a[1].acc - b[1].acc))
    console.log(`  ${(v.acc * 100).toFixed(0).padStart(5)}%  ${v.ok}/${v.n}  ${s}`);
  if (misses.length) {
    console.log(`misses (first ${Math.min(showMisses, misses.length)}):`);
    for (const m of misses.slice(0, showMisses))
      console.log(`  want ${m.want}, got ${m.got} — ${m.q}`);
  }
}
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
