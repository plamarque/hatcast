# Story 5.8 : Onglet Dispos — vue sondage unifiée (inspirée WhatsApp)

Status: done

baseline_commit: cd1c47ce0adbfe495044915c84364352bb988083
as_built_spec: _bmad-output/planning-artifacts/ux-design-dispos-poll-as-built-2026-06-09.md

<!-- Spec UX : ux-design-dispos-poll-2026-06-09.md + as-built 2026-06-09 — décisions D1–D22, AC UX prêts -->

## Story

En tant que **membre d’une troupe**,  
je veux **indiquer ma disponibilité et voir l’état du groupe sur un même écran type sondage**,  
afin de **ne plus basculer entre Moi et Tous et comprendre d’un coup d’œil quels rôles manquent de candidats**.

En tant qu’**organisateur ou admin**,  
je veux **la même vue avec saisie au nom d’un membre**,  
afin de **renseigner les dispos pour autrui tout en conservant la lecture collective**.

## Acceptance Criteria

1. **AC-01 — Vue unifiée** — **Given** un membre sur l’onglet Dispos d’un spectacle publié avec rôles, **when** le summary est chargé, **then** il voit une **liste sondage** (ligne Indispo + une ligne par rôle requis) **sans** toggle Moi/Tous. [Source: ux-design-dispos-poll D1 ; FR15, FR19]

2. **AC-02 — Vote multi-rôles immédiat** — **Given** un sujet éditable, **when** il coche deux rôles, **then** statut `available` et `role_keys` contient les deux ; enregistrement **immédiat** au clic (pas de bouton « Enregistrer rôles »). [Source: D3, D6, D7 ; FR16]

3. **AC-03 — Non renseigné** — **Given** un sujet avec rôles cochés, **when** il décoche tout (y compris Indispo), **then** statut `unknown`. [Source: D4 ; FR15]

4. **AC-04 — Pas disponible** — **Given** un sujet avec rôles cochés, **when** il coche « Pas disponible », **then** rôles décochés côté API et statut `unavailable`. **As-built :** lignes rôles **restent éditables** ; cocher un rôle repasse en `available`. [Source: D5 amendé ; as-built]

5. **AC-05 — Jauge candidats/postes** — **Given** un rôle avec 4 candidats et 12 postes, **when** la ligne s’affiche, **then** jauge à 33 % et compteur `4/12` ; avec 20 candidats et 4 postes, jauge **100 %** (plafond) et compteur `20/4`. [Source: D8 ; FR19]

6. **AC-06 — Pool dépliable** — **Given** une ligne avec candidats, **when** l’utilisateur tape jauge, compteur ou avatars, **then** `app-composition-pool-preview` s’affiche sous la ligne ; **un seul** pool ouvert à la fois. [Source: D9, D10 ; FR19]

7. **AC-07 — Pas de % sur la jauge** — **Given** explainability activée (`explainabilityEnabled`), **when** la ligne s’affiche, **then** la jauge **ne** montre **pas** `chancePercent` ; les % restent dans le pool déplié / breakdown sheet. [Source: D12 ; FR24 Dispos — gate = spectacle publié, story **5.9**]

8. **AC-08 — Proxy orga** — **Given** `canSwitchSubject`, **when** l’orga change le sujet via `app-availability-subject-selector`, **then** les cases reflètent les votes du sujet ; bandeau **« Tu modifies les dispos de … »** sur une ligne avec le sélecteur. [Source: D11 ; FR17, story 5.5 ; as-built]

9. **AC-09 — Commentaire séparé** — **Given** un sujet `available` ou `unavailable`, **when** il saisit un commentaire et clique **« Enregistrer le commentaire »**, **then** seul le commentaire est persisté (≤ 500 car.) sans modifier les votes si inchangés. [Source: D13 ; FR18]

10. **AC-10 — Sans rôles** — **Given** un événement sans `roleSlots` (`totalSlots === 0`), **when** l’onglet s’affiche, **then** variante **deux lignes** Pas disponible / Dispo avec jauge globale `disponibles/effectif`. [Source: D14 ; FR15]

11. **AC-11 — Brouillon / archivé** — **Given** spectacle brouillon (membre sans `canManageComposition`) ou archivé, **then** comportement inchangé story **3.21** / lecture seule (pas de vote). [Source: D15, D16 ; story 3.21]

