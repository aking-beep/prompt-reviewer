import { NextResponse } from "next/server";
import { z } from "zod";
import {
  accessGateEnabled,
  extractAccessToken,
  verifyAccessToken,
} from "@/lib/access/gate";
import { reviewPrompt } from "@/lib/prompt/review";
import { LIMITS, clientIp, rateLimit } from "@/lib/security/ratelimit";

export const runtime = "nodejs";

const bodySchema = z.object({
  prompt: z.string().min(1).max(200_000),
  label: z.string().max(200).optional(),
  tools: z
    .array(
      z.object({
        name: z.string().min(1).max(200),
        description: z.string().max(4000).optional(),
      }),
    )
    .max(100)
    .optional(),
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = await rateLimit(`review:${ip}`, LIMITS.review.limit, LIMITS.review.windowMs);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    );
  }

  if (accessGateEnabled()) {
    const token = extractAccessToken(req);
    const auth = verifyAccessToken(token);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error, code: "access_required" }, { status: 401 });
    }
  }

  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const report = reviewPrompt({
      prompt: parsed.data.prompt,
      label: parsed.data.label,
      tools: parsed.data.tools,
    });

    return NextResponse.json({ report });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Review failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
