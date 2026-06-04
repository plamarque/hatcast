# Triage du deferred work HatCast V2 — mai 2026

**Date :** 2026-05-28  
**Sources :** [`deferred-work.md`](deferred-work.md) (lecture intégrale, 46 sections / ~105 puces distinctes), [`sprint-status.yaml`](sprint-status.yaml), spot-check code (10 items **E**), [`PLAN.md`](../../PLAN.md) § Pre-prod V2, [ADR 0013](../../docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md).  
**Hors périmètre :** `growth-backlog.md`, `PLAN.md` (non modifiés), `SPEC.md` (non modifié).

---

## 1. Résumé exécutif

Environ **105** entrées distinctes dans `deferred-work.md` (puces, pas sections entières). Après triage : **~28 % A** (obsolète / livré / résolu), **~6 % B** (déjà story, à archiver), **~14 % C** (infra H2/Flyway/CI/OpenAPI — dont beaucoup **partiellement obsolètes** depuis OPS-1 et correction `V3_1`), **~32 % D** (tests manquants, polish UX, hygiène commit), **~14 % E** (dette technique réelle), **~8 % F** (réserve produit / iso-V1), **~2 % G** (migration staging — renvoi **MIG-*** / **M1**). **Recommandation :** vague **H1** limitée à **8–10** actions à effort faible (CI tests, perf lecture dispos, verrou auth, 1–2 points migration slug) ; reporter le gros du cosmétique et de l’Epic 13 au **post-staging** ou à la **vague iso-V1** ; ne pas bloquer **M1** sur le deferred code-review sauf validation CI Postgres.

---

## 2. Méthode

Chaque puce de `deferred-work.md` reçoit un **ID** `DW-###`. Croisement **story id → status** dans `sprint-status.yaml`. Seaux :

| Seau | Signification |
|------|----------------|
| **A** | Obsolète / fermé (livré, ~~résolu~~, ADR annule l’intention, texte dépassé) |
| **B** | Déjà promu en story (lien ; puis archiver) |
| **C** | Infra répétée (H2/Flyway/seed, pgcrypto historique, CI, OpenAPI) |
| **D** | Cosmétique / gap de tests / hygiène |
| **E** | Dette technique réelle (comportement, perf, concurrence, modèle) |
| **F** | Réserve produit (pas une tâche code immédiate) |
| **G** | Bloquant staging / migration (**MIG-***, **M1**, données prod) |

**Priorités :** H1 = avant staging M1 / recette migration ; H2 = prochain sprint post-staging ; post-staging = après M1 validé ; archive = ranger dans historique sans action.

**Spot-check E (2026-05-28) :** `user-agenda.ts` (pas de token concurrence) ; `CompositionService.publishComposition` + `publishDraftCompositionShared` in-transaction ; `organizerChipTooltip` exporté non branché ; `V3_1` seed sans `ON CONFLICT` ; `V23` sans `pgcrypto` (`gen_random_uuid` + commentaire H2) ; `event-context-strip` absent du DOM (test 17.5) ; `tr.data[0]` absent des pages (2.4 / 17.23) ; `rememberCurrentUrlForPostLogin` présent sur plusieurs routes admin/membre.

---

## 3. Tableau de triage

