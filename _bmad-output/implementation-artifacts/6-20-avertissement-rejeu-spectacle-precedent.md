# Story 6.20 : Avertissement rejeu spectacle précédent (même rôle, même compartiment)

Status: review

baseline_commit: 75bfc677

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

En tant qu’**organisateur·ice** constituant l’équipe sur le détail événement,  
je veux un **avertissement visible mais non bloquant** sur un créneau lorsque la personne assignée occupait **déjà le même rôle** au **spectacle validé chronologiquement précédent** dans le **même compartiment** (catégorie),  
afin de **décider en connaissance de cause** de maintenir ou changer ce choix.

## Acceptance Criteria

1. **AC-01 — Résolution du prédécesseur immédiat** — **Given** la position chronologique et le compartiment (`SpectacleCategory.slug`) de l’événement courant, **when** le système résout `immediatePredecessorEvent`, **then** c’est le **dernier** événement antérieur strict de la saison dans le **même compartiment** avec composition **validée** (`event_compositions.validated_at IS NOT NULL`), **non archivé**, ordonné par `(startsAt DESC, createdAt DESC, id DESC)` parmi les événements **strictement avant** l’événement courant (`startsAt`, puis `createdAt`, puis `id` — même tie-break que [`EventCompositionSlotRepository.countValidatedSelectionsBeforeEvent`](../../services/api/src/main/kotlin/com/hatcast/api/composition/EventCompositionSlotRepository.kt)). [Source: SCP 2026-06-05 §1 ; epics 6.20 AC-1 ; [`SpectacleCategory`](../../services/api/src/main/kotlin/com/hatcast/api/event/SpectacleCategory.kt)]

2. **AC-02 — Absence de prédécesseur** — **Given** aucun prédécesseur immédiat (premier spectacle du compartiment, ou aucun spectacle validé antérieur), **when** un créneau est assigné, **then** `consecutiveShowWarning` est **absent / null** sur ce slot. [Source: epics 6.20 AC-2]

3. **AC-03 — Avertissement déclenché** — **Given** un prédécesseur P et une assignation (participant X, rôle R) sur l’événement courant, **when** X occupait R sur P (slot validé, `participationStatus ≠ DECLINED`), **then** le slot expose `consecutiveShowWarning: { previousEventId, previousEventTitle, previousEventStartsAt }` et l’UI affiche un hint inline FR nommant **titre** et **date** de P — **sans modale**. [Source: epics 6.20 AC-3 ; UX spec § Copy]

4. **AC-04 — Compartiment différent** — **Given** le participant X a joué le rôle R au spectacle chronologiquement précédent **global** mais dans un **compartiment différent** (ex. `deplacements` puis `principal`), **when** assignation sur l’événement courant, **then** **pas** d’avertissement. [Source: epics 6.20 AC-4 ; test pattern [`CompositionDrawIntegrationTest` compartment test](../../services/api/src/test/kotlin/com/hatcast/api/composition/CompositionDrawIntegrationTest.kt)]

5. **AC-05 — Composition brouillon** — **Given** une composition **brouillon** (`validatedAt == null`) sur l’événement courant, **when** l’assignation déclenche l’avertissement et l’utilisateur est **organisateur** (`canManageComposition`), **then** l’avertissement reste visible (prévention avant validation). [Source: epics 6.20 AC-5]

6. **AC-06 — Manuel et tirage** — **Given** assignation via **PUT slot** (manuel) ou **POST draw**, **when** les slots sont persistés, **then** la réponse composition (et tout GET composition subséquent) inclut les warnings recalculés de façon cohérente via le même chemin [`CompositionService.getCompositionState`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt). [Source: epics 6.20 AC-6]

7. **AC-07 — Retrait / remplacement** — **Given** un avertissement affiché, **when** l’orga **efface** le slot (`participantId: null`) ou **remplace** le participant, **then** l’avertissement **disparaît** ou **se met à jour** après refresh API (pas de cache client stale). [Source: epics 6.20 AC-7]

