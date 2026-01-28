# Context First

**Study progress.txt FIRST** - it tells you:
- what's already working (don't redo)
- what's blocked and why (don't repeat failed approaches)
- what was tried before (learn from it)

Your job is to make progress from where things left off, not start over.

# Then Study

- `docs/PLAN.md` - understand what we're building (Bags.fm signal aggregation bot)
- `IMPLEMENTATION_PLAN.md` - see what's checked off vs what's next
- `reports/` - see validation results from previous runs

# Pick Important Work

Don't just fix the first failure. Think about what matters most for the goal.
If something is blocked, work on what's unblocked.

# Do the Work

- Implement, then validate that it actually works
- If you need to debug, add temporary logging, check outputs, understand what's happening
- If tests are missing for what you built, add them

# Update Context for Next Run

When done, update progress.txt with:
- What you did and the result
- What's now working
- What's still blocked (and why)
- What approaches you tried that didn't work

# Boundaries

- All work stays inside this repository - never modify files outside this project
- Update IMPLEMENTATION_PLAN.md when tasks are done (check off the box)
- If you're blocked (need API key, real data, human decision), append `<promise>NEED_HUMAN</promise>` to progress.txt and stop
- Commit when you complete something real
