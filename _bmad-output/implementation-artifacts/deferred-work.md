## Deferred from: code review of 18-4-ux-onboarding-rejoindre-demo.md (2026-05-28)

- Fichiers `demo-troupe-*.ts` encore non suivis git (`??`) — à inclure au prochain commit ; pas un défaut runtime.
- Pages admin (`admin-membres`, `admin-participants`, etc.) : breadcrumb sans `troupeIsDemo` — hors libellé AC3 « surfaces membre saison » ; aligner si badge souhaité côté orga.

## Deferred from: code review of 18-2-self-join-open-api-super-admin-join-policy.md (2026-05-28)

- `ensureMembershipParticipants` n'utilise pas `ensureSeasonParticipantForMembership` — refactor bulk sync hors scope 18.2, duplication préexistante étendue.
- Plusieurs saisons actives → `NonUniqueResultException` sur `findByTroupe_IdAndIsActiveTrue` — invariant produit via `SeasonService.activate`, edge case DB directe.

## Deferred from: code review of 18-1-modele-join-policy-is-demo.md (2026-05-28)

- Drift enum `TroupeJoinPolicy` ↔ CHECK `troupes_join_policy_chk` — même pattern que `baseline_role` / V10 ; pas de source de vérité unique.

## Deferred from: code review of 18-0-renommer-seed-dev-les-improbots.md (2026-05-28)

- Venue fiction « Local Malice, Lille » dans V26 — libellé lieu spectacle, pas identité troupe seed.
- Noms export `buildMalicie*` dans `generate-improbots-seed-sql.js` — aliases npm malice conservés ; renommage cosmétique différé.
- Checksum Flyway seeds modifiés sur base Neon persistant sans `repair-on-migrate` — V31 compense le contenu ; pattern ops connu.
- Collision slug `les-improbots` si troupe homonyme créée manuellement avant V31 — edge case dev rare.
- Fixtures unitaires front « La Malice » génériques dans `troupe-context.service.spec.ts` — non couplées au seed UUID.

## Deferred from: code review of 2-11-creation-troupe-api-ui-minimale.md (2026-05-28)

- `TroupeRepository.findBySlug` ajouté mais non utilisé (optionnel dans la story) — retirer ou utiliser si un flux slug→id apparaît.

## Deferred from: code review of ops-2-ci-integration-tests-postgres.md (2026-05-28)

- Required status check / branch protection for workflow `services/api (tests)` (`api-test.yml`) not verified in repo settings — configure on `v2`/`main` when enforcing M1 gate.

## Archive / closed (triage 2026-05-28, OPS-2)

- **DW-099 / H-CI-TEST** — CI `./gradlew test` : [`.github/workflows/api-test.yml`](../../.github/workflows/api-test.yml) ; profil `test` + H2 documenté dans [`services/api/README.md`](../../services/api/README.md).
- **DW-001, DW-004** — `MemberSeasonGlanceIntegrationTest`, `ShareRecipientsIntegrationTest` : fermés après vert CI (seed `V3_1` sans `ON CONFLICT`, OPS-1).
- **DW-028, DW-030, DW-037** (pgcrypto) — **Obsolète** : `V23` utilise `gen_random_uuid()` (PostgreSQL 13+) ; pas d’extension `pgcrypto` ; H2 `MODE=PostgreSQL` en test.

---

## Deferred from: code review of 16-1-route-membre-saison-clin-oeil-filtres.md (2026-05-26)

- ~~`MemberSeasonGlanceIntegrationTest` non exécutable localement — Flyway H2 échoue sur seed `V3_1` (`ON CONFLICT`) avant d’atteindre les tests glance ; valider en CI.~~ **Fermé OPS-2 (2026-05-28).**
- `openapi/members.yaml` isolé — pas de merge dans la composition OpenAPI tant qu’aucun pipeline ne l’exige.

## Deferred from: code review of 10-1-installabilite-pwa-raccourci-ajouter-a-lecran-d-accueil.md (2026-05-26)

- `scripts/check-pwa.sh` still targets V1 production URL — parameterize `BASE_URL` for V2 HTTPS smoke (story already optional).
- `PwaInstallService` imports `PwaInstallInstructionsDialog` from `shared/` (core → shared) — acceptable for now; refactor only if layering rules tighten.

## Deferred from: code review of 6-10-partage-et-annonce-message-editable-canaux.md (2026-05-26)