| ID | Source (story/review) | Résumé | Seau | Story status | Obsolete? | Action | Priorité | Notes |
|----|------------------------|--------|------|--------------|-----------|--------|----------|-------|
| DW-001 | 16-1 review | `MemberSeasonGlanceIntegrationTest` bloqué Flyway H2 / seed `V3_1` | C | 16-1 done | oui | **Fermé OPS-2** — CI `api-test.yml` vert | H1 | Seed réécrit sans `ON CONFLICT` (OPS-1) |
| DW-002 | 10-1 review | `check-pwa.sh` URL prod V1 | C | 10-1 done | non | Param `BASE_URL` V2 staging | post-staging | Optionnel story |
| DW-003 | 10-1 review | `PwaInstallService` import shared depuis core | D | 10-1 done | non | Reporter si règles layering durcies | post-staging | |
| DW-004 | 6-10 review | `ShareRecipientsIntegrationTest` non exécuté local H2 | C | 6-10 done | oui | **Fermé OPS-2** — CI `api-test.yml` vert | H1 | |
| DW-005 | 17-17 review | Pas de test UI rétrograder / chip sans droits | D | 17-17 done | non | Tests si régression signalée | post-staging | |
| DW-006 | 17-17 review | Duplication template Externes/Membres admin-event | D | 17-17 done | non | Refactor structurel | post-staging | Héritage 17.16 |
| DW-007 | 17-17 review | `organizerChipTooltip` non branché | D | 17-17 done | non | Brancher ou supprimer export | H2 | Grep : seul helper |
| DW-008 | 17-17 review | AC11 `canManageSeasonOrganizers` inactif sans API | F | 17-17 done | non | Revisiter si permissions orga saison | post-staging | |
| DW-009 | 17-16 review | `afterClosed()` non désabonné add dialog | D | 17-16 done | non | Aligner convention ou `take(1)` | post-staging | Pattern existant |
| DW-010 | 17-15 review | Autocomplete orga limité 100 membres | D | 17-15 done | non | Accepter ou paginer API | post-staging | |
| DW-011 | 17-10 review | Pas de MockMvc `equityCompartments` | D | 17-10 done | non | Test controller si régression | post-staging | |
| DW-012 | 17-10 review | Bottom sheet mobile filtre stats | F | 17-10 done | non | Story UX dédiée | post-staging | |
| DW-013 | 17-10 review | Deep link `?statsGroups=` | F | 17-10 done | non | F10 optionnel | archive | |
| DW-014 | 17-11 review | Breadcrumb visible avant redirect 403 | D | 17-11 done | non | Accepter ou skeleton guard | post-staging | |
| DW-015 | 17-11 review | Pas de test viewport 480px breadcrumb | D | 17-11 done | non | Test e2e/visual si hub l’exige | post-staging | |
| DW-016 | 17-11 review | AC2 admin participants → story 17.16 | B→A | 17-11 / 17-16 done | oui | Archiver ; route livrée | archive | |
| DW-017 | 3-6 review | Parité formules sel/dispo Kotlin ↔ TS | E | 3-6 done | non | Test contrat partagé ou OpenAPI | H2 | |
| DW-018 | 3-6b review | Onglet Statistiques switcher ligue | A | 3-6b done | oui | Retirer du deferred actif | archive | ~~Résolu 2026-05-25~~ |
| DW-019 | 3-6b review | Pas de test `SeasonHome` `loadPastEvents` | D | 3-6b done | non | Test composant si fragile | post-staging | |
| DW-020 | Product reserve 3.6b | Historique ≠ relecture compositions V1 | F | 3-6b done | non | Epic / amendement shell | iso-V1 | §5 |
| DW-021 | Product reserve 3.6b | Mode consultation passé + focus Composition | F | 3-6b done | non | Produit post-iso | iso-V1 | |
| DW-022 | 17-14 review | Renommage copy tag équité | A | 17-14 done | oui | Archiver | archive | Livré commit 17.14 |
| DW-023 | 17-14 review | CTA « Mettre dans un groupe » | A | 17-14 done | oui | Archiver | archive | 2026-05-25 |
| DW-024 | 17-14 review | `event-form-dialog.*` listés non modifiés commit | A | 17-14 done | oui | Archiver (AC déjà sur v2) | archive | |
| DW-025 | 17-12 review | AC6 suite web non revalidée | D | 17-12 done | non | Re-run ciblé `event-infos` specs | H2 | |
| DW-026 | 17-8 review | Double `listEquityTags` Infos + dialog | D | 17-8 done | non | Cache léger si mesuré lent | post-staging | |
| DW-027 | 17-8 review | Spec slug dans commit 17.8 | D | 17-8 done | non | Hygiène commit (fait) | archive | |
| DW-028 | 17-7 review | `@SpringBootTest` H2 bloqué V23 **pgcrypto** | A/C | 17-7 done | oui | Mettre à jour note : V23 = `gen_random_uuid`, alias H2 test | archive | Texte deferred dépassé |
| DW-029 | SCP Event form UX | Suivi 17.8–17.15 backlog SCP | B→A | 17-8…17-15 done | oui | Archiver meta SCP | archive | |
| DW-030 | 17-6 review | Même blocage H2 V23 pgcrypto | A/C | 17-6 done | oui | Idem DW-028 | archive | Doublon |
| DW-031 | 17-6 review | Backfill SQL `translate` vs `slugify` NFD | E/G | 17-6 done | non | Vérifier à **MIG-2** import titres exotiques | H1 | Données prod |
| DW-032 | 17-5 review | Spec admin-membres titre stale | D | 17-5 done | non | Renommer assertion spec | H2 | |
| DW-033 | 17-5 review | Commit bundle 17.4+17.5 | D | 17-5 done | non | Process only | archive | |
| DW-034 | 17-5 review | `seasons-list` unreachable ; kebab saison | F | 17-5 done | non | Non-objectif documenté | iso-V1 | Hub 17.x |
| DW-035 | 17-4 review | Pagination >50 saisons | F | 17-4 done | non | « Charger plus » si troupe grande | post-staging | |
| DW-036 | 17-4 review | `event-dispos-tab.spec` drive-by 17.4 | D | 17-4 done | non | Voir DW-039 | post-staging | |
| DW-037 | 17-3 review | Tests intégration API Flyway V23 CREATE EXTENSION | A/C | 17-3 done | oui | Obsolète (plus d’EXTENSION) | archive | Doublon pgcrypto |
| DW-038 | 17-3 review | `event-dispos-tab.spec` échec suite web | D | 17-3 done | incertain | Confirmer CI web verte | H2 | Spec « 100 % » existe encore |
| DW-039 | 17-2 review | Même échec `event-dispos-tab` AC9 | D | 17-2 done | incertain | Idem DW-038 | H2 | |
| DW-040 | 17-2 closure LIMIT-002 | LIMIT-002 → story 17.11 breadcrumb | B→A | 17-11 done | oui | Archiver | archive | |
| DW-041 | 17-1 review | Double breadcrumb + context strip | A | 17-1 done | oui | Archiver (17.5 strip retiré) | archive | ~~resolved~~ |
| DW-042 | 5-5 review | Proxy PUT sur propre `participantId` | E | 5-5 done | non | Restreindre API si politique stricte | post-staging | Impact faible |
| DW-043 | 12-6 review | Spec header liens sans préfixe `/ligue/` | D | 12-6 done | non | Renforcer assertions | post-staging | |
| DW-044 | 12-3 review | `loadAgenda()` sans token concurrence | E | 12-3 done | non | AbortController / seq | H1 | Spot-check : toujours vrai |
| DW-045 | 12-3 review | 2 requêtes catalogue SQL par load agenda | E | 12-3 done | non | Batch / cache si NFR | H2 | Lié perf agenda |
| DW-046 | 12-3 review | `bootstrapFiltersFromRoute` snapshot seulement | E | 12-3 done | non | `router.events` sync | H2 | |
| DW-047 | 12-3 review | Sticky bar `top:0` chevauche header | D | 12-3 done | non | Polish CSS | post-staging | |
| DW-048 | 12-3 review | Position barre filtres vs wireframe | D | 12-3 done | non | Accepter ou ajuster | post-staging | |
| DW-049 | 6-6 review | Renommer output `compositionPublished` | D | 6-6 done | non | Refactor event-detail | post-staging | |
| DW-050 | 6-6 review | Slots hors lock validate/unlock | E | 6-6 done | non | Documenter MVP ; lock si multi-orga | post-staging | |
| DW-051 | 12-1 review | 4 requêtes auxiliaires participation context | E | 12-1 done | non | Fusion SQL si explain plan | H2 | NFR-P1 |
| DW-052 | 12-2 review | Troncature silencieuse 50 événements | F | 12-2 done | non | Pagination UI story dédiée | post-staging | |
| DW-053 | 12-2 review | SCSS carte agenda dupliqué | D | 12-2 done | non | Extraction shared si 3e usage | post-staging | |
| DW-054 | 2-9 review | `navigateAfterSignIn` concurrent sans verrou | E | 2-9 done | non | Mutex in-flight Login/OAuth | H1 | Recette auth staging |
| DW-055 | 6-2 review | Format date dupliqué header/Infos | D | 6-2 done | non | Helper partagé si 3e usage | post-staging | |
| DW-056 | 3-2 review | Revue limitée diff non commité | A | 3-2 done | oui | Archiver (historique avril) | archive | |
| DW-057 | 3-2 review | ACL lecture/écriture non différenciée EventService | E | 3-2 done | non | Epic 2 matrice permissions | post-staging | |
| DW-058 | 3-2 review | Saison par slug = première troupe web | A/E | 3-2 done | partiel | 2.4 + 17.23 contexte ; revérifier edge | H2 | Plus de `data[0]` pages |
| DW-059 | 3-2 review | TroupeAccessService membre vs admin | E | 3-2 done | non | Epic 2 / super-admin | post-staging | |
| DW-060 | 3-4 review | Seed V6 events `custom`/0 slots | G | 3-4 done | non | Script post-import ou **MIG-2** | H2 | Icônes ❓ seed dev |
| DW-061 | 3-5 review | Race grant organisateur check-then-insert | E | 3-5 done | non | UPSERT / catch duplicate | H2 | |
| DW-062 | 3-5 review | FK `granted_by` sans ON DELETE SET NULL | E | 3-5 done | non | Migration Flyway | H2 | |
| DW-063 | 3-5 review | N+1 fetch users list organizers | E | 3-5 done | non | JOIN FETCH | H2 | |
| DW-064 | 3-5 review | Super-admin stub `canManageComposition` | E | 3-5 done | non | Config epic-2 | post-staging | |
| DW-065 | 3-5 review | Validation email minimale | E | 3-5 done | non | Renforcer si comptes réels | post-staging | |
| DW-066 | 3-5 review | `organizerSaving` flag partagé | D | 3-5 done | non | Disable per-row | post-staging | |
| DW-067 | 2-2 review | Pas de RFC 7807 Problem Details | E | 2-2 done | non | Initiative transverse API | post-staging | |
| DW-068 | 2-2 review | N+1 `user.email` GET /members | E | 2-2 done | non | JOIN FETCH | H1 | Charge staging troupes réelles |
| DW-069 | 2-2 review | Retest produit 3.5 après 2.2 | D | 2-2 done | non | Checklist recette manuelle | H2 | |
| DW-070 | 2-1 review | Multi-troupe `data[0]` season-home | A | 2-1 done | oui | Archiver (2.4 livré) | archive | |
| DW-071 | 2-1 review | Actions admin visibles non-admin UI | E | 2-1 done | partiel | Masquage UI si backend OK | H2 | |
| DW-072 | 2-3 review | Limite upload multipart non documentée | D | 2-3 done | non | Doc DEVELOPMENT | post-staging | |
| DW-073 | 2-8 review | Multi-troupe `data[0]` AdminMembres | A | 2-8 done | oui | Archiver (2.4) | archive | |
| DW-074 | 2-4 review | localStorage fail → préférence périmée | E | 2-4 done | non | Edge case documenté | post-staging | |
| DW-075 | 2-5 review | Email dupliqué test intégration | A | 2-5 done | oui | Archiver (fix flaky) | archive | |
| DW-076 | 2-6 review | `AvatarConfig` GCS = exception vs warning | D | 2-6 done | non | Warning startup cloud | post-staging | |
| DW-077 | 3-8 review | GET roster déclenche `ensureMembershipParticipants` | E | 3-8 done | non | Job async si perf | H2 | Lié **G-003** |
| DW-078 | 3-8 review | Email normalisé lowercase DTO admin | D | 3-8 done | non | Afficher casing user | post-staging | |
| DW-079 | 5-3 W1 | GET summary + `ensureMembershipParticipants` écriture | E | 5-3 done | non | Découpler sync lecture | **H1** | **G-003** / PERF dispos |
| DW-080 | 5-3 W2 | % arrondis ≠ 100 (stub pastSelection) | E | 5-3 done | non | largest remainder quand Epic 6 counts | post-staging | |
| DW-081 | 5-3 W3 | Accordéons Tous reset à chaque reload | D | 5-3 done | non | Conserver état UI | post-staging | |
| DW-082 | 5-3 W4 | `requiredCount` neutre dans stub | E | 5-3 done | non | Attendre comptages réels | post-staging | |
| DW-083 | 5-3 W5 | Toggle Moi/Tous purple — audit SCSS | D | 5-3 done | non | Vérifier M3 tokens | post-staging | |
| DW-084 | 6-1 review | POST/PATCH event sans lifecycle enrichment | D | 6-1 done | non | Enrichir si clients l’utilisent | post-staging | |
| DW-085 | 6-3 D1 | Notification publish in-`@Transactional` | E | 6-3 done | non | `@TransactionalEventListener` avant Epic 8 | H1 | Spot-check : toujours in-tx |
| DW-086 | 6-3 D2 | Idempotence publish si slots retirés | E | 6-5+ done | non | Corriger avec mutations slots | post-staging | |
| DW-087 | 6-3 D3 | `compositionPublished` perdu si onglet détruit | D | 6-3 done | non | Signal parent / cache | post-staging | |
| DW-088 | 6-3 D4 | Slots API non filtrés `roleSlots` | E | 6-3 done | non | Filtrer avant 6.4/6.5 edge | H2 | |
| DW-089 | 6-3 D5 | `resolveDraftVisibility` ignore `hasAssignedSlots` | E | 6-3 done | non | Aligner sémantique | post-staging | |
| DW-090 | 6-3 D6 | 409 tous mappés « Rien à publier » | D | 6-3 done | non | Messages distincts UX | H2 | |
| DW-091 | 6-3 D7 | Publish avec slots DECLINED comptés | E | 6-7+ done | non | Filtrer statuts participation | post-staging | |
| DW-092 | 6-5 review | Duplication pool eligible explainability | E | 6-5 done | non | Refactor service | post-staging | |
| DW-093 | 6-5 review | TOCTOU assign même rôle | E | 6-5 done | non | Lock slot si prod report | post-staging | |
| DW-094 | 6-4 review | Duplicate eligible loading draw vs service | E | 6-4 done | non | Helper partagé | post-staging | |
| DW-095 | 6-4 review | `prefers-reduced-motion` lu une fois | D | 6-4 done | non | Media query listener | post-staging | |
| DW-096 | 6-8 review | Branche morte snackbar foreign slot | D | 6-8 done | non | Cleanup TS | H2 | |
| DW-097 | 6-8 review | Viewer non lié slots statiques | E | 6-8 done | non | Edge case documenté | post-staging | |
| DW-098 | 16-1 (meta) | `openapi/members.yaml` non mergé composition | C | 16-1 done | non | Merger si pipeline exige | post-staging | |
| DW-099 | cluster C | **~8 entrées** Flyway H2 / pgcrypto / V3_1 | C | divers done | oui | **Fermé OPS-2** — `api-test.yml` + README profil `test`/H2 | H1 | Option A PO ; Postgres CI optionnel avant MIG-2 |
| DW-100 | cluster F | Réserve historique 3.6b (DW-020–021) | F | 3-6b done | non | Iso-V1 track | iso-V1 | |

