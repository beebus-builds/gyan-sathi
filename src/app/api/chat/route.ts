import { NextResponse } from "next/server";
import { botReply } from "@/lib/chatbot";

export async function POST(req: Request) {
  const { message } = await req.json().catch(() => ({ message: "" }));
  const reply = botReply(String(message ?? ""));
  return NextResponse.json({ reply });
}

export async function GET() {
  return NextResponse.json({
    name: "Sathi by GyanSathi",
    type: "custom rule-based (no external AI)",
    try: ["CSIT 4th sem subjects", "BIT eligibility", "Explain normalization"],
  });
}
