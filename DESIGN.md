---
name: TipsToTreat
description: A friendly index of one Indian kitchen's remedies, tips, and recipes.
colors:
  paper: "oklch(1 0 0)"
  ink: "oklch(0.141 0.005 285.823)"
  indigo: "oklch(0.457 0.24 277.023)"
  indigo-text: "oklch(0.962 0.018 272.314)"
  tint: "oklch(0.967 0.001 286.375)"
  quiet-ink: "oklch(0.552 0.016 285.938)"
  hairline: "oklch(0.92 0.004 286.32)"
  focus-ring: "oklch(0.705 0.015 286.067)"
  caution: "oklch(0.577 0.245 27.325)"
  paper-dark: "oklch(0.141 0.005 285.823)"
  paper-raised-dark: "oklch(0.21 0.006 285.885)"
  ink-dark: "oklch(0.985 0 0)"
  indigo-dark: "oklch(0.398 0.195 277.366)"
  tint-dark: "oklch(0.274 0.006 286.033)"
  quiet-ink-dark: "oklch(0.705 0.015 286.067)"
  hairline-dark: "oklch(1 0 0 / 10%)"
  field-edge-dark: "oklch(1 0 0 / 15%)"
  focus-ring-dark: "oklch(0.552 0.016 285.938)"
  caution-dark: "oklch(0.704 0.191 22.216)"
typography:
  display:
    fontFamily: "Inter Variable, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  display-wide:
    fontFamily: "Inter Variable, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.11
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Inter Variable, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.33
    letterSpacing: "-0.025em"
  headline-quiet:
    fontFamily: "Inter Variable, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.33
    letterSpacing: "normal"
  card-title:
    fontFamily: "Inter Variable, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Inter Variable, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 500
    lineHeight: 1.56
    letterSpacing: "-0.025em"
  lede:
    fontFamily: "Inter Variable, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.56
    letterSpacing: "normal"
  body:
    fontFamily: "Inter Variable, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
    fontFeature: "'ss01'"
  label:
    fontFamily: "Inter Variable, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: "normal"
  label-strong:
    fontFamily: "Inter Variable, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.43
    letterSpacing: "normal"
  caption:
    fontFamily: "Inter Variable, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.33
    letterSpacing: "normal"
  mono:
    fontFamily: "ui-monospace, monospace"
    fontSize: "0.9em"
    fontWeight: 400
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  2xl: "18px"
  4xl: "26px"
  full: "9999px"
spacing:
  "1.5": "6px"
  "2": "8px"
  "2.5": "10px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
  "12": "48px"
  "14": "56px"
  "24": "96px"
components:
  button-primary:
    backgroundColor: "{colors.indigo}"
    textColor: "{colors.indigo-text}"
    typography: "{typography.label-strong}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-primary-hover:
    backgroundColor: "color-mix(in oklab, {colors.indigo} 80%, transparent)"
  button-primary-lg:
    backgroundColor: "{colors.indigo}"
    textColor: "{colors.indigo-text}"
    typography: "{typography.label-strong}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "36px"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label-strong}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-outline-hover:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.ink}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label-strong}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-ghost-hover:
    backgroundColor: "{colors.tint}"
  button-destructive:
    backgroundColor: "color-mix(in oklab, {colors.caution} 10%, transparent)"
    textColor: "{colors.caution}"
    typography: "{typography.label-strong}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "28px"
  button-destructive-hover:
    backgroundColor: "color-mix(in oklab, {colors.caution} 20%, transparent)"
  badge-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.4xl}"
    padding: "2px 8px"
    height: "20px"
  badge-outline-hover:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.quiet-ink}"
  badge-secondary:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.4xl}"
    padding: "2px 8px"
    height: "20px"
  badge-primary:
    backgroundColor: "{colors.indigo}"
    textColor: "{colors.indigo-text}"
    typography: "{typography.caption}"
    rounded: "{rounded.4xl}"
    padding: "2px 8px"
    height: "20px"
  input-field:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "4px 10px"
    height: "32px"
  input-search:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "0 12px 0 32px"
    height: "36px"
  icon-button:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.quiet-ink}"
    rounded: "{rounded.lg}"
    size: "36px"
  icon-button-hover:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.ink}"
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "12px"
  alert-caution:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.caution}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "8px 10px"
  entry-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "16px 12px"
  entry-row-hover:
    backgroundColor: "color-mix(in oklab, {colors.tint} 60%, transparent)"
  featured-card:
    backgroundColor: "color-mix(in oklab, {colors.indigo} 5%, transparent)"
    textColor: "{colors.ink}"
    rounded: "{rounded.2xl}"
    padding: "20px"
  featured-card-hover:
    backgroundColor: "color-mix(in oklab, {colors.indigo} 10%, transparent)"
  kind-mark:
    backgroundColor: "color-mix(in oklab, {colors.indigo} 10%, transparent)"
    textColor: "{colors.indigo}"
    rounded: "{rounded.lg}"
    size: "36px"
  step-number:
    backgroundColor: "color-mix(in oklab, {colors.indigo} 10%, transparent)"
    textColor: "{colors.indigo}"
    typography: "{typography.label-strong}"
    rounded: "{rounded.full}"
    size: "28px"
