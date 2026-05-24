## Deferred from: code review of 12-2-ecran-mon-agenda.md (2026-05-24)

- Silent truncation beyond 50 events — story explicitly defers load-more / pagination UI to a later slice.
- Duplicated agenda-card SCSS vs season-agenda — story guardrails allow minimal duplication until shared extraction is warranted.

## Deferred from: code review of 2-9-post-login-et-derniere-ligue-visitee-v1-parity.md (2026-05-24)

- Appels concurrents à `navigateAfterSignIn` (double-clic / double flux OAuth) — aucun verrou in-flight dans `Login`. Pattern pré-existant avant cette story. À adresser dans une passe dédiée à la robustesse des auth flows (stories Epic 1 rétrospective ou Epic 12).

## Deferred from: code review of 6-2-detail-evenement-plein-ecran-onglets-infos-dispos-equipe.md (2026-05-24)

- Duplicated date formatting in event-detail header and Infos tab — same pattern as agenda; extract shared helper only if a third consumer appears.

## Deferred from: code review of 3-2-spectacles-dans-la-saison-et-liste-pour-les-membres.md (2026-04-21)

- Revue limitée au diff non commité : périmètre incomplet vs story (API événements, UI `season-home`, migrations, tests unitaires PATCH hors `SeasonControllerIntegrationTest`) — valider sur la branche `v2` ou l’historique de commits avant merge.

- Contrôle d’accès lecture/écriture non différencié (modèle membre/admin provisoire avant epic-2) dans `services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt`.
- Résolution de saison par `slug` basée sur la première troupe côté web (acceptable tant que seed unique), dans `apps/web/src/app/pages/season-home/season-home.ts`.
- Modèle d’accès lecture membre vs gestion admin non séparé (dépend d’epic-2 / matrice permissions), dans `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeAccessService.kt`.

## Deferred from: code review of 3-4-types-devenement-et-roles-requis-optionnels.md (2026-05-23)

- Seed events (V6) keep `custom`/zero slots — agenda icons stay ❓ for titled spectacles (migration scope only; optional follow-up seed script to infer types from titles).

## Deferred from: code review of 3-5-delegation-des-organisateurs-perimetre-saison-evenement.md (2026-05-23)

- Race condition check-then-insert on concurrent organizer grant (composite PK may surface 500 instead of idempotent 200), in `OrganizerAccessService.kt`.
- FK `granted_by_user_id` without `ON DELETE SET NULL` — deleting a grantor user may be blocked, in `V8__season_and_event_organizers.sql`.
- Potential N+1 on user fetch when listing organizers (no JOIN FETCH on repository queries).
- Super-admin stub not wired in `canManageComposition` (documented placeholder until config/epic-2).
- Minimal email validation (`contains("@")` only) in `resolveUserByEmail`.
- Shared `organizerSaving` flag allows parallel remove clicks before DOM disables buttons.

## Deferred from: code review of 2-2-administration-des-membres-et-roles-de-base.md (2026-05-23)

- Erreurs API sans RFC 7807 Problem Details malgré AC5 — le repo utilise `ResponseStatusException` partout ; alignement global hors périmètre story 2.2.
- N+1 lazy-load `user.email` sur `GET /members` (`findByTroupe_Id` sans JOIN FETCH), dans `TroupeMembershipRepository.kt`.
- Retest produit Story 3.5 (organisateurs) non documenté après remplacement de la règle admin provisoire seed-troupe.

## Deferred from: code review of 2-1-adhesion-a-une-troupe-et-profil-membre-minimal.md (2026-05-23)

- Multi-troupe route resolution still uses the first membership (`tr.data[0]`) in `season-home` and event detail pages; deferred to Story 2.4 navigation/troupe switching.
- Admin CRUD actions are still visible for non-admin troupe members; deferred to Story 2.2 role/permission UI while backend enforcement remains authoritative.

## Deferred from: code review of 2-3-import-export-csv-des-membres-de-troupe.md (2026-05-23)

- Limite taille upload multipart non documentée — pattern Spring global préexistant, pas introduit par cette story.

## Deferred from: code review of 2-8-admin-membres-route-ui-ux-dr10.md (2026-05-23)

- Multi-troupe route resolution uses the first membership in `AdminMembres.loadPage`; deferred to Story 2.4 because multi-troupe switching is explicitly out of scope for Story 2.8.

## Deferred from: code review of 2-4-navigation-entre-troupes.md (2026-05-23)

- localStorage indisponible : `selectTroupe` met à jour le signal en mémoire mais si `writeStoredTroupeId` échoue, un `load()` ultérieur peut restaurer une préférence périmée depuis le stockage — edge case navigateurs durcis, commentaire déjà présent dans le service.

## Deferred from: code review of 2-5-pseudo-affiche-par-troupe.md (2026-05-23)

