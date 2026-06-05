# Story 6.19 : Export calendrier et navigation lieu (onglet Infos)

Status: done

baseline_commit: 1720092b08a67fdef1124c4613673daa7c1cd415

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

En tant que **membre ou organisateur·ice** consultant le détail événement,  
je veux **exporter le spectacle vers mon agenda personnel** (Google, Outlook, Apple/.ics) et **ouvrir le lieu dans une appli de navigation** (Google Maps, Waze) depuis l’onglet **Infos**,  
afin de **retrouver la parité V1** (menus calendrier + liens maps) sans quitter le détail événement V2.

## Acceptance Criteria

1. **AC-01 — Contrat parent → tab (B1)** — **Given** `app-event-infos-tab` rendu dans [`event-detail.html`](../../apps/web/src/app/pages/event-detail/event-detail.html), **when** le parent charge l’événement, **then** le tab reçoit `troupeSlug` et `seasonSlug` via **`@Input()`** (même convention que [`event-dispos-tab`](../../apps/web/src/app/shared/availability/event-dispos-tab.ts) / [`event-equipe-tab`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.ts)) — **pas** d’injection `ActivatedRoute` dans le tab. [Source: EXPERIENCE.md § Parent → tab data contract ; `.decision-log.md` B1]

2. **AC-02 — Origin testable** — **Given** une action d’export calendrier, **when** les utilitaires construisent l’URL événement, **then** `origin` provient de `inject(DOCUMENT).location.origin` (parent ou tab) et les fonctions pures de [`event-calendar-export.ts`](../../apps/web/src/app/core/events/event-calendar-export.ts) prennent `origin` en paramètre — **jamais** `window.location` en dur dans les utils. [Source: EXPERIENCE.md ; investigation Finding 5]

3. **AC-03 — ICS RFC 5545** — **Given** un export Apple (.ics), **when** le contenu est généré, **then** il respecte RFC 5545 : échappement `\`, `;`, `,`, retours ligne ; pliage lignes **> 75 octets** (`CRLF + SPACE`) ; `UID` = `{event.id}@{hostname}` avec `hostname = new URL(origin).hostname` ; `PRODID:-//HatCast//V2//FR` ; `DTSTART`/`DTEND` en UTC avec suffixe `Z` ; **pas** de champ `X-ALT-DESC`. [Source: EXPERIENCE.md § Calendar export payload ; `.decision-log.md`]

4. **AC-04 — Durée + DST (tests unitaires)** — **Given** `startsAt` ISO UTC depuis l’API, **when** `DTEND` est calculé, **then** fin = **`startsAt + 4 heures`** (arithmétique instant, pas heure locale fixe) ; tests unitaires couvrent au minimum : été (DST), hiver, et passage minuit. [Source: `.decision-log.md` ; investigation Deduction 2]

5. **AC-05 — Tests composant Infos + feedback calendrier** — **Given** [`event-infos-tab.spec.ts`](../../apps/web/src/app/pages/event-detail/event-infos-tab.spec.ts) (à créer), **when** `npm run test --workspace=apps/web` s’exécute, **then** les scénarios couvrent : ouverture menus Date/Lieu ; `window.open` mocké (Google/Outlook/Waze/Maps) ; téléchargement ICS (blob/anchor) ; snackbars succès calendrier (Google / Outlook / ICS selon microcopy) et erreur ; lieu absent vs présent ; date désactivée si `slug` vide ou `startsAt` invalide. **And** après export calendrier réussi, le snackbar FR correspondant du tableau microcopy s’affiche (durée 3,5–4 s). [Source: EXPERIENCE.md AC-05 ; § Voice and Tone]

6. **AC-06 — Popup bloquée** — **Given** un clic menu calendrier ou maps, **when** `window.open` retourne `null`, **then** un `MatSnackBar` affiche *« Ouverture bloquée. Autorisez les pop-ups pour ce site, puis réessayez. »* (distinct du message d’erreur générique calendrier). [Source: EXPERIENCE.md § Voice and Tone]

