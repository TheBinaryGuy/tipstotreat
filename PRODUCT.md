# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: people searching the web for a home remedy for a common, everyday complaint (a cough, acidity, a mouth ulcer, dry skin, a child who will not eat) or for an Indian home recipe. They arrive from search on a phone, mid-problem, usually in a kitchen or bedroom, and want something they can do with what is already in the house.

Secondary: the author (the site owner's mother), who writes every remedy, tip, and recipe from her own household practice and will add and edit content through an admin panel.

## Product Purpose

TipsToTreat is a single author's collection of Indian home remedies (gharelu nuskhe), health tips, and home recipes. It exists so that the knowledge one Indian household keeps in its head is written down, findable, and shareable. Success: a visitor lands from search, finds a remedy or recipe they can act on in under a minute, trusts it enough to try it, and comes back or shares it.

## Positioning

One real person's kitchen practice, not an aggregator. Every entry is something the author has actually made or used, written the way she would tell a neighbour. Neighbouring wellness sites cannot truthfully claim a single accountable author who cooks and treats from the same shelf of ingredients.

## Operating Context

- Visitors: mobile-first, from Google, often mid-task; ingredients are ordinary Indian pantry items (turmeric, ginger, ajwain, jaggery, ghee, tulsi, curd, hing, methi).
- Author: writes long-form, structured entries (ingredients, steps, when to use, when not to) in an admin panel with a rich text editor (Tiptap). Content is authored in English only (the owner asked for no Hindi in the interface or content).
- Three content kinds: Remedies (a complaint and what to do), Tips (short health habits), Recipes (a dish with ingredients and steps). All share one entry model with a category.

## Capabilities and Constraints

- Stack (existing): TanStack Start + TanStack Router, React 19, Tailwind v4, shadcn (base-nova style, Base UI primitives), lucide icons, Cloudflare Workers via wrangler.
- Planned: Cloudflare D1 via Drizzle ORM v1, better-auth for the admin, TanStack React Query integrated with the router (mirroring the sibling project thebinary.dev), Tiptap for authoring.
- Content model: entry { slug, title, kind: remedy | tip | recipe, useFor, summary, body (rich text), ingredients[], steps[], tags[], caution?, prep/cook minutes?, servings?, coverImage?, publishedAt, updatedAt }.
- Home page must render real entries from the database once it exists; until then it renders seeded sample entries labelled as samples in code, never in the UI as fake claims.
- Undecided: whether recipes carry prep/cook time and servings; whether remedies carry a "consult a doctor if" block (recommended for health content).

## Brand Commitments

- Name: TipsToTreat. Existing favicon and manifest assets in `public/` (heart-plus mark, indigo `#432dd7` in `src/logo.svg`); the mark may be recoloured, the name may not change.
- Voice: warm, plain, first-person from the author; no medical jargon, no hype, no miracle claims.
- Design: the owner wants minimal design (stated 2026-09-03 after seeing a bolder concept). Quiet, typographic, one accent colour, no decorative systems.
- Language: English only in the interface and content; no Hindi.
- Light and dark themes already exist (cookie-persisted) and must keep working.

## Evidence on Hand

- No real entries written yet. No photographs. No testimonials, traffic numbers, or press. Future work must not fabricate any of these; sample entries are labelled synthetic in code and replaced by the author's own content via the admin panel.

## Product Principles

- Actionable in one minute: the complaint, the ingredients, and the first step are visible before anything else.
- One author, one voice: the page sounds like a person, never like a content farm.
- Kitchen-shelf honesty: only ingredients a normal Indian kitchen has; nothing to buy.
- Safe by default: health entries say when to stop and see a doctor.
- Built for the phone in hand: fast, readable, thumb-reachable.

## Accessibility & Inclusion

- Mobile-first reading with large body type; the primary audience includes older readers and non-native English readers, so copy stays plain.
