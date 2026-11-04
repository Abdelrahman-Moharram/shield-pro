# PLAN: Wholesale business change (small)

Follow the **Executor protocol in `PLAN.md`** (scope, no bloat, LF, honest numstat, no `pnpm dev`, no git add/commit).

## Decision
The Figma design is correct and does NOT change: product page, product card, install banner, traffic notice, feature texts, home page, footer, installation centers, warranty and price all stay exactly as they are.
Only one thing in the code came from the old "car installation" understanding: the product card.

## Task 1: Product card: neutral wording for the options case
File: `app/components/shared/cards/ProductCardItem.tsx` only.
Facts (verified): when a product has options the card's "+" button sends the user to the product page; its `title` says `اختر تفاصيل السيارة`, and a nearby comment says "car model/year/package". Wholesale rolls may still have options (for example roll size), so the wording must not mention a car.
Do:
1. `title` for the options case: `اختر تفاصيل السيارة` → `اختر المواصفات`. Keep `أضف إلى السلة` for the no-options case.
2. Update that one comment so it does not say "car model/year/package" (say "options/variants").
Do not: change logic, classes, layout, `dir="rtl"`, or the `type === 'service'` check.
Diff budget: ≤ 2 changed lines (numstat 2 added, 2 deleted).
Acceptance: `pnpm typecheck` and `pnpm test` pass; nothing else in the diff.

## Task 2: Product list: make the filters and "all products" work on real Salla products
Do this task AFTER Task 1 and only when the user names it. It is independent of the wholesale change (it is a bug in the list page).
Files: `app/components/product/ProductListPage.tsx`, `app/components/product/productHelpers.ts` (one new helper there, no new file).
Facts (verified in the code and in the engine types):
- `ProductListPage` receives `products` and `pagination` from the engine loader (`ProductListLoaderData`). The pagination is cursor based (`next` is a URL or null). The page ignores `pagination`: only the first page of products is ever shown and there is no way to reach the rest.
- The tabs (العزل الحراري / حماية الطلاء PPF), the category checkboxes and the insulation-level checkboxes read `category` and `tintLevel`, which exist only on the demo type `ProductItem`. For a real Salla product both are empty, so the code skips those filters and shows everything. The traffic checkbox treats every Salla product as compliant. Search, sort and the offers tab already work.
Do:
1. **Real category and level.** Add one helper in `productHelpers.ts` that returns `{ category, tintLevel }` for a Salla product and use it in the filter logic of `ProductListPage` where the code now uses `''` for Salla products. Reuse `getProductCategoryNames` and `getProductCustomFields`; do not duplicate their logic.
   - category: look at category names + product name + tags (lower-cased). Contains `ppf`, `طلاء` or `ترمل` → `ppf`; otherwise contains `عزل`, `حرار`, `vlt` or `تظليل` → `thermal`; otherwise empty.
   - tintLevel: take the custom field whose label contains `VLT`, read its number n. n ≥ 50 → `50`; 30 ≤ n < 50 → `35`; 20 ≤ n < 30 → `20-25`; n < 20 → `10-15`. No VLT field → empty (the product is not hidden by this filter, same as today).
   - The demo `ProductItem` path stays exactly as it is.
2. **Leave the traffic checkbox as it is** for Salla products (there is no data for it). Report it in the final reply.
3. **Reach every product.** Read `/guide/loading-data` and the product-listing docs first (see `AGENTS.md` table). If the engine already offers a way to load the next page, use it with one "عرض المزيد" button under the grid that appends the next page's products and disappears when `pagination.next` is empty. If the docs show no supported way to fetch the next page from the component, STOP and report in 3 lines instead of inventing a request.
Do not: change the layout, classes, texts, the demo catalog, the sort/search logic, or the hard-coded `dir="rtl"`; do not add libraries or new files.
Diff budget: `productHelpers.ts` ≤ 25 added lines; `ProductListPage.tsx` ≤ 25 added lines (about 8 for step 1, about 15 for step 3). Over budget only for a real need, said in one line.
Acceptance: `pnpm build`, `pnpm typecheck`, `pnpm test` pass; with real products (ask the user to run `pnpm dev` against the store, or use two mocked Salla-shaped products temporarily and remove them): the thermal tab shows only film-for-heat products, the PPF tab only paint-protection products, ticking an insulation level hides products whose VLT is in another bucket, products without a VLT field stay visible; with more products than one page, the button loads the next page once and then disappears; the demo preview (no products from Salla) behaves exactly as before.

