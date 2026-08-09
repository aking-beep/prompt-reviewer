import Link from "next/link";

const ITEMS: { label: string; done: boolean; note: string }[] = [
  { label: "Static clarity / structure / ambiguity checks", done: true, note: "Shipped in 0.1" },
  { label: "Injection-surface defenses + failure-mode catalog", done: true, note: "Shipped in 0.1" },
  { label: "Rewrite suggestions + Markdown / JSON export", done: true, note: "Shipped in 0.1" },
  { label: "CLI with --min-grade for CI gating", done: true, note: "Shipped in 0.1" },
  { label: "Shareable report permalinks", done: false, note: "Next — same pattern as MCP scanner" },
  { label: "Live attack-battery mode (opt-in model calls)", done: false, note: "After static v1 hardens" },
  { label: "GitHub Action wrapper", done: false, note: "Thin wrapper over CLI" },
];

export default function RoadmapPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
        <Link href="/" className="text-sm text-sub hover:text-ink">
          ← Prompt Reviewer
        </Link>
        <h1 className="text-3xl font-bold">Roadmap</h1>
        <ul className="space-y-3">
          {ITEMS.map((item) => (
            <li key={item.label} className="card p-4 flex items-start gap-3">
              <span className={item.done ? "text-good" : "text-sub"}>{item.done ? "✓" : "○"}</span>
              <div>
                <div className="font-medium text-sm">{item.label}</div>
                <div className="text-xs text-sub mt-0.5">{item.note}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
