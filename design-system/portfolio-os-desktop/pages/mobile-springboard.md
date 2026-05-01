# Mobile Springboard — `/desktop` at ≤768px

> **PROJECT:** Portfolio OS Desktop · Mobile Branch
> **Generated:** 2026-04-30
> **Page Type:** iOS Springboard (Home Screen) Metaphor

> ⚠️ **IMPORTANT:** Rules in this file **override** the Master file (`design-system/portfolio-os-desktop/MASTER.md`).

---

## Metaphor

When viewport width ≤ **768px**, the `/desktop` route swaps the macOS Sonoma chrome (top bar + dock + draggable windows) for an **iOS 17 Springboard**: status bar + grid of app icons + home indicator. Tapping an icon opens a **fullscreen sheet** that wraps the same React app components used on desktop. This keeps the "OS portfolio" fiction consistent across form factors instead of bailing out to a redirect.

**Why a metaphor swap, not just CSS shrinking:**
- macOS draggable windows + dock magnification are pointer-driven. They don't survive a touch-only environment.
- iOS Springboard is the canonical mobile equivalent users already know — discoverability is free.

## Breakpoint contract

- `≤ 768px`: render `<MobileSpringboard>` instead of `<MacDesktop>`. Single source of truth.
- `> 768px`: render `<MacDesktop>` (existing experience untouched).
- Implementation: a `useViewportMode()` hook that subscribes to `matchMedia('(max-width: 768px)')` with cleanup.

## Structure

```
┌─────────────────────────────────┐ ← status-bar (44px)
│ 12:48          ▮▮▮ ⌒ 100%       │
├─────────────────────────────────┤
│                                 │
│    [CV]   [Bog]  [Pro]  [Abt]  │
│                                 │
│    [Cnt]  [Stu]  [Trh]         │
│                                 │
│            ...                  │
│                                 │
├─────────────────────────────────┤
│            ─────                │ ← home indicator (134×5)
└─────────────────────────────────┘
```

## Tokens

| Token | Value | Note |
|---|---|---|
| `--ios-status-bar-height` | `44px` | iPhone safe-area aware |
| `--ios-home-indicator-height` | `34px` | Bottom safe area |
| `--ios-icon-size` | `60px` | Touch-friendly, matches iOS |
| `--ios-icon-radius` | `14px` | iOS uses 22.37% but 14 reads correct visually |
| `--ios-icon-shadow` | `0 4px 12px rgba(0,0,0,0.35)` | Drop shadow on translucent bg |
| `--ios-grid-gap-x` | `16px` | Between columns |
| `--ios-grid-gap-y` | `28px` | Between rows |
| `--ios-grid-padding-x` | `24px` | Side padding |
| `--ios-label-size` | `11px` | iOS-faithful |
| `--ios-label-color` | `#fff` | With drop-shadow for legibility |
| `--ios-sheet-radius` | `12px` | Rounded sheet top corners (after slide-up) |
| `--ios-sheet-bg` | `rgba(246,246,246,0.96)` | Matches macOS window glass |

## Component spec

### Status Bar
- 44px tall, content vertically centered.
- Left: time (live, updates every 30s) — 16px / 600, `#fff`, `text-shadow: 0 1px 2px rgba(0,0,0,0.35)`.
- Right: signal, wifi, battery — Lucide-style SVG glyphs, 13px tall, `#fff` opacity 0.95.
- No background — overlays the wallpaper directly, like real iOS.

### Springboard Grid
- 4 columns, fixed-width tiles (60px icon + label).
- `padding: 24px 24px 0 24px`.
- `display: grid; grid-template-columns: repeat(4, 1fr); gap: 28px 16px;`
- Each tile is a `<button>` with `min-height: 88px` (icon 60 + gap 6 + label ~22) — tap target far above 44px.
- Icon background uses the same gradient/SVG as the dock (reuse DockIcon registry).
- Label: 11px, `#fff`, single line, ellipsis if long.

### Home Indicator
- Centered horizontally, 18px from bottom, 134×5px white pill, `border-radius: 3px`, `opacity: 0.85`.
- Decorative; not interactive.

### Fullscreen Sheet (on icon tap)
- Slides up from bottom in 280ms `cubic-bezier(0.32, 0.72, 0, 1)` (iOS-faithful curve).
- Top 12px: rounded corners. Below: full-bleed.
- Header (44px): centered title (15px / 600), left-aligned `Done` button (17px / 400, `--accent #2563EB`).
- Content area: scrollable, full height minus header, reuses existing app components (`<AboutApp />`, `<ProjectsApp />`, etc.) without modification.
- Tap `Done` → sheet slides back down, returns to springboard.
- Swipe-down gesture (out of scope — keep `Done` button only for v1).

### External-URL apps
- Same tap behavior as on desktop: `window.open(url, '_blank', 'noopener,noreferrer')` — no sheet for those.

### Reduced-motion
- Sheet animation collapses to fade-in 80ms.

## Anti-patterns

- ❌ Don't shrink the macOS dock and call it mobile. The metaphor breaks.
- ❌ Don't auto-redirect to `/`. The user explicitly came to `/desktop` — give them a faithful mobile counterpart.
- ❌ No `100vh` — use `100dvh` (mobile browser chrome eats `vh`).
- ❌ Don't show the desktop's right-click context menu on touch.
- ❌ No drag-to-rearrange icons in v1 (out of scope).

## Layout & Touch Rules (from ui-ux-pro-max ux domain)

- ✅ Touch targets ≥ 44×44px (every springboard tile is 88px tall, well above).
- ✅ Touch spacing ≥ 8px (we use 16px column gap, 28px row gap).
- ✅ `overscroll-behavior: contain` on the springboard layer to prevent bounce-refresh.
- ✅ Use `100dvh` for full height.
- ✅ Test at 320 / 375 / 414 / 768.

## Pre-Delivery Checklist (mobile-specific)

- [ ] At 375px width: 4 cols visible, all 6+ icons reachable without horizontal scroll
- [ ] Status bar text legible against any wallpaper
- [ ] Home indicator clearly visible
- [ ] Sheet `Done` button has 44×44 hit area
- [ ] Tap targets all ≥ 44px
- [ ] No `100vh` anywhere — `100dvh` only
- [ ] `prefers-reduced-motion` collapses sheet animation
- [ ] At 768px exactly: still mobile (boundary inclusive); at 769px: macOS
- [ ] Wallpaper renders behind status bar
- [ ] Existing app components (`AboutApp`, `ProjectsApp`, `ContactApp`, `PDFViewer`, `BlogApp`, `TrashApp`) render correctly inside the sheet without flex-overflow issues