7. **AC-07 — Logique hors composant** — **Given** l’implémentation, **when** on inspecte le code, **then** construction ICS + URLs Google/Outlook vit dans [`event-calendar-export.ts`](../../apps/web/src/app/core/events/event-calendar-export.ts) (+ [`event-calendar-export.spec.ts`](../../apps/web/src/app/core/events/event-calendar-export.spec.ts)) ; URLs maps dans [`event-maps.ts`](../../apps/web/src/app/core/events/event-maps.ts) (ou même module) — **pas** de logique d’export inline dans le template/composant au-delà du câblage UI. [Source: EXPERIENCE.md § Implementation constraints]

8. **AC-08 — Identifiants ICS** — **Given** un export ICS, **when** le fichier est lu, **then** `PRODID` = `-//HatCast//V2//FR` et `UID` utilise l’`id` événement (UUID API) + hostname de `origin` — **pas** `@impropick.com` ni slug seul. [Source: EXPERIENCE.md ; port V1 `calendarService.js`]

9. **AC-09 — Brouillon (B2)** — **Given** un événement **brouillon** (`availabilityOpenedAt == null` ou état draft équivalent visible côté Infos), **when** l’onglet Infos s’affiche avec date/lieu valides, **then** les menus calendrier et maps restent **actifs** (non grisés) — lien canonique exporté même si inaccessible aux membres avant publication. [Source: `.decision-log.md` B2 ; EXPERIENCE.md § Draft event]

10. **AC-10 — Tooltip lieu** — **Given** un lieu renseigné (texte potentiellement tronqué en CSS), **when** la ligne Lieu interactive est rendue, **then** l’attribut `title` du bouton action porte la **chaîne complète** `event.location`. [Source: EXPERIENCE.md AC-10 ; DESIGN.md § Layout]

11. **AC-11 — Événement passé** — **Given** `startsAt < now`, **when** l’utilisateur déclenche un export calendrier (Google, Outlook ou Apple), **then** l’action s’exécute normalement **et** un snackbar avertit *« Cet événement est passé — l'entrée sera ajoutée dans votre historique de calendrier. »* (affiché à chaque export acceptable). [Source: EXPERIENCE.md § Past event ; `.decision-log.md`]

12. **AC-12 — Mobile affordance + menu + états** — **Given** viewport **375×667** (ou ≤ 480 px), **when** les lignes Date/Lieu sont affichées, **then** (a) fond action row **8 %** `on-surface` vs **6 %** champs read-only Titre/Description (affordance au repos) ; (b) le `mat-menu` maps/calendrier n’est **pas** rogné — `overlayPanelClass` avec `max-height: calc(100dvh - env(safe-area-inset-bottom) - 8px)` si nécessaire ; (c) date **disabled** (`slug` vide ou `startsAt` invalide) : texte atténué, **pas** de chevron, `cursor: default`, pas de menu ; (d) lieu vide : bloc statique sans chevron. [Source: DESIGN.md ; EXPERIENCE.md § Responsive & State Patterns]

13. **AC-13 — Chevron (B3)** — **Given** un menu Date ou Lieu ouvert, **when** l’overlay Material est visible, **then** l’icône trailing `expand_more` sur le bouton trigger est **rotée 180°** (`transform: rotate(180deg)`) et `aria-expanded="true"` ; fermeture restaure rotation et `aria-expanded="false"`. [Source: `.decision-log.md` B3 ; DESIGN.md]

14. **AC-14 — Sécurité URLs maps** — **Given** une URL Google Maps ou Waze construite, **when** le code ouvre un nouvel onglet, **then** l’URL commence par `https://` (assertion avant `window.open`) ; ouverture avec `noopener noreferrer`. [Source: EXPERIENCE.md § External URL patterns ; investigation]

