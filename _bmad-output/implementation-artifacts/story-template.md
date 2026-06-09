# Story {EPIC}.{NUM} : {Titre court}

Status: backlog

<!-- Copier ce fichier pour une nouvelle story. Commande BMad : /bmad-create-story — inclure ce template si le skill ne le charge pas automatiquement. -->

## Story

En tant que **{rôle}**,  
je veux **{capacité}**,  
afin de **{bénéfice}**.

## Acceptance Criteria

<!-- Critères métier / API / permissions. Numérotation 1, 2, 3… -->

1. **Given** …, **when** …, **then** … [Source: epics {id} ; FR…]
2. …

**Couverture produit :** {UX-DR…, liens specs}

---

## Acceptance Criteria — Material 3 (UI)

<!-- OBLIGATOIRE si la story touche apps/web/ (écran, composant, style, dialog, header, nav).
     Si story 100 % API/backend/scripts : remplacer toute la section par une ligne :
     **UI : N/A** — pas de changement sous apps/web/ ; section Material 3 omise volontairement.
     Adapter les libellés ; supprimer les AC M3 non pertinents ; en ajouter si besoin (ex. dialog, table admin).
     Réf. : docs/v2/technical/FRONTEND_UI.md (checklist), UX-DR11. -->

**M3-1. Composants Material** — **Given** l’UI livrée dans le périmètre de la story, **when** un contrôle équivalent existe dans Angular Material, **then** utiliser `{mat-stroked-button | mat-button | mat-form-field | MatDialog | mat-menu | mat-chip | mat-toolbar | …}` (nommer les composants réels dans l’implémentation) — pas de `<button>` / div cliquable custom pour le même rôle. [Source: FRONTEND_UI.md ; UX-DR11]

**M3-2. Tokens & thème** — **Given** les styles SCSS/HTML de la story, **when** couleurs ou fonds sont appliqués, **then** uniquement `var(--mat-sys-*)` et `color-mix(in srgb, var(--mat-sys-…) …)` — pas de couleur hex/rgb en dur sur les features (hors thème global `styles.scss`). [Source: FRONTEND_UI.md]

*(Si la story touche une barre d’onglets page : ajouter AC ou Dev Note pointant [ux-design-pill-tab-bar.md](../planning-artifacts/ux-design-pill-tab-bar.md) + mixin `_hatcast-pill-tab-bar.scss`.)*

**M3-3. Mobile & tactile** — **Given** viewport **max-width: 480px** (breakpoint standard HatCast), **when** les contrôles interactifs de la story sont affichés, **then** cibles tactiles **≥ 48×48 dp** (ou **≥ 40×40** si justifié ici) ; **si** le libellé texte est masqué, **then** `aria-label` **français** sur chaque contrôle concerné ; pas de chevauchement du chrome (avatar, menu). [Source: NFR-A1 ; FRONTEND_UI.md]

**M3-4. Navigation membre** *(uniquement si chrome global / nav / header membre)* — **Given** une surface membre (`/agenda`, `/saison/*`, `/membre/*`, hub…), **when** la story ajoute ou modifie la navigation d’espace app, **then** respecter top app bar M3 et **ne pas** introduire de bottom app bar M2 ; rail desktop à **840px** seulement si spec [`ux-hub-a-faire.md`](../planning-artifacts/ux-hub-a-faire.md) ou story l’exige. [Source: ux-hub-a-faire.md]

**M3-5. Revue** — **Given** implémentation terminée, **when** l’agent ou le relecteur valide la story, **then** la checklist § « Checklist M3 HatCast » de [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) est parcourue et les écarts volontaires sont notés dans Dev Notes ou `ISSUES.md`. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [ ] **Périmètre :** `apps/web/` | `services/api/` | les deux — …
- [ ] …

## Dev Notes

### Product and UX rules

- …

### Frontend implementation guardrails *(si UI)*

| Concern | Action |
|--------|--------|
| Material | … |
| Tokens | `--mat-sys-*` |
| Réutilisation | chercher dans `shared/` … |

### Explicit non-goals

- …

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| … | … | … |

## Dev Agent Record

### Agent Model Used

…

### Completion Notes List

- …

### File List

- …

### Change Log

- YYYY-MM-DD : …

---

### Validation create-story

<!-- Après rédaction, vérifier : -->

- [ ] AC métier numérotés et sourcés (epics / FR)
- [ ] Section **Material 3** remplie **ou** **UI : N/A** explicite
- [ ] Tasks référencent les numéros d’AC (y compris M3-x si UI)
- [ ] Liens vers fichiers code existants à réutiliser
- [ ] `npm run test` / `./gradlew test` mentionnés si touch web/API
