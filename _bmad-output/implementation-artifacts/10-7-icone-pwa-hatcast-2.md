---
baseline_commit: 4b8dc64e
---

# Story 10.7: HatCast 2 PWA icon set

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **HatCast user migrating from V1 to V2**,
I want a **distinct, modern PWA icon** on my home screen that still feels like HatCast,
so that I can **recognize the new app at a glance** and trust I am on the V2 client (Wave V2.0.0 cutover signal).

## Acceptance Criteria

1. **Given** the V2 production build, **when** a user installs or adds the PWA, **then** the home-screen icon is **visually distinct from the V1 PWA** (currently blue-themed `#0ea5e9` legacy assets copied in Story 10.1) while remaining **recognizably HatCast** (same core motif: top hat / brand silhouette — not a unrelated glyph) (SCP V2.0.0 §10.7 ; FR40 visual identity).
2. **Given** the V2 Material 3 theme in [`apps/web/src/styles.scss`](../../apps/web/src/styles.scss), **when** the icon palette is applied, **then** primary branding uses **M3 violet** (`mat.$violet-palette` → manifest `theme_color` **`#6750A4`**) with optional **tertiary orange** accent (`mat.$orange-palette`) — **not** V1 sky blue `#0ea5e9` (Sally UX brief below).
3. **Given** [`apps/web/public/manifest.webmanifest`](../../apps/web/public/manifest.webmanifest) and [`apps/web/src/index.html`](../../apps/web/src/index.html), **when** auditors or Lighthouse run, **then** all referenced icon paths resolve and include at minimum:
   - `manifest-icon-192.maskable.png` (192×192)
   - `manifest-icon-512.maskable.png` (512×512)
   - `apple-icon-180.png` (180×180)
   - `favicon.ico`, `favicon.svg`, `icon-48x48.png`, `mstile-150x150.png`
   - `theme_color` `#6750A4`, `background_color` `#FFFBFE` (unchanged unless Sally brief specifies a branded maskable fill — document choice)
