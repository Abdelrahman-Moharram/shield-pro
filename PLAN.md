# PLAN: FAQ data table + footer links + full-height home sections

The executor (Gemini) works ONE task at a time: only the task the user names.
State today: `/faq` works (the user checked it). The home page has NOT been changed yet (git shows no edits under `app/components/home`).

## Executor protocol (general rules, apply to every task)

### Scope
- Follow `AGENTS.md`. Implement ONLY the named task. Touch ONLY the files listed for it. If another file seems to need a change, stop and say why; do not edit it.
- Do not start `pnpm dev`; ask the user to run it. Never edit `app/routeTree.gen.ts`, `node_modules`, or `dist`.
- Read the doc (see `AGENTS.md` table) before using any engine API. Never write an engine API from memory.

### No code bloat (this is the most important part)
- Smallest diff that solves the task. Prefer changing a few class names or one value over adding code.
- Do NOT: add libraries, new files, new components, helpers, hooks, wrappers, abstractions, comments that restate code, or "improvements" nobody asked for.
- Do NOT reformat, rename, reorder, or re-indent code you are not changing. Do not rewrite a whole file when a few lines change. Do not re-generate translation files or JSON files: edit only the lines you need.
- Do not duplicate data: one source of truth per value (if a value is a setting, do not also hard-code it).
- Each task has a **Diff budget** = the maximum number of *added* lines in `git diff --numstat` for each file. The numbers are estimated from reading the code, and they already include normal formatting. Check yourself with `git diff --numstat` before you reply.
- Going over the budget without a real need is a mistake, not a style choice. The first try of Task 1 added 86 lines where 29 were enough: it read the setting from three places, merged dotted keys into one fake item, parsed JSON strings, and read the language from `document` (a hydration bug). That is exactly what not to do.
- A real need is only: a type error that needs one cast, or a bug that the plan did not foresee. If you are over budget for a real need, say so in one line in your final reply (which lines and why). If you cannot name the need, remove the extra lines.

### Real fixes, not cosmetic ones
- A task is done when its **Acceptance** checks pass in the browser or in a command, not when the code looks right. If a check cannot be run (needs `pnpm dev`), say so; do not claim it passed.
- If after your change the thing looks the same as before, you did not solve it. Find out why (computed styles, DevTools) instead of adding more code.
- Do not fix a problem by hiding it (`overflow-hidden` on everything, `!important`, fixed pixel heights, `display:none`).
- If the plan's premise is wrong (the cause is not what the plan says), stop and report the real cause in 3 lines.

