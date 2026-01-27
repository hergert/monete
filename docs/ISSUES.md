# Monenete Issues & Runbook

## Active issues
<!-- Add issues as they're discovered -->
<!-- Format:
- [ ] (YYYY-MM-DD) <title>
  - Symptoms:
  - Repro:
  - Suspected cause:
  - Next step:
  - Related logs: logs/iter_<n>.verify.txt
-->

## Resolved
<!-- Move fixed issues here -->
<!-- Format:
- [x] (YYYY-MM-DD) <title> — fixed in <commit hash>
-->

---

## Runbook (common failures)

### Verify fails because DB isn't ready
- Check: `docker compose ps`
- Check readiness: `docker compose exec -T db pg_isready -U monenete`
- If stuck: `docker compose logs db --tail=200`

### E2E replay fails
- Look at: `logs/iter_*.verify.txt`
- Confirm replay file exists: `data/replay/events.jsonl`
- Confirm fixtures exist: `data/fixtures/bags/*.json` and `data/fixtures/non_bags_dbc/*.json`

### Signature gate fails (false positives)
- Use manual checker:
  - `bun run sig:check data/fixtures/bags/<file>.json`
  - `bun run sig:check data/fixtures/non_bags_dbc/<file>.json`
- Add a fixture that reproduces the failure, then tighten classifier rules.

### Loop thrashing / no progress
- Check: `logs/iter_*.diffstat.txt`
- Add a smaller next step into `IMPLEMENTATION_PLAN.md`
- Document blocker in `BLOCKERS.md` if truly stuck.