4. **Given** [W3C maskable icon safe zone](https://www.w3.org/TR/appmanifest/#icon-masks-and-safe-zone) and [web.dev maskable guidance](https://web.dev/articles/maskable-icon), **when** maskable PNGs are inspected (Chrome DevTools → Application → Icons → *Show only the minimum safe area*, or [maskable.app](https://maskable.app)), **then** **all critical logo elements** (hat silhouette, face if present) sit inside the **central 80% diameter circle** (radius = 40% of icon size) — no clipping on Android adaptive shapes.
5. **Given** web.dev recommendation, **when** manifest icons are declared, **then** provide **separate entries** for `"purpose": "any"` (transparent favicon-style, no extra padding) and `"purpose": "maskable"` (full-bleed background fill) **or** document a single `"any maskable"` entry only if visual QA on Android/iOS confirms no undersized glyph — prefer **split purposes** for 192 and 512 (AC4 + latest PWA best practice).
6. **Given** a **version-controlled source asset** `apps/web/public/icons/logo-hatcast-2.svg` (or `apps/web/assets/branding/logo-hatcast-2.svg` copied at build — prefer `public/icons/` for simplicity), **when** PNG derivatives are regenerated, **then** [`scripts/generate-icons.sh`](../../scripts/generate-icons.sh) supports a **V2 target** (e.g. `--target apps/web` + `--source apps/web/public/icons/logo-hatcast-2.svg`) without overwriting `legacy/public/icons/` (do not mutate V1 production assets).
7. **Given** Story **10.4** recette scope, **when** this story ships, **then** `ngsw-config.json` already precaches `/icons/**` — replacing files is sufficient; no SW logic change unless filenames change (if filenames change, update manifest + `index.html` + `pwa-manifest.spec.ts` in same PR).
8. **Given** implementation complete, **when** tests run, **then** extend [`pwa-manifest.spec.ts`](../../apps/web/src/app/core/pwa/pwa-manifest.spec.ts) (or add `pwa-icons.spec.ts`) to assert required icon files exist under `apps/web/public/icons/` and manifest declares 192 + 512; `npm run build -w @hatcast/web -- --configuration production` succeeds; manual smoke: production HTTPS build → DevTools Application → Manifest + Icons preview.

**Product coverage:** Epic 10 / Wave V2.0.0 (SCP 2026-06-02) ; complements **10.1** (installability), **10.4** (recette) ; **not** FR41.

**In-app logo (added by PO 2026-06-02):** the HatCast 2 mask (`/icons/logo-hatcast-2.svg`) also replaces the brand mark on the **login screen**, appears in the **Mon compte → À propos** version button, and is shown **right-aligned next to the « Nouveautés » dialog title**.

**Out of scope:** member/admin header & toolbar chrome logo (separate brand story) ; splash screens ; notification badge icon ; Play Store / App Store assets ; animated icons ; changing `short_name` / `name` in manifest.

---

## Acceptance Criteria — Material 3 (UI)

**UI scope:** brand assets + manifest meta — **no new Angular screens**. Adapt checklist to visual/theming rules.

**M3-1. Composants Material** — **N/A** — no `apps/web` UI components in this story.

**M3-2. Tokens & thème (brand)** — **Given** icon and manifest colors, **when** choosing fills and accents, **then** map explicitly to the V2 M3 theme defined in `styles.scss`:
  - Primary / chrome: **`#6750A4`** (`--mat-sys-primary` light baseline)
  - Surface / maskable background option: **`#FFFBFE`** (`--mat-sys-surface` light) or **`#EADDFF`** (primary container tone) — pick one in Sally brief and use consistently on maskable full-bleed icons
  - Tertiary accent (optional highlight on hat band, sparkle, etc.): orange palette stop compatible with `--mat-sys-tertiary` — avoid V1 cyan `#0ea5e9` and ad-hoc purple `#9333ea`
  - Document chosen hex values in Dev Agent Record (manifest meta is an **allowed** hex exception per FRONTEND_UI.md)

**M3-3. Legibility at small sizes** — **Given** 48×48 and 192×192 renders, **when** viewed on a home screen, **then** silhouette reads clearly without text labels ; avoid fine lines &lt; 2px at 512 canvas scale.

**M3-4. Navigation membre** — **N/A**.

**M3-5. Revue** — **Given** final PNG/SVG set, **when** validating, **then** compare side-by-side with legacy V1 icon on the same device ; confirm distinct at thumbnail size ; note any waived safe-zone trade-offs in Dev Agent Record.

---

## UX Design Brief — Sally (Material 3–aligned, HatCast 2)

> **Author:** Sally (UX Designer) — consulted [docs/v2/technical/FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) M3 theming + [Material color roles](https://m3.material.io/styles/color/roles) ; PO direction: *reconnaissable, modernisé, distinct, aligné thème V2*.

### Design intent

| Dimension | V1 (legacy PWA) | HatCast 2 (this story) |
|-----------|-----------------|-------------------------|
| **Recognition** | Top-hat mascot, playful | **Keep** top-hat + friendly face silhouette — users must spot HatCast instantly |
| **Color story** | Sky blue `#0ea5e9`, lighter cyan feel | **M3 violet primary** `#6750A4` dominant ; subtle **orange tertiary** accent (hat band / cheek / star) — signals V2 without breaking brand |
| **Style** | Flat / soft gradient, white surround | **Modernized:** cleaner geometry, slightly bolder shapes, restrained depth (soft gradient or single shadow **inside** safe zone only) |
| **Distinctness** | Blue icon on home screen | **Violet-forward** icon — side-by-side with V1, users can tell which is « new » |
| **M3 alignment** | Pre-M3 palette | Treat icon as **product avatar**: primary container / on-primary contrast per M3 pairing (violet + near-white face details) |

### Material 3 preconisations applied to app icons

1. **Color roles, not random hex** — derive fills from the same `mat.$violet-palette` + `mat.$orange-palette` as `styles.scss` ; manifest `theme_color` stays `#6750A4` for OS chrome consistency.
2. **Adaptive / maskable** — full-bleed square with **opaque** background (no transparency on maskable PNGs) ; logo glyph centered within **80% safe circle** ; verify circle/squircle/rounded-square masks.
3. **Separate `any` vs `maskable` assets** — favicon/`any`: tight crop, transparent OK ; maskable: intentional padding + background fill (web.dev: do not reuse `any` asset for maskable — avoids tiny glyph on Android).
4. **No text « 2 » in the icon** — distinction via **color + refinement** ; text fails at 48px.
5. **Dark mode consideration (nice-to-have)** — if time permits, optional `logo-hatcast-2-dark.svg` variant for future `media (prefers-color-scheme: dark)` favicon — **not required** for AC pass.

### Reference assets

- **V1 source (do not ship):** [`legacy/logo.svg`](../../legacy/logo.svg), [`legacy/public/icons/`](../../legacy/public/icons/) — reference silhouette only ; file may embed raster (large) ; prefer **tracing/redrawing** a clean vector for V2.
- **V2 current (V1 copy):** [`apps/web/public/icons/`](../../apps/web/public/icons/) — **replace entirely** in this story.
- **Theme anchor:** [`apps/web/src/styles.scss`](../../apps/web/src/styles.scss) lines 13–21 (`mat.$violet-palette`, `mat.$orange-palette`).

### Deliverables (UX)

- [x] `logo-hatcast-2.svg` — master vector (512 viewBox recommended)
- [x] Export sheet or Figma-free PNG preview in PR description (before/after V1 vs V2)
- [x] Short rationale in Dev Agent Record: what changed (color, stroke weight, expression) and why it stays on-brand

---

## Tasks / Subtasks

- [x] **Design source asset (AC: 1–2, Sally brief)** — `apps/web/public/icons/logo-hatcast-2.svg`
  - [x] Redraw / modernize from legacy motif ; violet + optional orange accent ; no V1 blue
  - [x] PO visual checkpoint (screenshot side-by-side V1 vs V2 on mock home screen)

- [x] **Generate PNG / ICO set (AC: 3–4, 6)**
  - [x] Extend `scripts/generate-icons.sh` with `--target apps/web` and configurable `--source` (default `logo-hatcast-2.svg` under target `public/icons/`)
  - [x] Regenerate all files under `apps/web/public/icons/` (maskable 192/512 with safe-zone padding per script or updated padding constants)
  - [x] Produce separate `icon-192.png` / `icon-512.png` with `purpose: any` if split manifest entries (AC5)

- [x] **Wire manifest + HTML meta (AC: 3, 5)**
  - [x] Update `apps/web/public/manifest.webmanifest` icon entries (`any` + `maskable` if split)
  - [x] Confirm `index.html` links (`favicon`, `apple-touch-icon`, `msapplication-TileImage`) point to new files
  - [x] Keep `theme_color` `#6750A4`, `background_color` `#FFFBFE` unless maskable fill requires documented tweak

- [x] **QA maskable & platform (AC: 4, 8)**
  - [x] Chrome DevTools → Application → Manifest → Icons safe-area preview
  - [ ] Optional: [maskable.app](https://maskable.app) upload 512 maskable
  - [ ] Manual: Android Chrome install + iOS Add to Home Screen thumbnail check

- [x] **Tests & build (AC: 8)**
  - [x] Extend `pwa-manifest.spec.ts` or add `pwa-icons.spec.ts` — file existence + manifest sizes
  - [x] `npm run test -w @hatcast/web -- --watch=false`
  - [x] `npm run build -w @hatcast/web -- --configuration production` — verify `dist/web/browser/icons/*` + manifest

---

## Dev Notes

### Scope boundaries

| In scope (10.7) | Out of scope |
|-----------------|--------------|
| Replace `apps/web/public/icons/**` with HatCast 2 set | `legacy/` icon changes |
| Source SVG in repo + generation script V2 target | Header in-app logo component |
| Manifest + `index.html` icon links | **10.4** full recette checklist (this story feeds it) |
| Maskable safe-zone validation | OPS-6 version/changelog pipeline |
| Vitest file/manifest contract tests | Playwright visual regression (optional follow-up) |

### Current state (Story 10.1 baseline)

Story **10.1** copied **V1 icons verbatim** from `legacy/public/icons/` and set V2 manifest `theme_color` to `#6750A4` while icons still show **V1 blue artwork** — visual mismatch and no V1/V2 distinction on home screens. **10.7 fixes the artwork** to match the M3 theme already wired in manifest meta.

### Manifest contract (extend, do not break)

Current [`manifest.webmanifest`](../../apps/web/public/manifest.webmanifest):

```json
{
  "theme_color": "#6750A4",
  "background_color": "#FFFBFE",
  "icons": [
    { "src": "/icons/manifest-icon-192.maskable.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/manifest-icon-512.maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

**Recommended improvement (AC5):**

```json
"icons": [
  { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
  { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
  { "src": "/icons/manifest-icon-192.maskable.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
  { "src": "/icons/manifest-icon-512.maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
]
```

Update [`pwa-manifest.spec.ts`](../../apps/web/src/app/core/pwa/pwa-manifest.spec.ts) `MANIFEST_CONTRACT` accordingly if manifest structure changes.

### Icon generation script

[`scripts/generate-icons.sh`](../../scripts/generate-icons.sh) today:

- Expects `logo.svg` in **cwd** (legacy workflow)
- Writes to `public/icons/` (legacy paths)
- Uses Inkscape + ImageMagick ; maskable padding hard-coded (512 → 12px padding, 25px vertical offset)

**Required changes:**

1. Parse `--target apps/web` → output to `apps/web/public/icons/`
2. Parse `--source path/to/logo-hatcast-2.svg`
3. Do **not** run legacy target without explicit flag (avoid accidental V1 overwrite)
4. Re-tune padding/vertical offset for new artwork after visual QA

Prerequisites (document in PR if missing): `brew install inkscape imagemagick`

### Service worker / deploy

[`ngsw-config.json`](../../apps/web/ngsw-config.json) asset group already includes `/icons/**` with `updateMode: prefetch` — new icons ship on next deploy + user update (Story 10.2). No code change unless paths change.

Docker/nginx: static icons served from bundle root — unchanged from 10.1.

### Architecture compliance

- **Stack:** Static assets under `apps/web/public/` → production bundle ([`architecture.md`](../../_bmad-output/planning-artifacts/architecture.md) § Frontend Architecture).
- **PWA FR40:** Installability unchanged ; icon quality supports user trust at V2.0.0 cutover.
- **Do not modify `legacy/`** — V1 production keeps its blue icon until decommissioned.
- **NFR-R1:** Icons ship in same coupled Docker image as API.

### Implementation guardrails

- **Do not** reuse V1 `#0ea5e9` as dominant icon color.
- **Do not** embed multi-MB raster inside SVG (legacy `logo.svg` problem) — clean vector only.
- **Do not** put essential details outside maskable safe zone.
- **Do not** change `short_name` / app `name` unless PO explicitly requests (out of scope).
- **Do not** break Story 10.1 install tests — update icon path assertions only.
- **Prefer** split `any` / `maskable` over combined `"any maskable"` unless QA proves equivalent.

### Previous story intelligence

| Story | Relevance |
|-------|-----------|
| **10.1** | Established manifest paths, icon filenames, `theme_color` `#6750A4`, Vitest manifest contract |
| **10.2** | Icons update via SW prefetch after deploy — users need **Mettre à jour** to see new icon on some platforms (document in QA) |
| **10.3** | No icon dependency ; version/changelog separate |
| **10.4** (backlog) | Will recette full PWA stack — **10.7** should land **before or with** 10.4 audit |

### Git intelligence

Recent Epic 10 commits:

- `feat(web): Add version and changelog on account` — 10.3 pattern: `public/` assets, Vitest contracts, French UX elsewhere
- `feat(web): Add PWA update banner on user action` — 10.2 ; shared PWA infra stable
- Follow: asset files in `apps/web/public/`, colocated specs, conventional commit `feat(web): Refresh PWA icons for HatCast 2 brand`

### Testing standards

```bash
npm run test -w @hatcast/web -- --watch=false
npm run build -w @hatcast/web -- --configuration production
# Manual: Chrome DevTools → Application → Manifest + Icons (safe area)
# Manual: install PWA on Android + iOS home screen thumbnail
# Optional: ./scripts/check-pwa.sh with BASE_URL=<staging V2 HTTPS> after 10.4
```

Suggested automated checks:

- Glob assert: required PNG/ICO/SVG exist under `apps/web/public/icons/`
- Manifest JSON parse test (read file from disk in Vitest, like future 10.4 recette)
- Optional: checksum snapshot to detect accidental icon regression

### Project structure (expected touch list)

- `apps/web/public/icons/logo-hatcast-2.svg` **(new master)**
- `apps/web/public/icons/*.png`, `favicon.ico`, `favicon.svg` **(regenerated)**
- `apps/web/public/manifest.webmanifest` **(icon entries)**
- `apps/web/src/index.html` **(only if filenames change)**
- `scripts/generate-icons.sh` **(V2 target flags)**
- `apps/web/src/app/core/pwa/pwa-manifest.spec.ts` or `pwa-icons.spec.ts` **(tests)**

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| 10.1 | done | Provides manifest/SW baseline — **replace icons** |
| 10.2 | done | SW delivers updated icons after user update |
| 10.4 | backlog | Recette validates this story output |
| OPS-6 | backlog | No blocker for icons |

### Latest technical information (PWA icons)

- **Maskable safe zone:** central circle, radius = **40%** of min(width,height) — [W3C App Manifest §2.3](https://www.w3.org/TR/appmanifest/#icon-masks-and-safe-zone)
- **Split purposes:** web.dev recommends **separate** `any` and `maskable` assets — combined `"any maskable"` adds padding and shrinks glyph on some launchers
- **Opaque maskable backgrounds:** transparent maskable icons get composited onto arbitrary OS fill — prefer explicit `#FFFBFE` or `#6750A4` background
- **Validation tools:** Chrome DevTools Application panel ; [maskable.app/editor](https://maskable.app/editor)

### Project context reference

- [project-context.md](../../project-context.md) — Angular 21.2, M3 tokens, `apps/web/` target
- [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) — M3 checklist ; hex allowed in global theme/manifest
- [PLAN.md](../../PLAN.md) § Wave V2.0.0 — **10.7** P0 with **10.4** / **10.2** / **10.3**

---

## Dev Agent Record

### Agent Model Used

Composer

### Completion Notes List

- **Brand refresh:** Clean vector `logo-hatcast-2.svg` — **single continuous comedy-mask silhouette** (faithful to V1, no separated ears) + smiling closed eyes + wide grin + orange checkmark, M3 violet gradient (`#A974F0` → `#7E57C2` → `#6750A4`), tertiary accent `#FF9800` on checkmark.
- **Redesign note (PO feedback 2026-06-02):** First attempt split the mask into ears + shield → read as a monkey face. Redrawn as one smooth mask shape matching the V1 logo provided by PO.
- **Maskable:** Full-bleed background `#EADDFF` (primary container) ; ~18% inset keeps glyph inside W3C safe zone.
- **Manifest:** Split `purpose: any` (`icon-192/512.png`, transparent) + `purpose: maskable` (dedicated PNGs).
- **Script:** `scripts/generate-icons.sh --target apps/web` ; legacy path preserved via `--target legacy`.
- **Tests:** 863/863 Vitest ; production build OK ; `dist/web/browser/icons/` verified.
- **Design iterations (PO feedback):** Final mask = single continuous comedy-mask silhouette with **gentle concave top** (two soft "imp horn" peaks evoking *La Malice*), **bolder smiling closed eyes** + **open laughing mouth** (hearty laugh, not a beta squint), pointy chin kept. M3 violet gradient `#A974F0` → `#7E57C2` → `#6750A4`, orange checkmark `#FF9800`. No tongue / pupils / eyebrows (don't survive small resolution).
- **In-app logo wiring (PO add):** login brand mark unified (single themeable lockup, replaces light/dark `theater_comedy` + `/brand/hatcast-logo.svg`), version button in « À propos », right-aligned logo in « Nouveautés » dialog title. Removed now-unused `MatIconModule` from `Login`.
- **Manual QA deferred:** maskable.app upload ; real device install (PO recette with Story 10.4).

### File List

- apps/web/public/icons/logo-hatcast-2.svg
- apps/web/public/icons/favicon-hatcast-2.svg
- apps/web/public/icons/favicon-48.png
- apps/web/public/icons/icon-192.png
- apps/web/public/icons/icon-512.png
- apps/web/public/icons/manifest-icon-192.maskable.png
- apps/web/public/icons/manifest-icon-512.maskable.png
- apps/web/public/icons/apple-icon-180.png
- apps/web/public/icons/favicon.ico
- apps/web/public/icons/favicon.svg
- apps/web/public/icons/favicon-16.png
- apps/web/public/icons/favicon-32.png
- apps/web/public/icons/icon-48x48.png
- apps/web/public/icons/mstile-150x150.png
- apps/web/public/favicon.ico
- apps/web/public/manifest.webmanifest
- apps/web/src/index.html
- scripts/generate-icons.sh
- apps/web/src/app/core/pwa/pwa-icons.spec.ts
- apps/web/src/app/core/pwa/pwa-manifest.spec.ts
- apps/web/src/app/pages/login/login.html
- apps/web/src/app/pages/login/login.scss
- apps/web/src/app/pages/login/login.ts
- apps/web/src/app/pages/account-placeholder/account-placeholder.html
- apps/web/src/app/pages/account-placeholder/account-placeholder.scss
- apps/web/src/app/shared/changelog/changelog-dialog/changelog-dialog.html
- apps/web/src/app/shared/changelog/changelog-dialog/changelog-dialog.scss

### Change Log

- 2026-06-02: Story 10.7 created — HatCast 2 PWA icon set with Sally M3 UX brief and V2 theme alignment.
- 2026-06-02: Implemented HatCast 2 icon set — SVG master, PNG derivatives, manifest split any/maskable, generate-icons V2 target, Vitest contracts.
- 2026-06-02: PO design iterations (concave mask top, bolder eyes, laughing mouth) + in-app logo wiring (login, account « À propos », changelog dialog).
- 2026-06-02: Dedicated favicon source `favicon-hatcast-2.svg` (tightly cropped, flat fill, bold features, no checkmark) for 16/32px sharpness ; `favicon.svg`/`.ico` now generated from it (app icons keep gradient + checkmark).
- 2026-06-02: `index.html` favicon order fixed — SVG declared first, `.ico` marked `sizes="32x32"` (fallback only) so browsers render the crisp vector favicon instead of the anti-aliased raster (V1 parity).
- 2026-06-02: Favicon refined (PO) — frame-filling crop, more saturated violet `#7A4FD0`, bolder eyes/mouth, **orange checkmark reintroduced** (bottom-right over the violet so it reads at 16/32px without bleeding into the white). Favicons regenerated.
- 2026-06-02: Favicon — GitHub-style **detached status badge** (white halo + orange disc + white check) replaces the inline checkmark so the validation accent stays legible and visually separated from the mask at 16/32px. Favicons regenerated.
- 2026-06-02: **Detached badge unified across the whole icon set** (PO: "le plus abouti, à appliquer partout") — master `logo-hatcast-2.svg` now uses the detached badge instead of the inline checkmark; large icons keep the violet gradient, favicon stays flat for 16px sharpness. All app/maskable/Apple/Windows icons + in-app logo (login, account, changelog) regenerated/inherit the new design.
- 2026-06-02: In-app logo enlarged for legibility (PO) — account « À propos » button 1.25rem → 2rem, changelog dialog 2rem → 3rem.
- 2026-06-02: Code review patches — tests lisent manifest/fichiers réels (`pwa-icons.spec.ts` + `vitest-node.d.ts`), snippet install → `logo-hatcast-2.svg`, dimensions SVG in-app, a11y login, mstile fond `#EADDFF`, icônes régénérées.

### Review Findings

- [x] [Review][Patch] Tests PWA tautologiques — `pwa-icons.spec.ts` duplique le manifest et la liste de fichiers en constantes sans lire `manifest.webmanifest` ni vérifier l’existence sur disque ; une régression passerait au vert (AC8). [`apps/web/src/app/core/pwa/pwa-icons.spec.ts`:7-77]
- [x] [Review][Patch] Snippet d’installation PWA obsolète — `pwa-install-instructions.ts` référence encore `/icons/icon-48x48.png` alors que la bannière et le login utilisent `logo-hatcast-2.svg`. [`apps/web/src/app/core/pwa/pwa-install-instructions.ts`:21]
- [x] [Review][Patch] Dimensions SVG manquantes sur logos in-app — `<img>` login, compte et changelog sans `width`/`height` HTML (intrinsèque 512×512 → risque CLS/flash au premier paint) ; `pwa-system-banner` le fait correctement. [`login.html`:7, `account-placeholder.html`:180, `changelog-dialog.html`:3]
- [x] [Review][Patch] `REQUIRED_ICON_FILES` incomplet — n’inclut pas `favicon-hatcast-2.svg` ni `favicon-16.png`/`favicon-32.png` produits par le script. [`pwa-icons.spec.ts`:26-37]
- [x] [Review][Patch] Accessibilité login — `role="img" aria-label="HatCast"` englobe un `<span>HatCast</span>` non masqué → double annonce possible sur lecteurs d’écran. [`login.html`:6-8]
- [x] [Review][Patch] Tuile Windows incohérente — `mstile-150x150.png` généré sans fond `#EADDFF` contrairement à `apple-icon-180.png`. [`scripts/generate-icons.sh`:162]
- [x] [Review][Defer] QA maskable manuelle (DevTools safe area, maskable.app, devices) — explicitement reportée à Story 10.4 ; calcul script 18 % plausible. [AC4, M3-5]
- [x] [Review][Defer] Cache SW/OS des anciennes icônes jusqu’à « Mettre à jour » ou réinstallation — comportement connu Story 10.2, hors scope correctif 10.7.
- [x] [Review][Defer] Script `generate-icons.sh` zsh-only — convention repo existante, documentée en en-tête.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR / SCP V2.0.0)
- [x] Section **Material 3** adaptée au scope brand/assets (M3-1 N/A, M3-2 brand tokens)
- [x] Tasks référencent les numéros d'AC (y compris M3-2, M3-3, M3-5)
- [x] Liens vers fichiers code existants à réutiliser / remplacer
- [x] `npm run test` / production build mentionnés
