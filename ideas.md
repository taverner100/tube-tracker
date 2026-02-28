# Tube Tracker — Design Ideas

## Idea 1 — "Roundel & Brutalism"

<response>
<idea>
**Design Movement:** London Transport Brutalism meets the iconic Johnston typeface era (1930s–1960s)

**Core Principles:**
- Raw, confident use of the TfL roundel motif as a structural element
- Heavy typographic hierarchy using slab serifs and all-caps labels
- Stark contrast between white backgrounds and the vivid line colours
- Functional density — every pixel serves a purpose, no decorative fluff

**Color Philosophy:**
- Background: pure off-white (#F5F2EE) — aged paper, not sterile white
- Text: near-black (#1A1A1A) — ink on paper
- Accents: each line's official TfL colour used boldly, never muted
- No gradients — flat blocks of colour only

**Layout Paradigm:**
- Left sidebar with line navigation (coloured pill tabs)
- Main content area: a dense grid of station cards, 4 columns on desktop
- Header: a bold roundel logo + progress bar spanning full width
- No centred hero — immediately functional on load

**Signature Elements:**
- Roundel motif (red ring + blue bar) used as logo and decorative divider
- Coloured left-border on each station card matching its line
- Monospaced station count badges (e.g. "12/27 visited")

**Interaction Philosophy:**
- Clicking a station card flips it with a satisfying snap (CSS flip animation)
- Checked stations get a bold strikethrough and reduced opacity
- Line tabs pulse briefly when all stations on that line are completed

**Animation:**
- Card check: 150ms scale-down + colour fill from left border
- Line completion: confetti burst in the line's colour
- Page load: cards stagger in from bottom, 30ms delay each

**Typography System:**
- Display: "Bebas Neue" — bold, condensed, all-caps for headings
- Body: "DM Mono" — monospaced for station names and counts
- Size scale: 48px title / 14px station name / 12px metadata
</idea>
<text>Brutalist London Transport aesthetic with roundel motifs, slab typography, and dense grid layout.</text>
<probability>0.08</probability>
</response>

---

## Idea 2 — "Cartographic Minimalism" (SELECTED)

<response>
<idea>
**Design Movement:** Swiss International Typographic Style meets London A-Z cartography

**Core Principles:**
- Information hierarchy inspired by wayfinding signage — clear, scannable, purposeful
- Thin rules and hairlines as structural dividers (not boxes or cards)
- Line colours used as the sole source of visual accent — everything else is neutral
- Data-forward: progress stats are prominent, not buried

**Color Philosophy:**
- Background: warm near-white (#FAFAF8) — like a printed map
- Text: deep charcoal (#1C1C1E) — legible at all sizes
- Line colours: exact TfL hex values — the only colour in the UI
- Visited stations: desaturated to 30% opacity with a checkmark overlay
- Unvisited: full colour line accent on left edge

**Layout Paradigm:**
- Full-width sticky header with overall progress arc/ring
- Left sidebar (collapsible on mobile) listing all 11 lines as coloured tabs
- Main area: vertical list per line, each station as a slim row with checkbox
- Lines collapse/expand like an accordion
- No card grid — rows feel like a printed checklist or timetable

**Signature Elements:**
- Thin coloured left-border rule on each line section header (4px, line colour)
- Circular progress indicators per line (small donut chart)
- A subtle dot-grid background texture on the header area

**Interaction Philosophy:**
- Checkbox rows: clicking anywhere on the row toggles visited state
- Smooth line-through animation on station name when checked
- Filter bar: "All / Visited / Unvisited" toggle pills

**Animation:**
- Row check: 200ms left-to-right fill of a thin underline in line colour
- Line header: progress donut animates on check
- Sidebar line tab: visited count badge increments with a pop

**Typography System:**
- Display: "Playfair Display" — editorial serif for the main title
- UI: "IBM Plex Sans" — clean, technical, excellent at small sizes
- Mono: "IBM Plex Mono" — for counts and zone numbers
- Scale: 36px title / 16px line name / 14px station name / 12px zone tag
</idea>
<text>Swiss cartographic minimalism — thin rules, line-colour accents, accordion rows, Playfair Display title.</text>
<probability>0.07</probability>
</response>

---

## Idea 3 — "Night Map / Dark Cartography"

<response>
<idea>
**Design Movement:** Dark mode cartography inspired by night-mode transit maps and Ordnance Survey aesthetics

**Core Principles:**
- Dark background simulates a night-time tube map
- Line colours glow against the dark — neon-on-dark effect
- Spatial metaphor: the app feels like looking at a lit map in a dark carriage
- Dense but legible — tight line-height, generous letter-spacing

**Color Philosophy:**
- Background: very dark navy (#0D1117) — not pure black, has depth
- Surface: slightly lighter (#161B22) for cards/panels
- Text: soft white (#E6EDF3) — not harsh pure white
- Line colours: full TfL saturation — they pop dramatically on dark bg
- Visited: muted grey with subtle glow

**Layout Paradigm:**
- Full-bleed dark header with a stylised tube map SVG as background (low opacity)
- Two-column layout: left = line list, right = station checklist
- Glowing coloured dividers between line sections
- Sticky progress bar at top showing total completion

**Signature Elements:**
- Glowing line-colour borders on section headers
- Station rows with a small coloured dot indicator (like map stations)
- Completion celebration: a brief "line glow" animation when all stations checked

**Interaction Philosophy:**
- Hover: station row gets a subtle glow in line colour
- Check: station name fades and a checkmark glows in
- Line completion: the line name gets a persistent glow border

**Animation:**
- Glow pulse on hover (box-shadow animation)
- Check: 300ms fade + glow-out of line colour
- Line complete: 500ms sweep of glow across the section header

**Typography System:**
- Display: "Space Grotesk" — geometric, slightly futuristic
- Body: "Inter" — reliable at small sizes on dark backgrounds
- Mono: "JetBrains Mono" — for counts
- Scale: 40px title / 15px line name / 13px station name
</idea>
<text>Dark cartography aesthetic — navy background, glowing TfL line colours, night-map atmosphere.</text>
<probability>0.06</probability>
</response>

---

**Selected: Idea 2 — Cartographic Minimalism**

Warm off-white background, Swiss typographic rigour, thin coloured rules, accordion line sections, Playfair Display + IBM Plex Sans typography. The line colours are the sole source of visual accent — clean, purposeful, and immediately reminiscent of a printed tube map.