- Correction email dupliqué dans `EventControllerIntegrationTest` (email fixe `event@example.com` remplacé par email par sub) — correctif flaky test hors périmètre story 2.5, conservé dans le diff.

## Deferred from: code review of 2-6-avatar-et-option-image-de-profil-google.md (2026-05-23)

- `AvatarConfig` lève `IllegalStateException` si `HATCAST_AVATAR_STORAGE=gcs` au lieu d’un warning au démarrage comme suggéré dans Dev Notes — prod GCS hors périmètre MVP.

## Deferred from: code review of 3-8-rosters-participants-saison-et-evenement.md (2026-05-24)

- GET list/selectors mutate DB via `ensureMembershipParticipants` on every call — intentional per Dev Notes (sync on GET); revisit if caching or read replicas are introduced.
- Admin DTO exposes normalized (lowercase) email instead of user-entered casing — cosmetic UX only.

## Deferred from: code review of 5-3-vue-organisateur-disponibilites-par-role-et-vues-moi-tous.md (2026-05-24)

- W1 — GET /summary déclenche `ensureMembershipParticipants` (écriture dans transaction lecture) — design voulu pour cohérence du roster ; revisiter si la synchro est découplée en job séparé (Epic 6+).
- W2 — Arrondissements des % ne totalisent pas toujours 100 — inhérent au stub `pastSelectionCount=0` ; appliquer "largest remainder" ou normalisation quand les vrais comptages Epic 6 sont injectés.
- W3 — Accordéons Tous réinitialisés (tous ouverts) à chaque reload du summary post-save — UX mineure ; conserver l'état replié/déplié par rôle lors du rechargement.
- W4 — `requiredCount` algébriquement neutre dans le stub (annulé dans le ratio malus/total) — deviendra pertinent quand Epic 6 introduira des `pastSelectionCount` variables entre candidats.
- W5 — Purple active state Moi/Tous toggle non vérifiable sans contenu SCSS dans le diff — audit SCSS `event-dispos-tab.scss` avant merge.

## Deferred from: code review of 6-1-etats-de-cycle-de-vie-de-composition-et-coherence-ui.md (2026-05-24)

- Réponses POST/PATCH event sans enrichment lifecycle — les endpoints mutation renvoient `compositionLifecycle`/`teamStatusBadge` null ; acceptable pour 6.1 (rechargement via list/detail).

## Deferred from: code review of 6-3-composition-brouillon-non-visible-aux-membres-ordinaires.md (2026-05-24)

- **D1** — Notification `publishDraftCompositionShared` appelée dans `@Transactional` avant commit (`CompositionService.kt` L71) : safe maintenant (no-op log), à corriger en `@TransactionalEventListener` pour Epic 8 avant toute implémentation réelle de livraison.
- **D2** — Idempotence `publish` cassée si tous les slots sont retirés après publication (`assignedCount == 0` check avant `alreadyPublished` check dans `CompositionService.kt` L59-72) : ne peut pas se produire en 6.3 (aucune mutation de slots), à corriger lors de l'implémentation de la story 6.5.
- **D3** — `compositionPublished` perdu si l'onglet Équipe est détruit pendant le publish (`event-detail.html` `@if (activeTab() === 'equipe')`) : dégradation UX mineure, badge Infos non rafraîchi en cas de navigation rapide pendant la publication.
- **D4** — Slots API renvoyés non filtrés sur `event.roleSlots` courant (`CompositionService.kt` buildResponse) : silencieusement ignorés côté Angular aujourd'hui, conséquence réelle à prévoir pour 6.4/6.5 (slots ajoutés via draw/assign).
- **D5** — `resolveDraftVisibility` ignore `hasAssignedSlots` (écart sémantique avec `buildResponse`) : aucune conséquence fonctionnelle actuelle dans `CompositionLifecycleEnrichmentService.kt`.
- **D6** — Toutes les erreurs 409 mappées au même message UX "Rien à publier" côté Angular (`event-equipe-tab.ts` L132-133) : les trois cas backend distincts (pas de composition, déjà validée, aucun slot assigné) ne sont pas différenciés pour l'organisateur.
- **D7** — Publish autorisé avec slots tous en statut `DECLINED` (`CompositionService.kt` L60 : `assignedCount` compte tous les `participantId != null`) : logique de participation 6.7+, sans conséquence fonctionnelle en 6.3.

## Deferred from: code review of 6-4-tirage-aleatoire-pondere-et-affichage-des-cotes-explainability.md (2026-05-24)

- Duplicate eligible-participant loading in `CompositionDrawService` and `CompositionService` — refactor when a shared helper is warranted.
- `prefers-reduced-motion` read once at `EventEquipeTab` init — user toggling OS reduced-motion without reload will not update until navigation.