**Couverture produit :** parité V1 Infos (SPEC.md § event full-screen add-to-calendar + maps) ; UX [`EXPERIENCE.md`](../planning-artifacts/ux-designs/ux-hatcast-2026-06-05/EXPERIENCE.md) + [`DESIGN.md`](../planning-artifacts/ux-designs/ux-hatcast-2026-06-05/DESIGN.md) ; investigation [`event-calendar-maps-v1-v2-parity-investigation.md`](investigations/event-calendar-maps-v1-v2-parity-investigation.md).

### Payload calendrier (normatif — complète AC-03/04/08)

| Champ | Règle |
| ----- | ----- |
| Title | `event.title` |
| Start | `startsAt` (instant UTC API) |
| End | `startsAt + 4h` |
| Location | `event.location` si non vide — échappé RFC 5545 |
| Description | (1) `description` ou vide · (2) *Type : {emoji} {label}* via [`getEventTypeIcon`](../../apps/web/src/app/core/events/event-types.ts) / `getEventTypeLabel` · (3) *Détails : {eventUrl}* — `buildEventUrls(origin, troupeSlug, seasonSlug, event.slug).eventUrl` |
| Équipe confirmée | **Omise** (PO) |
| Google `dates=` / Outlook `startdt`/`enddt` | Mêmes instants UTC que ICS |

### Microcopy snackbars (FR — EXPERIENCE.md)

| Action | Message |
| ------ | ------- |
| ICS (navigateur standard) | *Fichier .ics téléchargé. Importez-le dans votre agenda.* |
| ICS (iOS / Safari UA) | *Agenda iOS ouvert pour confirmation.* |
| Google | *Google Calendar ouvert dans un nouvel onglet.* |
| Outlook | *Outlook ouvert dans un nouvel onglet.* |
| Popup bloquée | *Ouverture bloquée. Autorisez les pop-ups pour ce site, puis réessayez.* |
| Erreur calendrier | *Erreur lors de l'ajout au calendrier.* |
| Événement passé | *Cet événement est passé — l'entrée sera ajoutée dans votre historique de calendrier.* |

Durée snackbar : **3500–4000 ms** ; ICS : `politeness: 'assertive'` si supporté.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** les lignes Date/Lieu interactives et leurs menus, **when** l’UI est livrée, **then** utiliser `<button type="button">` + `MatMenuTrigger` + `mat-menu` / `mat-menu-item` ; `mat-icon` (`event`, `place`, `expand_more`) ; menu calendrier avec en-tête *Ajouter à votre agenda :* et items *Google* / *Outlook* / *Apple* ; menu maps *Ouvrir dans Google Maps* / *Ouvrir dans Waze* ; feedback calendrier via `MatSnackBar` — pas de `<div (click)>` ni bouton HTML custom pour le même rôle. [Source: FRONTEND_UI.md ; UX-DR11 ; DESIGN.md ; EXPERIENCE.md § Voice]

**M3-2. Tokens & thème** — **Given** les styles SCSS du tab, **when** couleurs de fond/hover des action rows sont appliquées, **then** `color-mix(in srgb, var(--mat-sys-on-surface) 8%, transparent)` (action) vs **6 %** (read-only) ; chevron `{on-surface}` ; focus ring `var(--mat-sys-primary)` — migrer les `rgba(255,255,255,0.06)` existants des champs Date/Lieu vers tokens si touchés. [Source: DESIGN.md ; FRONTEND_UI.md]

**M3-3. Mobile & tactile** — **Given** viewport **max-width: 480px**, **when** les action rows Date/Lieu sont affichées, **then** hauteur minimale **48px** ; ligne entière + picto cliquables ; boutons trigger : `aria-haspopup="menu"`, `aria-expanded`, `aria-label` français (*« Ajouter à votre agenda »* / *« Ouvrir le lieu dans une appli de navigation »*) ; menu calendrier `aria-label="Options d'agenda"` ; libellés menu visibles (pas d’items icon-only) ; `:focus-visible` ring M3 sur les action rows. [Source: EXPERIENCE.md § Accessibility ; NFR-A1 ; DESIGN.md]

**M3-4. Navigation membre** — **N/A** — pas de modification du chrome global (app bar / rail) ; scope = contenu onglet Infos uniquement.