### Mistakes already made in this project (do not repeat)
1. **Line endings.** Every file in this repo uses LF. Tasks 3 and 4 came back with whole files converted to CRLF, so `git diff` showed 100+ changed lines for a 5-line change. Edit with your normal edit tool, line by line. Never write or run a script (`.js`, PowerShell, `sed` over a whole file) that rewrites a file. Before replying run `git diff --numstat` WITHOUT `-w`; the numbers must be close to the number of lines you really changed. If a file shows more, you changed its line endings: fix it before replying.
2. **Flex centering collapses the content.** If you make a `<section>` `flex items-center` (to center vertically), its direct child is a flex item: with `mx-auto` and no `w-full` it shrinks to its content width and the grid or cards inside collapse. Always give that direct child `w-full` (keep its `max-w-*`, `mx-auto`, paddings).
3. **Invalid classes.** Tailwind here is v3.4. `object-start`/`object-end` do not exist in v3 (use `object-left`/`object-right`) and an unknown class is silently ignored. Before using any unusual utility, search the Tailwind v3 docs or the existing code for it. Logical utilities that do exist: `ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `text-end`, `rtl:`/`ltr:` variants.
4. **Honest numbers.** Report the `numstat` of the real diff, not a number computed with whitespace ignored. If you could not run something (browser checks need `pnpm dev`), say "not run", not "passed".
5. **Stay in the listed files.** Do not leave temp files in the repo (scripts, backups). Do not run `git add`, `git commit`, `git checkout`, or `git stash`.

### Verify and report
- Run `pnpm build`, `pnpm typecheck`, `pnpm test`; after editing `twilight.json` also `pnpm check:manifest`. Report failures as they are.
- Final reply: at most 5 lines: what changed, `git diff --stat` numbers, which acceptance checks passed, which could not be run.

---

## Part 1: FAQ data table and footer links

Background (verified in the code): a Salla theme has no database. The project already has the pattern for "a table the merchant fills in": a `collection` setting in `twilight.json` (`installation_centers`), edited in the Salla dashboard and read by `app/routes/branches.tsx`. FAQ questions use the same pattern.
Contact form: leave it exactly as it is for now (local state only, no network). The messages table and the send-to-backend step will be done later together with the warranty backend. Do not touch the form in any task.

### Task 1: FAQ list from a dashboard table (fix the first attempt)
Review of the first attempt (`git diff`): `twilight.json` (+18) and `twilight.preview.json` (+14) are correct: keep them untouched. `faq.tsx` works but is wrong in the way below and must be redone smaller. The baseline for `git diff` is the staged version, so the diff shows only this task.
Files: `app/routes/faq.tsx`, `locales/ar.json`, `locales/en.json`.
Remove from `faq.tsx`: the `useTwilight` import and call, `themeSettingsAny`, `themeObjSettingsAny`, `rawSetting` (and its `window.salla.config` branch), `flatDottedFaqs`, `itemsList`, `isEn`, the JSON-string parsing, and every `any` that is not needed.
Replace with the smallest version, in this order (the first attempt was about three times bigger than this needs to be):
1. Get `locale` from the `useTranslation()` call that already exists in the file (it already returns `locale`; do not read `document.documentElement.lang`, because the server has no `document` and the English page breaks hydration).
2. Get `settings` from `useTheme()` and read only `settings.faq_items`, treated as an array (empty array when it is missing). It is a `collection` setting, so it is already an array: do not parse strings or use `Object.values`; `branches.tsx` does that only for its own reasons.
3. One tiny local helper that reads a field from an item and also accepts the dotted key `faq_items.<field>` (the dotted key is the only reason `branches.tsx` has long `||` chains).
4. Map the items to id, question, answer. Use the English fields only when `locale` is `en` and they are not empty. Drop items missing a question or an answer.
5. `displayFaqs` is the mapped items, or, when there are none, the built-in `FAQS` list translated with `t(...)` (unchanged fallback).
6. `visibleFaqs` is the first 7 until the user presses the button; the "عرض المزيد" button shows only when there are more than 7 and it was not pressed yet.
7. Add the key `pages.faq.show_more` to both locale files, Arabic "عرض المزيد" and English "Show more". (The first plan said "do not touch locales"; that was a mistake in the plan: without the key the English page shows Arabic text.)
Do not: change the accordion markup beyond using `faq.question` / `faq.answer`, create files, or touch `twilight.json` / preview.
Diff budget: `faq.tsx` ≤ 35 added lines (expected need: about 30), each locale file ≤ 2 added lines.
Acceptance: `pnpm build`, `pnpm typecheck`, `pnpm check:manifest` pass; empty setting → the 7 built-in questions; the preview has 2 items → exactly 2 show, no button; add 9 items in the preview temporarily (then remove them) → 7 show + the button reveals 2; `/en/faq` shows English fields and "Show more" with no hydration warning in the console; `grep -n "document\." app/routes/faq.tsx` returns nothing.

### Task 2: Footer: fix the broken links (FAQ first)
The navbar (`app/data/NavbarData.ts`, FAQ item and "لماذا شيلدو برو") is being edited by the user. Do NOT touch it.
Files: `app/components/layout/Footer.tsx` only.
Facts (verified): links live in the `FOOTER_DATA.sections` constant and are rendered with a plain `<a href={link.url}>` (about line 256). Today `الأسئلة الشائعة` → `#faq`, `الضمان` → `#warranty`, `مراكز التركيب المعتمدة` → `#installers`: these anchors do not exist on any page, so the links do nothing. The real routes are `/faq`, `/warranty`, `/branches`. `الشحن والتوصيل` (`#shipping`), `الاستبدال والاسترجاع` (`#returns`), `من نحن` (`#about`) have no page yet: leave them as they are.
Do:
1. Change the three urls above to `/faq`, `/warranty`, `/branches`.
2. Internal urls (starting with `/`) must use the engine `Link` from `@salla.sa/twilight-theme-engine/common` (it keeps the `/ar` or `/en` prefix and navigates without a full reload; `AGENTS.md` forbids `<a>` for internal navigation). Keep a plain `<a>` for other urls (`#...`, `tel:`, `mailto:`, social). Keep the same `className`. Check the exact `Link` props in the docs (`/hooks/navigation`) before writing it.
3. The product links (`/products?category=thermal`, `/products?category=ppf`) are internal too; they get the same treatment through the same condition, no extra code.
Do not: add new footer columns or links, change texts, styles, the newsletter, or the contact block; change the `FooterLink`/`FooterSection` interfaces unless the type check requires it.
Diff budget: ≤ 15 added lines (estimated need: about 12: 3 url edits, 1 import, a 7-line condition around the `<a>`).
Acceptance: `pnpm build`, `pnpm typecheck` pass; on `/ar` clicking `الأسئلة الشائعة` opens `/ar/faq` without a page reload; on `/en` it opens `/en/faq`; `الضمان` → `/ar/warranty`, `مراكز التركيب` → `/ar/branches`; `#shipping`, `#returns`, `#about` unchanged; the footer looks identical.

---

