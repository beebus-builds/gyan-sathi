# Sathi custom-LLM track — Stage 2: fine-tune + eval

**Where we are.** Stage 1 (`npm run dataset`) builds `datasets/tu-instruct-train.jsonl`
(555 rows) + `datasets/tu-instruct-val.jsonl` (29 rows), Alpaca-style
`{instruction, input, output}` from the app's own TU data (MCQs, flashcards,
exam topics, syllabus, past papers, formula sheets).

**Baseline (measured).** The current rule-based bot scores **0%** on letter-accuracy
(`npm run eval` → 0/68) — it explains and drills, but never answers `Answer: X`.
That is the number the fine-tuned model has to beat.

## 1. Train (GPU machine or free Colab)

```bash
pip install -r ml/requirements.txt
python ml/sft.py --train datasets/tu-instruct-train.jsonl \
    --val datasets/tu-instruct-val.jsonl \
    --out models/sathi-qwen15 --load-4bit
```

Defaults: base `Qwen/Qwen2.5-1.5B-Instruct`, LoRA r=16/α=32 on all attention+MLP
projections, lr 2e-4, 3 epochs, batch 4 × grad-accum 4. The `--load-4bit` flag
fits a free Colab T4; drop it on an A100.

**Tiny-data regime (584 pairs).** Start with 2–4 epochs and watch val loss every
epoch — with data this small the model memorises fast. If val loss rises after
epoch 2, stop there and grow the dataset (Stage 5) instead of tuning harder.
Prompt shape is `ml/sft.py::ALPACA_TEMPLATE` — keep it byte-identical everywhere;
`scripts/eval-mcq.ts` reuses it for inference.

## 2. Eval

```bash
npm run eval                                              # baseline (rule-based)
npm run eval -- --split val                               # val split only
npm run eval -- --backend api \
  --endpoint http://localhost:11434/v1 --model sathi      # fine-tuned model
```

The `api` backend speaks OpenAI-compatible `/chat/completions`, so it works with
Ollama or vLLM with no code changes. It reports overall + per-subject accuracy
and the first misses. **Target: ≥70% on `--split all`** (val has only ~4 MCQ
rows, so it is too noisy to gate on until the dataset grows).

## 3. Export for serving (after training)

```bash
# merge LoRA into base, quantise to GGUF, serve:
python - <<'EOF'
from peft import AutoPeftModelForCausalLM
m = AutoPeftModelForCausalLM.from_pretrained("models/sathi-qwen15").merge_and_unload()
m.save_pretrained("models/sathi-merged")
EOF
# then: llama.cpp `convert_hf_to_gguf.py` + quantize to Q4_K_M,
# then: `ollama create sathi -f Modelfile` (FROM ./sathi-q4_k_m.gguf)
```

## 4. What comes next

- **Stage 3 — app inference swap.** Point `/api/chat` (or a new `/api/sathi-model`
  route) at the served model, keep `botReply` as offline fallback. Decide hosting:
  server GPU vs. on-device GGUF — the "works offline" story depends on it.
- **Stage 4 — quality bar.** Human rubric on 50 sampled answers (correctness,
  TU-syllabus grounding, no hallucinated codes/marks) before students see it.
- **Stage 5 — flywheel.** Quiz misses + forum Q&A flow back into the dataset;
  re-run `npm run dataset`, retrain monthly. This is what fixes the 0→70 gap
  permanently — data scale, not hyperparameters.