**M3-5. Revue** — **Given** implémentation terminée, **when** l’agent valide la story, **then** parcourir la checklist § « Checklist M3 HatCast » de [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) et noter les écarts volontaires dans Dev Agent Record ou `ISSUES.md`. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Périmètre :** `apps/web/` uniquement — **pas** de changement `services/api/` ni `legacy/`.
- [x] **AC-01** — Ajouter `@Input()` `troupeSlug` + `seasonSlug` sur [`event-infos-tab.ts`](../../apps/web/src/app/pages/event-detail/event-infos-tab.ts) ; binder dans [`event-detail.html`](../../apps/web/src/app/pages/event-detail/event-detail.html) : `[troupeSlug]="routeTroupeSlug()"` et `[seasonSlug]="slug()"` (miroir Dispos/Équipe).
- [x] **AC-02, AC-03, AC-04, AC-07, AC-08** — Créer [`event-calendar-export.ts`](../../apps/web/src/app/core/events/event-calendar-export.ts) + [`event-calendar-export.spec.ts`](../../apps/web/src/app/core/events/event-calendar-export.spec.ts) : `buildCalendarDescription`, `buildIcsContent`, `buildGoogleCalendarUrl`, `buildOutlookCalendarUrl`, `triggerIcsDownload` ; réutiliser [`buildEventUrls`](../../apps/web/src/app/core/messaging/event-urls.ts) ; port logique depuis [`legacy/src/services/calendarService.js`](../../legacy/src/services/calendarService.js) **sans** équipe confirmée, **sans** `X-ALT-DESC`, **avec** `startsAt` réel + +4h.
- [x] **AC-14** — Créer [`event-maps.ts`](../../apps/web/src/app/core/events/event-maps.ts) (+ tests) : `buildGoogleMapsSearchUrl`, `buildWazeUrl`, garde `https://`.
- [x] **AC-06, AC-09, AC-10, AC-11, AC-12, AC-13, M3-1–M3-3** — Refactor [`event-infos-tab.html`](../../apps/web/src/app/pages/event-detail/event-infos-tab.html) : lignes Date/Lieu en `<button>` + `mat-menu` ; menu calendrier (*Ajouter à votre agenda :* / Google / Outlook / Apple) ; menu maps (*Ouvrir dans Google Maps* / *Ouvrir dans Waze*) ; lieu vide = bloc statique *Non renseigné* ; chevron rotation ; handlers **synchrones** avant `window.open` (pas d’`await` intercalé).
- [x] **AC-12, M3-2** — Mettre à jour [`event-infos-tab.scss`](../../apps/web/src/app/pages/event-detail/event-infos-tab.scss) : classes `event-infos__action-row`, disabled, chevron `--open`, truncate lieu, tokens `color-mix`.
- [x] **AC-05, AC-06, AC-09, AC-11** — Créer [`event-infos-tab.spec.ts`](../../apps/web/src/app/pages/event-detail/event-infos-tab.spec.ts) : spy `window.open`, mock `MatSnackBar`, menus, draft, past event snackbar, popup blocked.
- [x] **Régression** — Exécuter `npm run test --workspace=apps/web` et `ng build` ; vérifier que sections existantes Infos (format, organisateurs, catégorie) ne régressent pas.
- [x] **M3-5** — Self-check checklist FRONTEND_UI.md ; documenter waivers éventuels.

---

## Dev Notes

### Product and UX rules