## Task 3: Card "+" button: add with the merchant's default options
Do this after Task 1. Independent of Task 2.
File: `app/components/shared/cards/ProductCardItem.tsx` only.
Decision (from the user): almost every product will have the same glass options. The merchant controls the behaviour from the Salla dashboard by marking a default value on an option. Rule for the "+" button on a Salla product:
1. No options → add one unit directly (as today).
2. Options exist and EVERY required option has a default value → add one unit directly, sending those default values as the chosen options.
3. Options exist and at least one required option has no default → open the product page (as today).
Facts (verified in the engine types): a value is the default when `is_default` is 1 (detail shape: `ProductOptionDetail`) or `is_selected` is true (older list shape: `ProductOptionValue`). The cart SDK's simple `addItem(productId, quantity)` has no place for options.
Do:
1. Before writing code, find out what the product LIST items really carry: look at an item in the home featured block and in `/products` (a temporary `console.log`, removed after) and report in one line whether `options[].values[]` or `options[].details[]` is present and whether the default flags are there. If the list items do NOT carry the options values, do not guess: fetch the product details on click through the engine product API (read its docs first) and use the `details` shape. If neither works, STOP and report in 3 lines.
2. Read the Salla docs for the exact way to add an item with options to the cart from code (the product page does it by posting a form whose fields are `id`, `quantity` and `options[<option id>]`). Use the same fields. Never write the SDK call from memory.
3. Apply the rule above in `handleAddToCart`. Keep the success/failure states and the fallback that opens the product page when the add fails.
4. `hasOptions` stays as the "is there something to choose" flag; do not rename. The button `title` keeps `اختر المواصفات` only for rule 3; rules 1 and 2 use `أضف إلى السلة`.
Do not: change the layout, classes, the demo `ProductItem` path, or the product page form (it keeps starting at "اختر", as in the design). No new files, no new libraries.
Diff budget: ≤ 30 added lines. Over budget only for a real need, said in one line.
Acceptance: `pnpm typecheck`, `pnpm test` pass; in the browser (ask the user to run `pnpm dev` against the store): a product with no options is added directly; a product whose required options all have a default is added directly and the cart line shows those options; a product with a required option without a default opens its page; the cart toast/count updates in the first two cases; no console error. If the browser checks cannot be run, say "not run".
Alternative NOT included (for a later decision): a small "choose options" sheet on the card (the theme already has `BottomSheet` in `app/components/common`) so the visitor can pick without leaving the list. It is not in the Figma design.

## Task 2b: Fixes after reviewing Task 2
Files: `app/components/product/ProductListPage.tsx`, `app/components/product/productHelpers.ts`, `locales/ar.json`, `locales/en.json`.
Do:
1. **Button hidden when it is needed most.** The "عرض المزيد" button renders only when `filteredProducts.length > 0`. If a tab or checkbox matches nothing on the loaded pages, the page shows "no products" and the button is gone, although matching products may be on the next pages. Remove that length condition so the button also shows under the empty state while `nextCursor` exists.
2. **Same order on every page.** `handleLoadMore` calls `product.list` with the source only; the loader's `query.sort` is not passed, so the next pages can come in a different order than the first page. Pass the loader's sort to the call (read the `product.list` options in the engine types; use the exact option name, do not guess). Add `query` to the destructured props for it.
3. **VLT also from the product name.** The list items may not carry custom fields (the product page itself fetches them later), so the insulation-level filter could silently do nothing. In `getProductFilterData`, when there is no VLT custom field, read the number from the product name (`VLT` followed by a number, as in `فيلم عزل حراري — VLT 35%`). Keep the same four buckets.
4. **Readable code.** Split the one-line `useState` pair into separate `const` lines, move the "load more" button's long class string and markup onto separate lines like the rest of the file, and replace `source?.type as any` with the proper type from the engine if it exists (if it needs a cast, keep one cast and say why).
5. **Texts.** `'جاري التحميل...'` and `'عرض المزيد'` are hard-coded Arabic, so `/en` shows Arabic. Use `t()` with new keys `pages.products.show_more` and `pages.products.loading` in BOTH locale files (ar: عرض المزيد / جاري التحميل...; en: Show more / Loading...).
6. **Known failing tests.** The Task 2 report said 5 tests already fail. In the final reply list their names and the first error line of each, and say whether they also fail without our changes. Do not fix them here.
Do not: change behaviour beyond these six points; add files.
Diff budget: ≤ 15 added lines in total across the two source files (point 4 mostly reformats existing lines), ≤ 2 added lines in each locale file.
Acceptance: `pnpm build`, `pnpm typecheck`, `pnpm test` pass (the same 5 known failing suites only); with a mocked list where no product on page 1 matches the PPF tab, the button is visible and loads the next page; `/en` shows "Show more".

---

## Not code: done in the Salla dashboard
- Product type: physical, with weight and unit (needed by Salla for shipping; the theme does not show weight, as in the design). The cart already shows the weight label by itself if Salla sends it.
- Delete the four glass options (الزجاج الأمامي / الخلفي / الجوانب) from the products, or replace them with roll sizes. With no options the product page shows: specs box, quantity + add to cart + buy now, then the traffic notice. The card's "+" then adds one roll straight to the cart.
- Roll length and width are optional: if you add them as custom fields the technical-specs section shows them automatically; if not, nothing breaks.

## Reported, not fixed
- `ProductCard.tsx` (theme wrapper) looks for the engine's `.s-product-card-vertical` markup; if the `product:card` override is active, that code may be dead. Verify before touching.
