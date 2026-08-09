# CLAUDE.md — Prompt Reviewer

Context for AI agents working in this repo. Read this first.

## What this is
A free developer tool (**ARC Labs 0.1**) that statically reviews a system prompt (optional tool
list) and grades clarity, structure, ambiguity, injection surface, failure modes, and tool policy.
Next.js 15 (App Router) + TypeScript + Tailwind. Deploys to Vercel. MIT licensed.
No LLM calls in 0.1 — deterministic heuristics only.

## Homes
- Google Drive: `ARC Transformation/ARC Labs (Free)/prompt-reviewer` (canonical Labs folder)
- Local mirror: `~/Projects/prompt-reviewer`
- GitHub: `https://github.com/aking-beep/prompt-reviewer`

Keep all three in sync when you ship. Prefer committing from the Drive home or Projects mirror,
then push to GitHub; rsync the other local copy.

## Commands
- `npm install` — install deps
- `npm run dev` — dev server at localhost:3000
- `npm run build` — production build
- `npm run typecheck` — `tsc --noEmit`
- `npm run review -- <prompt.txt>` — CLI review

## Architecture
UI (`app/page.tsx`) → `POST /api/review` → `lib/prompt/review.ts` orchestrator:
1. `lib/prompt/checks.ts` — static checks across 6 categories
2. `lib/prompt/ambiguity.ts` — weasel-phrase hits
3. `lib/prompt/scoring.ts` + `remediation.ts` — scores, grade, recommendations
4. `lib/prompt/failureModes.ts` — catalog with covered/gap
5. `lib/prompt/rewrite.ts` — PR-ready rewrite blocks
6. `lib/prompt/markdown.ts` — Markdown export

`lib/prompt/types.ts` holds shared shapes — start there.
`ReviewReport` is the single object the API returns and the UI renders.

## Conventions
- Path alias `@/*` → repo root
- Tailwind theme colors in `tailwind.config.ts`; component classes in `app/globals.css`
- Check scoring: pass=1, warn=0.5, fail=0, skip=excluded
- Match MCP Conformance Scanner UX patterns (card / pill / gauge / grade badge)

## Honest limits
Static review measures defensive *intent* in the text, not runtime resistance.
Never claim a prompt is “unjailbreakable.” Point users at live adversarial testing.