12. **AC-12 — Bénévole auto** — **Given** format impose bénévole avec comédien·ne, **when** le membre coche Comédien·ne, **then** Bénévole coché automatiquement + snackbar « Bénévole ajouté (obligatoire sur ce format) ». [Source: D17 ; FR14, FR16]

13. **AC-13 — Toggle rôle isolé** — **Given** un sujet sans `role_keys` sauvegardés, **when** il coche un rôle, **then** **seul ce rôle** est coché (pas de pré-remplissage multi-rôles depuis préférences compte). [Source: D18 amendé ; as-built]

14. **AC-14 — Libellés genre sujet** — **Given** un sujet avec genre `male`/`female`, **when** les libellés de rôles s’affichent, **then** labels adaptés au **sujet** (pas au viewer) — parité **2.12b**. [Source: D19]

15. **AC-15 — Dialog agenda inchangé** — **Given** `availability-dialog` (agenda / cellule participation), **when** ouvert, **then** il continue d’utiliser `availability-form` (formulaire compact) — pas de sondage dans le dialog en v1. [Source: ux-design-dispos-poll Q2]

16. **AC-16 — Animation jauge au vote** — **Given** un sujet éditable et une ligne rôle affichée à `3/12` (jauge ~25 %), **when** il coche ce rôle, **then** le compteur passe à `4/12` et la jauge **anime** le remplissage vers ~33 % en **≤ 300 ms** (optimistic UI dès le clic) ; **when** il décoche, **then** retour animé vers `3/12`. **Given** cocher/décocher **Indispo** ou **Dispo** (variante sans rôles), **then** la jauge de la ligne concernée suit la même règle. **Given** `prefers-reduced-motion: reduce`, **then** mise à jour **instantanée** sans transition. **Given** échec save API, **then** revert case + jauge/compteur vers l’état serveur. [Source: ux-design-dispos-poll D21]

17. **AC-17 — Icône onglet Dispos** — **Given** le détail spectacle, **when** la barre d’onglets s’affiche, **then** l’onglet Dispos utilise `mat-icon` **`ballot`** à la place de `grid_on` ; libellé texte « Dispos » inchangé. [Source: ux-design-dispos-poll D22 ; `event-detail.html`]

18. **AC-18 — Explainability sur spectacle publié** — **Given** un membre sur un spectacle **publié** (dispos ouvertes), **when** il déplie le pool d’un rôle, **then** segments `%` et breakdown disponibles **sans** composition validée ni publiée. **Given** spectacle brouillon (membre sans droit orga), **then** pas de chances (story **3.21**). [Source: D12 gate ; SCP 2026-06-09 ; implémentation story **5.9**]

**Couverture produit :** FR15, FR16, FR17, FR18, FR19, FR24, FR46 ; UX-DR5, UX-DR11 ; [ux-design-dispos-poll-2026-06-09.md](../planning-artifacts/ux-design-dispos-poll-2026-06-09.md)

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** l’UI livrée, **when** un contrôle équivalent existe, **then** utiliser `mat-checkbox`, `mat-progress-bar` (mode determinate), `mat-form-field`, `mat-flat-button`, `mat-spinner`, `mat-icon` — pas de cases ou barres HTML custom pour le même rôle. [Source: FRONTEND_UI.md ; D20]

**M3-2. Tokens & thème** — **Given** les SCSS de la story, **when** couleurs/fonds sont appliqués, **then** `--mat-sys-*` et tokens sémantiques participation (`_hatcast-semantic-colors.scss`) — **pas** de vert WhatsApp `#00a884` ni hex ad hoc. [Source: FRONTEND_UI.md ; D20]

**M3-3. Mobile & tactile** — **Given** viewport **≤ 480 px**, **when** les contrôles sont affichés, **then** case à cocher ≥ **48 dp** ; **2 lignes par vote** (L1 libellé+stats, L2 jauge) ; zone pool-trigger ≥ **40 dp** ; pas de débordement horizontal avatars. Voir [as-built](../planning-artifacts/ux-design-dispos-poll-as-built-2026-06-09.md). [Source: NFR-A1 ; FRONTEND_UI.md]

**M3-4. Navigation membre** — **UI : N/A** — contenu onglet existant sous `mat-tab-group` événement.

**M3-5. Revue** — **Given** implémentation terminée, **when** validation story, **then** checklist § « Checklist M3 HatCast » de [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) parcourue ; waivers M3-3 recopiés en Dev Notes.

---

## Tasks / Subtasks

