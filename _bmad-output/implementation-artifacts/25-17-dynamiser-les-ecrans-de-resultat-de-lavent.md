---
feature_branch: feat/25-17-dynamiser-les-ecrans-de-resultat-de-lavent
baseline_commit:
---

# Story 25.17 : Dynamiser les écrans de résultat de l’Avent

Status: backlog

## Story

En tant que **membre qui découvre son résultat**,
je veux **retrouver une scène expressive pour une bonne comme pour une mauvaise réponse**,
afin de **vivre un moment aussi dynamique et chaleureux que la confirmation de ma réponse**.

## Acceptance Criteria

1. **Given** un résultat autorisé, **when** il est correct ou incorrect, **then** les écrans « Bravo, tu as trouvé ! » et « Bien tenté ! » adoptent chacun une composition festive et dynamique inspirée respectivement des vignettes 4 et 5 de la planche et de la confirmation existante : lutin générique expressif adapté au résultat, décor et titre mis en scène, notamment un traitement en arc lorsque lisible et adapté. La mauvaise réponse reste encourageante. Les références guident l’intention graphique sans imposer leurs textes ou boutons illustratifs. [Source : demande de Patrice ; epic 25.17 ; DESIGN]
2. **Given** chacun des deux résultats, **when** la scène est affichée, **then** le portrait personnel fourni par l’API reste en médaillon en haut à droite et les informations existantes restent lisibles : date, points, choix si différent, anecdote fausse, explication éventuelle et message de prévisualisation applicable. Les illustrations génériques sont décoratives et ne contiennent pas de portrait personnel. [Source : DESIGN ; EXPERIENCE]
3. **Given** une révélation prioritaire, un résultat historique ou une réponse tardive, **when** le membre consulte son résultat, **then** conserver les contenus, les points, les commandes et destinations existantes, la priorité de révélation et l’absence de célébration rejouée pour une consultation historique. Ne révéler aucun résultat avant son autorisation. Conserver également les comportements du mode test et de la prévisualisation autorisée. [Source : EXPERIENCE ; architecture AD-2 à AD-4]
4. **Given** la réalisation, **when** les deux issues sont vérifiées dans l’interface réelle avec des données fictives, **then** fournir des captures ou une démonstration à taille mobile comparant les scènes aux vignettes et à la confirmation, ainsi qu’une vérification des variantes historique et tardive ; documenter les écarts visuels et limites de vérification. [Source : demande de Patrice ; stratégie de tests Avent]

**Couverture produit :** [Epic 25.17](../planning-artifacts/epics.md), [DESIGN](../planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/DESIGN.md), [EXPERIENCE](../planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/EXPERIENCE.md), [architecture AD-7](../planning-artifacts/architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md), [planche, vignettes 4 et 5](../planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/imports/advent-quiz-design-system-reference.png), [référence de confirmation](../planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/imports/confirmation-reference.png).

## Acceptance Criteria — Material 3 (UI)

- **M3-1.** Réutiliser les commandes Material et composants Avent adaptés ; préserver libellés, états, navigation, focus et fonctions existantes.
- **M3-2.** Isoler styles, ressources, typographies et tokens Avent selon AD-7, sans modifier le thème global HatCast. Les titres, points et anecdotes restent du texte réel, lisible et accessible ; les décorations ne masquent ni texte ni commandes.
- **M3-3.** Vérifier 320 px, mobiles usuels, tablette, ordinateur et zoom : contenu non coupé et défilement possible ; cibles tactiles au moins 44 × 44 px, 48 préférés. Vérifier clavier, focus, contraste et mouvement réduit ; le contenu reste immédiatement disponible sans animation et les illustrations décoratives ne sont pas annoncées.
- **M3-4.** Parcourir la [checklist M3](../../docs/v2/technical/FRONTEND_UI.md) et la [stratégie d’isolation visuelle](../test-artifacts/test-design-advent-visual-isolation.md), vérifier un écran HatCast hors Avent et signaler les écarts ou contrôles non effectués.

## Tasks / Subtasks

- [ ] **Périmètre :** `apps/web/` et ressources visuelles Avent ; examiner la confirmation existante et les vignettes 4 et 5 avant de composer les deux résultats. (AC 1 ; M3-2)
- [ ] Adapter les deux scènes, leurs illustrations et titres tout en préservant portrait, contenu dynamique et commandes. (AC 1–2 ; M3-1 à M3-3)
- [ ] Vérifier les résultats correct et incorrect, prioritaires, historiques et tardifs, ainsi que les contextes test et prévisualisation concernés. (AC 2–3)
- [ ] Exécuter les tests Angular pertinents via `npm run test` selon les conventions du dépôt ; compléter les vérifications navigateur et la comparaison visuelle avec des données fictives. (AC 3–4 ; M3-3–M3-4)
- [ ] Parcourir la checklist M3, vérifier l’isolation hors Avent et consigner preuves et limites. Actualiser les contrats UX si la réalisation précise durablement la direction visuelle. (AC 4 ; M3-4)

## Dev Notes

### Product and UX rules

La demande vise un rapprochement artistique, pas une copie littérale de la planche : ses actions et textes ne changent pas les règles métier. Le texte en arc est une piste visuelle, à réaliser en texte accessible et à adapter aux petits écrans. Le dynamisme ne doit pas rendre une consultation historique animée à nouveau.

Les deux extraits confirmés par Patrice correspondent aux vignettes 4 et 5 de la planche liée ci-dessus :

- **Bravo :** grand lutin jubilant, poing levé, sur fond vert lumineux avec cadeaux et étoiles ; il émerge derrière un bandeau crème courbe portant le titre, orné de grandes étoiles dorées. La scène se prolonge sur un panneau clair et un décor de Noël enneigé.
- **Bien tenté :** grand lutin à l’expression déçue, sur fond rouge lumineux avec étoiles filantes ; il émerge derrière un panneau crème enneigé, encadré de feuillage et de baies. Le titre rouge est expressif et la réponse apparaît dans une carte claire.

Ces éléments décrivent la composition attendue pour les deux variantes ; le contenu réel, le portrait personnel et les actions existantes priment sur les exemples de la planche.

### Frontend implementation guardrails

- Examiner [advent-test.html](../../apps/web/src/app/pages/advent-test/advent-test.html), les styles associés et [advent-test.spec.ts](../../apps/web/src/app/pages/advent-test/advent-test.spec.ts). La branche `result()` partage la structure des deux issues ; elle distingue `historicalResult()` et la prévisualisation.
- Examiner les ressources existantes `apps/web/public/advent/elf-celebration-v1.webp` et `elf-encouragement-v1.webp` ainsi que la composition de confirmation avant de décider si elles doivent être adaptées. Ne pas incorporer du texte dans une image.

### Explicit non-goals

- Modifier le calcul des points, les dates de révélation, les réponses, la navigation, le classement ou les données de production ; ajouter les fonctionnalités illustratives de la planche ; déployer.

### Dependencies

Les résultats et parcours de l’epic 25, notamment 25.3, 25.5 et 25.8, ainsi que la confirmation actuelle constituent la base à préserver.

## Dev Agent Record

### Agent Model Used

À renseigner à l’implémentation.

### Completion Notes List

- À renseigner à l’implémentation.

### File List

- À renseigner à l’implémentation.

### Change Log

- 2026-11-03 : création de la story.