---

# Design System: TipsToTreat

## Overview

**Creative North Star: "The Friendly Index"**

TipsToTreat is a well-set list of entries with a little warmth let back in. A visitor arrives from search, on a phone, mid-complaint or mid-cooking; the page gives them a three-line headline that says what this is, a muted paragraph that says who writes it, three outline buttons with counts, and then the entries themselves, one under another, separated by hairlines. The warmth is small and consistent: a pale indigo card for the newest entry, a leaf, a bulb, and a cooking pot in indigo-tinted squares marking the three kinds, ingredient names as outline chips under every title, and numbered circles on the method. Nothing else is decorated.

The material is shadcn's zinc paper: pure white in light mode, near-black in dark, with one chromatic colour, the mark's indigo. Indigo is almost never a solid fill; it is a 5% or 10% tint behind an icon, a number, or the featured card, and a text colour on the mark, the "Newest remedy" line, and the "Published" word. Solid indigo appears on exactly two things: the primary button and the Published badge in the admin. Inter Variable carries every role at 16px body; headings are semibold with tight tracking, and the second voice on every page is quiet ink at 14px.

The admin is the same site, not a separate shell. It lives under `/admin` inside the public header, adds one slim sub-nav line, and builds every form from the same shadcn primitives (Field, Input, Textarea, NativeSelect, Button, Card, Alert, Table, Badge) at 10px radius. A visitor and the author see one design.

**Key Characteristics:**
- Paper ground, hairline structure, one 56rem column with a 20px gutter on every page, public and admin.
- Inter Variable for every role with `ss01` on; page titles semibold and tight, body 16px/1.5, second voice 14px in quiet ink.
- Indigo as tint and signal: 5–10% washes behind icons, numbers, and the featured card; solid only on the primary button and the Published badge.
- Three kind icons (Leaf, Lightbulb, CookingPot) in 36px indigo-tinted rounded squares are the only pictorial element.
- Ingredients as 20px outline chips wherever an entry is listed; tags as the same chip.
- 10px base radius on every control; enclosures step up to 14px (cards, row hover) and 18px (featured card).
- Flat: no drop shadows; depth is a hairline, a 1px ring, or a tint. Motion is a 150ms colour transition and a 1px press.
- Sentence case everywhere; no uppercase, no tracked-out labels.

## Colors

Shadcn's zinc neutrals with a single indigo accent, defined as OKLCH custom properties on `:root` and `.dark` in `src/styles.css`; hierarchy is ink versus quiet ink, and indigo is spent as tint far more often than as fill.

### Primary
- **Indigo** ({colors.indigo}; dark {colors.indigo-dark}): the heart-plus mark, the kind icons, step numbers, the "Newest remedy" line, the "Published" state word in the editor, prose links, and text selection. As a solid fill it appears only on the primary button (Publish / Save changes / Sign in / New entry) and the Published badge in the admin table. At 5% it washes the featured card; at 10% it sits behind kind icons and step numbers and lifts the featured card on hover. The static favicon and manifest assets in `public/` carry the mark's original hex (`#432dd7`), a near match; the in-page mark draws in `currentColor`.
- **Indigo Text** ({colors.indigo-text}): text on a solid indigo fill; both themes share it.

