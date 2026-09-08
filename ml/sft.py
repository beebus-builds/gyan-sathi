"""
Stage 2 of the GyanSathi custom-LLM track: LoRA fine-tune (SFT).

Trains any HuggingFace causal-LM on the Stage-1 dataset
(datasets/tu-instruct-train.jsonl, Alpaca-style instruction/input/output rows).

Default base model: Qwen2.5-1.5B-Instruct — small enough for free Colab (T4),
multilingual enough for Nepali-mix prompts, instruction-tuned so it already
follows the "### Instruction / ### Input / ### Response" shape.

Run locally (GPU) or paste into Colab; see ml/README.md for the runbook.

  pip install -r ml/requirements.txt
  python ml/sft.py --train datasets/tu-instruct-train.jsonl \\
      --val datasets/tu-instruct-val.jsonl --out models/sathi-qwen15
"""

import argparse
import json

from datasets import Dataset
from peft import LoraConfig
from transformers import AutoModelForCausalLM, AutoTokenizer
from trl import SFTConfig, SFTTrainer

# Single source of truth for the prompt shape. scripts/eval-mcq.ts documents
# the same template for inference — keep them in sync.
ALPACA_TEMPLATE = (
    "### Instruction:\n{instruction}\n\n### Input:\n{input}\n\n### Response:\n"
)


def load_jsonl(path: str) -> Dataset:
    rows = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return Dataset.from_list(rows)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default="Qwen/Qwen2.5-1.5B-Instruct")
    ap.add_argument("--train", default="datasets/tu-instruct-train.jsonl")
    ap.add_argument("--val", default="datasets/tu-instruct-val.jsonl")
    ap.add_argument("--out", default="models/sathi-qwen15")
    ap.add_argument("--epochs", type=float, default=3)
    ap.add_argument("--lr", type=float, default=2e-4)
    ap.add_argument("--rank", type=int, default=16)
    ap.add_argument("--alpha", type=int, default=32)
    ap.add_argument("--batch", type=int, default=4)
    ap.add_argument("--grad-accum", type=int, default=4)
    ap.add_argument("--max-len", type=int, default=1024)
    ap.add_argument("--load-4bit", action="store_true",
                    help="4-bit quantised base weights (fits a free T4).")
    args = ap.parse_args()

    tok = AutoTokenizer.from_pretrained(args.model, use_fast=True)
    if tok.pad_token is None:
        tok.pad_token = tok.eos_token

    model_kwargs: dict = {"dtype": "auto"}
    if args.load_4bit:
        model_kwargs["load_in_4bit"] = True
    model = AutoModelForCausalLM.from_pretrained(args.model, **model_kwargs)

    train_ds = load_jsonl(args.train)
    val_ds = load_jsonl(args.val)

    def format_row(row: dict) -> str:
        prompt = ALPACA_TEMPLATE.format(
            instruction=row["instruction"].strip(),
            input=row["input"].strip(),
        )
        return prompt + row["output"].strip() + tok.eos_token

    lora = LoraConfig(
        r=args.rank,
        lora_alpha=args.alpha,
        lora_dropout=0.05,
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj",
                        "gate_proj", "up_proj", "down_proj"],
        task_type="CAUSAL_LM",
    )

    sft_args = SFTConfig(
        output_dir=args.out,
        num_train_epochs=args.epochs,
        learning_rate=args.lr,
        per_device_train_batch_size=args.batch,
        gradient_accumulation_steps=args.grad_accum,
        max_length=args.max_len,
        dataset_text_field="text",
        eval_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        logging_steps=10,
        report_to="none",
    )

    trainer = SFTTrainer(
        model=model,
        args=sft_args,
        train_dataset=train_ds.map(lambda r: {"text": format_row(r)}),
        eval_dataset=val_ds.map(lambda r: {"text": format_row(r)}),
        peft_config=lora,
        processing_class=tok,
    )
    trainer.train()
    trainer.save_model(args.out)
    tok.save_pretrained(args.out)
    print(f"saved LoRA adapter + tokenizer to {args.out}")


if __name__ == "__main__":
    main()