*Lignes DW-001–097 = corpus principal ; DW-098–100 = regroupements documentés pour le résumé (éviter double comptage dans les totaux § chat : utiliser **97 lignes atomiques** + 3 synthèses).*

---

## 4. Liste H1 proposée (max 10)

| # | ID | Justification |
|---|-----|----------------|
| 1 | **DW-099 / DW-001 / DW-004 / DW-028–030–037** | Confiance CI/staging : valider suite intégration (H2 corrigé, Postgres CI) — bloqueur confiance pas M1 infra. |
| 2 | **DW-079** (+ **G-003**) | Perf réelle onglet Dispos en recette / migration (écriture sur GET summary) — retour terrain. |
| 3 | **DW-068** | N+1 membres : charge API avec troupe prod importée (**M2**). |
| 4 | **DW-031** | Risque slugs import V1 titres exotiques (**MIG-2**). |
| 5 | **DW-054** | Double navigation post-login en recette OAuth staging. |
| 6 | **DW-044** | Race filtres agenda (clics rapides) — bug UX visible. |
| 7 | **DW-085** | Préparer notifications Epic 8 (publish in-tx) — faible effort, gros risque futur. |
| 8 | **DW-002** | Smoke PWA V2 sur URL staging (script paramétrable). |

*Non retenus H1 (report H2/post-staging) : DW-017 parité formules, DW-088 slots API, polish 17.x, Epic 13.*

