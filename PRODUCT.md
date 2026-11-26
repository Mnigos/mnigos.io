# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Three kinds of reader come to mnigos.io, Igor Makowski's personal site.

- Recruiters and hiring managers. They want to know in one visit what Igor does now, where he worked, what he owned there and which tools he used, and how to reach him. `/work` is the page written for them.
- Developers who find him through rigtch.fm or his open source work (T3 Code, oRPC, platform-hono). They want proof that the person behind the project is real and active: the commit history, the numbers behind rigtch.fm and the code he has merged into other projects.
- Readers of the blog, who often land on a single post from a shared link. They want to read it without anything in the way, and maybe find the next post or the project it describes.

## Product Purpose

The site is Igor's record of work. The home page shows his GitHub and GitLab contributions since 2021 with the job he held at the time, the rigtch.fm numbers, his open source work and his latest posts. `/work` lists rigtch.fm and each job with what he did there and the stack. `/rigtch` describes his own product. `/blog` holds his writing.

It succeeds when a recruiter leaves knowing what he can be hired for, a developer believes the numbers, and a reader finishes the post.

## Positioning

The site proves its claims instead of describing them. A contribution grid built from real data, numbers with a recorded source and check date, a product with 73,000 listeners that he builds and runs alone, and posts about how it works. Nothing on the site is a skill bar, a testimonial or a "passionate about" sentence.

## Operating Context

- A static Astro site, rebuilt every day so the contribution grid and commit strips stay current. No server, no client JavaScript.
- Link previews matter: the site is mostly reached through links on GitHub, X, LinkedIn and rigtch.fm, so every page and post has its own preview image.
- Igor approved the content fact by fact: every number, job, project and link on the site was accepted by him one by one.

## Capabilities and Constraints

- Every number carries a source and the date it was checked, in `src/modules/profile/content/`. Numbers change only when Igor checks them again; the contribution data refreshes on its own.
- English only. Contact is through the profile links (GitHub, X, LinkedIn) and RSS. There is no contact form.
- Dark theme only, with no theme switch. No analytics and no cookies.
- Posts in `src/content/blog/` are Igor's own writing. Their text is never edited by anyone else; their layout and typography may change.

## Brand Commitments

- The name is `mnigos.io`, shown next to the hexagon mark.
- Voice: first person, plain and factual. Short sentences, concrete nouns, numbers instead of adjectives. No em dashes or en dashes anywhere.
- Igor's own words on the current site: he likes its overall feel, but parts of it read as machine-made. Changes should take things away or make them more exact, not add decoration.

## Evidence on Hand

- Contribution data: committed GitHub and GitLab snapshots from 2021, and rigtch.fm commit snapshots from November 2022 (see `ARCHITECTURE.md`).
- rigtch.fm facts: listeners, plays stored, the month every play started being saved and the month the paid plan went live, each with a source.
- Open source facts: merged pull request counts and npm downloads, each with a source link.
- Four rigtch.fm screenshots in `src/modules/rigtch/content/screenshots/`.
- One published post.
- No testimonials, client logos, photos of Igor or downloadable CV exist, and none should be invented.

## Product Principles

1. Show the record, then say as little as needed about it. The grid, the numbers and the job lists carry the page.
2. Every claim is checkable. A number without a source does not go on the site.
3. One fact appears once on a page. Repetition reads as padding.
4. Recruiters get the answer in the first screen of `/work`: current role, past roles, dates.
5. Reading comes first on a post. Nothing competes with the text.

## Accessibility & Inclusion

WCAG 2.2 AA: text contrast of at least 4.5:1 on the near-black background, visible keyboard focus on every link, and motion only where the visitor has not asked to reduce it. The contribution cells carry their count and date in a title, because colour alone cannot.
