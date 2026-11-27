---
name: mnigos.io
description: Igor Makowski's record of work, a contribution grid, a product, jobs and posts on near-black.
colors:
  bg: '#0a0a0b'
  cell: '#171615'
  code: '#111110'
  ink: '#ece8df'
  body: '#d6d2c8'
  dim: '#aaa59b'
  faint: '#7f7a70'
  line: '#272724'
  line-strong: '#3b3a35'
  accent: '#ff5a2e'
  accent-soft: '#ffc2a3'
  on-accent: '#0a0a0b'
  level-1: '#3a1a10'
  level-2: '#6e2a14'
  level-3: '#b23f1a'
  level-4: '#ff5a2e'
  level-5: '#ff8a66'
  level-6: '#ffb89c'
  level-7: '#ffe1d2'
  level-8: '#ffffff'
typography:
  display:
    fontFamily: 'Martian Mono, ui-monospace, monospace'
    fontSize: '2.75rem'
    fontWeight: 800
    lineHeight: 1
    letterSpacing: '-0.045em'
    fontVariation: "'wdth' 75"
  headline:
    fontFamily: 'Martian Mono, ui-monospace, monospace'
    fontSize: '1.6875rem'
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: '-0.045em'
    fontVariation: "'wdth' 75"
  heading:
    fontFamily: 'Martian Mono, ui-monospace, monospace'
    fontSize: '1.3125rem'
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: '-0.045em'
    fontVariation: "'wdth' 75"
  figure:
    fontFamily: 'Martian Mono, ui-monospace, monospace'
    fontSize: '1.4375rem'
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: '-0.03em'
    fontFeature: "'tnum'"
    fontVariation: "'wdth' 80"
  lede:
    fontFamily: 'Archivo, system-ui, sans-serif'
    fontSize: '1.1875rem'
    fontWeight: 400
    lineHeight: 1.45
  title:
    fontFamily: 'Archivo, system-ui, sans-serif'
    fontSize: '1.03125rem'
    fontWeight: 600
    lineHeight: 1.55
  body:
    fontFamily: 'Archivo, system-ui, sans-serif'
    fontSize: '0.96875rem'
    fontWeight: 400
    lineHeight: 1.55
  prose:
    fontFamily: 'Archivo, system-ui, sans-serif'
    fontSize: '17.5px'
    fontWeight: 400
    lineHeight: 1.68
  label:
    fontFamily: 'Archivo, system-ui, sans-serif'
    fontSize: '0.8125rem'
    fontWeight: 400
    lineHeight: 1.55
  date:
    fontFamily: 'Martian Mono, ui-monospace, monospace'
    fontSize: '0.8125rem'
    fontWeight: 400
    lineHeight: 1.55
    fontFeature: "'tnum'"
    fontVariation: "'wdth' 80"
rounded:
  none: '0'
  cell: '2px'
spacing:
  gutter-phone: '16px'
  gutter: '28px'
  page: '48rem'
  section: '40px'
components:
  button-primary:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.on-accent}'
    rounded: '{rounded.none}'
    padding: '7px 14px'
  button-primary-hover:
    backgroundColor: '{colors.accent-soft}'
    textColor: '{colors.on-accent}'
  profile-link:
    backgroundColor: '{colors.bg}'
    textColor: '{colors.ink}'
    rounded: '{rounded.none}'
    padding: '5px 11px'
  profile-link-hover:
    textColor: '{colors.accent}'
  nav-link:
    textColor: '{colors.dim}'
  nav-link-current:
    textColor: '{colors.ink}'
  contribution-cell:
    backgroundColor: '{colors.cell}'
    rounded: '{rounded.cell}'
---

# Design System: mnigos.io

## Overview

**Creative North Star: "The contribution grid"**

The home page opens on five years of GitHub and GitLab contributions, one square per day, with the job Igor held above each stretch of weeks. That grid sets the rules for the rest of the site: the record of work is the design, colour encodes quantity, and type labels what the data cannot say by itself. Everything else, the product facts, the job lists, the stack, the posts, is a list or a table set on the same near-black page with thin rules between rows.

The site is dense the way a well-kept log is dense: many rows, little chrome, no boxes around things that do not need them. One accent colour, cinnabar, marks the things worth noticing: the mark, the busy days, the numbers, the current page and the links. It has no client JavaScript. The one moving part is the sticky header, which shrinks as the page scrolls and draws a hand-drawn line under itself to show progress, through CSS scroll timelines only.

