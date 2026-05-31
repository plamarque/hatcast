# Story 17.33: Préférences membre au niveau compte utilisateur

Status: in-progress

## Story

En tant que **membre HatCast**,  
je veux **un pseudo et des rôles préférés stockés une seule fois sur mon compte**,  
afin de **ne plus les dupliquer ni les synchroniser manuellement troupe par troupe**.

## Contexte / motivation

Story **17.29** a déplacé l’UI des préférences vers Mon compte en **propageant** pseudo et rôles sur chaque adhésion active via `PATCH …/memberships/me` et `PUT …/preferred-roles` (solution interim). Revue code 17.29 (2026-06-01) : persistance non atomique et rôles divergents inter-troupes → **nouvelle story requise** pour un modèle compte unique.

## Acceptance Criteria

1. **Given** un utilisateur authentifié, **when** il modifie pseudo ou rôles préférés sur `/compte`, **then** une **seule** source de vérité persiste au niveau **compte utilisateur** (colonne(s) ou table dédiée), pas N appels par troupe.
2. **Given** le modèle compte en place, **when** l’utilisateur rejoint ou consulte une troupe, **then** le pseudo affiché et les rôles pré-cochés proviennent du compte (éventuellement surcharge locale future — hors scope initial).
3. **Given** migration depuis le modèle interim 17.29, **when** déployé, **then** stratégie documentée pour données existantes (consensus, dernière modification, ou première troupe active) sans perte silencieuse.
4. **Given** endpoints troupe `displayName` / `preferred-roles` par membership, **when** cette story est terminée, **then** chemins obsolètes retirés ou dépréciés ; UI Mon compte ne boucle plus sur les troupes actives.
5. **Given** implémentation terminée, **when** tests web + API + migration, **then** ils passent ; specs 17.29 interim (`MemberPreferencesForm` propagation) adaptées ou remplacées.

**Couverture produit :** Remplace l’interim propagation de 17.29 ; amends FR9 / pseudo global mentionné en Dev Notes 17.29.

**UI : N/A** pour la conception API/migration seule ; inclure section Material 3 si changements `apps/web/`.

---

## Tasks / Subtasks

- [ ] **Domaine & API** — modèle `users.member_display_name` (ou équivalent) + preferred roles compte ; endpoints `GET/PATCH /v1/me/preferences` (ou similaire).
- [ ] **Migration** — script/consolidation depuis `troupe_memberships.display_name` et preferred roles par troupe.
- [ ] **Web Mon compte** — `MemberPreferencesForm` lit/écrit le compte, supprime la boucle multi-troupes.
- [ ] **Cleanup** — déprécier ou retirer propagation per-troupe ; ADR optionnel.
- [ ] **Tests** — unit/integration ; cas divergence legacy.

## Dependencies

| Story | Relationship |
|-------|--------------|
| 17.29 | Interim UI + propagation — remplacé par 17.33 |
| 17.24 | Mon compte shell |

## Dev Agent Record

### Agent Model Used

—

### Completion Notes List

—

### File List

—

### Change Log

- 2026-06-01 : Story créée depuis revue code 17.29 (décisions persistance compte vs per-troupe).