- **Normatif UX :** [`EXPERIENCE.md`](../planning-artifacts/ux-designs/ux-hatcast-2026-06-05/EXPERIENCE.md), [`DESIGN.md`](../planning-artifacts/ux-designs/ux-hatcast-2026-06-05/DESIGN.md), [`.decision-log.md`](../planning-artifacts/ux-designs/ux-hatcast-2026-06-05/.decision-log.md).
- **Scope surface :** onglet **Infos** uniquement — ne pas modifier header gear, onglets Dispos/Équipe, bannière brouillon.
- **Cible clic (PO) :** ligne entière + picto — un seul `<button>` englobant icône leading, texte, chevron trailing.
- **Liens maps :** externes uniquement — **pas** d’iframe, **pas** de clé Google Maps API (PO 2026-06-05).
- **Événement archivé :** calendrier + maps **restent disponibles** (même sémantique V1 / EXPERIENCE § Archived event).
- **Date row disabled :** si `!event.slug?.trim()` ou `startsAt` non parseable (`Number.isNaN(new Date(startsAt).getTime())`) — pas de menu, pas de chevron (DESIGN `event-infos-action-row-disabled`).
- **Lieu row :** interactive **seulement** si `location` truthy ; sinon copy italique *Non renseigné* sans chevron.
- **Interaction menu :** tap item → menu se ferme → effet de bord (onglet / téléchargement) **dans le même callstack clic** — pas d’`await` avant `window.open` (EXPERIENCE § Interaction Primitives).
- **Maps succès :** pas de snackbar succès obligatoire à l’ouverture maps (V1 = ouverture silencieuse) ; snackbar maps **uniquement** si popup bloquée (AC-06).
- **Titre / Description :** restent read-only — ne pas rendre interactifs (DESIGN § Do's and Don'ts).

### État actuel du code (brownfield)

| Fichier | État aujourd’hui | Delta story |
| ------- | ---------------- | ----------- |
| [`event-infos-tab.html:18-35`](../../apps/web/src/app/pages/event-detail/event-infos-tab.html) | Date/Lieu = `div.event-infos__value--with-icon` read-only | Remplacer par action rows + menus |
| [`event-infos-tab.ts`](../../apps/web/src/app/pages/event-detail/event-infos-tab.ts) | Pas de `troupeSlug`/`seasonSlug` ; pas de `MatMenuModule` | Ajouter inputs + handlers export/maps |
| [`event-detail.html:50-59`](../../apps/web/src/app/pages/event-detail/event-detail.html) | Infos tab sans bindings slug | Ajouter `[troupeSlug]` / `[seasonSlug]` |
| [`event-urls.ts`](../../apps/web/src/app/core/messaging/event-urls.ts) | `buildEventUrls` prêt | Consommer tel quel |
| `legacy/.../calendarService.js` | Référence port V1 | **Ne pas modifier** |

### Port V1 → V2 (calendarService)

Référence : [`legacy/src/services/calendarService.js`](../../legacy/src/services/calendarService.js).

| V1 | V2 (cette story) |
| -- | ---------------- |
| `event.date` + heures 19h–23h | `startsAt` API + **+4h** |
| URL `/season/{seasonSlug}/event/{id}` | `buildEventUrls` → `/saison/{troupeSlug}/{seasonSlug}/event/{eventSlug}` |
| Équipe confirmée dans description | **Omise** |
| `X-ALT-DESC` HTML | **Omis** |
| `UID` `@impropick.com` | `{event.id}@{hostname}` |
| `PRODID` V1 | `-//HatCast//V2//FR` |
| `async` wrappers avant `window.open` | **Sync** dans handler clic (anti popup-blocker) |

**Google Calendar URL :** `https://calendar.google.com/calendar/render?action=TEMPLATE&text=…&dates=START/END&details=…&location=…` — instants `YYYYMMDDTHHmmssZ`.

**Outlook URL :** `https://outlook.live.com/calendar/0/deeplink/compose?subject=…&startdt=…&enddt=…&body=…&location=…` — ISO strings.

**ICS Apple :** Blob `text/calendar` + `<a download>` ; nom fichier `{title_sanitized}_{yyyy-mm-dd}.ics`.

**VALARM -1h :** présent en V1 — **hors scope** EXPERIENCE normatif ; ne pas réintroduire sauf demande PO explicite.

### Maps URL builders

```text
Google Maps: https://www.google.com/maps/search/?api=1&query={encodeURIComponent(location)}
Waze:        https://waze.com/ul?q={encodeURIComponent(location)}
```