---

## 5. Liste iso-V1 / V2.0.0 (hors deferred code-review)

Écarts V1 / produit **non** traités comme H1 deferred — sources PLAN, ADR, stories. **MAJ 2026-06-02 :** MEP iso-V1 **closed** ; cutover = § **Wave V2.0.0** ([SCP](_bmad-output/planning-artifacts/sprint-change-proposal-2026-06-02-v2.0.0-cutover-scope.md)).

| Thème | Source | Priorité |
|-------|--------|----------|
| Historique ligue : relecture **compositions** passées | DW-020–021 | Post-V2.0.0 |
| **Mon compte** hub membre | **17.24** | Done |
| Compte : onglets + prefs entry | **17.34** | **P0 V2.0.0** |
| Inscription email / mot de passe | **1.2** | **Recette gate V2.0.0** (code done) |
| UX inscription dédiée (parité V1) | **1.2b** | **P0 V2.0.0** |
| Compte : MAJ email + MDP connecté | **1.6** | **P0 V2.0.0** |
| Compte : suppression | **1.7** | **P0 V2.0.0** (exclu MEP → in cutover) |
| Reset mot de passe | **1.3** | **Recette gate V2.0.0** |
| **Annuaire public troupes** | **4.1** | Done |
| **Audit** | **9.0** capture ; **9.1** UI | Done / post-V2.0.0 (**9.2**) |
| **Notifications** | **8.1**, **3.21**, **8.3**, **8.2**, **8.5**, **6.10b** | Done ; **8.4** post-V2.0.0 |
| Modales annonces UX | **6.15** | **P0 V2.0.0** |
| PWA recette + MAJ + changelog + aides + icône | **10.4–10.7**, **10.2**, **10.3** | **P0 V2.0.0** |
| Release pipeline tags | **OPS-4–7** | **P0 V2.0.0** |
| Prod domaine **`hatcast.app`** (CF + Cloud Run west1) | **OPS-8** | **P0 V2.0.0** — domaine acheté 2026-06-03 |
| PostHog analytics (proxy `e.hatcast.app`) | **OPS-9** / **G-005** | **P1 V2.0.0** — post-**M4** |
| E-mail `noreply@` / `info@` **@hatcast.app** | **OPS-10** | **P1 V2.0.0** — post-**M4** |
| Invités | Epic **7** | Post-V2.0.0 |
| Multi-saisons actives | Epic **13** | Post-V2.0.0 |
| Pages publiques saison/événement | **4.2** | Post-V2.0.0 |