## Part 2: Home page: the first three sections fill the screen, the rest keep their design heights

Decision (from the user): only sections 1–3 (hero, services, products) are one screen tall. "لماذا شيلدو برو" and every section below it (protection banner, how to start, installation centers, warranty, blog) keep the height they had before: their design in Figma is about 374px high and the original code was right. Do not make them screen-tall. For these sections the only allowed change is RTL/LTR cleanup (see Tasks 5 and 6).

### What is wrong now (verified by reading the code, not guessed)
Home block order: `enhanced-slider` (HeroBanner) → `photos-slider-with-text` (ServicesSection, `#services`) → `featured-products` (`#products`) → `store-features` (WhyUs, `#why-us`) → `protection-banner` → `how-to-start` (`#how-it-works`) → `installation-centers` (`#centers`) → `warranty-banner` (`#warranty`) → `blog`.
- Sections 1–3 had fixed heights (HeroBanner `min-h-[580px] lg:min-h-[660px]`, the others only `py-*`) and `featured-products` reserved `450px`. These are the ones that change.
- Sections 4–9 were fine as designed. Tasks 3 and 5 wrongly made some of them screen-tall (router heights, `home-screen flex items-center`, removed `max-h-[350px]`): those parts must be undone (Tasks 3 and 5 below).
- Eight sections hard-code `dir="rtl"`, which breaks `/en`. Sections 1–3 are already cleaned (Task 4). Physical classes (`ml/mr/pl/pr/left/right`) remain in `Brands`, `FixedProducts`, `InstallationCentersSection`, `WhyUsSection` (the SVG, kept on purpose).
- Correction to an earlier note: the extra ids `how-to-start`, `installers`, `installation-centers`, `warranty-banner` are on separate empty anchor `<span>`s on purpose (not duplicates). Still unverified: whether the wrapper that `router.tsx` renders with `id: 'why-us' | 'protection-banner' | 'how-it-works' | 'centers' | 'warranty'` duplicates the inner `<section id>`. Check it in the browser (Task 7).

### Design rules
- **Scope**: the screen-height rules below apply ONLY to sections 1–3 (hero, services, products). Sections 4–9 keep their original heights; never add `home-screen`, `flex items-center`, `min-h`, or a router `height` to them.
- **Height**: each of the three sections gets `min-height` = the shared variable `--home-screen-h` (`100svh` minus the header height; the header values 72px / 88px were checked against `header.scss`). Use `min-height`, never `height`, so a short phone screen grows instead of clipping.
- **Centering**: content centered vertically (`flex items-center`, with `w-full` on the direct child); changing the window height changes only empty space, not the layout.
- **Same ratios at any height**: images/banners keep a fixed `aspect-ratio` and are limited with `min()/clamp()` against the section height, never fixed pixels. Text sizes use `clamp()`. Never stretch an image.
- **Sizes to check**: 375×667, 390×844, 768×1024, 1024×768, 1440×900, 1920×1080 and the short window 1440×600. At each: no horizontal scroll, no overlap, nothing cut off.
- **RTL/LTR** (all sections): logical classes only (`ms-*`, `ps-*`, `text-start`, `start-*`, `end-*`). In an RTL page `start` is the RIGHT side and `end` is the LEFT side: to keep something on the right in `/ar`, use `start-*`. Never add `left/right/ml/mr/pl/pr` or `dir="rtl"`.
- Keep the content, copy, colors, and ids of each section. Header, footer, product pages: untouched.
- Prefer class-name edits. A section change that adds more than ~15 lines is probably wrong.

### Task 3: Shared variable + placeholder heights (undo the part that was too wide)
Files: `app/router.tsx` only.
Status: the variable `--home-screen-h`, `--header-h` and the `.home-screen` class in `home-blocks.scss`, the `featured-products` height in `FeaturedProducts.tsx`, and the reverted `common.scss` are correct: keep them.
Do (undo, nothing new): in `registerHomeComponentConfig` remove the `height` line that was added to `store-features`, `why-us`, `protection-banner`, `fixed-banner`, `how-to-start`, `how-it-works`, `installation-centers`, `certified-centers`, `warranty-banner`, `product-warranty` (10 lines), and put back the original `blog` height `clamp(480px, 45vw, 660px)`.
Result: `app/router.tsx` has NO difference from `HEAD` (`git diff HEAD --numstat -- app/router.tsx` prints nothing). Keep LF line endings.
Diff budget: 0 lines left in `router.tsx`.
Acceptance: `git diff HEAD --numstat -- app/router.tsx` is empty; `tsc` passes; the lazy sections 4–9 reserve the same height as before the change.