Chaîne brute API — pas de géocodage. Qualité de recherche dépend du provider (accepté).

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Material | `MatMenuModule`, `MatMenuTrigger`, `mat-menu`, `mat-menu-item`, `MatSnackBar` |
| Tokens | `color-mix` + `var(--mat-sys-*)` pour action rows (DESIGN.md) |
| Popup blocker | Pas de `await` / `setTimeout` entre clic menu et `window.open` |
| iOS ICS copy | Détection UA iOS/Safari (réutiliser pattern [`pwa-browser-info.ts`](../../apps/web/src/app/core/pwa/pwa-browser-info.ts) si pertinent) |
| Tests | Utils purs testables sans DOM ; composant avec `MatMenu` + `NoopAnimationsModule` |
| Réutilisation | `getEventTypeIcon` / `getEventTypeLabel`, `buildEventUrls`, `formatDate` existant pour affichage |

### Explicit non-goals

| Item | Reason |
| ---- | ------ |
| iframe Google Maps embed | PO — links-only (`.decision-log.md`) |
| `@Input composition` / équipe confirmée dans export | PO — vie privée / bruit |
| `ActivatedRoute` dans `EventInfosTab` | B1 — convention tabs |
| Désactiver menus sur brouillon | B2 — PO veut export organisateur |
| Backend feed calendrier / geocoding | Hors scope front-only |
| Modifier `legacy/` | Story boundary |
| Édition date/lieu depuis picto | Admin garde `EventFormDialog` / gear |
| V1 ICS `CATEGORIES`, `VALARM`, extensions Microsoft (`X-MICROSOFT-*`) | Hors EXPERIENCE normatif — ne pas porter sauf demande PO |

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| **6.2** | done | Shell Infos read-only DATE/LIEU — baseline à étendre |
| **6.1** | done | Badge statut Infos — ne pas déplacer |
| **3.3** | done | Route `/saison/.../event/...` + slugs |
| Investigation calendar/maps | done | Spec input contract |

### Testing requirements

| Layer | What to test |
|-------|----------------|
| Unit `event-calendar-export.spec.ts` | RFC escape/fold ; +4h DST (≥3 cas) ; `UID`/`PRODID` ; description sans équipe ; URL via `buildEventUrls` |
| Unit `event-maps.spec.ts` | Encodage query ; URLs `https://` |
| Component `event-infos-tab.spec.ts` | Menus ; disabled date ; lieu vide ; draft actif ; past snackbar ; popup null ; chevron class |
| Regression | `event-detail.spec.ts` si bindings parent ; `ng build` |

Commande : `npm run test --workspace=apps/web` (ou script monorepo équivalent).

### Previous story intelligence (6.2)

1. Infos tab = composant présentationnel avec `@Input event`, permissions, sections format/orga/catégorie ajoutées depuis — **préserver** ces sections.
2. `formatDate` + `AGENDA_TIME_ZONE` (Europe/Paris) pour **affichage** uniquement ; export calendrier utilise instants UTC API.
3. Kebab admin (Modifier/Archiver) était dans 6.2 initial — a migré vers header/gear ; ne pas confondre avec action rows Date/Lieu.

### Git intelligence

- Pattern snackbar + `MatMenu` : voir [`event-detail-header`](../../apps/web/src/app/pages/event-detail/event-detail-header.ts), gear menus saison.
- Slugs parent : [`event-detail.ts`](../../apps/web/src/app/pages/event-detail/event-detail.ts) expose `routeTroupeSlug()` et `slug()` — même source que Dispos/Équipe.

### References

- [SPEC.md](../../SPEC.md) — Infos add-to-calendar + maps
- [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) — checklist M3
- [Story 6.2](6-2-detail-evenement-plein-ecran-onglets-infos-dispos-equipe.md) — baseline Infos
- [Investigation](investigations/event-calendar-maps-v1-v2-parity-investigation.md)

## Dev Agent Record

### Agent Model Used

Composer (dev-story 6.19)

### Completion Notes List