- [x] **Périmètre :** `apps/web/` uniquement — pas de changement API (`services/api/`).
- [x] **AC-17** — [`event-detail.html`](../../apps/web/src/app/pages/event-detail/event-detail.html) : `grid_on` → `ballot` sur l’onglet Dispos.
- [x] **AC-01, AC-08** — Refactor [`event-dispos-tab.ts`](../../apps/web/src/app/shared/availability/event-dispos-tab.ts) + [`.html`](../../apps/web/src/app/shared/availability/event-dispos-tab.html) : retirer toggle Moi/Tous, `viewMode`, `AvailabilityMoiPanel`, `AvailabilityTousPanel` ; intégrer nouveau `app-availability-poll`.
- [x] **AC-02–AC-04, AC-12, AC-13** — Créer `availability-poll.ts` + `availability-poll-row.ts` : logique vote (extraire ou déléguer depuis [`availability-form.ts`](../../apps/web/src/app/shared/availability/availability-form.ts) — `persistStatus`, `toggleRole`, `normalizeCandidateRoleKeys`, `applyPreferredPrecheck`, règle bénévole).
- [x] **AC-05, AC-06, AC-07, AC-16** — Ligne rôle : jauge `min(100, candidates/required)`, compteur `N/M`, stack avatars (max 3), expand pool via [`composition-pool-preview`](../../apps/web/src/app/shared/composition/composition-pool-preview.ts) ; lazy load `includeChances` au premier expand (perf — voir Dev Notes). **AC-16** : transition jauge 250–300 ms + patch optimiste summary au clic ; `@media (prefers-reduced-motion: reduce)` → pas de transition.
- [x] **AC-09** — Bloc commentaire bas de poll : `mat-form-field` + bouton dédié ; `scope: 'details'` / comment-only PUT.
- [x] **AC-10** — Branche `totalSlots === 0` : lignes Indispo/Dispo exclusives.
- [x] **AC-11** — Conserver `draftBlocksMemberDispos`, `readOnly`, `archived` guards.
- [x] **AC-14** — `getRoleLabel(roleKey, subject.gender)` sur libellés lignes.
- [x] **AC-15** — Ne pas modifier [`availability-dialog.html`](../../apps/web/src/app/shared/availability/availability-dialog.html) sauf si extraction service partagé sans régression.
- [x] **Tests** — Réécrire [`event-dispos-tab.spec.ts`](../../apps/web/src/app/shared/availability/event-dispos-tab.spec.ts) ; ajouter `availability-poll.spec.ts` / `availability-poll-row.spec.ts` : vote, indispo exclusif, jauge plafond, expand pool, proxy, commentaire seul, **AC-16** (compteur/jauge mis à jour optimistic + classe `prefers-reduced-motion` si testable).
- [x] **Régression** — `npm run test` (web) ; vérifier e2e dispos si présents (`apps/web/e2e/`).
- [x] **Docs** — Après ship : mettre à jour tableau « Quand utiliser » dans [ux-design-role-toggle-chips.md](../planning-artifacts/ux-design-role-toggle-chips.md) (Dispos n’utilise plus chips pour saisie).

---

## Dev Notes

### Product and UX rules

- **Spec normative :** [ux-design-dispos-poll-2026-06-09.md](../planning-artifacts/ux-design-dispos-poll-2026-06-09.md) + **[as-built figé](../planning-artifacts/ux-design-dispos-poll-as-built-2026-06-09.md)** (layout, proxy, anti-régression).
- **Indispo** = libellé UI **`Pas disponible`** pour `unavailable`.

### Fichiers existants — état actuel et ce qui change

| Fichier | État actuel | À préserver / changer |
|---------|-------------|----------------------|
| `event-dispos-tab.ts` | Toggle `viewMode` moi/tous ; charge chances si Tous ; `patchSubjectInSummary` | **Changer** : une vue ; **préserver** : `load()`, draft guard, `subjectParticipantId`, `onSaved` patch summary, `summaryChanged` output |
| `availability-form.ts` | Toggle 3 états + chips rôles + save status/details séparés | **Garder** pour dialog agenda ; **extraire** logique persist dans service partagé (`availability-persist.service.ts` ou méthodes statiques testables) pour éviter duplication poll/form |
| `availability-moi-panel.ts` | Wrapper form + bannière proxy | **Retirer** de dispos tab (peut supprimer si plus référencé) |
| `availability-tous-panel.ts` | Accordéon + pool par rôle | **Retirer** de dispos tab ; pool preview **réutilisé** dans poll-row |
| `availability-subject-selector` | Pulldown orga | **Inchangé** — reste en toolbar poll |
| `composition-pool-preview` | Pool tags marron wrap | **Réutiliser** tel quel ; `interactive` + `segmentTap` → `ChanceBreakdownService` si explainability |

