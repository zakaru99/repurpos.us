# REFRAMEdb design language

This is how redesigned pages look and behave. Read it before you redesign a page
or add a new one. The homepage, header, footer, sign-in box and ontology browser
already follow it, so use them as working examples.

**Where it lives in code**

- `src/_tokens.scss`: every colour, font, radius and timing, as CSS custom
  properties. This is the one place values are defined.
- `src/_design.scss`: short Sass names for those tokens, plus mixins for the
  shared building blocks. Import it in each component with a relative path,
  for example `@import '../../design';`.
- In component styles, use the token names (`$ink`, `$navy`, `$rule`…) and the
  mixins. Don't write hex colours, font stacks or radii inline. If you need a
  value that doesn't exist yet, add it to `_tokens.scss` with a comment saying
  what it's for.

## Character

The references are Clarivate and ChemDiv: calm, editorial and scientific. It
should look like a well-run research institute made it, not a template or an
AI generator. When in doubt, choose the plainer option.

**Do**

- Left-aligned layouts in a centred column (`@include shell`: 1200px max, 32px
  gutters, 20px on phones).
- 1px hairline rules to separate things, instead of boxes and shadows.
- A small uppercase label above section headings (`@include eyebrow`).
- Real data on the page wherever possible: live previews, actual counts,
  actual structures.
- Clearly label anything that isn't real yet. The homepage phase chart carries
  a "Placeholder figures" tag.

**Don't**

- Pills, gradients, emoji, glowing shadows, or cards with heavy drop shadows.
- Everything centred.
- Bold white buttons on navy. They read as too loud; use the quiet navy button
  instead (see Buttons).
- Boxed "download tiles" with monospace format badges and arrows. A download
  is a button that says what's in the file.
- Text that isn't backed by the site's own content. Copy is taken from the
  About pages, the proposal form, or the data itself.

## Looking hand-made, not AI-generated

This rule matters more than any other in this guide. Generated interfaces
share a recognisable look. The root cause is uniformity: one treatment applied
to everything, every element given similar weight, and components chosen
before the job is understood. Start from the job instead. Decide who uses the
page, what they must get done, and what the one most important thing on it
is; then give that thing the size and space.

**Tells to avoid**

- Rows of identical stat cards: a big number, a coloured dot and a tiny
  caption, evenly spaced in a grid. If a number matters, say it in a heading
  ("3 proposals need a decision"). If it doesn't, put it in a sentence.
- Every section in the same white card on a grey background, each with a
  header and a "Manage ›" link. Separate sections with space and a rule; box
  something only when it really is a separate object.
- Status as tinted pills with dots. Use coloured text.
- Eyebrow labels on tools and dashboards. The homepage hero may have one;
  app screens shouldn't.