- **AC-01–AC-14 / M3-1–M3-3 :** Utils `event-calendar-export.ts` (ICS RFC 5545, Google/Outlook URLs, +4h UTC, `PRODID`/`UID` V2) et `event-maps.ts` (Google Maps / Waze HTTPS). Onglet Infos : action rows Date/Lieu avec `mat-menu`, `@Input troupeSlug/seasonSlug`, snackbars FR, popup bloquée, événement passé, brouillon actif, chevron rotation, tokens `color-mix`.
- **Tests :** 35 tests ciblés passent (`event-calendar-export`, `event-maps`, `event-infos-tab`). `ng build -w @hatcast/web` OK.
- **M3-5 checklist :** Composants Material (`button`, `mat-menu`, `MatSnackBar`) — OK. Tokens `color-mix` + `--mat-sys-*` sur action rows — OK. Mobile 48px, aria FR, focus ring — OK. **Waiver :** `::ng-deep` sur `.event-infos__menu-panel` pour `max-height` safe-area (pattern overlay similaire ailleurs dans le repo ; pas de `panelClass` global ajouté dans `styles.scss`).

### File List

**NEW**

- `apps/web/src/app/core/events/event-calendar-export.ts`
- `apps/web/src/app/core/events/event-calendar-export.spec.ts`
- `apps/web/src/app/core/events/event-maps.ts`
- `apps/web/src/app/core/events/event-maps.spec.ts`
- `apps/web/src/app/pages/event-detail/event-infos-tab.spec.ts`

**UPDATE**

- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/6-19-export-calendrier-et-navigation-lieu-onglet-infos.md`
- `apps/web/src/app/pages/event-detail/event-infos-tab.ts`
- `apps/web/src/app/pages/event-detail/event-infos-tab.html`
- `apps/web/src/app/pages/event-detail/event-infos-tab.scss`
- `apps/web/src/app/pages/event-detail/event-detail.html`

### Change Log

- 2026-06-05 : Story 6.19 créée — parité V1 export calendrier + navigation lieu onglet Infos.
- 2026-06-05 : Implémentation dev-story — utils calendrier/maps, refactor onglet Infos, tests unitaires + composant, build OK.
- 2026-06-05 : Code review — snackbar passé combiné (A), assertive ICS iOS, 3 tests ajoutés/corrigés ; 37 tests OK.

### Review Findings

- [x] [Review][Decision] Snackbars événement passé — **Résolu (A)** : message combiné succès + avertissement passé dans un seul `MatSnackBar.open()`.

- [x] [Review][Patch] Politeness ICS iOS non assertive [`event-infos-tab.ts:382`] — `assertive` pour `icsDownload` et `icsIos`.

- [x] [Review][Patch] Test snackbar erreur calendrier manquant [`event-infos-tab.spec.ts`] — scénario `openExternalUrl` throw ajouté.

- [x] [Review][Patch] Test chevron menu Lieu manquant [`event-infos-tab.spec.ts`] — `onMapsMenuOpened/Closed` + `aria-expanded` testés.

- [x] [Review][Defer] `::ng-deep` pour `max-height` menu mobile [`event-infos-tab.scss:104-106`] — deferred, waiver documenté M3-5 ; pattern overlay similaire ailleurs dans le repo.

---

### Validation create-story

- [x] AC métier numérotés AC-01…AC-14 et sourcés (EXPERIENCE, SPEC, investigation, decision-log)
- [x] Section **Material 3** remplie (M3-1…M3-5 ; M3-4 N/A explicite)
- [x] Tasks référencent les numéros d’AC (y compris M3-x)
- [x] Liens vers fichiers code existants à réutiliser / modifier
- [x] `npm run test --workspace=apps/web` + `ng build` mentionnés

**Validate pass (2026-06-05) — gaps corrigés vs EXPERIENCE/DESIGN :** snackbars succès calendrier (AC-05) ; états disabled/empty (AC-12) ; libellés menus (M3-1) ; a11y `aria-haspopup` (M3-3) ; callstack sync + maps sans snackbar succès (Dev Notes) ; extensions ICS V1 exclues (non-goals).