---

## 6. Doublons / consolidation

| Cluster | IDs | Action |
|---------|-----|--------|
| **H2 / pgcrypto / V23** | DW-028, DW-030, DW-037 (+ mentions 17-6, 17-7) | **Archiver** ; remplacer par note unique : « CI Postgres ; H2 `application-test.yml` + `gen_random_uuid` » |
| **Flyway seed V3_1 ON CONFLICT** | DW-001 (+ tests intégration 6-10, 16-1) | Fusionner ; seed corrigé — **fermer après vert CI** |
| **event-dispos-tab spec** | DW-036, DW-038, DW-039 | Une entrée active ; lier **G-003** / 5-6 / 6-11 |
| **LIMIT-002 → 17.11** | DW-040 | **A** |
| **Multi-troupe data[0]** | DW-070, DW-073, DW-058 | **A** sauf re-audit ciblé |
| **G-003 vs DW-079** | growth + deferred 5-3 W1 | **Un** ticket perf « summary dispos » |
| **Epic 13.6 travel league** | PLAN + ADR 0013 | **F/A** — pas deferred item ; ne pas rouvrir |

---

## 7. Actions proposées sur `deferred-work.md` — **fait (DOC-1, 2026-06-04)**

- Archive verbatim : [`deferred-work-archive.md`](deferred-work-archive.md)
- Actif P0–P2 : [`deferred-work.md`](deferred-work.md)
- Triage juin + DW-101+ : [`deferred-triage-2026-06.md`](deferred-triage-2026-06.md)

---

## Annexe — Comptage par seau (lignes DW-001–097, hors synthèses DW-098–100)

| Seau | N | % (~97) |
|------|---|--------|
| **A** | 14 | 14 % |
| **B** | 3 | 3 % |
| **C** | 9 | 9 % |
| **D** | 32 | 33 % |
| **E** | 28 | 29 % |
| **F** | 8 | 8 % |
| **G** | 3 | 3 % |

*Ajustement résumé exécutif (vision produit) : en incluant regroupements et items « incertain » vers A après CI, le volume **actionnable** avant staging est **~15–20 %** (H1 + G + C), le reste post-staging ou iso-V1.*
