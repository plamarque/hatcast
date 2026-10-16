---
feature_branch: feat/11-4-observabilite-parcours-organisateur-posthog
baseline_commit:
---

# Story 11.4 : Observabilité parcours organisateur PostHog

Status: backlog

**Story ID:** 11.4
**Story key:** `11-4-observabilite-parcours-organisateur-posthog`
**Priority:** P1 product observability
**PLAN:** [PLAN.md](../../PLAN.md) § backlog **11.x**
**Epic alignment:** Epic **11** (FR47 — analytics workflow opérateurs produit)
**Depends on:** [11.1](../../_bmad-output/planning-artifacts/epics.md#story-111--événements-analytics-anonymisés-pour-indicateurs-success-criteria), [OPS-9](ops-9-posthog-hatcast-app.md), et les permissions événement déjà exposées par l’API.
**Related:** [11.2](11-2-posthog-identify-person-properties-m4-cutover.md) (dérogation M4 person properties), [hatcast-posthog-smoke-analysis](../../.agents/skills/hatcast-posthog-smoke-analysis/SKILL.md) (exploitation des événements pour le contrat de smoke).

---

## Story

En tant qu’**opérateur produit**,
je veux distinguer les parcours **membre** et **organisateur dans leur contexte de troupe, saison et événement**,
afin de comprendre l’adoption, les abandons et les issues des outils de gestion sans collecter de données métier ou personnelles inutiles.

## Acceptance Criteria

1. **Given** un événement analytics métier émis depuis un détail d’événement, **when** les permissions de la saison et de l’événement ont été chargées, **then** son contexte porte `actor_scope`, valeur exactement parmi `member`, `event_organizer`, `season_organizer`, `troupe_admin`, `platform_admin`, calculée pour cet événement avec une précédence documentée. Un utilisateur organisateur d’un seul événement reste `member` sur les autres événements. [Source: Epic 11 / FR47 ; `MySeasonPermissions` et `canManageComposition`]

2. **Given** les événements FR47 existants (`availability_first_submission`, `notification_link_opened`, `composition_validated`, `composition_all_confirmations_received`), **when** ils sont émis après cette story, **then** ils emportent le contexte `actor_scope` lorsqu’il est déterminable sans appel réseau additionnel ; leur nom et leurs propriétés existantes restent compatibles. [Source: comparaison membres / organisateurs]

3. **Given** un organisateur autorisé ouvre l’espace Équipe d’un événement, **when** la composition est effectivement chargée, **then** `composition_workspace_opened` est émis une fois par contexte événement/session avec `actor_scope`, contexte FR47 et état de cycle de vie borné ; une page vue automatique seule n’est pas considérée comme cette étape. [Source: parcours organisateur]

4. **Given** une mutation organisateur réussit dans le cycle de composition, **when** elle affecte un créneau, prévisualise ou exécute un tirage, valide, publie ou annonce, **then** l’événement sémantique correspondant est émis avec une action et une issue bornées. Pour les créneaux, `operation` est limité à `assign`, `unassign`, `remove_slot` ou `restore_slot`; aucune identité de participant, aucun rôle libre, aucun texte de message ou payload API ne part vers PostHog. [Source: Epic 6 ; Epic 22]

5. **Given** un organisateur envoie une relance de disponibilités, **when** la requête réussit, **then** `availability_reminder_sent` est émis avec le contexte de rôle et un compte de destinataires en classes bornées ; **when** elle échoue ou est refusée, **then** seule une `outcome` bornée est enregistrée. [Source: parcours organisateur / FR47]

6. **Given** les événements de cette story, **when** l’opérateur produit les analyse dans PostHog, **then** il peut filtrer par `actor_scope`, `is_demo_troupe` et le contexte pseudonymisé déjà employé (`troupe_id`, `season_id`, `event_id`), et construire au minimum les funnels « ouvrir Équipe → modifier/tirer → valider » et « valider → publier → annoncer ». La création ou modification d’insights et de dashboards dans PostHog ne se fait qu’avec autorisation explicite. [Source: besoin PO]

7. **Given** l’implémentation, **when** une capture est inspectée dans les tests, **then** ses propriétés suivent une allow-list typée ; elle n’inclut jamais email, nom, slug, avatar, commentaire de disponibilité, contenu de notification, message libre, identifiant de participant ou détail brut d’erreur. La dérogation M4 de 11.2 (`email` / `name` sur *person properties*) n’est ni étendue ni modifiée par cette story. [Source: NFR-S2 ; 11.2]

8. **Given** une personne est organisatrice dans au moins un contexte, **when** un profil People doit servir aux cohortes, **then** le seul trait global supplémentaire autorisé est `has_ever_organized: true`; aucun `role` global mutable ne sert à qualifier les événements. [Source: exactitude multi-périmètre]

9. **Given** la story est prête à être livrée, **when** un mainteneur consulte la documentation, **then** le catalogue des événements, leurs propriétés autorisées, la précédence `actor_scope`, les règles de déduplication et les requêtes/funnels opérateur sont documentés dans le runbook PostHog ; la skill d’analyse smoke peut citer ces signaux sans imposer leur réanalyse à chaque release. [Source: exploitation durable]

**Couverture produit :** FR47 ; NFR-S2. **UI : N/A** — instrumentation invisible, sans changement de comportement ou de surface utilisateur.

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — aucun changement visible sous `apps/web/`; la checklist Material 3 est omise volontairement.

---

## Tasks / Subtasks

- [ ] **Contrat analytics (AC: 1, 2, 7, 8)** — Définir types, constantes et allow-lists dans `apps/web/src/app/core/analytics/`; documenter la précédence du contexte de permissions.
- [ ] **Résolution du contexte (AC: 1, 2, 8)** — Réutiliser `MySeasonPermissions` et la réponse déjà chargée de l’événement ; ne pas introduire d’appel de permissions pour la seule analytics ; ne pas stocker un rôle global périssable comme vérité d’autorisation.
- [ ] **Équipe / composition (AC: 3, 4)** — Instrumenter uniquement les ouvertures chargées et mutations réussies dans `event-detail` / `event-equipe-tab` et les services réellement responsables des opérations.
- [ ] **Relances disponibilités (AC: 5)** — Instrumenter après succès avec catégories d’issue et tranches de volume, sans destinataires ni texte.
- [ ] **Cohortes et exploitation (AC: 6, 9)** — Ajouter les recettes de requêtes/funnels au runbook ; créer des insights PostHog uniquement si l’autorisation est donnée dans la story.
- [ ] **Tests (AC: 1, 2, 3, 4, 5, 7, 8)** — Étendre `product-analytics.service.spec.ts` et les specs des composants/services appelants ; vérifier compatibilité des événements FR47 existants et absence de propriétés interdites.
- [ ] **Documentation et planning (AC: 9)** — Mettre à jour le runbook PostHog et les références de la skill d’analyse si le contrat livré le nécessite.

## Dev Notes

### Product and privacy rules

- Un rôle HatCast est contextuel : troupe, saison et parfois événement. `actor_scope` est donc une propriété **d’événement**, pas une autorisation persistée dans PostHog.
- Les identifiants de contexte FR47 déjà présents sont pseudonymes mais restent des données produit : ils sont réservés au projet PostHog EU et aux opérateurs autorisés.
- Capturer le succès serveur ou une issue bornée, jamais l’intention seule si l’action métier n’a pas abouti. L’ouverture de l’espace Équipe est l’exception utile pour mesurer le haut de funnel.
- Les champs libres et identités de tiers sont interdits dans les propriétés d’événements, y compris sous forme d’objet sérialisé.
- Cette story ne décide pas du retrait de `email` / `name` envoyés par 11.2 : ce changement de gouvernance devra être explicitement demandé et traité séparément.

### Existing implementation anchors

| Fichier | À réutiliser |
|---|---|
| `apps/web/src/app/core/analytics/product-analytics.service.ts` | Façade centralisée, `eventContext`, no-op lorsque PostHog est désactivé. |
| `apps/web/src/app/core/analytics/fr47-event-names.ts` | Constantes d’événements métier existantes. |
| `apps/web/src/app/core/permissions/organizer-api.service.ts` | `MySeasonPermissions` issu de l’API. |
| `apps/web/src/app/core/permissions/organizer-permissions.ts` | Règles actuelles de capacité organisateur par événement. |
| `apps/web/src/app/pages/event-detail/event-detail.ts` | Réponse événement + permissions et chargement d’onglets. |
| `apps/web/src/app/pages/event-detail/event-equipe-tab.ts` | Validation de composition et mutations Équipe. |
| `apps/web/src/app/shared/availability/availability-persist.service.ts` | Capture disponibilité existante à préserver. |

### Explicit non-goals

- Tableau de bord analytics dans HatCast, ou accès PostHog pour les organisateurs de troupe.
- Session replay systématique, enregistrement de frappes, texte libre ou contenu de messages.
- Suivi individuel des participants affectés à une place.
- Nouvelle autorisation métier ou modification des règles de permission.
- Suppression ou extension de la dérogation M4 de la story 11.2 sur les propriétés People.
- Réanalyse PostHog automatique à chaque release.

### Dependencies

| Story | Status | Relationship |
|---|---|---|
| 11.1 | backlog / delivered in code | Base FR47 à conserver compatible. |
| OPS-9 | done | SDK, proxy EU et désactivation sans clé. |
| 11.2 | done | Dérogation M4 People à ne pas étendre. |
| Epic 6 / Epic 22 | done | Parcours de composition et vocabulaire de mutations. |

## Dev Agent Record

### Agent Model Used

À renseigner pendant l’implémentation.

### Completion Notes List

- À renseigner pendant l’implémentation.

### File List

- À renseigner pendant l’implémentation.

### Change Log

- 2026-10-16 : Story créée depuis l’analyse PostHog et le besoin PO de distinguer les parcours organisateur.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (Epic 11 / FR47 / besoin PO)
- [x] **UI : N/A** explicite
- [x] Tasks référencent les numéros d’AC
- [x] Liens vers fichiers code existants à réutiliser
- [x] Commandes de tests à préciser après sélection des composants appelants