### Neutral
- **Paper** ({colors.paper}; dark {colors.paper-dark}): the page, header, footer, the search field, the theme toggle, cards, and alerts. In dark mode cards and popovers lift to **Paper Raised** ({colors.paper-raised-dark}) so a Card reads as a surface against the near-black page; in light mode a card is paper inside a ring.
- **Ink** ({colors.ink}; dark {colors.ink-dark}): headlines, row titles, body copy, the brand name, chip text, the active nav item, and the hover state of every muted link.
- **Quiet Ink** ({colors.quiet-ink}; dark {colors.quiet-ink-dark}): the second voice. Ledes, "For dry cough, scratchy throat" context lines, section blurbs, dates, nav items at rest, placeholders, ingredient quantities, field descriptions, the footer, and the alert body. Roughly half of the words on any page.
- **Tint** ({colors.tint}; dark {colors.tint-dark}): the only grey fill. Row hover at 60%, table-row hover and the editor toolbar at 50%, outline and ghost button hover, the secondary badge (counts, Draft), the active filter chip, and inline code. Shadcn's `secondary`, `muted`, and `accent` all resolve to it.
- **Hairline** ({colors.hairline}; dark {colors.hairline-dark}): every divider and every control border: header and footer rules, section tops, list separators, table rows, outline chips, inputs, the search field, the toggle, alerts, the ingredient box, the auth panel. In dark mode it is white at 10%; inputs and selects use **Field Edge Dark** ({colors.field-edge-dark}) at 15% with a 30% tint fill so a field reads as a field.
- **Focus Ring** ({colors.focus-ring}; dark {colors.focus-ring-dark}): a mid-grey used only for the 3px focus halo at 50% and the focused border on inputs, buttons, and the search field. Focus is grey, not indigo.
- **Caution** ({colors.caution}; dark {colors.caution-dark}): the "When to see a doctor" alert (icon, title, and body at 90%), form and sign-in errors, invalid field borders, and the Delete entry button (text on a 10% wash). Never a solid fill.

### Named Rules
**The Tinted Indigo Rule.** Indigo is spent as a 5–10% wash behind an icon, a number, or the featured card, or as text and stroke colour. It becomes a solid fill only on the one primary button per view and the Published badge. Headlines, nav, row titles, and hover states are never indigo; hover moves quiet ink to ink and adds an underline.

**The Hairline Structure Rule.** Boundaries are 1px hairlines: dividers, control borders, chip borders, card rings. The tint is a state (hover, active, draft), never a resting surface for content. The featured card is the one tinted resting surface, and it is indigo at 5%, not grey.

## Typography

**Display Font:** Inter Variable (with sans-serif), loaded from `@fontsource-variable/inter`
**Body Font:** Inter Variable (same stack)
**Label/Mono Font:** ui-monospace, monospace (the slug field in the editor and inline code in prose)

**Character:** One face at three weights. Page titles are 600 with -0.025em tracking, balanced (`text-wrap: balance`); row titles are 500 with the same tracking; running text is 400 at 16px/1.5 with `ss01` on (single-storey a), pretty-wrapped. The hierarchy is weight and the ink/quiet-ink split, not size alone.

### Hierarchy
- **Display** (600, 1.875rem, 1.2, -0.025em): every public h1. On the home page and the entry page it grows to **Display Wide** (2.25rem, 1.11) from the `sm` breakpoint (640px); section and search pages stay at 1.875rem.
- **Headline** (600, 1.5rem, 1.33, -0.025em): home-page section titles (Remedies / Tips / Recipes) beside their kind mark, and the admin index h1 ("Entries"). Admin sign-in and setup h1s use the same size and weight.
- **Headline Quiet** (400, 1.5rem, 1.33): article sub-headings inside an entry ("Method", "More remedies"). Regular weight so an entry has one bold line, its title.
- **Card Title** (600, 1.25rem, 1.4, -0.025em): the featured card's entry title; underlines on hover.
- **Title** (500, 1.125rem, 1.56, -0.025em): the entry title in a list row. Medium, not semibold; underlines with a 4px offset on row hover. Related-entry titles and admin table titles are the same 500 at 16px.
- **Lede** (400, 1.125rem, 1.56): the muted paragraph under the home headline (capped at `max-w-xl`, 36rem) and the entry summary under an entry title (capped at `max-w-prose`, 65ch). The editor's Title input is also 1.125rem at 500.
- **Body** (400, 1rem, 1.5): row summaries (65ch cap), method steps, ingredient names, rich text (`.prose-quiet`, 66ch cap, 1em paragraph gap). In prose, h2 drops to 1.25rem and h3 to 1.1rem, both 600, with 1.8em above, so an author's headings sit below the page's own.
- **Label** (400, 0.875rem, 1.43): nav items, context lines, section blurbs, dates, "All remedies →", field descriptions, the admin sub-nav, table cells, the footer, and alert bodies. Sentence case, mostly quiet ink.
- **Label Strong** (500, 0.875rem): button text, field labels (`leading-none`), table headers, the "Newest remedy" line, the active admin sub-nav item, and step numbers (600 at this size).
- **Caption** (500, 0.75rem): every badge (ingredient chips, tags, counts, status). The featured card's date is 400 at this size.
- **Mono** (0.9em, ui-monospace): the Address (slug) input and inline code in rich text (tinted, 6px radius).