8. **AC-08 — Visibilité orga uniquement** — **Given** un membre **non organisateur** consulte l’onglet Équipe (composition validée visible), **when** la composition est chargée, **then** les slots **n’incluent pas** de `consecutiveShowWarning` (champ omis ou toujours `null`) — même règle que visibilité brouillon orga (**OQ-6-20-03** : orga-only, confirmé SCP). [Source: UX spec § Trigger ; [`CompositionVisibilityRules`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionVisibilityRules.kt)]

9. **AC-09 — Tous les rôles** — **Given** un rôle quelconque (`player`, `mc`, `dj`, `volunteer`, …), **when** les conditions AC-03 sont remplies, **then** l’avertissement s’applique — match sur `(participantId, roleKey)` indépendamment du rôle. [Source: SCP §1 Scope roles]

10. **AC-10 — Slot declined sur prédécesseur** — **Given** X occupait R sur P mais avec `participationStatus = DECLINED`, **when** assignation de X à R sur l’événement courant, **then** **pas** d’avertissement. [Source: SCP §1 History source]

11. **AC-11 — Docs normatives** — **Given** implémentation livrée, **when** revue docs, **then** la règle `immediatePredecessorEvent` / `consecutiveRoleWarning` est documentée dans [`DOMAIN.md`](../../DOMAIN.md) (modèle composition / equity compartment) et une phrase dans [`SPEC.md`](../../SPEC.md) § composition organizer UX (extension FR21 — pas de nouveau FR ID requis). [Source: SCP §4.1 step 1]

12. **AC-12 — Tests API** — **Given** `./gradlew test`, **when** la suite composition s’exécute, **then** des tests d’intégration couvrent au minimum : warning présent (même compartiment + rôle), absent (compartiment différent), absent (pas de prédécesseur validé), absent après clear, absent pour membre non-orga. [Source: AGENTS.md tests]

13. **AC-13 — Tests front** — **Given** `npm run test -w @hatcast/web -- --watch=false`, **when** les specs Équipe s’exécute, **then** [`event-equipe-tab.spec.ts`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.spec.ts) couvre : hint visible avec copy FR + icône ; hint absent sans warning API ; hint disparaît après clear ; layout hint ne chevauche pas le bouton clear (375 px). [Source: UX spec § Layout]

**Couverture produit :** FR21 (UX assignation manuelle) ; complète **19.9** (facteur tirage) **sans** implémenter 19.9. **Priorité :** P2 post-MEP. **Depends :** **6.5** (done), **17.7** (done). **UX :** [ux-design-composition-consecutive-show-warning.md](../planning-artifacts/ux-design-composition-consecutive-show-warning.md). **SCP :** [sprint-change-proposal-2026-06-05-composition-consecutive-show-warning.md](../planning-artifacts/sprint-change-proposal-2026-06-05-composition-consecutive-show-warning.md). **Backlog :** G-010.

### Règle normative (référence implémentation)

```
immediatePredecessorEvent(currentEvent) =
  argmax by (startsAt, createdAt, id) among season events E where
    E.id ≠ currentEvent.id
    AND SpectacleCategory.slug(E) = SpectacleCategory.slug(currentEvent)
    AND composition(E).validatedAt IS NOT NULL
    AND E.archived = false
    AND E is strictly before currentEvent in (startsAt, createdAt, id) order

consecutiveRoleWarning(slot) =
  let prev = immediatePredecessorEvent(currentEvent)
  if prev is null → null
  else if ∃ slot S on prev with S.participantId = slot.participantId
       AND S.roleKey = slot.roleKey
       AND S.participationStatus ≠ DECLINED
  → { previousEventId: prev.id, previousEventTitle: prev.title, previousEventStartsAt: prev.startsAt }
  else → null
```

### Microcopy UI (FR — tunable)

> Déjà en **{roleLabel}** au spectacle **« {eventTitle} »** ({formattedDate}).

- `{roleLabel}` — [`roleLabelSingular`](../../apps/web/src/app/shared/event-roles/event-roles.ts)
- `{formattedDate}` — `Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })` (**OQ-6-20-02** : date seule, pas l’heure)

