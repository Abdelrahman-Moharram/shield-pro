# PLAN: Salla review fixes (run in 3 batches)

Follow the **Executor protocol in `PLAN.md`** (scope, no bloat, LF, honest numstat, no `pnpm dev`, no git add/commit).
Do NOT "fix" line endings of files you are not changing (the repo shows CRLF noise on untouched files; leave it).

## How to run this plan fast
- Work in **batches**. Inside a batch, do all its tasks one after another WITHOUT stopping to ask. Stop only at the end of the batch and send ONE reply: per task, one line of what changed + the real `git diff --numstat`, then the results of `pnpm build`, `pnpm typecheck`, `pnpm test`.
- If a task's premise is wrong, skip that task, say why in 3 lines, and continue with the next one.
- Order is fixed: Batch 1 → Batch 2 → Batch 3. Batch 3 comes last because it changes texts that tests look for.

## Context (verified)
- The theme builds and typechecks. The work below is about Salla's review rules and warnings, not about a broken build.
- Salla's technical review wants: no static strings (use localization), no demo data, clean code. `pnpm build` prints `twilight:best-practices` warnings that Task 1 and 2 remove.
- Engine translation: `import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n'`; `const { t, isRTL } = useTranslation()`; `t('key', 'default')`. Read `/recipes/add-translation-keys` before Batch 3.

---

## BATCH 1: mechanical fixes (files do not overlap, no texts change)

### Task 1: Remove `no-manual-dom` warnings
Files: `app/components/layout/MobileBottomBar.tsx` (lines ~63, 66, 67, 126, 127), `app/hooks/useStaggeredRows.ts` (~55, 59), `app/components/layout/HeaderNav.tsx` (~191), `app/components/layout/HeaderMainMenu.tsx` (~244), `app/components/product/ProductListHero.tsx` (~13).
Do: replace each `document.querySelector/getElementById` with a `useRef` (or state) as the warning suggests. Keep behaviour identical.
Do not: change classes, markup, or logic beyond the DOM access.
Diff budget: ≤ 12 added lines per file.
Acceptance: `pnpm build` prints no `no-manual-dom` warning; `pnpm test` is not worse than before. Browser checks (mobile bottom bar, sticky header, menu) are for the user: say "not run".

### Task 2: Remove `no-deep-component-import` and image-size warnings
Files: `app/components/cart/CartPage.tsx` (lines 15, 16), `app/components/home/index.ts` (line 21), `app/routes/warranty.tsx` (~121), `app/components/product/AddToCartForm.tsx` (~65).
Do: import from the barrel (`../product`, `../layout`) instead of the deep path; add `width` and `height` to the two `<img>` tags (use the real size of the file; keep the existing classes).
Do not: touch anything else. If a barrel import creates a circular import or a build error, keep the deep import for that line and say so.
Diff budget: ≤ 3 added lines per file.
Acceptance: `pnpm build` prints no `no-deep-component-import` and no `no-img-without-dimensions` for these files.

---

## BATCH 2: demo data (decision already taken: remove it)

### Task 3: Remove the demo product catalog
Files: `app/components/product/ProductListPage.tsx`, `app/data/ProductsCatalogData.ts` (delete), plus any file that only existed to support it.
Facts: `ProductListPage` falls back to `CATALOG_PRODUCTS` when the store returns no products (line ~65). A real store never shows it, but reviewers will read it as demo data in the theme.
Do:
1. When `initialProducts` is empty, show the engine empty state (`NoContent` from `@salla.sa/twilight-theme-engine/common`, read `/components` docs first) instead of the catalog. Keep every filter, tab and sort exactly as is.
2. Delete `app/data/ProductsCatalogData.ts` and remove its import. Then search for the demo type `ProductItem`: remove only what becomes unused because of this change (one grep, report the result). If removing more than that is needed, stop and report.
Do not: touch the card, the layout, texts, or the Salla-product filter logic.
Diff budget: `ProductListPage.tsx` ≤ 10 added lines.
Acceptance: `pnpm build`, `pnpm typecheck` pass; no import of `ProductsCatalogData` remains.

### Task 4: Static fallback items on the home page
Files: `app/components/home/FeaturedProductsSection.tsx` (it hard-codes products with `image_7.webp` / `image_8.webp`).
Do: first report in 3 lines where these static items are shown (always, or only when the block has no products). If they show only as a fallback when the store has no products, replace the fallback with rendering nothing (return null). If the section is built only from these static items, STOP and report; do not redesign it.
Diff budget: ≤ 10 changed lines.
Acceptance: build and typecheck pass; the report is in the reply.

---

## BATCH 3: localization (the big one). Run its tasks in order, all in one go.

