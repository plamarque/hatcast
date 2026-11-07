---
feature_branch: feat/25-25-lire-les-anecdotes-completes-avant-de-choisir
baseline_commit:
---

# Story 25.25 : Lire les anecdotes complètes avant de choisir

Status: backlog

## Story

En tant que **membre participant au Quiz de l’Avent**,  
je veux **pouvoir consulter l’histoire complète de chaque proposition avant de répondre**,  
afin de **juger les trois anecdotes avec les informations fournies par les contributeurs**.

## Acceptance Criteria

1. **Given** un quiz accessible et jouable, **when** le membre arrive au formulaire de réponse, **then** les trois propositions courtes restent visibles, identifiables et sélectionnables ; leur ordre et leur association à la réponse enregistrée sont inchangés. [Source : demande produit 2026-11-07 ; story 25.2]
2. **Given** une proposition disposant d’un récit complet, **when** le membre active sa commande de lecture, **then** il peut lire tout le récit correspondant, avec ses paragraphes et caractères conservés, puis revenir au choix. Consulter, ouvrir ou fermer un récit ne sélectionne pas une réponse et ne modifie pas le choix déjà fait ; le membre peut toujours changer ce choix avant confirmation. Chaque récit disponible est consultable avant de répondre. [Source : demande produit ; story 25.22]
3. **Given** une ou plusieurs propositions sans récit complet, **when** le quiz est affiché, **then** la proposition courte disponible reste sélectionnable et aucune commande de lecture vide ne lui est associée. Les anciens quiz sans récits restent jouables. [Source : demande produit ; catalogue Avent]
4. **Given** une réponse confirmée puis un résultat autorisé et révélable, **when** le membre le consulte, **then** les histoires complètes disponibles restent accessibles en rappel sous leurs propositions respectives ; l’explication, les points et la navigation existants sont préservés. [Source : demande produit ; story 25.22]
5. **Given** une lecture autorisée du quiz jouable, **when** le serveur fournit son contenu, **then** il peut fournir les récits facultatifs ordonnés associés aux trois propositions, sans divulguer l’indice de la proposition fausse, la justesse, les points, l’explication de révélation ou des métadonnées révélatrices. Les accès aux jours futurs, l’appartenance, la prévisualisation, les modes de test, l’isolation des comptes et `no-store` restent appliqués côté serveur. Les autres réponses et états restent protégés selon leurs règles existantes. [Source : demande produit ; architecture AD-1 à AD-4]
6. **Given** les différents parcours autorisés (membre, test isolé, prévisualisation et ouverture anticipée autorisée en développement), **when** le quiz est jouable, **then** la consultation des récits suit les mêmes droits et le même ordre ; une requête non autorisée ou visant un jour verrouillé ne divulgue aucun contenu privé. Les états d’attente et de résultat conservent leurs protections et comportements propres. [Source : stories 25.15, 25.19 et 25.22]

**Couverture produit :** epic 25, UX-DR11 ; [DESIGN](../planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/DESIGN.md), [EXPERIENCE](../planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/EXPERIENCE.md), [architecture AD-7](../planning-artifacts/architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md).

## Acceptance Criteria — Material 3 (UI)

- **M3-1.** Utiliser des commandes Material accessibles adaptées à la sélection et à la lecture, avec des commandes distinctes et non imbriquées ; leur nom et leur état ouvert/fermé sont perceptibles au clavier et aux lecteurs d’écran. Préserver le focus et l’ordre de navigation.
- **M3-2.** Respecter la direction artistique et les tokens isolés Avent, sans changement du thème global HatCast ; appliquer [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md), UX-DR11 et AD-7.
- **M3-3.** Vérifier mobile ≤ 480 px, notamment 320 px, texte agrandi à 200 %, défilement naturel et absence de troncature ou débordement ; cibles tactiles ≥ 44 × 44 px, 48 préférés. Respecter le mouvement réduit.
- **M3-4.** Vérifier visuellement les états sans récit, partiels et complets, au clavier et sur mobile ; vérifier l’absence de régression ou de fuite de styles sur HatCast selon la [stratégie de tests](../test-artifacts/test-design-advent-visual-isolation.md).
- **M3-5.** Parcourir la checklist M3 de FRONTEND_UI et documenter tout écart justifié.

## Tasks / Subtasks

- [ ] **API :** adapter les projections de quiz et les types concernés pour exposer les récits facultatifs uniquement aux lectures autorisées ; conserver les protections et vérifier les parcours et refus (AC 1, 3, 5, 6).
- [ ] **Web :** proposer une lecture indépendante pour chaque récit présent et conserver la sélection, la confirmation et le rappel au résultat (AC 1–4 ; M3-1 à M3-4).
- [ ] **Documentation :** actualiser SPEC, les contrats UX/architecture et la procédure catalogue là où ils réservent actuellement les récits à la révélation ; conserver la distinction entre récits consultables et explication ou réponse encore secrètes (AC 4–6).
- [ ] **Vérification :** tests API et web avec données fictives, récits multilignes, valeurs absentes et partielles, sélection, refus d’accès et non-divulgation de la réponse ; exécuter les tests ciblés puis les vérifications pertinentes `npm run test` et `./gradlew test` selon les commandes du dépôt. Vérifier visuellement et parcourir la checklist (AC 1–6 ; M3-1 à M3-5).

## Dev Notes

### Product and UX rules

- Cette demande remplace explicitement la restriction de 25.22 selon laquelle les récits complets ne sont visibles qu’après révélation. Elle ne change pas l’instant de révélation de la réponse, de la justesse ou des points. Le contenu narratif lui-même est volontairement communiqué au joueur : sa rédaction doit permettre le jeu et éviter les indices involontaires, sans ajouter de contenu inventé.
- La lecture concerne le formulaire de réponse au quiz ; elle ne demande pas de nouveau formulaire de collecte des contributions. Les récits existants restent facultatifs et ordonnés comme les propositions.
- Code à examiner : `apps/web/src/app/pages/advent-test/advent-test.html`, `advent-test.ts`, `advent-result.scss` ; `services/api/src/main/kotlin/com/hatcast/api/advent/AdventMemberController.kt`, `AdventMemberGame.kt` et les parcours de test. Réutiliser les panneaux de résultat lorsque pertinent, sans contrôles interactifs imbriqués.
- La règle actuelle de [AVENT_CATALOGUE.md](../../docs/v2/technical/AVENT_CATALOGUE.md) et la spec figée [25.22](spec-25-22-advent-long-stories.md) décrivent l’ancien contrat : mettre à jour les documents normatifs lors de l’implémentation et conserver la spec historique comme trace de la décision remplacée.

### Explicit non-goals

- Modifier les contributions réelles, synchroniser un catalogue ou une base cloud, déployer, changer les scores ou les dates de révélation.

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| 25.2 | done | Formulaire et sélection existants. |
| 25.22 | done | Stockage facultatif ordonné et rappel des récits au résultat. |
| 25.15 / 25.19 | done | Prévisualisation et droits des tests à préserver. |

## Dev Agent Record

### Agent Model Used

À renseigner à l’implémentation.

### Completion Notes List

- À renseigner.

### File List

- À renseigner.

### Change Log

- 2026-11-07 : story créée à partir de la demande produit.