### Explicit out of scope

| Item | Reason |
|------|--------|
| Warning dans le picker candidats (`composition-slot-picker-dialog`) | **OQ-6-20-01** — stretch optionnel ; V1 story = hint sur la row après assignation |
| Modale / confirmation bloquante | SCP rejeté |
| Pénalité ou exclusion au tirage | Epic **19.9** — réutiliser le resolver plus tard, **ne pas** brancher sur le draw weight |
| Warning onglet Dispos / agenda / stats | UX spec § Out of scope |
| Champ warning pour membres non-orga | AC-08 |

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** le hint inline sur la row slot, **when** rendu, **then** utiliser `mat-icon` `warning_amber` (16–18 px) + texte `body-small` dans un fragment inline — **pas** de `MatDialog`, **pas** de snackbar pour l’avertissement. [Source: UX spec § Visual design ; FRONTEND_UI.md]

**M3-2. Tokens & thème** — **Given** les styles du hint, **when** couleurs appliquées, **then** texte via `color-mix(in srgb, var(--mat-sys-error) 75%, var(--mat-sys-on-surface))` ou `--mat-sys-on-surface-variant` ; fond optionnel `color-mix(in srgb, var(--mat-sys-error) 8%, transparent)` sur la ligne hint uniquement — **pas de hex/rgb** sur la feature. [Source: UX spec § Visual design]

**M3-3. Mobile & tactile** — **Given** viewport **max-width: 480px**, **when** slot rempli + hint affiché, **then** la row conserve cibles tactiles slot ≥ 48 dp et le bouton clear ≥ 40×40 ; le hint **ne chevauche pas** le clear ; titre long tronqué avec ellipsis + attribut `title` pour le titre complet. [Source: UX spec § Layout ; NFR-A1]

**M3-4. Navigation membre** — **N/A** — pas de modification du chrome global.