### Named Rules
**The Sentence Case Rule.** No text is uppercased and no letter-spacing is opened. Small text is set smaller and greyer, never tracked out.

**The One Bold Line Rule.** A page or an entry has one 600 line, its title (plus home-page section titles, which head separate lists). Row titles are 500; article sub-headings are 400; everything below is Label.

## Layout

A single centred column. Every page, public and admin, shares one 56rem (896px) container with a 20px gutter (`max-w-4xl px-5`); the sign-in and setup forms sit in 24rem (384px) inside it. Text measures stay short inside the column: the home intro at 36rem, ledes and summaries at 65ch, prose at 66ch. Hairlines span the full column.

The header is a hairline-bottomed strip with 16px vertical padding, flex-wrapped: mark and name, then the section links (plus "Author" when signed in) at Label 16px apart, then the search field pushed right (`ml-auto`, 14rem wide), then the theme toggle. Below `sm` (640px) the search field wraps to a full-width second line and the toggle leaves the header for the footer. Nothing collapses into a menu.

Home: the hero is a two-column grid from `md` (768px), fluid intro on the left and a 20rem (320px) featured card on the right, 32px apart, 48px above and 40px below; below `md` the card stacks under the kind buttons. Each kind section opens with a hairline and 40px of padding: a 36px kind mark, the Headline and a one-line blurb, an "All remedies →" link on the right, then a 16px gap and hairline-divided rows.

Rows: 16px vertical padding, bleeding 12px into the gutter (`-mx-3 px-3`) so the 14px-radius hover tint clears the text while hairlines stay aligned to the column. Inside a row: title, a 2px gap, context line, a 6px gap, summary, a 10px gap, chips 6px apart. On the search page rows carry their kind mark on the left with a 16px gap.

Entry page: 48px below the header; back link, then the title with its kind mark (hidden below `sm`), context line, lede, date. From `md` the body splits into a fluid main column and a 16rem (256px) ingredients aside on the right, 40px apart, the aside sticky 24px from the top. Below `md` the aside stacks first, so a cook sees ingredients before method. Method, notes, and caution are 40px apart; tags sit 48px below; related entries open with a hairline 56px below.

Section and search pages start 56px below the header. The footer sits 96px below the last content with 32px internal padding.

Admin: 24px below the header, a hairline-bottomed sub-nav (Entries · + New entry · name · Sign out) with 12px padding, then 24px of space. The editor is a two-column form from `lg` (1024px): fluid fields, an 18rem (288px) sticky action column on the right, 40px apart. Fields stack 20px apart (`FieldGroup`), label-to-control 8px; Kind and Title share an 11rem/1fr row from `sm`. The index table hides Kind below `sm` and Updated below `md`.

Spacing scale as used: 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 96px. Breakpoints are Tailwind's `sm` 640px, `md` 768px, `lg` 1024px.

## Elevation & Depth

Flat. There are no drop shadows on any built surface: sticky asides, cards, the search field, the toggle, the toolbar, and the featured card all sit flush. Depth is conveyed by three devices: a 1px hairline (dividers and control borders), a 1px ring at 10% ink (the shadcn Card, so it reads as a surface without a shadow), and a tint (indigo at 5–10% for the featured card, kind marks, and step numbers; grey at 50–60% for hover). In dark mode cards additionally lift one step to Paper Raised. Focus is a 3px halo of the grey focus ring at 50% plus a focused border, on every control.

