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
| `segmented` | Grey track with a raised white active segment (ontology toolbar) |
| `underline-tabs` | Text tabs with an underline on the active tab (light backgrounds) |
| `focus-ring` | Keyboard focus outline; every interactive element needs one |

## Page patterns

- **Hero**: navy, and the whole hero must fit on one screen (check 1366×650
  and 1440×820). Headline: "The world's largest open-access drug repurposing
  library". Stats sit on the right, downloads under the search.
- **Tool pages** (like the ontology browser): one slim toolbar holding the
  title, a segmented switch, search and a view toggle, with the tool filling
  the rest of the screen below. No large page header.
- **Navbar**: white bar with links and Sign in. No call-to-action buttons in
  the navbar; the proposal call-to-action lives on the homepage.
- **"What's new"**: a small, light floating chip that opens a slide-out
  panel. It is not a full-width row.
- **Footer**: navy, with link columns, the REFRAME citation (PNAS 2018, with a
  copy button) and white logos.
- **Admin portal** (`/internal`): the same slim toolbar, with underline tabs
  for Overview, Proposals, Users and Maintenance, on a muted background with
  white panels. Shared admin pieces (status tags, data tables, form fields,
  compact buttons, notices) are in `src/app/internal/_admin.scss`; admin API
  calls are in `admin-api.service.ts`. Any action that changes someone's
  access or a proposal's status asks for confirmation in place, and the
  interface only updates once the server confirms the change.
- **Status colours**: `$status-pending`, `$status-approved` and
  `$status-rejected`, each with a `-bg` tint. Show status as a dot plus a
  label, never as colour alone.

## Gotchas

- A global rule `body, header { color: … }` in `styles.scss` recolours any
  `<header>` element. Set `color: inherit` on it, or use a `<div>`.
- Global and Bootstrap class names leak into components: `.wrap` (forces
  `word-break: break-all`), `.title` (uppercase grey), and Bootstrap's `.row`
  (negative margins, flex-wrap). Don't use these names in a component.
- The page body defaults to Lato at weight 300. `@include full-bleed-host`
  resets it to Plex at 400; components that don't use the mixin need to set
  `font-weight: 400` themselves.
- d3 and other drawing code can't use Sass. Read tokens at runtime with
  `getComputedStyle(document.documentElement).getPropertyValue('--color-…')`,
  as `ontology-tree.component.ts` does.
- `data:` image URLs (such as structure SVGs) need `DomSanitizer` before
  Angular will render them.

## Checking your work

Before calling a page done, screenshot it at 1440 and 390 wide (and at 1100 for
tool pages). Look for overflow, clipped text, and anything that breaks the
rules above.
