# Story 5.6 : Onglet Dispos — alignement Material 3 et commentaire (FR18)

Status: done

<!-- Contexte : revue M3 2026-05-27 — ux-design-hatcast-v2.md § revue-m3-onglet-dispos -->

## Story

En tant que **membre ou organisateur** sur le détail spectacle,  
je veux un **onglet Dispos** conforme **Material 3** (tokens, composants standards, modes clair/sombre) **et** pouvoir saisir un **commentaire optionnel** sur ma disponibilité,  
afin d’avoir une interface **cohérente**, **accessible** et **alignée** avec la spec UX et **FR18** / **FR19**.

## Acceptance Criteria

1. **Given** j’ouvre l’onglet **Dispos** (`?tab=dispos`), **when** la vue **Tous** s’affiche, **then** les **pourcentages de chance** sont **visibles par défaut** pour chaque candidat (pas d’état initial « sans % ») — pendant le chargement API, un **skeleton** ou indicateur de chargement inline remplace le % — **FR19**, [ux-design — revue M3](../planning-artifacts/ux-design-hatcast-v2.md#revue-m3-onglet-dispos).
2. **Given** le premier chargement de l’onglet en mode **Tous**, **when** l’API est appelée, **then** `GET …/availability/summary` utilise **`includeChances=true`** (ou équivalent livrant `chancePercent` sans second clic utilisateur) — **FR19** ; si perf inacceptable, documenter l’écart dans Dev Notes + entrée **G-003**, ne pas réintroduire un état vide par défaut.
3. **Given** les styles de l’onglet Dispos (`event-dispos-tab`, `availability-form`, `availability-tous-panel`, `availability-subject-selector`), **when** une couleur ou un fond est appliqué, **then** **aucun** `#rrggbb` / `rgb()` / `rgba(…)` ad hoc dans ces fichiers — uniquement `var(--mat-sys-*)`, `var(--hatcast-availability-*)`, `var(--hatcast-chance-*)` définis dans [`styles.scss`](../../apps/web/src/styles.scss) — **UX-DR11**.
4. **Given** la vue **Tous**, **when** je parcours les rôles, **then** chaque rôle est un **`mat-expansion-panel`** (ou `mat-accordion` équivalent) avec en-tête **icône/emoji + libellé FR + ratio `(candidats/places)`** et chevron **`mat-icon`** — pas de `<button>` accordéon custom avec ▶/▼ texte.
5. **Given** des candidats dans un rôle, **when** la liste s’affiche, **then** elle utilise **`mat-nav-list`** ou **`mat-list`** (`matListItemAvatar`, meta pour le %) — pas de grille de `<button class="availability-tous__person">` custom — **UX-DR11**.
6. **Given** le panneau **Moi** (ou la [modal disponibilité](../planning-artifacts/ux-design-hatcast-v2.md#pattern-availability-modal-overlay)), **when** je choisis mon statut, **then** les **trois états exclusifs** utilisent **`mat-button-toggle-group`** (3 toggles) **ou** `mat-chip-listbox` single-selection — pas trois `mat-flat-button` avec fond vert/rouge/gris en dur — sémantique inchangée (**Dispo** / **Pas dispo** / **Non renseigné**).
7. **Given** le toggle **Moi / Tous**, **when** un mode est actif, **then** le style sélectionné repose sur **`--mat-sys-primary-container`** / **`--mat-sys-on-primary-container`** — pas `rgba(147, 51, 234, …)` — **UX-DR11**.
8. **Given** je suis le participant lié (sujet = moi), **when** le formulaire est éditable, **then** je vois **« Commentaire (optionnel) »** + **`mat-form-field` textarea** ; sauvegarde **immédiate** (même modèle que statut/rôles) ; texte **≤ 500** caractères — **FR18** (couvre epic story **5.4**).
9. **Given** un commentaire **> 500** caractères, **when** je tente d’enregistrer, **then** message d’erreur **français** et pas de persistance — **FR18**.
10. **Given** un **organisateur** consulte le **Moi** d’un **autre** sujet, **when** lecture seule, **then** le commentaire existant est **affiché** en lecture seule (sans proxy). En **mode proxy** (5.5), commentaire **éditable** — **FR18** (aligné epics/PRD). Audit détaillé auteur commentaire : FR35 / `recorded_by_user_id` en attendant.
11. **Given** j’ai le droit d’éditer via **Tous** (proxy **5.5**), **when** je clique une personne, **then** le contrôle a un **`aria-label`** français (*« Modifier la disponibilité de … »*) ; en lecture seule, libellé *« Voir la disponibilité de … »* — pas seulement `title`.
12. **Given** viewport **≤ 480 px**, **when** les trois choix de statut sont affichés, **then** hauteur tactile **≥ 48 dp** chacun — **NFR-A1**.
13. **Couverture :** **FR18**, **FR19** ; **UX-DR5**, **UX-DR11** ; revue M3 [ux-design-hatcast-v2.md § revue-m3-onglet-dispos](../planning-artifacts/ux-design-hatcast-v2.md#revue-m3-onglet-dispos).

### Explicit out of scope

| Item | Report |
|------|--------|
| Refonte perf `ensureMembershipParticipants` / prefetch global événement | [G-003](../planning-artifacts/growth-backlog.md) |
| Icône aide calcul des % (G-002) | Story ultérieure ou polish |
| Affichage commentaire pages publiques | Interdit FR18 |
| Historique audit **qui a écrit** le commentaire (vs statut seul) | Story audit trail / FR35 — `recorded_by_user_id` couvre la dernière écriture proxy en attendant |

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** l’UI livrée, **when** un contrôle équivalent existe, **then** utiliser `mat-button-toggle-group`, `mat-expansion-panel`, `mat-list` / `mat-nav-list`, `mat-form-field`, `mat-checkbox`, `mat-spinner`, `mat-stroked-button` — pas d’accordéon HTML ni de tuiles personne en `<button>` stylé — [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md).

**M3-2. Tokens & thème** — **Given** les SCSS de la story, **when** couleurs/fonds sont appliqués, **then** `--mat-sys-*` et tokens `--hatcast-availability-*` / `--hatcast-chance-*` dans `styles.scss` uniquement — [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md).

**M3-3. Mobile & tactile** — **Given** max-width **480px**, **when** les contrôles de la story sont affichés, **then** cibles **≥ 48×48 dp** sur les trois états ; `aria-label` FR sur actions icône / lignes cliquables sans libellé visible.

**M3-4. Navigation membre** — **UI : N/A** — pas de changement chrome global (onglet déjà sous `mat-tab-group` événement).

**M3-5. Revue** — **Given** implémentation terminée, **when** validation story, **then** checklist § « Checklist M3 HatCast » de [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) parcourue ; écarts dans Dev Notes ou `ISSUES.md`.

---

## Tasks / Subtasks

- [x] **Périmètre :** `apps/web/` + `services/api/` (commentaire API si absent) — ne pas modifier `legacy/`.
- [x] **Thème** — Dans [`apps/web/src/styles.scss`](../../apps/web/src/styles.scss), ajouter `--hatcast-availability-*` et `--hatcast-chance-*` (light + dark via `color-mix` / palettes M3) ; documenter dans [ux-design revue M3](../planning-artifacts/ux-design-hatcast-v2.md#revue-m3-onglet-dispos).
- [x] **API FR18** (si pas encore en prod) :
  - [x] Colonne / champ `comment` sur `event_availability` (migration Flyway/Liquibase selon repo).
  - [x] Étendre PUT `/me`, proxy PUT (**5.5**), DTO summary `participants[].comment`.
  - [x] Validation serveur **max 500** ; OpenAPI [`availability.yaml`](../../services/api/openapi/availability.yaml).
  - [x] Tests intégration Kotlin.
- [x] **Angular API client** — [`availability-api.service.ts`](../../apps/web/src/app/core/availability/availability-api.service.ts) : types + lecture/écriture `comment`.
- [x] **`availability-form`** — Refactor états → `mat-button-toggle-group` (ou chip listbox) ; tokens SCSS ; `mat-form-field` textarea commentaire ; auto-save commentaire ; compteur ou `maxlength` 500 + message erreur.
- [x] **`availability-dialog`** — Afficher le même bloc commentaire (réutilisation form).
- [x] **`event-dispos-tab`** — Toggle Moi/Tous tokenisé ; chargement Tous avec `includeChances=true` ; retirer ou inverser bouton « Afficher les chances » selon AC1 ; skeleton % dans [`availability-tous-panel`](../../apps/web/src/app/shared/availability/availability-tous-panel.ts).
- [x] **`availability-tous-panel`** — `mat-accordion` + `mat-list` ; `aria-label` sur lignes cliquables ; breakpoints grille 2/3 colonnes via SCSS + tokens surfaces.
- [x] **Tests** — Mettre à jour `event-dispos-tab.spec.ts`, `availability-form` (si spec dédié), `availability-tous-panel` : % par défaut, pas de hex dans styles (snapshot ou lint optionnel), commentaire 500 chars, expansion panels présents.
- [x] **Régression** — `npm run test` (web), `./gradlew test` (API touchée).

---

## Dev Notes

### Product and UX rules

- Spec UX : [Dispos tab](../planning-artifacts/ux-design-hatcast-v2.md#screen-event-detail-dispos-tab) + [Revue M3](../planning-artifacts/ux-design-hatcast-v2.md#revue-m3-onglet-dispos).
- **Epic 5.4** (commentaire) : **absorbée** par cette story — ne pas créer un second fichier story 5.4 sauf découpage PO.
- Modal et onglet **partagent** `availability-form` — une seule logique save.

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Material | `MatExpansionModule`, `MatListModule`, `MatButtonToggleModule`, `MatInputModule` |
| Tokens | Migrer `availability-form.scss`, `event-dispos-tab.scss`, `availability-tous-panel.scss` |
| Réutilisation | Ne pas dupliquer save : étendre le service/form existant (**5.1** / **5.2**) |
| Chances | `event-dispos-tab.ts` : `loadSummary({ includeChances: viewMode() === 'tous' })` ou toujours true si payload acceptable |

### Explicit non-goals

- Bottom app bar, hub rail, refonte onglet Équipe.
- Commentaire visible hors périmètre orga/admin sur dispos.

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| **5.3** | done | Onglet Dispos, summary, Moi/Tous |
| **5.5** | done | Proxy + clic Tous → Moi |
| **5.1 / 5.2** | done | Form + rôles + dialog |
| **5.4** (epics) | backlog | **Livré par 5.6** (FR18) |
| **G-003** | idée | Perf summary — mesurer avant/après `includeChances` par défaut |

### File List (expected)

- `apps/web/src/styles.scss`
- `apps/web/src/app/shared/availability/availability-form.{ts,html,scss}`
- `apps/web/src/app/shared/availability/availability-tous-panel.{ts,html,scss}`
- `apps/web/src/app/shared/availability/event-dispos-tab.{ts,html,scss}`
- `apps/web/src/app/shared/availability/availability-dialog.{html,scss}` (si wrapper commentaire)
- `apps/web/src/app/core/availability/availability-api.service.ts`
- `services/api/.../availability/*` + migration + openapi
- Tests associés

---

## Dev Agent Record

### Agent Model Used

—

### Completion Notes List

- Migration `V29__event_availability_comment.sql` ; champ `comment` sur entité/DTOs/PUT me + proxy + summary.
- Tokens `--hatcast-availability-*` / `--hatcast-chance-*` dans `styles.scss` ; SCSS onglet Dispos sans hex/rgb ad hoc.
- `availability-form` : `mat-button-toggle-group`, textarea commentaire (auto-save 400 ms, max 500).
- `event-dispos-tab` : toggle Moi/Tous via `--mat-sys-primary-container` ; vue Tous charge `includeChances=true` (bouton « Afficher les chances » retiré).
- `availability-tous-panel` : `mat-accordion` + `mat-nav-list`, skeleton %, `aria-label` FR.
- Tests : `AvailabilityControllerIntegrationTest` (FR18 commentaire) ; specs Angular availability OK.
- **Proxy + commentaire (FR18)** : édition autorisée en `proxyMode` ; API persiste `comment` sur PUT proxy ; `recorded_by_user_id` = dernier auteur (audit trail détaillé à FR35).
- **Bandeau proxy** : tokens `--hatcast-proxy-banner-*`, fond tertiary visible, copy « Saisie pour le compte de … » + icône warning.
- **Tests** : `availability-form.spec.ts` ; proxy commentaire API ; 34 specs availability front OK.

### Change Log

- 2026-05-27 : Story créée suite revue M3 onglet Dispos (challenge UX + spec).
- 2026-05-27 : Implémentation story 5.6 (M3 + FR18/FR19).
- 2026-05-27 : Correction périmètre — commentaire proxy aligné epics/PRD FR18 (retrait hors-scope erroné).
- 2026-05-27 : Story clôturée — bandeau proxy M3, revue code, tests verts.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (FR18, FR19, UX-DR5, UX-DR11)
- [x] Section **Material 3** remplie (M3-4 N/A)
- [x] Tasks référencent AC et fichiers code
- [x] `npm run test` / `./gradlew test` mentionnés