### Shadow Vocabulary
- **Card ring** (`box-shadow: 0 0 0 1px color-mix(in oklab, var(--foreground) 10%, transparent)`): the only resting "shadow", a hairline drawn as a ring on Cards (ingredients aside, editor action panel).
- **Focus halo** (`box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)`): buttons, inputs, selects, textareas, chips-as-links, on `:focus-visible` only.

### Named Rules
**The Flat Paper Rule.** Surfaces are flat at rest. A card is paper inside a hairline ring; an input is transparent inside a hairline; a hovered row is paper with 60% tint behind it. No element casts a shadow, and nothing gains one on hover.

## Shapes

Softly rounded controls on a square page. Content blocks (sections, rows at rest, tables, the header and footer) have no radius; only controls and enclosures are rounded. The base radius is 0.625rem (10px, `--radius`), and the scale steps from it: **6px** (`sm`) on inline code and the editor's small radii; **8px** (`md`) on the body editor and related-entry hover; **10px** (`lg`) on every button, input, textarea, select, the search field, the theme toggle, alerts, kind marks, and the ingredient box; **14px** (`xl`) on Cards, the auth panel, entry-row hover, and the larger section-page kind mark (44px); **18px** (`2xl`) on the featured card alone. Badges are 20px tall with a 26px radius, so they read as pills; step numbers are true circles. Borders are 1px, solid, hairline grey; the Card uses a ring instead of a border.

Icons are lucide at 1.5–2 stroke: 16px in buttons and inputs, 14px inline with Label text (arrows, pencil, plus in the sub-nav, toolbar glyphs), 18px inside a 36px kind mark, 20px inside the 44px section-page mark. The heart-plus mark is a 24-unit stroked icon at 2.25 stroke width with round caps and joins, drawn in `currentColor`, shown at 20px in the header in indigo.

## Components

### Entry Row
The signature list item: title, context line, summary, and the first four ingredients as chips, in a hairline-divided list. Character: a notebook line with its shopping list.
- **Shape:** the whole row is a block link, bleeding 12px into the gutter, 16px vertical padding, 14px radius (visible only on hover).
- **Type:** Title (500, 1.125rem, tight); context line at Label in quiet ink; summary at Body capped at 65ch; up to four outline chips 6px apart, with a ghost "+2" chip for the remainder.
- **Hover:** background becomes tint at 60% and the title underlines (4px offset); 150ms colour transition. No movement.
- **Variants:** the search page shows the kind mark on the left (`showKind`). Related entries on an entry page are a lighter row: 12px padding, 8px radius, 500 title at 16px, one clamped summary line at Label; no chips.

### Featured Card
The home page's one tinted surface: the newest entry, on the right of the hero from `md`.
- **Shape:** 18px radius, hairline border, 20px padding, indigo at 5%; hover lifts to 10%.
- **Content:** a "Newest remedy" line at Label Strong in indigo with a 16px sparkles icon; the Card Title (600, 1.25rem), underlined on hover; the context line at Label in quiet ink; up to five outline chips on paper; the date at 12px in quiet ink. The whole card is the link.

### Kind Mark
A 36px indigo-tinted rounded square (10px radius) holding an 18px lucide icon in indigo: Leaf for remedies, Lightbulb for tips, CookingPot for recipes. Appears beside home-page section titles, beside the entry title (hidden below `sm`), in search rows, and at 44px with a 14px radius and 20px icon beside a section-page h1. It is decorative (`aria-hidden`); the kind is always also named in words.

### Chips (shadcn Badge)
- **Style:** 20px tall, 26px radius (a pill), 8px horizontal padding, Caption at 500, no wrapping.
- **Outline:** hairline border, ink text; ingredient names in rows and the featured card (on paper there), and tags on an entry page. As a link (tags) it hovers to tint with quiet-ink text.
- **Secondary:** tint fill, ink text; the count inside each home-page kind button and the Draft status in the admin table.
- **Primary:** solid indigo, indigo text; the Published status in the admin table only.
- **Ghost:** no border; the "+N" overflow count after four chips.