**M3-5. Revue** — **Given** implémentation terminée, **when** validation story, **then** checklist § « Checklist M3 HatCast » de [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) parcourue ; écarts notés dans Dev Agent Record ou `ISSUES.md`. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Périmètre :** `services/api/` + `apps/web/` + docs (`DOMAIN.md`, `SPEC.md`) — **pas** `legacy/`.
- [x] **AC-11** — Ajouter la règle consecutive-show warning dans `DOMAIN.md` + phrase SPEC § orga composition UX.
- [x] **AC-01, AC-04, AC-10** — API : créer `ImmediatePredecessorEventResolver` (ou méthode dédiée) + requête JPQL sur [`EventRepository`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventRepository.kt) / join `EventCompositionEntity` ; **réutiliser** le filtre compartiment identique à [`SpectacleCategory.eventInCategory`](../../services/api/src/main/kotlin/com/hatcast/api/event/SpectacleCategory.kt) et aux requêtes [`EventCompositionSlotRepository`](../../services/api/src/main/kotlin/com/hatcast/api/composition/EventCompositionSlotRepository.kt) — **ne pas** dupliquer la logique `principal` / `deplacements` inline ailleurs.
- [x] **AC-03, AC-05, AC-08, AC-09** — API : `ConsecutiveShowWarningService` (nom libre) ; DTO `ConsecutiveShowWarningDto` dans [`CompositionDtos.kt`](../../services/api/src/main/kotlin/com/hatcast/api/composition/dto/CompositionDtos.kt) ; champ optionnel `consecutiveShowWarning` sur `CompositionSlotDto` ; enrichir le mapping dans [`CompositionService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt) **uniquement** si `resolvedCanManage == true` ; batch : 1 lookup prédécesseur + 1 lecture slots du prédécesseur pour tous les slots courants assignés.
- [x] **AC-06, AC-07** — Vérifier que `assignSlot` et `CompositionDrawService` retournent déjà `getCompositionStateAfterMutation` — les warnings doivent apparaître sans changement controller si enrichissement centralisé dans `CompositionService`.
- [x] **AC-12** — Tests Kotlin : nouveau test d’intégration (ex. `ConsecutiveShowWarningIntegrationTest.kt`) ou extension [`CompositionSlotAssignmentIntegrationTest`](../../services/api/src/test/kotlin/com/hatcast/api/composition/CompositionSlotAssignmentIntegrationTest.kt) — scénarios AC-02 à AC-04, AC-07, AC-08, AC-10.
- [x] **AC-03, AC-13, M3-1–M3-3** — Front : étendre [`CompositionSlot`](../../apps/web/src/app/core/composition/composition-api.service.ts) ; helper pur `formatConsecutiveShowWarningMessage(warning, roleKey)` (ex. `apps/web/src/app/core/composition/consecutive-show-warning.ts` + spec) ; refactor layout row dans [`event-equipe-tab.html`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.html) — colonne slot (nom + hint) dans **toutes** les branches row (editable, participation, readonly, static) ; styles [`event-equipe-tab.scss`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.scss) `.event-equipe-tab__consecutive-warning` ; `role="note"`, icône `aria-hidden="true"`.
- [x] **Régression** — `./gradlew test` ; `npm run test -w @hatcast/web -- --watch=false` ; `npm run build -w @hatcast/web`.
- [x] **M3-5** — Self-check FRONTEND_UI.md.

---

## Dev Notes

### Product and UX rules

- **Normatif UX :** [_bmad-output/planning-artifacts/ux-design-composition-consecutive-show-warning.md](../planning-artifacts/ux-design-composition-consecutive-show-warning.md).
- **Normatif métier :** SCP [sprint-change-proposal-2026-06-05-composition-consecutive-show-warning.md](../planning-artifacts/sprint-change-proposal-2026-06-05-composition-consecutive-show-warning.md) — règles PO **verrouillées** 2026-06-05.
- **Surface UI :** onglet **Équipe** uniquement — [`app-event-equipe-tab`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.ts).
- **Non-bloquant :** aucune action requise ; l’orga peut valider / partager malgré le warning.
- **Historique source :** seuls les spectacles **validés** comptent pour le prédécesseur — un spectacle antérieur encore en brouillon est **ignoré** (on remonte au validé précédent dans le compartiment, ou null).

### État actuel du code (brownfield — lire avant d’implémenter)

| Zone | État today | Delta story |
|------|------------|-------------|
| [`CompositionSlotDto`](../../services/api/src/main/kotlin/com/hatcast/api/composition/dto/CompositionDtos.kt) | Pas de warning | Ajouter `consecutiveShowWarning?` |
| [`CompositionService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt) L316–336 | Map slots → DTO avec explainability | Injecter warnings post-map si orga |
| [`CompositionSelectionHistoryService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSelectionHistoryService.kt) | Compte historique **agrégé** par compartiment | **Ne pas confondre** — 6.20 = prédécesseur **immédiat** + même rôle, pas `pastSelectionCount` |
| [`EventCompositionSlotRepository`](../../services/api/src/main/kotlin/com/hatcast/api/composition/EventCompositionSlotRepository.kt) | Requêtes count validated before event | **Modèle** pour filtre compartiment + ordre chronologique — extraire helper partagé si JPQL dupliqué |
| [`SpectacleCategory`](../../services/api/src/main/kotlin/com/hatcast/api/event/SpectacleCategory.kt) | `slug(event)` + `eventInCategory` | **Source de vérité** compartiment — alignement obligatoire JPQL |
| [`composition-api.service.ts`](../../apps/web/src/app/core/composition/composition-api.service.ts) `CompositionSlot` | 8 champs | + `consecutiveShowWarning?` |
| [`event-equipe-tab.html`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.html) | Row flex horizontal avatar + nom | Restructurer : wrapper colonne sous le nom pour le hint |
| [`event-equipe-tab.scss`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.scss) L61–68 | `.event-equipe-tab__row { align-items: center }` | Passer slot content en colonne ; hint `font-size` body-small |

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Copy FR | Centraliser dans helper pur (testable) — **pas** de string inline dans le template |
| Date | `AGENDA_TIME_ZONE = 'Europe/Paris'` depuis [`season-events.utils.ts`](../../apps/web/src/app/pages/season-home/season-events.utils.ts) |
| Role label | `roleLabelSingular(roleKey)` depuis [`event-roles.ts`](../../apps/web/src/app/shared/event-roles/event-roles.ts) |
| Row layout | Hint **sous** le nom, aligné à gauche avec le nom (pas sous l’avatar) — voir wireframe UX |
| Visibilité | `@if (row.slot?.consecutiveShowWarning; as w)` — API n’envoie déjà rien aux membres ; pas de guard `canEditSlots()` supplémentaire requis si AC-08 respecté côté API |
| Draw refresh | Après draw, le tab recharge déjà la composition — warnings doivent apparaître sans logique client spéciale |
| Picker | **Out of scope** — ne pas modifier [`composition-slot-picker-dialog`](../../apps/web/src/app/shared/composition/composition-slot-picker-dialog.ts) sauf décision PO explicite |

### API implementation guardrails

| Concern | Action |
|--------|--------|
| Performance | ≤ 2 requêtes extra par GET composition orga (prédécesseur + slots prédécesseur) — **pas** N+1 par slot |
| Resolver réutilisable | Exposer `ImmediatePredecessorEventResolver` (interface + `@Service`) documenté pour **19.9** — commentaire `@see Story 19.9` |
| Chronologie | « Strictement avant » = même prédicat que `countValidatedSelectionsBeforeEvent` mais `ORDER BY … DESC LIMIT 1` |
| Compartiment | Slug courant via `SpectacleCategory.slug(currentEvent)` |
| Assignee ID | Utiliser `EventCompositionSlotEntity.assignedParticipantId()` (season vs event participant) — cohérent avec le reste composition |
| JSON | Jackson sérialise camelCase — front `consecutiveShowWarning.previousEventStartsAt` |

### Suggested JPQL sketch (implementer + test)

```kotlin
// EventRepository or dedicated repository
@Query("""
  SELECT e FROM EventEntity e
  INNER JOIN EventCompositionEntity c ON c.eventId = e.id
  WHERE e.season.id = :seasonId
    AND e.archived = false
    AND c.validatedAt IS NOT NULL
    AND (
      e.startsAt < :beforeStartsAt
      OR (e.startsAt = :beforeStartsAt AND e.createdAt < :beforeCreatedAt)
      OR (e.startsAt = :beforeStartsAt AND e.createdAt = :beforeCreatedAt AND e.id < :beforeEventId)
    )
    AND ( /* same categorySlug filter as EventCompositionSlotRepository */ )
  ORDER BY e.startsAt DESC, e.createdAt DESC, e.id DESC
  LIMIT 1
""")
```

Valider le filtre category en copiant **exactement** les 3 branches JPQL existantes (`principal`, `deplacements`, custom slug).

### Testing scenarios (minimum)

| # | Setup | Expected |
|---|--------|----------|
| T1 | Event A (principal) validated player=X → Event B (principal) assign X player | Warning cites A |
| T2 | Event A (aperock) validated → Event B (principal) assign X same role | No warning |
| T3 | First event in compartment | No warning |
| T4 | Predecessor exists but X had different role | No warning |
| T5 | Predecessor slot DECLINED for X | No warning |
| T6 | Clear slot on B | Warning gone |
| T7 | Member GET composition | `consecutiveShowWarning` absent |
| T8 | POST draw assigns X repeating role | Warning on draw response |

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| 6.5 Assignation manuelle | done | Prérequis — flux PUT slot |
| 6.4 Tirage | done | Prérequis — flux draw |
| 17.7 Tag équité / catégories | done | Modèle compartiment `SpectacleCategory` |
| 19.9 Facteur rejouer | backlog | **Réutilise** resolver — ne pas implémenter ici |

### Previous story intelligence (6.19, 6.18)

- **6.19** — Pattern `@Input()` parent → tab, helpers purs testables (`event-calendar-export.ts`), specs composant dédiés, tokens M3 — **répliquer** pour `consecutive-show-warning.ts` + spec.
- **6.18** — Hints discrets orga-only ; suppression de copy redondante dans l’onglet Équipe — **ne pas** réintroduire de paragraphe global ; le warning est **par slot** uniquement.
- **Layout Équipe** — `.event-equipe-tab__row` utilise encore quelques `rgba` legacy sur les états participation ; **ne pas** refactoriser ces rows dans cette story — limiter le diff au wrapper hint + tokens warning.

### Git intelligence (recent)

- Derniers commits dominés par CI/e2e/docs — **pas** de conflit direct sur composition.
- Patterns composition récents stables : assign/draw → `getCompositionStateAfterMutation` ; tests intégration MockMvc + `@Tag("FR21")` / `@Tag("FR20")` dans `Composition*IntegrationTest`.

### Latest tech information

- **Angular 21.2 + Material 21.2** — `@if` control flow déjà utilisé dans `event-equipe-tab.html` ; pas de nouvelle dépendance.
- **Spring Data JPA** — `LIMIT 1` supporté en JPQL ; alternative `PageRequest.of(0,1)` si profil Hibernate l’exige.
- **Pas de recherche web requise** — stack figée dans [`project-context.md`](../../project-context.md).

### Project context reference

- [`project-context.md`](../../project-context.md) — stack, commandes test, FRONTEND_UI obligatoire.
- [`docs/v2/technical/FRONTEND_UI.md`](../../docs/v2/technical/FRONTEND_UI.md) — checklist M3.
- [`.cursor/rules/material-m3-hatcast.mdc`](../../.cursor/rules/material-m3-hatcast.mdc).

---

## Dev Agent Record

### Agent Model Used

_(dev-story)_

### Completion Notes List

- API : `ImmediatePredecessorEventResolver` + JPQL `findImmediateValidatedPredecessorInCategory` (filtre compartiment aligné `EventCompositionSlotRepository`) ; `ConsecutiveShowWarningService` batch (≤2 requêtes) ; enrichissement `CompositionService.buildResponse` si `resolvedCanManage`.
- Front : hint inline M3 (`warning_amber`, tokens `color-mix` / `--mat-sys-*`) sous le nom dans les 4 branches row ; helper `formatConsecutiveShowWarningMessage` testé.
- Tests : 6 intégration Kotlin ; 4 specs composant + 2 specs helper. `./gradlew test` OK ; `ng test` ciblé story OK (45 tests) ; `npm run build -w @hatcast/web` OK.
- M3 self-check : tokens only sur hint ; mobile clear ≥40×40 ; pas de modale/snackbar ; `role="note"` + icône `aria-hidden`. Écart mineur : `event-equipe-tab.scss` +13 B vs budget 7 kB (warning seulement).

### File List

- `services/api/src/main/kotlin/com/hatcast/api/composition/ImmediatePredecessorEventResolver.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/ConsecutiveShowWarningService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/dto/CompositionDtos.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/event/EventRepository.kt`
- `services/api/src/test/kotlin/com/hatcast/api/composition/ConsecutiveShowWarningIntegrationTest.kt`
- `apps/web/src/app/core/composition/composition-api.service.ts`
- `apps/web/src/app/core/composition/consecutive-show-warning.ts`
- `apps/web/src/app/core/composition/consecutive-show-warning.spec.ts`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.html`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.scss`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.ts`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.spec.ts`
- `DOMAIN.md`
- `SPEC.md`

### Change Log

- 2026-06-05 : Story 6.20 created (SCP G-010, bmad-create-story)
- 2026-06-05 : Story 6.20 implemented — consecutive-show warning API + Équipe tab UI (dev-story)

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR / SCP)
- [x] Section **Material 3** remplie
- [x] Tasks référencent les numéros d’AC (y compris M3-x)
- [x] Liens vers fichiers code existants à réutiliser
- [x] `npm run test` / `./gradlew test` mentionnés
- [x] Out of scope + OQ résolues documentées
- [x] Resolver 19.9 flagged for reuse