### Logique vote (mapping UI → API)

```
Tout décoché        → status: unknown,  roleKeys: []
Indispo coché       → status: unavailable, roleKeys: []
≥1 rôle coché      → status: available, roleKeys: [clés cochées]
```

- **PUT** : `setMyAvailability` ou `setParticipantAvailability` (proxy) — même body que `availability-form` (`applyVolunteerRule`, `comment` préservé sur save vote si `savedComment` inchangé).
- **Optimistic UI** : mettre à jour `summary.participants` **et** `roles[].candidates` **dès le clic** (avant `PUT`) pour déclencher l’animation jauge (**AC-16**) ; confirmer ou revert après réponse API (`patchSubjectInSummary`).

### Animation jauge (AC-16 / D21)

- Déclencher le changement de `value` sur `mat-progress-bar` via le patch optimiste ci-dessus — la transition CSS fait « avancer / reculer » la barre.
- SCSS `availability-poll-row.scss` : transition sur le segment primary MDC (`250–300 ms`, `cubic-bezier(0.4, 0, 0.2, 1)`).
- `@media (prefers-reduced-motion: reduce) { transition: none }` sur la jauge.
- Coche **Indispo** : animer jauge Indispo (+1) et reculer les jauges des rôles dont le sujet sortait du pool candidats.
- **Bénévole auto** : animer les deux lignes impactées (player + volunteer).
- Chargement initial / switch sujet proxy : pas d’animation longue (valeur directe).

### Jauge (AC-05)

```typescript
fillPercent = Math.min(100, Math.round(100 * candidates.length / Math.max(1, requiredCount)))
```

- Ligne **Indispo** : compteur = nb participants `unavailable` ; jauge teinte sémantique indispo (pas primary).
- Rôle avec `requiredCount === 0` : ne pas afficher la ligne.

### Chances / perf (AC-07)

- **Ne pas** charger `includeChances=true` au mount summary (contrairement à ancien mode Tous par défaut — story 5.6 AC1 **amendé** par cette story).
- Au **premier expand** d’un rôle : si `chancePercent` absent, appeler `getEventAvailabilitySummary(..., includeChances: true)` ou reload ciblé — aligner avec [perf-03](perf-03-event-detail-tab-gated-load.md) si déjà mergé.
- Hint global `chanceSource` (estimated/snapshot) : sous toolbar si chances chargées — reprendre copy `availability-tous-panel`.

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Material | `MatCheckboxModule`, `MatProgressBarModule`, `MatButtonModule`, `MatFormFieldModule`, `MatInputModule` |
| Tokens | Nouveau `availability-poll.scss` — `--mat-sys-primary` fill jauge rôles ; indispo via `--hatcast-v1-unavailable` / semantic tokens |
| Réutilisation | `UserAvatarComponent`, `CompositionPoolPreview`, `ChanceBreakdownService`, `availability-subject-selector` |
| Genre | `getRoleLabel` + `effectiveMemberGender(subject.gender)` |
| Analytics | `captureAvailabilityFirstSubmission` — conserver sur premier vote réussi (parité form) |

### Explicit non-goals

- Changement API / migration BDD.
- Sondage dans `availability-dialog` (agenda).
- Bouton global « Voir les votes ».
- Liste nominative indisponibles en mode sans-rôles (MVP+).
- Suppression de `availability-form` (encore utilisé par dialog).
- Pixel-perfect WhatsApp.

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| **5.3** | done | Remplace UI Moi/Tous — même FR19 |
| **5.5** | done | Proxy + subject selector — à conserver |
| **5.6** | done | M3 dispos — accordéon Tous remplacé ; commentaire pattern adapté |
| **5.7** | done | GET summary lecture seule — inchangé |
| **3.21** | done | Brouillon — guards inchangés |
| **2.12b** | done | Libellés genre sujet |
| **6.4 / 19.7** | done | Pool + breakdown — réutiliser dans expand |
| **PERF-03** | backlog | Compatible — ne pas eager-load chances |

### Previous story intelligence (5.7)