### Buttons (shadcn base-nova)
- **Shape:** 10px radius, Label Strong, 32px tall at 10px horizontal padding by default; `lg` is 36px; `sm` is 28px at 0.8rem; icon buttons are 32px square, `icon-sm` 28px.
- **Primary:** indigo fill, indigo text; hover to 80% indigo. One per view: "New entry" in the admin index, "Publish" / "Save changes" (lg, full width of the action card), "Sign in" / "Create account" (lg, full width).
- **Outline:** paper with a hairline border, ink text; hover to tint. The three kind buttons on the home page (with a secondary count badge), "Add ingredient" (sm), "Save as draft" / "Unpublish, keep as draft" (lg). In dark mode it takes the field-edge border on a 30% tint.
- **Ghost:** no border, hover to tint; "Sign out" (sm), the ingredient trash icon, toolbar buttons (`icon-sm`, active state inverts to ink fill with paper glyph), and inactive filter chips (sm) in the admin index, where the active chip is `secondary` (tint fill).
- **Destructive:** caution text on a 10% caution wash, hover to 20%; "Delete entry" (sm, full width), guarded by a confirm.
- **States:** focus is the grey 3px halo plus focused border; active nudges the button down 1px; disabled is 50% opacity with pointer events off. The theme toggle (a plain button, not the primitive) shows a wait cursor at 60% opacity while the cookie writes.

### Cards / Containers (shadcn Card)
- **Corner Style:** 14px radius.
- **Background:** paper (Paper Raised in dark).
- **Shadow Strategy:** a 1px ring at 10% ink; no shadow (see Elevation & Depth).
- **Border:** none beyond the ring.
- **Internal Padding:** 12px (`size="sm"`) on both uses: the Ingredients aside on an entry (CardTitle at 1.125rem) and the editor's action card (status line, alerts, buttons 8px apart). The auth panel is a plain `rounded-xl border p-5` box, not a Card.

### Alerts (shadcn Alert)
- **Style:** 10px radius, hairline border on paper, 10px × 8px padding, Label text, icon in a left column with an 8px gap.
- **Destructive:** caution text; description at 90% caution. Used for "When to see a doctor" on an entry (with a triangle icon and a title) and for form and sign-in errors (description only).

### Inputs / Fields (shadcn Field, Input, Textarea, NativeSelect)
- **Style:** transparent fill inside a hairline border (30% tint fill in dark), 10px radius, 32px tall, 10px horizontal padding, 16px text on touch and 14px from `md`; placeholder in quiet ink. The Title input is 40px tall at 1.125rem / 500; the Address input is mono. Textarea has a 64px minimum and grows with content. NativeSelect hides the native arrow and draws a 16px chevron in quiet ink at the right.
- **Focus:** border to focus-ring grey plus the 3px halo at 50%.
- **Error / Disabled:** invalid fields take a caution border and a caution halo at 20%; the error message is Label in caution below the description. Disabled is 50% opacity on a 50% field fill.
- **Field wrapper:** Label Strong label (`leading-none`) above, 8px gap, control, then a Label description in quiet ink; fields are 20px apart.
- **Ingredient list:** a hairline-bordered, hairline-divided box at 10px radius; each row is name / quantity / trash on a 1fr / 8rem / 2.25rem grid with 8px padding and gaps.
- **Body editor:** hairline border at 8px radius, focus-within to the ring grey; a 50% tint toolbar with a hairline below and 28px ghost icon buttons 2px apart; content is `.prose-quiet` with 16px × 12px padding and a 256px minimum height.

### Search field
36px tall, 10px radius, hairline border on paper, Label size, 32px left padding for a 16px search glyph in quiet ink; focus swaps the border to the ring grey with no outline. 14rem wide from `sm`, full width below it.