- ~~`ShareRecipientsIntegrationTest` non exécuté localement (Flyway/H2) — tests présents ; à valider en CI / env test sain.~~ **Fermé OPS-2 (2026-05-28).**

## Deferred from: code review of 17-17-chip-organisateur-promouvoir-listes-admin.md (2026-05-26, closure 2026-05-27)

- Pas de test Rétrograder via menu UI ni chip lecture seule sans droits `canManage*` — couverture promote/chip partielle jugée suffisante pour cette story.
- Duplication template Externes/Membres sur `admin-event-participants.html` — héritage 17.16, refactor structurel hors périmètre 17.17.
- `organizerChipTooltip` exporté mais non branché sur les templates — cosmétique ; retirer ou utiliser en follow-up UI.
- AC 11 branche `canManageSeasonOrganizers` sans liste participants — inactif tant que l’API lie les deux flags au admin troupe ; à revisiter si permissions orga saison évoluent.

## Deferred from: code review of 17-16-route-admin-participants-evenement.md (2026-05-26)

- Subscription `afterClosed()` non désabonnée dans `openAddDialog()` — même pattern que `admin-participants.ts` ; convention existante, pas introduit par 17.16.

## Deferred from: code review of 17-15-onglet-infos-organisateurs-retrait-participants-formulaire.md (2026-05-25)

- Autocomplete membres troupe limité à 100 dans `EventOrganizersDialog` — même risque que d’autres pickers ; acceptable pour la taille typique des troupes.

## Deferred from: code review of 17-10-statistiques-filtre-groupes-spectacles.md (2026-05-25)

- Pas de test MockMvc du paramètre `equityCompartments` — couverture service + unitaires compartiments jugée suffisante pour cette story.
- Bottom sheet mobile pour le filtre groupes — menu Material desktop livré ; polish mobile hors scope story.
- Deep link `?statsGroups=` — UX F10 optionnel ; non implémenté.

## Deferred from: code review of 17-11-breadcrumb-pages-admin-back-office.md (2026-05-25)

- Breadcrumb visible brièvement avant redirect « Accès non autorisé » — même fenêtre qu’avec l’ancien titre H1 ; hors périmètre chrome 17.11.
- Pas de test viewport mobile 480px pour AC4 — pattern 17.1 non couvert par tests automatisés sur les autres headers.
- **AC2 admin participants événement** → **Story 17.16** (`17-16-route-admin-participants-evenement.md`, backlog). PO : route (pas dialog) ; participants ponctuels event-only (musicien, MC invité) ; roster par défaut = participants saison (3.8). Supersède entrée dialog 17.15 AC6.

## Deferred from: code review of 3-6-vue-historique-colonnes-roles-mois-export-masquage.md (2026-05-25)

- Formules sel/dispo dupliquées Kotlin + TS sans test de parité contrat — risque de dérive ; acceptable tant que les tests unitaires des deux côtés restent alignés sur les cas V1.

## Deferred from: code review of 3-6b-vue-historique-ligue-chronologie-export.md (2026-05-25)

- _(Résolu 2026-05-25, story 3.6)_ Onglet **Statistiques** dans le switcher ligue (Agenda | Historique | Statistiques).
- Pas de test composant `SeasonHome` pour `loadPastEvents` — tests unitaires sur `season-agenda`, toolbar, export ; aligné pattern agenda existant.

## Product reserve — Historique vs V1 (PO 2026-05-25, story 3.6b validée avec réserve)

- Historique ligue = chronologie + filtres + export CSV (FR53–54) — **livré**.
- **UX :** parité Agenda insuffisante pour l’intention V1 (relecture des **compositions** passées, pas édition globale du spectacle). Liste en lecture seule ; **détail événement** encore modifiable pour les orgas.
- **Follow-up produit / UX :** mode consultation passé, focus Composition / rôle dans l’équipe sur les cartes ; possible epic ou amendement shell ligue + `event-detail`.

## Deferred from: code review of 17-14-onglet-infos-type-roles-modales.md (2026-05-25)

- Renommage copy tag d’équité (`event-equity-tag-dialog.ts`) inclus dans le commit 17.14 — cohérence « Groupe de spectacles » sur Infos, pas de correctif isolé requis.
- CTA vide (2026-05-25) : **« Mettre dans un groupe »** + style lien primaire (`.event-infos__add-tag` aligné organisateur·ices) — doc Screen 6b / story 17.8 mises à jour ; pas d’ADR.
- Fichiers `event-form-dialog.*` listés dans la story mais non modifiés dans `7041ab3` — comportement AC5–7 déjà présent sur `v2` avant ce commit.