- GET summary ne doit **pas** écrire en base (`ensureMembershipParticipants` retiré) — ne pas réintroduire d’effet de bord côté front en multipliant les reloads ; préférer patch local post-vote.

### Test plan (manuel — depuis spec UX)

1. Membre : tout décoché → unknown ; 1 rôle → available + save ; 2 rôles ; tout décocher.
2. « Pas disponible » depuis rôles cochés → unavailable ; cocher un rôle ensuite → available + rôle seul.
3. Orga : toolbar proxy une ligne ; copy « Tu modifies les dispos de … » ; teinte tertiary.
4. 12/4 candidats → jauge 100 %, `12/4`.
5. Tap jauge → pool ; autre ligne → premier pool fermé.
6. Explainability : % dans pool seulement.
7. Commentaire seul → save sans toucher rôles.
8. Bénévole auto + snackbar.
9. Événement sans rôles → 2 lignes.
10. Brouillon membre → hint, pas de vote.
11. Mobile 375 px : **2 lignes** par vote ; avatars in viewport ; desktop : jauge L2 visible.
12. Cocher rôle → jauge avance ; décocher → recule ; reduced-motion → instantané.
13. Premier clic DJ → **seul DJ** coché.

### Project context reference

- [DOMAIN.md](../../DOMAIN.md) — Availability, `role_keys`, statuts.
- [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) — checklist M3.
- [AGENTS.md](../../AGENTS.md) — pas de commit sans demande ; tests non désactivés.

---

## Dev Agent Record

### Agent Model Used

Composer (dev-story 2026-06-09)

### Completion Notes List

- Ultimate context engine analysis completed — comprehensive developer guide created from ux-design-dispos-poll-2026-06-09.md
- Replaced Moi/Tous toggle with unified poll view (`app-availability-poll` + `app-availability-poll-row`)
- Vote logic extracted to `availability-vote.utils.ts` + `AvailabilityPersistService` (dialog form unchanged)
- Optimistic summary patch on vote for gauge animation (AC-16); lazy `includeChances` on first pool expand (AC-07)
- Proxy subject selector + banner preserved (AC-08); comment save separated (AC-09)
- M3: mat-checkbox, mat-progress-bar, mat-form-field, mat-flat-button; semantic tokens for indispo gauge
- M3-3 waiver: pool-trigger min-height 40dp documented in row SCSS (aligned story 19.7)
- Tests: availability-poll.spec.ts, availability-poll-row.spec.ts (utils), event-dispos-tab.spec.ts rewritten — all pass
- Build `npm run build -w @hatcast/web` OK; full test suite has pre-existing failures unrelated to this story
- Docs: ux-design-role-toggle-chips.md table updated (Dispos → poll, not chips)

### File List

- `apps/web/src/app/shared/availability/event-dispos-tab.ts`
- `apps/web/src/app/shared/availability/event-dispos-tab.html`
- `apps/web/src/app/shared/availability/event-dispos-tab.scss`
- `apps/web/src/app/shared/availability/event-dispos-tab.spec.ts`
- `apps/web/src/app/shared/availability/availability-poll.ts`
- `apps/web/src/app/shared/availability/availability-poll.html`
- `apps/web/src/app/shared/availability/availability-poll.scss`
- `apps/web/src/app/shared/availability/availability-poll.spec.ts`
- `apps/web/src/app/shared/availability/availability-poll-row.ts`
- `apps/web/src/app/shared/availability/availability-poll-row.html`
- `apps/web/src/app/shared/availability/availability-poll-row.scss`
- `apps/web/src/app/shared/availability/availability-poll-row.spec.ts`
- `apps/web/src/app/shared/availability/availability-persist.service.ts`
- `apps/web/src/app/shared/availability/availability-vote.utils.ts`
- `_bmad-output/planning-artifacts/ux-design-role-toggle-chips.md`

### Change Log

- 2026-06-09 : Story créée depuis spec UX sondage Dispos (5.8, epic 5).
- 2026-06-09 : AC-16 — animation jauge au cocher/décocher (D21).
- 2026-06-09 : Implementation — unified poll view, tests, docs table update.
- 2026-06-09 : Recette figée — doc as-built UX + FRONTEND_UI § sondage ; AC-04/AC-13/M3-3 amendés ; proxy copy/layout ; layout 2 lignes mobile/desktop.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR / spec UX)
- [x] Section **Material 3** remplie
- [x] Tasks référencent les numéros d’AC
- [x] Liens vers fichiers code existants
- [x] `npm run test` mentionné