### Navigation
- **Public header:** hairline bottom, 16px padding. Mark (20px, indigo) and name (600, tight) as one link; section links at Label in quiet ink, ink when active or hovered, 16px apart; "Author" joins them when signed in; the search field; the theme toggle (36px square, 10px radius, hairline border, quiet-ink glyph; hover to tint and ink). Below `sm` the search wraps full-width and the toggle moves to the footer.
- **Admin sub-nav:** a second hairline-bottomed line inside the column, Label in quiet ink: "Entries" and "+ New entry" (active is ink at 500), then the author's name pushed right and a ghost "Sign out" with a 16px icon.
- **Back link:** "← All remedies" at Label in quiet ink with a 14px arrow; hover to ink with an underline. The "Edit" pencil link for a signed-in author sits opposite it in the same style.
- **Footer:** hairline top, 96px above, 32px inside; a disclaimer in quiet ink capped at 28rem and an "Author sign in" link pushed right; the theme toggle below `sm`.

### Table (admin index)
Label text; header cells 40px tall at Label Strong; body cells 8px padding; rows divided by hairlines and hovering to 50% tint. The title cell holds a 500 link that underlines on hover with the "what it is for" line in quiet ink beneath; Status is a badge; Updated is quiet ink with tabular figures. Above it, a hairline-bounded filter line: "Kind" and "Status" groups of `sm` ghost chips with the active one as `secondary`.

### Reading Parts (entry page)
- **Step list:** an ordered list with 16px between steps; the number sits in a 28px indigo-tinted circle at Label Strong (600) with tabular figures, 16px from the step text at Body.
- **Ingredient list:** hairline-divided rows, name in ink left, quantity in quiet ink right with tabular figures, 8px vertical padding, inside the Ingredients Card.
- **Rich text (`.prose-quiet`):** 66ch cap, 1em paragraph spacing, headings at 1.25rem / 1.1rem with 1.8em above, disc and decimal lists indented 1.4em, indigo underlined links, 2px hairline blockquote edge with quiet-ink text, hairline `hr`, tinted inline code at 6px radius.

### Motion
The only transitions are Tailwind's `transition-colors` / `transition-all` (150ms, cubic-bezier(0.4, 0, 0.2, 1)) on links, rows, chips, buttons, and inputs, and a 1px downward nudge on button press. Nothing scales, fades, or slides. `tw-animate-css` is loaded but no built surface uses an animation.

## Do's and Don'ts

### Do:
- **Do** build every new list as hairline-divided Entry Rows: Title at 500, context line in quiet ink, summary at Body, up to four outline chips, 60% tint on hover with an underlined title.
- **Do** keep every page, public and admin, inside the 56rem column with a 20px gutter, and open each section with a hairline and 40px of padding.
- **Do** carry hierarchy with ink versus quiet ink and with weight; a second line under a title is Label in quiet ink.
- **Do** spend indigo as a 5–10% tint behind an icon, number, or the featured card, or as text; reserve solid indigo for one primary button per view and the Published badge.
- **Do** use the shadcn primitives in `src/components/ui` for controls (Button, Badge, Card, Alert, Field, Input, Textarea, NativeSelect, Table) rather than hand-styled equivalents; the 10px radius, focus halo, and dark-mode field treatment come with them.
- **Do** mark a kind with its lucide icon (Leaf, Lightbulb, CookingPot) in a 36px indigo-tinted square, and always name the kind in words beside it.
- **Do** write labels, nav items, buttons, and table headers in sentence case at natural tracking.
- **Do** set tabular figures on any column of numbers, quantities, or dates.
- **Do** define every colour for both themes through the `:root` / `.dark` tokens; never hard-code a colour in a component.

### Don't:
- **Don't** add drop shadows, gradients, grey tinted section backgrounds, colour bands, or imagery blocks; the ground is paper, a card is a ring, and the one tinted surface is the featured card at 5% indigo.
- **Don't** wrap list entries in cards or card grids; the row and the hairline are the container. The Card is for an aside or an action panel, not for content in a list.
- **Don't** uppercase or letter-space any text.
- **Don't** colour headings, row titles, nav items, or hover states indigo; hover goes quiet ink to ink plus an underline, and focus is grey.
- **Don't** introduce a second accent or per-kind colours for Remedies, Tips, and Recipes; the kinds share indigo and differ by icon and word.
- **Don't** animate beyond a 150ms colour transition and the 1px button press; no reveals, slides, or scale on hover.
- **Don't** set row titles at 600 or article sub-headings ("Method") above 400; the semibold weight belongs to page titles and home-page section titles.
- **Don't** use a system or display face for any role; Inter Variable carries everything except the slug field and inline code.