## Deferred from: code review of 17-12-slug-spectacle-sans-saisie-formulaire.md (2026-05-25)

- AC6 — suite web complète non revalidée lors de la revue ; échecs préexistants `event-infos-tab.spec.ts` (17.8), déjà notés dans la story.

## Deferred from: code review of 17-8-ui-onglet-infos-tag-equite.md (2026-05-25)

- Duplicate `listEquityTags` on Infos tab init and on each dialog open — acceptable MVP cost.
- `event-form-dialog.spec.ts` slug-related edits co-located with 17.8 equity guard — belongs to 17.12 commit hygiene.

## Deferred from: code review of 17-7-api-tag-equite-glossaire-troupe.md (2026-05-25)

- ~~Suite d’intégration API `@SpringBootTest` sur H2 — V23 `pgcrypto` bloque Flyway en local H2 ; tests equity-tag supposent Postgres/CI (aligné 17.6).~~ **Obsolète** — voir en-tête archive OPS-2 ; CI H2 + `gen_random_uuid`.

## Follow-up — Event form UX (PO 2026-05-25, SCP)

- Retours modale spectacle → **17.8** amendée (tag on Infos tab) ; **17.12–17.15** backlog. SCP : `sprint-change-proposal-2026-05-25-epic17-event-form-ux.md` ; backlog : `ux-backlog-event-form-dialog.md`.

## Deferred from: code review of 17-6-slug-evenement-dans-les-urls.md (2026-05-25)

- ~~Suite d’intégration API `@SpringBootTest` sur H2 — V23 `pgcrypto` bloque Flyway en local H2 ; tests d’intégration slug supposent Postgres/CI.~~ **Obsolète** — voir en-tête archive OPS-2.
- Backfill SQL (`translate`) vs `slugify` Kotlin/NFD — écart possible sur titres exotiques au moment de la migration uniquement.

## Deferred from: code review of 17-5-redirects-fin-seasons-hub-troupe.md (2026-05-25)

- Stale admin-membres spec title (« seasons list ») while asserting navigation to `/troupes`.
- Commit `2dd6c07` bundles Story 17.4 troupe-hub and 17.5 redirects — harder to bisect/revert redirect-only changes.
- `seasons-list` unreachable after `/seasons` → `/troupes` redirect — season-level kebab CRUD gap (documented non-goal).

## Deferred from: code review of 17-4-hub-troupes-slug.md (2026-05-25)

- Pagination beyond 50 seasons (`SEASONS_PAGE_SIZE`) — no “Charger plus” until a troupe exceeds the cap.
- `event-dispos-tab.spec.ts` chances-toggle stabilisation bundled in 17.4 diff — drive-by, not acceptance scope.

## Deferred from: code review of 17-3-page-troupes-mes-troupes-decouvrir.md (2026-05-25)

- Session redirect test does not assert `rememberCurrentUrlForPostLogin` — same gap as `seasons-list` specs.
- ~~API integration tests blocked locally by Flyway V23 on H2 (`CREATE EXTENSION`).~~ **Obsolète** — voir en-tête archive OPS-2.
- Pre-existing `event-dispos-tab.spec.ts` failure in full web suite (unrelated to 17.3).

## Deferred from: code review of 17-2-bandeau-administration-par-scope.md (2026-05-25)

- Suite web 355/356 — échec préexistant `event-dispos-tab.spec.ts` (assertion « 100 % ») — hors périmètre 17.2 ; AC9 documenté comme connu dans la story.

## Follow-up at story closure (17-2, PO 2026-05-25) — scheduled as Epic 17.11

- **LIMIT-002** → **Story 17.11** `17-11-breadcrumb-pages-admin-back-office.md` (`ready-for-dev`, backlog in sprint-status). Correct Course SCP: `sprint-change-proposal-2026-05-25-epic17-admin-chrome-stories.md`.

## Deferred from: code review of 17-1-breadcrumb-contexte-responsive.md (2026-05-25)

- ~~Double affichage troupe·saison (breadcrumb mobile + `app-event-context-strip`)~~ — **resolved** in Story 17.5 (`event-context-strip` removed).

## Deferred from: code review of 5-5-saisie-de-disponibilite-pour-un-autre-membre-proxy-avec-audit.md (2026-05-25)