### Rules for every task in this batch
1. Move each Arabic string in the listed files into `locales/ar.json` (the SAME Arabic text, character for character, so the Arabic UI does not change) and add the English translation in `locales/en.json` under the same key.
2. Read the file in the component with `t('key', 'Arabic default')`. Use the key naming already used for theme-owned keys in `locales/*.json`; if there is none, use `theme.<area>.<name>` (e.g. `theme.home.hero_title`).
3. Module-level constants (arrays of cards, steps, menus) that contain Arabic: keep the structure but store the translation KEY in the constant and call `t(key)` at render. Never call `t` outside a component or hook.
4. Add keys by inserting lines; do NOT re-generate or reformat the JSON files. Both files must end with the same set of keys (check this at the end).
5. Do NOT translate: store content that comes from the merchant (product names, settings values, `twilight.json` labels/descriptions which are dashboard-only), CSS content, code comments.
6. Keep the English short and natural for a car-protection-film wholesale store (rolls, traders, certified installation centers, warranty by serial number). The user will review the English.
7. Diff budget per component file: about the number of Arabic lines in it (given below) plus ≤ 4 lines for the `useTranslation` import and call. Locale files: one added line per key.

### Task 5: Home blocks
Files: `HeroBanner.tsx` (10 Arabic lines), `WhyUsSection.tsx` (9), `ServicesSection.tsx`, `HowToStartSection.tsx` (9), `FeaturedProductsSection.tsx` (10), `ProtectionBanner.tsx`, `WarrantyBanner.tsx`, `InstallationCentersSection.tsx`, `Blog.tsx`, all in `app/components/home/`.
Note: text that the merchant edits from the dashboard (block fields in `twilight.json`) stays as a field value; translate only the fallback text written in the code.

### Task 6: Product and card
Files: `app/components/product/`: `ProductListPage.tsx` (44), `productHelpers.ts` (41, pure helpers: change them to return keys or take `t` as a parameter, do not call hooks there), `ProductDetails.tsx` (8), `AddToCartForm.tsx` (8), `ProductPage.tsx` (7), `ProductSpecs.tsx`, `ProductInstallBanner.tsx`, `ProductFeatures.tsx`, `ProductListHero.tsx`; and `app/components/shared/cards/ProductCardItem.tsx`, `app/components/shared/slider/SharedCarousel.tsx`.

### Task 7: Layout and navigation
Files: `app/components/layout/Header.tsx`, `Footer.tsx` (18), `app/data/NavbarData.ts` (8, store keys and call `t` where the menu renders: `HeaderNav.tsx`, `HeaderMainMenu.tsx`; those two are allowed here only for that).

### Task 8: Custom pages
Files: `app/routes/faq.tsx` (45), `app/routes/warranty.tsx` (18), `app/routes/branches.tsx` (16).
Note: FAQ questions and installation centers come from `twilight.json` collections (merchant content): leave them. Translate only the fixed UI texts (titles, labels, buttons, error and success messages).

### Task 9: Direction check (report only, tiny fixes allowed)
Run: grep for hard-coded `dir="rtl"` in `app/`. For each hit write one line (file, what it wraps). Where it wraps a whole page container and a one-line change to `dir={isRTL ? 'rtl' : 'ltr'}` is enough, make it; otherwise only report it.

### Task 10: Final localization check
1. A search for Arabic characters in `app/` returns only: comments, `twilight`-independent data you were told to keep, and nothing in rendered texts. List what remains in the reply.
2. `locales/ar.json` and `locales/en.json` have exactly the same keys (say how you checked).
3. `pnpm build`, `pnpm typecheck`, `pnpm check:manifest` pass.

---

## BATCH 4 (last): tests

### Task 11: Fix the failing tests
Files: only under `tests/`: `components/cart/CartItem.test.tsx` (6 failing: "No QueryClient set"), `components/home/EnhancedSlider.test.tsx` (29), `components/home/PhotosSliderWithText.test.tsx` (7), `components/layout/Header.test.tsx` (4). Also fix any new failure caused by Batch 3 (texts now come from keys).
Do: for each failure decide: stale test → update the test to the current component; real bug in the app → do NOT hide it, list it in 3 lines and leave that test failing.
Do not: edit app code to make a test pass, delete tests, or loosen assertions to `toBeTruthy`.
Acceptance: `pnpm test` is green except the failures you listed as real bugs.

---

## What only the user can do (the executor cannot)
1. Commit, merge `dev` into `main`, push; check the Partners Portal is linked to `main`; re-sync the theme.
2. Run `salla theme list` and `salla theme dev --store`; run `salla theme publish` only after the batches pass.
3. Take 3+ screenshots at 1366×768 (needs `pnpm dev` against the live store) and upload them in the Partners Portal.
4. Record the support video and write the steps list for the support team.
5. Browser checks (`pnpm dev`, `/ar` and `/en`, mobile and desktop) after Batch 1 and Batch 3; look at the WebP images once.
6. Review the English wording from Batch 3.
7. Add real products to the store before testing Task 3 and 4.
8. Decide about the 26MB `.git` history only if Salla says the repo size is the problem.
