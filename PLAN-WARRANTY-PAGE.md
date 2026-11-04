# PLAN: Warranty page talks to the real backend

The executor protocol of `PLAN.md` applies to this file (read it first): ONE task at a time, only the listed files, smallest diff, no new libraries or files, `pnpm build` / `pnpm typecheck` / `pnpm test` / `pnpm check:manifest`, final reply at most 5 lines with the raw `git diff --numstat`. Line endings stay LF (run `file <path>` after every edit).
The backend is the separate project `shield-pro-backend` (Bun + Hono). Its contract is fixed:

- `POST {base}/warranty/activate`, JSON body `{ "serial": "..." }` (`{base}` looks like `https://api.example.com/api/v1`).
- Success 200: `{ "success": true, "message": "...", "data": { "serial", "productName", "warrantyNumber", "activated": true, "activatedAt": ISO, "expiresAt": ISO } }`.
- Errors: `{ "success": false, "error": { "code", "message" } }` with HTTP 400 `VALIDATION_ERROR`, 404 `NOT_FOUND` (serial unknown), 409 `ALREADY_ACTIVATED`, 429 `RATE_LIMITED`, 500 anything else.

## Task W1: Activation through the backend
Files: `app/routes/warranty.tsx`, `twilight.json`, `twilight.preview.json`, `locales/ar.json`, `locales/en.json`.
Why a theme setting and not an env variable: Salla builds the published theme itself, so a gitignored `.env` / `VITE_*` value would not exist there. The merchant (or the user) sets the URL in the Salla dashboard.
Read `/guide/settings` and `/guide/twilight-json` (see the `AGENTS.md` table) before touching `twilight.json`.
Do:
1. Declare a text setting `warranty_api_url` in `twilight.json` (same shape as the existing string settings, e.g. `product_features_title`: `type: "string"`, `format: "text"`, `required: false`, empty `value`, Arabic label such as `رابط خادم الضمان`, and a description that gives the example `https://api.example.com/api/v1`). In `twilight.preview.json` give it the value `http://localhost:3000/api/v1`.
2. In `warranty.tsx` read the URL with `useTheme()` (`settings?.warranty_api_url`, per `AGENTS.md`; no `settings.get()`), strip a trailing `/`, and replace `ACTIVATE_URL` by `POST {base}/warranty/activate`. Pass the base to `activate` (it must not read hooks itself).
3. Use the API's field names directly: change the `Warranty` interface and the `rows` to `warrantyNumber`, `productName`, `activatedAt`, `expiresAt`; read `json.data`. No mapping layer.
4. The DEV design-preview mock stays, but only while the setting is empty (`import.meta.env.DEV && !base`). In production with an empty setting, the page shows the generic error.
5. Error messages by status instead of the single `failed` boolean: 404 -> `pages.warranty.error_not_found`, 409 -> `pages.warranty.error_used`, 429 -> `pages.warranty.error_rate`, anything else (including a network failure) -> the existing `pages.warranty.error`. Keep the same red/gray paragraph element; only its text changes. Add the three keys in BOTH locale files:
   - ar: `الرقم التسلسلي غير موجود، تأكد منه وحاول مرة أخرى.` / `تم تفعيل ضمان هذا الرقم التسلسلي من قبل.` / `محاولات كثيرة، حاول مرة أخرى بعد دقيقة.`
   - en: `Serial number not found. Check it and try again.` / `This serial number has already been activated.` / `Too many attempts. Try again in a minute.`
Do not: change the layout, classes, the success screen design, the route declaration (`createFileRoute as any` stays), or add libraries.
Diff budget: `warranty.tsx` <= 22 added lines, `twilight.json` <= 14, `twilight.preview.json` <= 3, each locale file <= 3.
Acceptance: `pnpm build`, `pnpm typecheck`, `pnpm test`, `pnpm check:manifest` pass. With the backend running locally and seeded (the user does this with `pnpm dev`): `TEST-NEW-003` -> success screen with `WR-003`; the same again -> the "already activated" text; an unknown serial -> "not found"; 11 fast tries -> the "too many attempts" text; with the setting emptied in the preview, the mock approves any serial as before. The user must put the theme dev origin into the backend `CORS_ORIGIN`. Anything that cannot be run: say "not run".

## Task W1b: Tidy Task W1 (behaviour does not change)
Review of W1: the contract, the setting, the error mapping and the locale keys are right. What to tidy in `app/routes/warranty.tsx` only:
1. The `errMsg` nested ternary is one line of about 330 characters. Replace it with a small lookup from the status (`'404'`, `'409'`, `'429'`) to the locale key and its Arabic default, then one `t(...)` call. No added line longer than 140 characters.
2. `(settings as any)?.warranty_api_url` : use `settings?.warranty_api_url` as `AGENTS.md` says (settings is a plain object). If the type really rejects it, keep exactly one cast with a one-line reason.
3. Put the one-line `const now = ..., end = ...; end.setFullYear(...)` and the long `fetch(...)` call on normal lines like the rest of the file (formatting only).
4. `throw new Error()` has an empty message: give it a short message (`'no_api_url'`).
Diff budget: at most +8 lines net. Acceptance: `pnpm build`, `pnpm typecheck`, `pnpm check:manifest` pass and the page behaves exactly as before (same states and messages).

## Task W2: FAQ contact form sends to the backend
Do this after the backend Task 10 exists. Files: `app/routes/faq.tsx`, `locales/ar.json`, `locales/en.json`.
Contract: `POST {base}/contact`, JSON `{ fullName, email, subject, message, website }`, where `{base}` is the SAME theme setting `warranty_api_url` from Task W1 (do not add a second setting). `subject` is the value of the existing select (`general`, `warranty`, `orders`, `support`): send it as is. Success: HTTP 201. Errors: 400 `VALIDATION_ERROR`, 429 `RATE_LIMITED`, anything else.
Do:
1. `handleFormSubmit` becomes async. While the request is running the submit button is disabled. On 201 do exactly what it does today (clear the fields, `submitted` for 4 seconds). On a failure show one text line under the button, styled like the warranty page's error line (`text-danger text-xs`): 429 -> `pages.faq.form_error_rate`, anything else (including a network failure) -> `pages.faq.form_error`.
2. Add a honeypot input named `website`: visually hidden (a `sr-only`-style class that already exists in Tailwind, not `display:none`), `tabIndex={-1}`, `autoComplete="off"`, `aria-hidden`, kept in its own state and sent as `website`.
3. When the setting is empty: in DEV keep today's local-only behaviour (so the design preview still works); in production show the generic error.
4. Add the two keys in BOTH locale files. ar: `تعذر إرسال رسالتك، حاول مرة أخرى.` / `محاولات كثيرة، حاول مرة أخرى بعد دقيقة.` en: `Could not send your message. Please try again.` / `Too many attempts. Try again in a minute.`
Do not: change the layout, classes, the select options, the other texts, or add libraries.
Diff budget: `faq.tsx` <= 28 added lines, each locale file <= 2.
Acceptance: `pnpm build`, `pnpm typecheck`, `pnpm test` pass. With the backend running and the dev origin in its `CORS_ORIGIN` (the user runs `pnpm dev`): a valid submit shows the success state and the message appears in `/admin/messages`; six quick submits end with the "too many attempts" line; filling the hidden field from DevTools still shows success but no row is stored. Anything that cannot be run: say "not run".