- Decorative subtitles that restate the heading ("People who can manage
  users"). If a sentence carries no new information, delete it.
- Uppercase letter-spaced table headers everywhere. Use sentence case in the
  secondary text colour.
- Monospace used for texture. Use it for identifiers and code only.
- Segmented controls and badges stuffed with counts. A plain "Pending 3"
  reads fine.
- Empty half-screens ("Select an item to view it"). Give space to content
  that exists, and open the second pane only when there's something in it.
- Content capped at a narrow width while the rest of the screen sits empty,
  on pages that are tables or tools. Use the width.
- A flat hierarchy where everything is the same size. Use fewer type sizes,
  with real contrast between them.

**Test before calling it done.** Show a screenshot to someone cold. If they
would guess it came from a generator, it isn't finished. The admin portal
(`/internal`) is the reference for the plain-tool end of this spectrum.

Further reading: [Impeccable: the visible tells of AI design](https://impeccable.style/slop),
[Impeccable anti-patterns](https://www.mintlify.com/pbakaus/impeccable/concepts/anti-patterns),
[How to de-slopify your designs](https://uxdesign.cc/how-to-de-slopify-your-designs-4c40c57c1dc9).

## Colour

| Token | Use |
|---|---|
| `$navy` | Hero and footer backgrounds; the primary button on light backgrounds |
| `$navy-2` | Secondary dark band (homepage charts) |
| `$navy-quiet` | Low-emphasis buttons on navy (hero downloads) |
| `$accent` (brand blue) | Links, the active/selected state, the search button |
| `$accent-text` | Brand blue for small text on tinted bands (passes AA contrast) |
| `$accent-on-dark` | Labels, icons and links on navy |
| `$ink` / `$ink-soft` / `$ink-faint` | Primary text / secondary text / placeholders |
| `$rule` | Hairlines on pages; `$rule-soft` inside tools |
| `$muted-bg`, `$tint-bg` | Alternating page bands |
| `$moa`, `$found`, `$category` | Ontology states: holds compounds / search path / category node |

Band rhythm on long pages: navy hero → tinted band → white → dark band →
muted strip → navy footer. Don't put two dark bands next to each other.

## Type

- UI: IBM Plex Sans (`$sans`). Figures, IDs, dates and InChIKeys: IBM Plex Mono
  (`$mono`), with tabular numbers. The "reframedb" wordmark alone stays in Lato
  (`$wordmark`).
- Headings use weight 500 with slightly tight letter-spacing. The hero heading
  is 2.25–2.75rem; section headings are 2rem (`@include section-title`).
- Write in sentence case: "Open compound profile", not "Open Compound Profile".

## Shape and space

- Pages are square-ish (`$radius-sharp`, 2px). App-like tools such as the
  ontology browser use the softer `$radius-soft` (8px), segmented controls and
  rounded rows. Don't mix the two styles within one view.
- Spacing comes from the existing 4px scale in `_tokens.scss`.

## Page width (applies site wide)

Width should follow the content, not be one rule for every page. Neither
"everything in a narrow column" nor "everything edge to edge" is right on
large screens.

- **Two columns.** Content pages (homepage, About, Workflow, Contact, user
  portal) use the reading column, `--shell-max` (1200 → 1440 → 1600px as the
  screen grows). Data pages (Assays list, an assay page, search results) and the admin
  portal use `--shell-wide` (1600px). The user portal's tables and forms are
  capped at 1100px inside the reading column.
- **Things that repeat may use the width; things read as one object may not.**
  A card grid adds columns as the screen widens (cards stay ~260–300px). A
  chart, a form, a record or a header is one object: cap it so related parts
  stay close. Rule of thumb: if a label and its value end up more than about
  1000px apart, the layout is too wide.
- **Caps in use:** prose ~75ch (two text columns on wide screens rather than
  longer lines, see the assay page Background; workflow step text 75ch); dot
  plot 1200px including the compound names (`.results-layout` on the assay
  page); search inputs 560px, with their filters right beside them; short
  tables (user portal) 1100px.
- **Leftover width goes to related secondary content**, placed next to the
  thing it belongs to (e.g. the assay page's downloads beside the chart at
  ≥1500px), never to stretching the primary element.
- On large screens keep modest outer margins; they frame the page. Check
  every page at 1440 and 1920 before calling it done.

## Building blocks (mixins in `_design.scss`)

| Mixin | What it is |
|---|---|
| `full-bleed-host` | Component host that runs edge to edge inside `.container-fluid` |
| `shell` | Centred content column |
| `eyebrow($on-dark)` | Small uppercase label above a heading |
| `section-title` | Section heading |
| `arrow-link` | Text link with a chevron that nudges right on hover |
| `button-navy` | Primary action on light backgrounds |
| `button-quiet-on-dark` | Low-emphasis action on navy |
| `button-outline-on-dark` | Secondary action on navy (e.g. "Copy citation") |
| `segmented` | Grey track with a raised white active segment (ontology toolbar only; don't spread it) |
| `underline-tabs` | Text tabs with an underline on the active tab (light backgrounds) |
| `focus-ring` | Keyboard focus outline; every interactive element needs one |

## Page patterns

- **Hero**: navy, and the whole hero must fit on one screen (check 1366×650
  and 1440×820). Headline: "The world's largest open-access drug repurposing
  library". Stats sit on the right, downloads under the search.
- **Tool pages** (like the ontology browser): one slim toolbar holding the
  title, a segmented switch, search and a view toggle, with the tool filling
  the rest of the screen below. No large page header.
- **Sub-headers are always sticky**: any bar under the site header (section
  tabs, tool toolbars such as the admin band or the ontology toolbar) uses
  `@include sticky-subheader`, so it stays pinned directly beneath the site
  header while the page scrolls.
- **Navbar**: white bar with links and Sign in. No call-to-action buttons in
  the navbar; the proposal call-to-action lives on the homepage.
- **"What's new"**: a small, light floating chip that opens a slide-out
  panel. It is not a full-width row.
- **Footer**: navy, with link columns, the REFRAME citation (PNAS 2018, with a
  copy button) and white logos.
- **Admin portal** (`/internal`): continues the homepage. A thin navy band
  (hex lattice, "CALIBR Admin" in eyebrow style, white underline tabs like the
  hero search) sits above white pages in the data-page column (`--shell-wide`). Pages use
  eyebrow labels, weight-500 headings, square navy buttons and arrow links,
  with no cards. Tables scroll inside a fixed-height area with a sticky header
  (`table-scroll` mixin) rather than growing the page. The Overview is two
  halves: proposals needing a decision on the left, maintenance, latest
  submissions and admins on the right. On the Proposals page the detail pane
  opens only when a proposal is selected. Shared pieces are in
  `src/app/internal/_admin.scss`; API calls are in `admin-api.service.ts`.
  Any action that changes someone's access or a proposal's status asks for
  confirmation in place, and the interface only updates once the server
  confirms the change.
- **User portal** (`/user_portal`): the same band (`portal-shell` mixin) with
  Proposals, Favorites, Lists and Account tabs, but in the site's shell
  column. Shared page pieces are in `src/app/user-portal/_user-portal.scss`.
- **Tables** (`data-table` mixin): the header row has its own fill
  (`$table-head`) so it reads apart from the rows; a selected row is tinted
  with an accent edge on the left so it never looks like a second header.
  Prefer tables to cards for anything that is mostly text to compare.
- **Assays page** (`/assays`): cards, because each assay is read as a unit.
  A stage-tinted top strip (ID and stage), then indication, title and
  summary, then a grey footer with the assay format and compounds screened.
  Filters are search, type and stage, plus the header figures (each one
  filters to the assays it counts); all of them live in the URL.
- **Chips** are allowed only for a small, fixed set of clickable values, such
  as assay format: square corners, a hairline border, no colour per value.
  Never for status (use coloured text) or decoration.
- **Status colours**: `$status-pending`, `$status-approved` and
  `$status-rejected`. In tables, show status as coloured text that spells out
  the word, never colour alone. The `-bg` tints are for rare emphasis only.

## Gotchas

- A global rule `body, header { color: … }` in `styles.scss` recolours any
  `<header>` element. Set `color: inherit` on it, or use a `<div>`.
- Global and Bootstrap class names leak into components: `.wrap` (forces
  `word-break: break-all`), `.title` (uppercase grey), and Bootstrap's `.row`
  (negative margins, flex-wrap), `.media` (flex) and `.figure` (inline-block).
  Don't use these names in a component.
- `position: sticky` only sticks within its parent. A component that renders
  a sticky bar for the whole page (page-header) sets `display: contents` on
  its host so the page, not the host, is that parent.
- The page body defaults to Lato at weight 300. `@include full-bleed-host`
  resets it to Plex at 400; components that don't use the mixin need to set
  `font-weight: 400` themselves.
- d3 and other drawing code can't use Sass. Read tokens at runtime with
  `getComputedStyle(document.documentElement).getPropertyValue('--color-…')`,
  as `ontology-tree.component.ts` does.
- `data:` image URLs (such as structure SVGs) need `DomSanitizer` before
  Angular will render them.

## Checking your work

Before calling a page done, screenshot it at 1440, 1920 and 390 wide (and at
1100 for tool pages). At 1920, check "Page width" above: nothing stretched,
related things still close together. Headless Chrome won't go below ~500px
wide; emulate a phone with the DevTools protocol to check 390. Look for overflow, clipped text, and anything that breaks the
rules above.
