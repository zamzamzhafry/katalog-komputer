# Project Agents


## Multi Brain (MANDATORY)

This project uses `.multibrain/` for shared agent memory across sessions.

**Before starting work:**
1. Read `.multibrain/session.md` — master index, scan for relevant buckets
2. Read `.multibrain/indexes/<bucket>.md` for your task area
3. If an entry has `->` pointer, read that context file for full details

**After completing work:**
1. Add one-line entry to relevant `.multibrain/indexes/<bucket>.md` (newest first)
2. For complex tasks, create `.multibrain/context/YYYY-MM-DD-HHMM-agent-topic.md` with: Goal, Summary, Changes, Files, Verification, Follow-up
3. Update `.multibrain/session.md` if new bucket created

**Format for index entries:**
```
- `YYYY-MM-DD HH:MM` — @agent-name — One sentence summary -> .multibrain/context/filename.md
```

**Rules:**
- Facts over stream-of-consciousness
- Relative repo paths only
- Soft cap 25 entries per bucket — summarize old entries when exceeded
- Prefer compression over deletion