This is a refinement-stage system. Igor approved the look in a set of mockups on 2026-11-25 and likes its overall feel; the work now is to remove what reads as machine-made, not to add decoration.

**Key Characteristics:**

- Near-black background, warm off-white text, one cinnabar accent.
- Martian Mono, condensed and extra bold, for headings, numbers and dates; Archivo for everything people read.
- Square corners everywhere except the 2px contribution cells.
- Thin rules instead of cards; a 2px off-white rule opens each section.
- A hand-drawn cinnabar stroke under links and the current page.
- One column, 48rem wide, with a 16px gutter on phones and 28px from 35rem up.

## Colors

Warm neutrals on near-black with a single saturated orange-red accent and an eight-step heat scale built from it.

### Primary

- **Cinnabar** (#ff5a2e): the hexagon mark, the Contact and Open rigtch.fm buttons, the hand-drawn link stroke, numbers in the open source list, month labels in the rigtch.fm history, bullets in the job lists, text selection and focus outlines. It is also level 4 of the contribution scale.
- **Soft cinnabar** (#ffc2a3): the hover state of every cinnabar button, and strings in code blocks.

### Neutral

- **Near-black** (#0a0a0b): the page, and text on cinnabar.
- **Cell** (#171615): an empty contribution day, inline code background, screenshot frames.
- **Code** (#111110): the code block surface.
- **Ink** (#ece8df): headings, names, link text and the 2px section rules.
- **Body** (#d6d2c8): paragraphs and post prose.
- **Dim** (#aaa59b): secondary text, dates, navigation at rest, descriptions under titles.
- **Faint** (#7f7a70): legends, the `.io` in the wordmark, contribution totals. Use it only for text a visitor can skip.
- **Line** (#272724): row dividers and box borders.
- **Line strong** (#3b3a35): borders of profile links.

### Contribution scale

Eight steps from dark ember (#3a1a10) through cinnabar (#ff5a2e) to white (#ffffff), plus Cell for zero. The home grid, the weekly strips on `/work` and `/rigtch`, and the link preview images all use it. The same scale holds for every year so years can be compared.

### Named Rules

**The One Accent Rule.** Cinnabar is the only hue on the page apart from the code highlighting and the rigtch.fm screenshots. A second accent colour is not allowed.

**The Heat Means Count Rule.** The level colours appear only where they encode a number of contributions or commits. They are never decoration.

## Typography

**Display Font:** Martian Mono, condensed (width 75%) and extra bold (800), with `ui-monospace` as fallback
**Body Font:** Archivo, variable, with `system-ui` as fallback
**Label/Mono Font:** Martian Mono at width 80% with tabular figures, for numbers and dates

**Character:** A condensed, heavy monospace for headings reads like labels stamped on a ledger; Archivo carries the reading. Mono appears where something is a name, a number or a date, never for running text.

### Hierarchy

- **Display** (800, 2.75rem from 35rem up and 2.25rem below, line height 1): the page title on `/work` and `/rigtch`.
- **Post title** (800, 2.375rem and 1.875rem on phones, line height 1.08, at most 15em wide): the title of a post.
- **Headline** (800, 1.6875rem, 1.1): company and product names on `/work`.
- **Heading** (800, 1.3125rem, 1.1): section headings such as Open source, Blog, What it does, History.
- **Figure** (700 in mono at width 80%, 1.4375rem, tracking -0.03em): fact values such as 73,000 and 362M, and the year labels of the grid.
- **Lede** (400, 1.1875rem, 1.45): the introduction on the home page and the summary on `/rigtch`, at most 24em to 34em wide.
- **Title** (600, 1.03125rem): row titles, such as a project, a post or a feature.
- **Body** (400, 0.96875rem, 1.55): the default.
- **Prose** (400, 17.5px and 16.5px on phones, line height 1.68, at most 34em wide): post text. The first paragraph is 20px in Ink.
- **Label** (400, 0.8125rem): fact labels, legends, dates, the job label above each grid row.

### Named Rules

**The Mono For Data Rule.** Martian Mono sets headings, numbers, dates and code. A sentence is never set in mono.

**The Tracking Rule.** Mono headings run at -0.045em, figures at -0.03em, and body text at the font's default.

## Layout

One centred column, 48rem at most, with 16px side gutters on phones and 28px from the `xs` breakpoint (35rem) up. Sections stack vertically with 40px to 44px between them. A section opens with a 2px Ink rule, then its heading, then rows divided by 1px Line rules with about 13px of vertical padding. Facts sit in a single bordered row of equal cells that becomes two columns on phones.

Two-column grids appear only where the content is a term and its description: job groups (148px term column), the stack (190px technology column), history months (96px), and a title next to a right-aligned date or number. All of them collapse to one column below 35rem.

The contribution grid keeps the year and its total in a 62px column on the left and splits each year's weeks into segments, one per job, with the company and role above each segment.

## Elevation & Depth

Flat. There are no shadows. Depth comes from the background steps (Near-black page, Cell for empty days and inline code, Code for code blocks), 1px borders, and the 2px Ink rules that open sections.

### Named Rules

**The No Shadow Rule.** No `box-shadow`, no blur, no glass. If something needs to stand apart, give it a border or a rule.

## Shapes

Square corners everywhere: buttons, profile links, fact rows, screenshots, code blocks. The only rounded shape is the contribution cell at 2px, small enough to read as a square while separating neighbours. Two drawn shapes carry the identity: the hexagon mark, an M cut into a hexagon, and the hand-drawn stroke, a slightly wobbling cinnabar line about 3px thick drawn from `link-stroke.svg`.

## Components

### Buttons

Solid, square, loud, and rare.

- **Shape:** square corners (0).
- **Primary:** Cinnabar background, Near-black bold text in the label size, 7px by 14px in the header and 10px by 18px on `/rigtch`. Used for Contact and Open rigtch.fm only.
- **Hover:** background turns Soft cinnabar.

### Profile links

- **Style:** a 1px Line strong border, Ink text in the label size at weight 500, 5px by 11px padding, square.
- **Hover:** border and text turn Cinnabar.

### Fact row

- **Style:** one bordered row of equal cells, each with a Figure value over a Label. On the home page the first cell is the rigtch.fm product in Cinnabar.
- **Phones:** two columns, with rules between cells.

### Navigation

- **Style:** Archivo at the small size in Dim; hover turns Ink. The current page is Ink with the hand-drawn stroke under it.
- **Sticky header:** wordmark and mark on the left, navigation and Contact on the right, a 1px Line rule below. While the first 90px scroll, the padding shrinks from 18px to 9px, the mark from 26px to 20px and the wordmark from 16.5px to 15px, and a hand-drawn stroke grows under the header with reading progress. Without scroll timeline support or with reduced motion it stays at full size.
- **Phones:** the navigation drops to its own line below the wordmark and Contact.

### Inline links

- **Style:** Ink text with the hand-drawn stroke under it, repeated on each line when the link wraps.
- **Hover:** text turns Cinnabar. **Focus:** a 2px Cinnabar outline with 2px offset.

### Contribution grid and weekly strips

The signature component. Each day or week is a square cell coloured by the contribution scale, with its count and date in the cell's title. The home grid has one row per year from 2021, newest first. The weekly strips on `/work` and `/rigtch` show one square per week of a job or of rigtch.fm commits, with a one-line legend in Faint.

## Do's and Don'ts

### Do:

- **Do** use only the tokens in `src/styles/global.css`; when a value is missing, add a token named by its role.
- **Do** keep every corner square, except the 2px contribution cell.
- **Do** separate rows with 1px Line rules and open sections with a 2px Ink rule.
- **Do** set every number and date in Martian Mono with tabular figures.
- **Do** mark links with the hand-drawn cinnabar stroke and give them a visible 2px cinnabar focus outline.
- **Do** check text against WCAG AA on #0a0a0b; Faint (#7f7a70) is the lowest text colour allowed.

### Don't:

- **Don't** add client JavaScript, a theme switch or a light theme.
- **Don't** add cards, shadows, gradients, glass, rounded boxes or a second accent colour.
- **Don't** add decoration, icons, illustrations or skill bars. The data is the image.
- **Don't** put a label or eyebrow above a heading, or number the sections.
- **Don't** repeat a fact that the page already shows elsewhere.
- **Don't** use em dashes or en dashes in any copy.