### Task 4: Sections 1–3 (hero, services, products)
Files: `HeroBanner.tsx`, `ServicesSection.tsx`, `FeaturedProductsSection.tsx` (and `FeaturedProducts.tsx` only for its `height: '450px'` config).
Do: apply the design rules; remove `min-h-[580px] lg:min-h-[660px]` from the hero; remove `dir="rtl"` and physical classes in these files.
Diff budget: ≤ 20 added lines per file (estimated need: 6–12; most of it is editing existing class names, which `numstat` counts as 1 added + 1 deleted). Not measurable before a browser check: if you need more than 20 in one file, stop and report which lines and why before adding them.
Acceptance: console check at 1440×900 and 1440×600: `document.querySelector('#hero').getBoundingClientRect().height >= innerHeight - headerHeight` (same for `#services`, `#products`); hero image ratio identical at both sizes; text never over the car image.
Status: DONE and reviewed. The first attempt had CRLF line endings, an invalid `object-start` class and a missing `w-full` (items 1–3 above); they were fixed by hand. Do not touch these three files again.

### Task 5: Sections 4–6 (why-us, protection, how-to-start): undo the height changes, keep the RTL cleanup
Files: `WhyUsSection.tsx`, `ProtectionBanner.tsx`, `HowToStartSection.tsx`.
Status: the first attempt made these sections screen-tall. Heights must go back to the original.
Do:
1. In all three sections remove `home-screen` and `flex items-center` from the `<section>` class list, and remove the `w-full` that was added to the inner container (it was only needed for the flex centering). Do not put back `dir="rtl"`.
2. `ProtectionBanner.tsx`: put back `max-h-[350px]` on the banner card (it was in `min-h-[260px] lg:min-h-[290px] max-h-[350px] overflow-visible`).
3. `HowToStartSection.tsx` (StepCard): the notch svg and the step number must stay on the RIGHT in `/ar` like the original. Use `start-0` for the notch, `start-3 sm:start-3.5` for the number, and mirror the svg with `ltr:-scale-x-100` (not `rtl:`). Keep `text-start`.
4. `WhyUsSection.tsx`: keep `text-start` on the heading and the decorative SVG's `left-[-2%]` as it is.
Result: apart from `dir="rtl"` removal, `text-right` → `text-start`, and the notch/number fix, these files are the same as `HEAD`.
Diff budget: ≤ 8 added lines per file.
Acceptance: `git diff HEAD --numstat` for the three files shows about 3–6 lines each, LF endings; the three sections have the same height as in `HEAD` at 1440×900 and 375×667; on `/ar` the notch and the number are at the top right of each step card; `tsc` passes.

### Task 6: Sections 7–8 (centers, warranty): RTL cleanup only, no height changes
Files: `InstallationCentersSection.tsx`, `WarrantyBanner.tsx`. Do not touch `Blog.tsx`.
Do: remove the hard-coded `dir="rtl"` from both sections; in `InstallationCentersSection` replace its one physical class with the logical one that keeps the same side in `/ar` (remember: `start` = right in RTL). Nothing else: no `home-screen`, no `flex items-center`, no `min-h`, no padding changes.
Diff budget: ≤ 6 added lines per file.
Acceptance: heights identical to `HEAD`; `/ar` looks the same as before; `/en` is LTR without broken alignment; LF endings; `tsc` passes.

### Task 7: Audit (checklist, report each item: fixed / not an issue / needs the user)
Files: only what each item needs.
1. In the browser run `[...document.querySelectorAll('[id]')].map(e=>e.id).filter((id,i,a)=>a.indexOf(id)!==i)` on `/ar` to list duplicate ids; fix only real duplicates (router wrapper vs inner section).
2. Anchors `/#services`, `/#why-us`, `/#how-it-works`, `#products` each hit exactly one element and the sticky header does not cover the section top (`scroll-mt-20` matches the real header height).
3. `/en` is LTR and correct after the `dir="rtl"` removal; dark mode still readable.
4. Console on `/ar` and `/en`: no hydration warnings, no key warnings, no failed image/font requests.
5. Hero image has priority loading and width/height (no CLS).
6. Redirects: `curl -sIL --max-redirs 10` on `/ar/faq` and `/en/faq` must be one 200 with no hops. `/ar/faqs` has no route: if the user's store menu uses it, change the menu link to `/faq`; otherwise leave it.
Acceptance: every item answered with evidence; build/typecheck/test pass.

### Task 8: Final visual check (no code unless a bug is found)
With the built-in browser on `/ar` and `/en` at the 7 sizes: scroll the whole page, screenshot each section. Report any of sections 1–3 shorter than the screen, any section clipped or overlapping, or with a changed image ratio, and any of sections 4–9 whose height differs from `HEAD`, and fix only those, one small change per problem.
Acceptance: sections 1–3 are at least one screen tall at every size and their image ratios are equal between 1440×900 and 1440×600; sections 4–9 have the same height as in `HEAD`; no horizontal scroll; `/ar` RTL and `/en` LTR both correct.
