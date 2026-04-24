# Portfolio Overhaul — Canvas Home + macOS-Accurate Desktop

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` to execute this plan. Orchestrator (you) dispatches one fresh subagent per Task, reviews the diff, commits, and moves to the next. Never let a subagent invent a color, font, or spacing value — inline values from `design-system/tokens.json` in every subagent prompt.

**Goal:** Re-skin `andriybabiy.com` into a hand-drawn "canvas" portfolio (inspired by portfoliobyshruti.com) driven by CV content, and rebuild the `/desktop` route as a near-pixel-accurate macOS Sonoma experience — without breaking the existing GHCR → Hetzner deploy pipeline.

**Architecture:**
- **Home (`/`)** — canvas/sketchbook aesthetic. Warm paper background, ink-black typography (Clash Display + Satoshi), handwritten accents (Caveat), pinned/taped project cards, scroll-driven experience timeline. CV data surfaces as discrete cards on a virtual canvas.
- **Desktop (`/desktop`)** — accurate macOS Sonoma UI. New `src/macos-kit/` primitive library (TrafficLights, MenuBar, Dock, Window, Sheet, Finder, Wallpaper) grounded in Apple HIG. SF Pro typography, genuine traffic-light geometry, dock magnification, frosted-glass window chrome.
- **Deploy** — unchanged GHCR + Hetzner pipeline. Add Cloudflare cache-busting query-string strategy for new static assets so Layer 4 image updates invalidate without manual cache purges.
- **Content** — driven by CV + real projects. All data stays in `src/data/*.json` (Sveltia CMS contract preserved). Adds `experience.json`, `education.json`, `certifications.json`.

**Tech Stack:** React 19, Vite 7, React Router 7, vanilla CSS + CSS modules, CSS custom properties (no Tailwind introduction — intentional, canvas aesthetic is cleaner in bespoke CSS), Sveltia CMS (existing), Docker + nginx:alpine + GHCR + Hetzner (existing), Framer Motion (new, for scroll/hover motion — opt-in per component), Cloudflare Origin Cert (existing).

**Orchestration model:**
- You (orchestrator) own `design-system/tokens.json`. It is the single source of truth.
- Each Task below dispatches a **fresh subagent** (via `Agent` tool) with an inline copy of the relevant token slice pasted into the prompt. Subagents never read `tokens.json` from disk — they receive the *exact values* they need, no more.
- Between Tasks, run `feature-dev:code-reviewer` agent on the diff.
- Every generation goes through the **Draft QA gate** (< 5s: token fidelity · alt text · touch targets · semantic HTML · contrast) before commit. A failing Draft check re-prompts the generator with the violation inlined.
- A **Release QA gate** (Lighthouse + responsive screenshots + keyboard nav + reduced-motion) runs before Phase 8 deploy.
- Every task updates `ui-history/<date>-<task>.md` with: subagent prompt, tokens sha256, versions observed, QA result, licensing row.

**Policy precedence (from `~/.claude/CLAUDE.md`):** Compliance > Security > Determinism > Reliability > Convenience. If a Task hits an unexpected situation, halt and ask.

---

## Phase 0 — Foundations

### Task 0.1: Verify repo state and carve a worktree

**Files:**
- Read: `.github/workflows/deploy.yml`
- Read: `deployment/docker-compose.yml`

**Step 1: Snapshot current deploy health**

```bash
curl -I https://andriybabiy.com/ | head -3
curl -I https://andriybabiy.com/desktop | head -3
ssh -i ~/.ssh/studyie_vps deploy@78.47.89.101 'sudo docker ps --filter name=portfolio'
```
Expected: `HTTP/2 200` on both, container `Up`.

**Step 2: Create isolated worktree** (uses `superpowers:using-git-worktrees`)

```bash
cd /Users/andriybabiy/personal_projects/react-personal-portfolio
git status                          # must be clean
git fetch origin
git worktree add -b feat/portfolio-overhaul ../portfolio-overhaul-worktree origin/main
cd ../portfolio-overhaul-worktree
```

**Step 3: Scaffold directories**

```bash
mkdir -p design-system ui-history src/macos-kit/primitives src/macos-kit/apps public/uploads/canvas
```

**Step 4: Commit empty scaffolding**

```bash
git add -A && git commit -m "chore: scaffold design-system, ui-history, macos-kit dirs"
```

---

## Phase 1 — Layer 1: Design token contract

### Task 1.1: Generate Andriy-branded tokens (orchestrator runs this directly — do NOT delegate)

**Files:**
- Read: `/Users/andriybabiy/hackathons/giveago-multiagent/output/www.portfoliobyshruti.com/design-system/tokens.json`
- Create: `design-system/tokens.json`
- Create: `design-system/MASTER.md`

**Step 1: Invoke `ui-ux-pro-max` skill via the Skill tool**

Pass args:
```
--persist
--inspiration /Users/andriybabiy/hackathons/giveago-multiagent/output/www.portfoliobyshruti.com/design-system/tokens.json
--brand "Andriy Babiy — growth-data-engineer story. Warm but rigorous. Analytic but human."
--target /Users/andriybabiy/personal_projects/portfolio-overhaul-worktree/design-system
```

**Step 2: Manual token review**

Check the produced `tokens.json`:
- `--color-canvas` warm (#FAFAFA–#F5F0E8 range)
- `--color-ink` near-black (#1A1A1A)
- `--color-accent` distinct from Shruti's coral — pick from **{#2E5E4E (ink-teal), #B8572E (burnt ochre), #D4A574 (aged gold)}** to avoid clone feel
- `--font-display: 'Clash Display'` (keep — this is the on-trend pairing)
- `--font-body: 'Satoshi'`
- `--font-hand: 'Caveat'`
- Add `--color-canvas-grid` (very faint rule-paper blue at 4% opacity)
- Add dark-mode block (`[data-theme='dark']`)

**Step 3: Commit**

```bash
git add design-system/
git commit -m "feat(design-system): Andriy-branded canvas tokens from ui-ux-pro-max"
```

### Task 1.2: Wire tokens into global CSS

**Files:**
- Modify: `src/index.css` (replace entire file)
- Read: `design-system/tokens.json`

**Subagent dispatch:** `general-purpose`, prompt must include full `cssVariables` object inlined.

**Step 1: Subagent writes new `src/index.css`**

Prompt skeleton:
> "Replace `src/index.css`. Paste the following CSS custom properties verbatim into `:root`. Do not invent any values. Also add `@font-face` declarations for Clash Display, Satoshi, and Caveat loading from `/fonts/` (will be populated in Task 1.3). Apply `--color-canvas` as body background and `--color-ink` as body color. Set font-family chain to `--font-body`. Include a `[data-theme='dark']` block from the dark section of tokens.json.
>
> [PASTE FULL cssVariables + dark block HERE]"

**Step 2: Draft QA — token fidelity check**

```bash
node -e "
  const tok = require('./design-system/tokens.json').cssVariables;
  const css = require('fs').readFileSync('./src/index.css','utf8');
  const miss = Object.entries(tok).filter(([k,v]) => !css.includes(v));
  if (miss.length) { console.error('MISSING', miss); process.exit(1); }
  console.log('OK');
"
```
Expected: `OK`. If FAIL → re-dispatch with violations inline.

**Step 3: Commit**

```bash
git add src/index.css && git commit -m "feat(style): wire canonical tokens into global CSS"
```

### Task 1.3: Self-host fonts (performance + privacy)

**Files:**
- Create: `public/fonts/ClashDisplay-Variable.woff2`
- Create: `public/fonts/Satoshi-Variable.woff2`
- Create: `public/fonts/Caveat-Variable.woff2`
- Modify: `src/index.css` (add `@font-face` — already done in 1.2 if subagent followed)

**Step 1:** Download from Fontshare (Clash Display + Satoshi — free commercial) and Google Fonts (Caveat — OFL).

**Step 2:** Verify `font-display: swap` and `unicode-range` set for Latin.

**Step 3:** Commit with `chore(fonts): self-host Clash Display, Satoshi, Caveat`.

---

## Phase 2 — Content model from CV

### Task 2.1: Profile

**Files:**
- Modify: `src/data/profile.json`

**Data to inline:**
```
name: Andriy Babiy
tagline: "I turn data into products — and products into growth."
location: Dublin, Ireland
email: babiya@tcd.ie
phone: +353 86 309 9721
linkedin: https://www.linkedin.com/in/andriy-babiy
github: https://github.com/AndriyBabiy
bio_short: (2 sentences on the growth→engineering arc)
bio_long: (4–6 sentences: Trinity → 2K Games marketing analytics → Atlas Primer CMO → MSc software engineering)
```

**Subagent:** `general-purpose`. Prompt must forbid inventing any credential not in CV.

**Commit:** `feat(content): profile from CV`.

### Task 2.2: Experience

**Files:**
- Create: `src/data/experience.json`
- Modify: `src/data/content.js` (add `experience` export)

Schema:
```json
{
  "experience": [
    {
      "id": "atlas-primer",
      "company": "Atlas Primer",
      "role": "Chief Marketing Officer",
      "location": "Dublin, Remote",
      "start": "2021-12",
      "end": "2023-07",
      "summary": "Personal learning assistant for students with dyslexia/ADHD.",
      "highlights": [
        "Designed in-app events system → 4× week-1 retention in top cohorts",
        "Amplitude + GA4 dashboards → 200% weekly engagement lift while scaling users 400%",
        "A/B-tested WIX landing → improved on-site duration + conversion",
        "Owned paid + organic UA; supplied product team with demographic-targeted testing cohorts"
      ]
    },
    {
      "id": "2k-games",
      "company": "2K Games",
      "role": "Performance Marketing Analyst",
      "location": "Dublin",
      "start": "2020-07",
      "end": "2021-12",
      "summary": "UA analytics for AAA launches incl. NBA 2K21.",
      "highlights": [
        "Managed + reported paid UA across all platforms for AAA launches",
        "Maintained daily marketing data pipelines + co-designed naming-convention tool",
        "SQL email-campaign analyses → CRM targeting refinement",
        "Built creative-perf extraction system for Facebook Ads mobile UA"
      ]
    }
  ]
}
```

**Commit:** `feat(content): experience from CV`.

### Task 2.3: Education + Certifications

**Files:**
- Create: `src/data/education.json`
- Create: `src/data/certifications.json`
- Modify: `src/data/content.js`

**Data:**
```json
{"education":[
  {"school":"GoIT Neoversity (Woolf)","degree":"MSc Computer Science — Software Engineering","start":"2023","end":"2025"},
  {"school":"Trinity College Dublin","degree":"B.S. Business and Economics — Entrepreneurship, Marketing, Management","grade":"First Class Honours (I.I)","start":"2015","end":"2020"}
]}
```
```json
{"certifications":[
  {"year":2023,"name":"Google Data Analytics Certificate","issuer":"Coursera"},
  {"year":2022,"name":"Foundations of Data Science","issuer":"BerkeleyX"},
  {"year":2020,"name":"KPMG Data Analytics Consulting Online Internship","issuer":"KPMG"}
]}
```

**Commit:** `feat(content): education and certifications`.

### Task 2.4: Skills (grouped, real stack)

**Files:**
- Modify: `src/data/skills.json`

**Subagent:** `general-purpose`. Constraint: only include skills evidenced by existing repos or CV.

Groups:
- `Languages`: JavaScript, TypeScript, Python, SQL, Bash
- `Frontend`: React, Vite, CSS (modules + vars), Framer Motion
- `Backend / Data`: Node.js, Python (FastAPI/Flask), PostgreSQL, Redis
- `Cloud / Infra`: Hetzner, Cloudflare, Docker, GitHub Actions, nginx, Terraform
- `AI / Agents`: Anthropic SDK, Claude Agent SDK, MCP, prompt caching, RAG
- `Analytics`: PostHog, Amplitude, GA4, Mixpanel
- `Design`: Figma, Excalidraw, ui-ux-pro-max workflow

**Commit:** `feat(content): skills grouped by domain`.

### Task 2.5: Projects (real)

**Files:**
- Modify: `src/data/projects.json`

**Candidates (orchestrator decides which 6–8 make the cut):** StudyIE, Cuigg, Ralph system, macOS portfolio, Echofold, Harris-Johnsen, operating-system-claude-code, giveago-multiagent.

Each: `{id, name, tagline, description, role, stack[], year, url, github, image, featured}`.

**Subagent:** `general-purpose`. Must read actual project READMEs from `~/personal_projects/<project>/README.md` before writing descriptions — no guessing.

**Commit:** `feat(content): projects from real repos`.

---

## Phase 3 — Canvas home page overhaul

### Task 3.1: Paper-canvas background + global layout chrome

**Files:**
- Create: `src/components/Canvas/Canvas.jsx`
- Create: `src/components/Canvas/Canvas.module.css`
- Modify: `src/pages/HomePage.jsx`

**Subagent prompt skeleton:**
> "Build a `<Canvas>` wrapper that renders a warm paper background using `var(--color-canvas)` with a subtle grid using `var(--color-canvas-grid)` via SVG data-URI (2px dots, 40px spacing, 4% opacity). Paper grain via a `radial-gradient` overlay. Provide a `<CanvasRegion>` child that snaps children onto the grid. Use only these CSS vars: [INLINE Phase 1 palette + spacing]. No hardcoded colors or pixels other than the grid spec."

**Draft QA:** contrast ≥ 7:1 for text-on-canvas.

**Commit:** `feat(home): paper-canvas background and layout chrome`.

### Task 3.2: Hero — handwritten + pinned name card

**Files:**
- Rewrite: `src/sections/Hero/Hero.jsx`
- Rewrite: `src/sections/Hero/HeroStyles.module.css`

**Design:**
- Large Caveat handwritten "Hey, I'm" → Clash Display "Andriy Babiy" — tilted 2°
- Pinned-to-canvas polaroid effect with tape strip and soft shadow
- Subtitle: tagline from profile.json in Satoshi
- CTAs: "View my work" (ochre accent) + "macOS mode →" (subtle ink-link)
- Motion: on mount, tape strip draws on; on hover, card nudges 1° (reduced-motion: static)

**Subagent:** `general-purpose`. Inline tokens + profile.json tagline value.

**Commit:** `feat(home): canvas hero with pinned name card`.

### Task 3.3: About — story card with ink-sketch portrait

**Files:**
- Create: `src/sections/About/About.jsx`
- Create: `src/sections/About/About.module.css`

**Design:**
- 2-col: ink-line portrait (generated in Phase 4) + 4-paragraph bio
- Caveat margin notes pulled from `profile.bio_long`
- Decorative paperclip SVG top-right

**Commit:** `feat(home): about section with story card`.

### Task 3.4: Experience — scroll-driven timeline

**Files:**
- Create: `src/sections/Experience/Experience.jsx`
- Create: `src/sections/Experience/Experience.module.css`

**Design:**
- Vertical dashed ink line through canvas
- Each role = taped "index card" on alternating sides
- Metrics (4× retention, 200% engagement, 400% user growth) rendered as highlighted marker-pen strokes
- Framer Motion: `whileInView` fade-up staggered (reduced-motion: instant)

**Subagent:** `general-purpose`. Read `src/data/experience.json` for content.

**Commit:** `feat(home): experience timeline with highlighted metrics`.

### Task 3.5: Projects — collage gallery

**Files:**
- Rewrite: `src/sections/Projects/Projects.jsx`
- Rewrite: `src/sections/Projects/ProjectsStyles.module.css`

**Design:**
- Masonry (CSS columns) — 1/2/3 cols at 375/768/1024
- Each card: polaroid with project screenshot, title, tagline, stack chips, hover-reveal GitHub + live links
- Random rotation (-3° to +3°) seeded by project.id for stability
- Featured projects get a "gold-star" sticker (from Phase 4)

**Subagent:** `general-purpose`. Inline projects.json.

**Commit:** `feat(home): projects collage gallery`.

### Task 3.6: Skills — chip cloud with weight

**Files:**
- Create: `src/sections/Skills/Skills.jsx`
- Create: `src/sections/Skills/Skills.module.css`

**Design:**
- Grouped chips; proficiency reflected as chip size (clamp between 0.9 and 1.4 rem)
- Hand-drawn underline under group headings
- Hover: chip rotates 1°, cursor-reactive

**Commit:** `feat(home): skills chip cloud`.

### Task 3.7: Certifications + Education row

**Files:**
- Create: `src/sections/Credentials/Credentials.jsx`
- Create: `src/sections/Credentials/Credentials.module.css`

**Design:** horizontal ribbon of index cards. Each: year · credential · issuer. Trinity card gets "First Class Honours" ribbon.

**Commit:** `feat(home): credentials row`.

### Task 3.8: Contact + footer

**Files:**
- Rewrite: `src/sections/Footer/Footer.jsx`
- Rewrite: `src/sections/Footer/FooterStyles.module.css`

**Design:** "Let's build something" handwritten heading + mailto + LinkedIn + GitHub + "go to macOS mode" as a pinned desktop-shortcut sticker that routes to `/desktop`.

**Commit:** `feat(home): contact section and macOS mode entry point`.

### Task 3.9: Wire sections into HomePage

**Files:**
- Modify: `src/pages/HomePage.jsx`

**Step 1:** Import Canvas wrapper + all sections in order: Hero, About, Experience, Projects, Skills, Credentials, Footer.

**Step 2:** Run `npm run dev`, open http://localhost:5173, scroll through, spot-check each section renders.

**Step 3:** Commit `feat(home): assemble canvas home page`.

---

## Phase 4 — Layer 4: canvas assets (nanobanana-or default)

### Task 4.1: Generate hero + section illustrations

**Files:**
- Create: `public/uploads/canvas/hero-portrait.webp`
- Create: `public/uploads/canvas/about-ink-sketch.webp`
- Create: `public/uploads/canvas/sticker-gold-star.svg`
- Create: `public/uploads/canvas/sticker-paperclip.svg`
- Create: `public/uploads/canvas/tape-strip-*.png` (3 variations)
- Create: `ui-history/2026-04-24-layer4-canvas-assets.md`

**Orchestrator runs directly.** Tool: `mcp__nanobanana-or__generate_image` for photographic/illustrative; `mcp__nanobanana-or__generate_icon` for stickers.

**Prompt template (inline tokens):**
> "Hand-drawn ink-line portrait, minimalist, monochrome `#1A1A1A` strokes on `#FAFAFA` canvas background. Sketchbook aesthetic, loose confident lines, no shading. Subject: male professional, late-20s, short dark hair, subtle smile, looking slightly off-camera. Style: like Quentin Blake meets Shruti Kuber portfolio aesthetic. 1:1, 1024x1024, webp output."

**Fallback:** if OpenRouter returns 429/5xx, switch to `mcp__nanobanana__generate_image` and note the switch in `ui-history/`.

**Draft QA:** alt text present for every `<img>` referencing these files (enforce in subagent that wires them in).

**Commit:** `feat(assets): canvas hero + section illustrations from nanobanana-or`.

---

## Phase 5 — macOS kit foundation

> **Research note:** the Apple Human Interface Guidelines + SF Symbols 6 are the spec reference. We embed *Apple-provided* SF Pro Display/Text/Mono (free for UI work per Apple's license, requires attribution — add to footer of `/desktop`). Traffic-light geometry: 12px diameter, 8px horizontal gap, 20px from top-left. Window corner radius: 10px. Frosted glass: `backdrop-filter: blur(30px) saturate(180%)` with `rgba(246,246,246,0.72)` base.

### Task 5.1: macOS tokens

**Files:**
- Create: `src/macos-kit/tokens.css`

**Include:**
```css
:root {
  /* macOS system colors (light mode Sonoma) */
  --mac-bg-window: rgba(246,246,246,0.72);
  --mac-bg-sidebar: rgba(229,229,229,0.60);
  --mac-bg-toolbar: rgba(246,246,246,0.85);
  --mac-bg-desktop: #1d1d1f;  /* fallback behind wallpaper */
  --mac-text-primary: #1d1d1f;
  --mac-text-secondary: rgba(60,60,67,0.60);
  --mac-separator: rgba(60,60,67,0.12);
  --mac-accent: #0a84ff;            /* system blue */
  --mac-selection: rgba(10,132,255,0.18);

  /* Traffic lights */
  --mac-tl-red: #ff5f57;
  --mac-tl-red-hover: #ff4136;
  --mac-tl-yellow: #febc2e;
  --mac-tl-green: #28c840;
  --mac-tl-inactive: #cecece;
  --mac-tl-size: 12px;
  --mac-tl-gap: 8px;

  /* Chrome */
  --mac-window-radius: 10px;
  --mac-window-shadow: 0 22px 70px rgba(0,0,0,0.22), 0 0 0 0.5px rgba(0,0,0,0.2);
  --mac-glass: blur(30px) saturate(180%);
  --mac-menubar-height: 24px;
  --mac-dock-height: 72px;

  /* SF Pro */
  --mac-font-system: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', sans-serif;
  --mac-font-mono: 'SF Mono', ui-monospace, monospace;
}
[data-theme='dark'] { /* matching dark palette */ }
```

**Commit:** `feat(macos-kit): system tokens`.

### Task 5.2: Primitives

**Files (each with `.jsx` + `.module.css`):**
- `src/macos-kit/primitives/TrafficLights.jsx`
- `src/macos-kit/primitives/MenuBar.jsx`
- `src/macos-kit/primitives/Dock.jsx` (with magnification via `useMouseDistance` hook)
- `src/macos-kit/primitives/Window.jsx` (replaces current `src/desktop/components/Window.jsx`)
- `src/macos-kit/primitives/Sheet.jsx` (modal sheet)
- `src/macos-kit/primitives/Finder.jsx` (sidebar + content)
- `src/macos-kit/primitives/Wallpaper.jsx`
- `src/macos-kit/primitives/ContextMenu.jsx`
- `src/macos-kit/index.js` (barrel)

**Dispatch one subagent per primitive** (use `Agent` tool in parallel — no shared state). Each subagent gets:
- The full `src/macos-kit/tokens.css` content inlined in prompt
- Apple HIG reference excerpt for that primitive (paste the relevant spec)
- Forbid importing anything from outside `src/macos-kit/`

**Draft QA per primitive:**
- Traffic-light: render test → 12px diameter, 8px gap, exact colors
- Window: 10px radius, correct shadow, backdrop-filter present
- Dock: magnification curve peaks at 1.6× at cursor, smooth falloff

**Commit per primitive.**

### Task 5.3: Wire SF Pro

**Files:**
- Create: `public/fonts/SFPro-*.woff2` (Display + Text + Mono)
- Modify: `src/macos-kit/tokens.css` (add `@font-face`)

**Licensing note:** add to `ui-history/2026-04-24-macos-kit.md`: Apple SF Pro license, required attribution text, placement in `/desktop` About menu.

**Commit:** `chore(fonts): embed SF Pro for macOS kit`.

---

## Phase 6 — macOS `/desktop` rebuild

### Task 6.1: Wallpaper + MenuBar shell

**Files:**
- Rewrite: `src/desktop/Desktop.jsx` (import from `src/macos-kit/`)
- Rewrite: `src/desktop/Desktop.css` → keep only layout concerns; primitives own their styles

**MenuBar contents:**
-  (Apple) → dropdown: About This Portfolio / Source / Log out (→ `/`)
- "Finder" active-app label
- Right side: battery icon, wifi, control center, spotlight, clock (live), user

**Subagent:** `general-purpose`. Must not duplicate primitive styles.

**Commit:** `feat(desktop): menu bar and wallpaper shell`.

### Task 6.2: Dock with real magnification

**Files:**
- Modify: `src/desktop/Desktop.jsx`

**Subagent prompt:**
> "Replace the current Sidebar with `<Dock>` from `src/macos-kit/primitives/Dock.jsx`. Pass `apps` prop from `desktopConfig.apps`. Position: bottom-centered, 16px from bottom, max-width 90vw. Magnification range: 48px base → 76px peak. Add Launchpad icon (9-grid) as first item."

**Commit:** `feat(desktop): dock with magnification`.

### Task 6.3: Rebuild Windows + apps

**Files (one subagent each, parallel):**
- `src/desktop/apps/AboutApp.jsx` (was `src/desktop/components/AboutApp.jsx`)
- `src/desktop/apps/ProjectsApp.jsx`
- `src/desktop/apps/ContactApp.jsx`
- `src/desktop/apps/PDFViewer.jsx`
- `src/desktop/apps/VideoPlayer.jsx`

Each app now wraps content in `<Window from="macos-kit" />` and uses only macOS-kit primitives + `--mac-*` tokens. No more `PlaceholderApp` (delete — YAGNI).

**AboutApp redesign:**
- Finder-style sidebar: Bio / Experience / Education / Contact
- Main pane: SF Pro body, list-detail layout matching macOS System Settings

**ProjectsApp redesign:**
- Finder column view: icon / list / gallery toggle (segmented control)
- Each project opens in new Window (PDF-style preview)

**ContactApp redesign:**
- Mail.app compose sheet look
- Opens default mailto on submit

**PDFViewer:** keep current iframe, wrap in macOS-kit Window with correct toolbar.

**VideoPlayer:** QuickTime Player chrome (centered title, translucent controls, fade on idle).

**Draft QA per app:** keyboard focus order correct, Esc closes window, ⌘W closes active window.

**Commit per app.**

### Task 6.4: Launchpad

**Files:**
- Create: `src/macos-kit/primitives/Launchpad.jsx`
- Create: `src/macos-kit/primitives/Launchpad.module.css`
- Modify: `src/desktop/Desktop.jsx`

**Design:** blurred full-screen overlay, 7×5 grid of app icons with labels, search bar at top, Esc closes.

**Commit:** `feat(desktop): launchpad overlay`.

### Task 6.5: Retire old desktop components

**Files:**
- Delete: `src/desktop/components/*` (superseded by macos-kit primitives + apps/)
- Ensure: no remaining imports

**Step 1:** `grep -r "desktop/components" src/` → expect empty.

**Step 2:** Commit `chore(desktop): remove superseded components`.

---

## Phase 7 — QA gates

### Task 7.1: Draft QA runner script

**Files:**
- Create: `scripts/qa-draft.mjs`

**Checks:**
1. `tokens.json` values all appear in `src/index.css` + `src/macos-kit/tokens.css`
2. Every `<img>` has non-empty `alt`
3. All `<button>` / clickable have min 44×44px (touch target)
4. No `<div onClick>` without role+tabIndex
5. Palette contrast (WCAG AA via culori)

Run on every pre-commit (add to Husky later — out of scope).

**Commit:** `chore(qa): draft QA script`.

### Task 7.2: Release QA — visual + a11y

**Files:**
- Create: `scripts/qa-release.mjs`

**Checks:**
1. `playwright-cli` skill: screenshots at 375 / 768 / 1024 / 1440 for `/` and `/desktop`
2. Lighthouse (headless): a11y ≥ 95, perf ≥ 80 on both routes
3. Keyboard nav: Tab order sane on `/`, Esc/⌘W work on `/desktop`
4. `prefers-reduced-motion`: set, confirm animations disabled

**Orchestrator dispatches `playwright-cli` skill for this.**

**Output:** `ui-history/2026-04-24-release-qa.md` with pass/fail + screenshots.

If a check fails → file a blocker issue, halt deploy.

### Task 7.3: Licensing row

**Files:**
- Modify: `ui-history/2026-04-24-portfolio-overhaul.md` (summary doc)

**Record:**
- Clash Display — Fontshare OFL
- Satoshi — Fontshare OFL
- Caveat — Google Fonts OFL
- SF Pro — Apple, UI-use license, attribution required in `/desktop` About
- nanobanana-or outputs — Gemini 3.1 Flash Image, check ToS for commercial use
- portfoliobyshruti.com — **inspiration only**, no assets imported (per CLAUDE.md Layer 0 compliance)

---

## Phase 8 — Deploy & verify

### Task 8.1: Merge and deploy

**Step 1:** From worktree, open PR:
```bash
git push -u origin feat/portfolio-overhaul
gh pr create --title "Portfolio overhaul: canvas home + accurate macOS desktop" --body "See docs/plans/2026-04-24-portfolio-overhaul.md"
```

**Step 2:** Review CI run (auto-triggered by `deploy.yml` on merge to main).

**Step 3:** After merge, monitor:
```bash
gh run list --limit 3 -R AndriyBabiy/react-personal-portfolio
ssh -i ~/.ssh/studyie_vps deploy@78.47.89.101 'sudo docker logs portfolio-portfolio-1 --tail 50'
curl -I https://andriybabiy.com/
curl -I https://andriybabiy.com/desktop
```

### Task 8.2: Cloudflare cache strategy for new Layer 4 assets

**Files:**
- Modify: `nginx.conf`

Add long-lived cache headers for `/uploads/canvas/*` + `/fonts/*`:
```
location ~* \.(woff2|webp|png|svg)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}
```

And for index.html: `Cache-Control: no-cache` so Cloudflare edge always revalidates app shell.

Build-time cache-bust: Vite already appends content hashes to JS/CSS — confirm via `dist/` inspection. No extra query-string strategy needed.

**Commit:** `chore(nginx): long-lived cache for static assets`.

### Task 8.3: Post-deploy verification

Run Release QA (Task 7.2) against production (`https://andriybabiy.com` instead of localhost). If all green → close the loop. If any regression → open issue, revert container to previous GHCR tag while fixing.

---

## Orchestrator playbook (quick reference)

| Situation | Action |
|---|---|
| Starting a task | Dispatch fresh `Agent` with inlined tokens + full task spec. Never reference tokens.json by path. |
| Subagent returns with invented color/font/value | Reject, re-dispatch with the violation quoted verbatim. |
| Multiple independent tasks (e.g. 5 primitives in Task 5.2) | Dispatch in a **single message with parallel `Agent` tool calls**. |
| Between tasks | Run `feature-dev:code-reviewer` on diff, fix high-confidence issues only. |
| Draft QA fails | Re-dispatch same subagent with failure output inline. Do not commit. |
| Release QA fails | Halt. File issue. Do not proceed to deploy. |
| Deploy fails | Keep previous GHCR tag pinned on VPS. Fix on branch. |
| User asks to change scope mid-flight | Pause, update this plan file, confirm before resuming. |

---

## Out of scope (documented here so we don't drift)

- TypeScript migration (current JS; revisit post-ship)
- Tailwind introduction (canvas aesthetic is cleaner with CSS modules)
- New CMS (Sveltia contract preserved)
- Blog/MDX (future phase)
- i18n (future phase)
- Analytics (portfolio already has PostHog via Cloudflare proxy — leave as-is)
- Mobile-first "macOS" shrink: `/desktop` remains desktop-primary, auto-redirect to `/` on touch under 768px (add in Task 6.1)

---

## Execution handoff

**Plan complete and saved to `docs/plans/2026-04-24-portfolio-overhaul.md`.**

Two execution options:

1. **Subagent-Driven (this session)** — I orchestrate directly: dispatch fresh subagent per Task, review between tasks, fast iteration. Best for tight feedback loop on design calls.

2. **Parallel Session (separate)** — Open new Claude Code session in the worktree, point it at this file, use `superpowers:executing-plans`. Best if you want to pause and resume across days.

**Recommendation:** Subagent-Driven for Phases 0–2 (content + tokens — high-judgment work where you'll want to see decisions), then flip to Parallel Session for Phases 3–6 (mechanical component work that batches well).

Which approach?