- Organizer may call proxy PUT on own `participantId` (sets `recorded_by_user_id`; AC #5 prefers `/me` only) — low impact, no UI path today.

## Deferred from: code review of 12-6-alias-route-ligue-slug.md (2026-05-25)

- `season-header.spec.ts` admin menu links assert `href*="admin/participants"` / `admin/membres` only, not the `/ligue/` prefix — pre-existing weak assertion pattern; links did migrate to `/ligue/` via helpers.

## Deferred from: code review of 12-3-filtres-troupe-ligue-agenda.md (2026-05-25)

- Concurrent `loadAgenda()` without request token — race on rapid filter clicks (`user-agenda.ts:loadAgenda`).
- Two extra catalog SQL queries on every agenda load when `filterBarVisible` — same class as 12-1 participation-context cost.
- `bootstrapFiltersFromRoute` uses route snapshot only — in-place query param changes not re-synced (`user-agenda.ts`).
- Sticky bar `top: 0` may overlap page header on scroll — minor UX polish.
- Filter bar below « Mes troupes » link, not directly under title — layout acceptable vs wireframe intent.

## Deferred from: code review of 6-6-validation-verrouillage-de-la-composition.md (2026-05-24)

- `compositionPublished` output reused for validate/unlock — AC10 reload works; rename when event-detail outputs are refactored (`event-equipe-tab.ts`).
- Slots updated outside composition row lock during validate/unlock — `findByEventIdForUpdate` on composition only; acceptable for single-organizer MVP (`CompositionService.kt`).

## Deferred from: code review of 12-1-api-agenda-utilisateur.md (2026-05-24)

- Participation context runs four auxiliary queries per request — acceptable for MVP; batch into one query if explain plans fail NFR-P1.

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

## Deferred from: code review of 6-5-assignation-manuelle-et-reassignation-des-roles.md (2026-05-24)

- `loadEligibleForExplainability` duplicates `CompositionParticipantPool` in `CompositionService.kt` — deferred from 6.4 review; refactor when explainability path is consolidated.
- Concurrent same-role assign TOCTOU in `CompositionSlotAssignmentService.kt` — check-then-insert without slot-level lock; acceptable for MVP unless duplicate-slot reports appear in prod.

## Deferred from: code review of 6-4-tirage-aleatoire-pondere-et-affichage-des-cotes-explainability.md (2026-05-24)

- Duplicate eligible-participant loading in `CompositionDrawService` and `CompositionService` — refactor when a shared helper is warranted.
- `prefers-reduced-motion` read once at `EventEquipeTab` init — user toggling OS reduced-motion without reload will not update until navigation.

## Deferred from: code review of 18-5-configuration-prod-tests-separation-demo.md (2026-05-28)

- Vitest ne couvre pas `inject-google-client-id.mjs` — seul `environment.ts` commité est testé ; hardening optionnel prévu par la story.
- `seasons-list.spec.ts` mock `DemoTroupeJoinService` sans assert `DEMO_TROUPE_ID` — AC4 satisfait via `troupes-list` + `demo-troupe-join.service` (clause `and/or`).
- UUID `…000099` dupliqué dans env + inject script sans import `DEMO_TROUPE_ID` — hardening optionnel prévu par la story.

## Deferred from: code review of 5-7-summary-dispos-lecture-sans-ecriture.md (2026-05-29)

- Transient summary/selectors race on first parallel load (`event-dispos-tab.ts:164`) — pre-existing Promise.all pattern; AC3 keeps sync on selectors; microwindow resolves on reload/retry.
- `reloadSummary()` does not re-fetch selectors (`event-dispos-tab.ts:199`) — pre-existing; out of 5-7 scope; membership changes mid-session are rare.
- API clients calling GET summary without selectors get stale roster (`AvailabilityController.kt:48`) — intentional AC2 contract; sync paths remain on selectors/listAdmin/composition.

## Deferred from: code review of 6-8-confirmation-ou-declinaison-pour-le-compte-d-un-membre-proxy.md (2026-05-25)

- Dead branch in `onSlotRowClick` foreign-slot snackbar (`event-equipe-tab.ts:337-344`) — readonly button path makes it unreachable; harmless cleanup.
- Unlinked viewer (`viewerParticipantIds` empty) sees static foreign slots without snackbar (`event-equipe-tab.html:151-168`) — edge case outside typical linked-member flow.
