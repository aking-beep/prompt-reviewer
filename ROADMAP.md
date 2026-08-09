# Roadmap — Prompt Reviewer

## Shipped (0.1)
- [x] Static clarity / structure / ambiguity checks
- [x] Injection-surface defenses + failure-mode catalog
- [x] Rewrite suggestions + Markdown / JSON export
- [x] Web UI + `POST /api/review`
- [x] CLI with `--min-grade` / `--json`

## Next
- [ ] Shareable report permalinks (30-day TTL, same pattern as MCP scanner)
- [ ] GitHub Action wrapper over the CLI
- [ ] SVG badge (`?grade=` / hash of prompt)
- [ ] Live attack-battery mode (opt-in model calls; never default)

## Later
- [ ] Diff two prompt versions
- [ ] Team rubrics / custom check packs
- [ ] Airtable / access-gate lead capture (optional, off by default)
