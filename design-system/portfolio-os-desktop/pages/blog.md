# Blog App — Page Overrides

> **PROJECT:** Portfolio OS Desktop · Blog
> **Generated:** 2026-04-30
> **Page Type:** Document Reader (Mail.app metaphor)

> ⚠️ **IMPORTANT:** Rules in this file **override** the Master file (`design-system/portfolio-os-desktop/MASTER.md`).
> Only deviations from the Master are documented here.

---

## Metaphor

The Blog is rendered as a **Mail.app / News.app-style list+detail window**, not a separate web blog. Selecting a post in the left list updates the right reading pane in place. This preserves the macOS Sonoma fiction.

## Layout (Window content area)

```
┌────────────────┬──────────────────────────────────────┐
│  Posts         │  <selected post title>               │
│  ──────────    │  Apr 30, 2026 · #meta · 3 min        │
│  ▸ Hello       │  ──────────                          │
│    Apr 30      │                                      │
│    A brief…    │  <reader content max-width 65ch>     │
│  ▸ Skill x...  │                                      │
│    Apr 29      │  Body uses SF Pro Text 15px / 1.65   │
│    Why I…      │  Headings use SF Pro Display 600     │
└────────────────┴──────────────────────────────────────┘
   240px wide          remaining width, scrollable
```

- **Left sidebar:** 240px fixed, `rgba(229,229,229,0.55)` background, separator line `0.5px solid rgba(0,0,0,0.08)` on its right edge.
- **Sidebar item:** padding 10px 14px, hover `rgba(0,0,0,0.04)`, selected `rgba(10,132,255,0.18)` with `--accent-color #2563EB` text.
- **Detail pane:** padding 32px 40px, white-ish `rgba(255,255,255,0.6)` over the window's frosted glass.
- **Below 520px window width:** sidebar collapses; show only the selected post's detail with a back chevron at top-left to return to the list. (Same trick as Mail.app on a narrow window.)

## Typography Overrides

- **Reader body:** `15px / 1.65` SF Pro Text, color `#1d1d1f`.
- **Reader title:** `26px / 1.2` SF Pro Display, weight 700.
- **Meta line:** `12px / 1` SF Pro Text, color `rgba(60,60,67,0.60)` (`--mac-text-secondary` from existing kit).
- Reading width: `max-width: 65ch` (line-length rule).

## Color Overrides

- Selection background: `rgba(10,132,255,0.18)` (macOS system blue at 18%)
- Tag chip: `rgba(0,0,0,0.06)` background, `#1d1d1f` text, 11px / 600
- Date text: `rgba(60,60,67,0.60)`
- Hairline separators: `0.5px solid rgba(0,0,0,0.08)`

## Component Overrides

- **List item:** title 13px/600, excerpt 12px/400 in `#86868b`, ellipsis after 2 lines.
- **Tag chips:** rendered inline after title in detail view, 11px, 4px 8px padding, 4px radius.
- **Empty state:** centered "Nothing here yet" + Caveat-style "but soon..." subline. Body color `#86868b`.

## Anti-patterns (specific to this page)

- ❌ No carousel of posts — list is canonical.
- ❌ No sticky author bio sidebar — keep the chrome airy.
- ❌ Don't render raw markdown — pre-process to safe HTML in `blog.json` (no `<script>`, no inline event handlers).
- ❌ Don't link out to medium/substack from here — this IS the canonical home.

## Pre-Delivery Checklist (page-specific)

- [ ] Reading width ≤ 65ch
- [ ] Body line-height 1.65 (matches reading rule)
- [ ] Selected state has visible focus ring (2px accent)
- [ ] Keyboard: ↑/↓ navigates list, Enter selects, Esc closes window
- [ ] Empty state present
- [ ] Date format absolute (`Apr 30, 2026`), not relative ("3 days ago")
- [ ] On window resize below 520px, sidebar gracefully collapses
