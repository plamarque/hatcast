---
feature_branch: feat/25-12-retrouver-le-lutin-endormi-apres-avoir-joue
baseline_commit:
---

# Story 25.12 : Retrouver le lutin endormi après avoir joué

Status: done

## Story

En tant que **membre ayant déjà répondu au quiz du jour**,
je veux **retrouver le lutin endormi et un décompte jusqu’à minuit**,
afin de **savoir quand je pourrai découvrir mon résultat**.

## Acceptance Criteria

1. **Given** une réponse normale déjà enregistrée pour le jour courant et encore en attente de révélation, **when** le membre revient consulter ce quiz, notamment depuis le calendrier, **then** afficher la scène d’attente ; la confirmation immédiatement après la réponse reste distincte. Préserver les points d’entrée actuels, notamment le classement à l’ouverture de l’icône cadeau après réponse, ainsi que la priorité des révélations non vues. [Source : epic 25.12 ; EXPERIENCE § États et transitions]
2. **Given** cette scène, **when** elle est affichée, **then** retrouver l’illustration du lutin endormi dans la neige, son bonnet vert et sa clochette, dans le décor de nuit enneigé et lumineux de la vignette 9. Afficher « Reviens demain ! » et le temps restant en heures, minutes et secondes en texte réel et adaptable. Expliquer qu’il s’agit du **résultat** : le 25 décembre est un bilan et ne comporte pas de nouveau quiz. [Source : demande de Patrice ; planche de référence ; EXPERIENCE]
3. **Given** une réponse en attente, **when** le temps s’écoule, **then** compter jusqu’au minuit suivant du jour civil Europe/Paris du quiz, avec une référence temporelle cohérente avec le serveur ; ne jamais afficher de durée négative. À l’échéance ou au réveil d’un onglet suspendu, relire l’état autorisé côté serveur avant toute révélation ; prévoir attente et réessai si la lecture échoue. L’horloge locale seule ne décide jamais de l’accès au résultat. [Source : architecture AD-2 et AD-3]
4. **Given** un autre état ou contexte, **when** le membre navigue, **then** conserver les parcours existants : jour sans contenu, quiz passé joué tardivement et révélé immédiatement, réponse déjà révélée, calendrier, classement, fermeture et révélation prioritaire. Ne divulguer ni choix, justesse, anecdote fausse ni points en attente. [Source : EXPERIENCE ; architecture AD-2 à AD-4]
5. **Given** le mode test isolé, **when** le testeur change le jour simulé ou rejoue, **then** respecter la date de cet onglet et les contrôles existants, sans présenter une date simulée comme une heure réelle ; les changements de jour, de compte et de mode ne conservent pas un décompte ou état périmé. Vérifier les frontières réelles séparément. [Source : EXPERIENCE ; architecture AD-4]
6. **Given** la livraison, **when** le parcours réel est exercé, **then** montrer réponse → confirmation → sortie → retour par calendrier → attente → révélation autorisée ; inclure le 24 décembre, l’échéance, l’onglet suspendu et les échecs réseau. Comparer visuellement avec la vignette de référence et signaler les écarts. Mettre à jour les contrats UX et fonctionnels concernés pour rendre cette nouvelle scène durable. [Source : AGENTS.md ; epic 25.12]

**Couverture produit :** [Epic 25.12](../planning-artifacts/epics.md), [DESIGN](../planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/DESIGN.md), [EXPERIENCE](../planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/EXPERIENCE.md), [architecture AD-7](../planning-artifacts/architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md), [planche de référence, vignette 9](../planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/imports/advent-quiz-design-system-reference.png).

## Acceptance Criteria — Material 3 (UI)

- **M3-1.** Réutiliser les commandes Material et les composants Avent existants ; conserver leurs libellés, états, focus et accès au calendrier, au classement et à la fermeture.
- **M3-2.** Isoler illustrations, styles, typographies et tokens dans l’Avent selon AD-7 ; ne pas modifier le thème global HatCast. Ne pas intégrer les libellés ou le compteur dans une image.
- **M3-3.** Vérifier 320 px, largeurs mobiles usuelles, tablette, ordinateur et zoom : texte lisible, sans contenu coupé ; cibles au moins 44 × 44 px, 48 préférés. Prévoir clavier, focus visible, contraste et mouvement réduit. L’illustration décorative ne perturbe pas la lecture ; ne pas annoncer chaque seconde en boucle aux technologies d’assistance.
- **M3-4.** Parcourir la [checklist M3](../../docs/v2/technical/FRONTEND_UI.md) et la [stratégie d’isolation visuelle](../test-artifacts/test-design-advent-visual-isolation.md) ; vérifier un écran HatCast hors Avent et signaler tout contrôle non effectué ou écart accepté.

## Tasks / Subtasks

Liste initiale conservée pour mémoire ; le suivi de réalisation et les preuves figurent dans la spécification d'implémentation liée plus bas.

- [ ] **Périmètre :** `apps/web/`, ressources visuelles Avent et contrats concernés ; évaluer une adaptation API minimale seulement si nécessaire à une référence horaire fiable. (AC 1–5)
- [ ] Identifier de façon fiable une consultation ultérieure, distincte de la confirmation immédiate et du rejeu tardif ; préserver navigation, reprise, autorisation et protections. (AC 1, 4, 5)
- [ ] Réaliser la scène et le compteur à partir de la vignette ; comparer à taille réelle et garder textes et commandes accessibles. (AC 2 ; M3-1 à M3-3)
- [ ] Gérer échéance serveur, suspension, erreurs et changements de contexte ; nettoyer les minuteries lors des transitions et de la destruction. (AC 3, 5)
- [ ] Actualiser les contrats fonctionnels et UX concernés ; ajouter les tests pertinents et vérifier notamment les limites réelles et simulées. Exécuter les tests Angular concernés via `npm run test` selon les conventions du dépôt et, si l’API change, `./gradlew test` pour les tests backend appropriés. (AC 1–6 ; M3-4)
- [ ] Démontrer le parcours réel et documenter comparaison visuelle, isolation, accessibilité et limites de vérification. (AC 6 ; M3-3, M3-4)

## Dev Notes

### Product and UX rules

La référence demandée est la vignette 9, pas l’écran de confirmation existant. Son texte illustratif « prochaine question » ne convient pas à la règle métier : l’objet du décompte est la révélation du résultat, y compris pour le quiz du 24. La réponse immédiate conserve son accusé actuel. La scène n’ajoute aucun accès aux résultats avant leur disponibilité.

La date simulée actuelle est une date et non une heure : déterminer pendant l’implémentation une présentation honnête et cohérente du compte à rebours en test, sans modifier les règles de révélation simulée. Ne pas supposer que l’horloge locale est celle du serveur. Ne pas inventer d’ouverture automatique à minuit si l’état serveur ne l’autorise pas.

### Frontend implementation guardrails

- Examiner [advent-test.html](../../apps/web/src/app/pages/advent-test/advent-test.html) et [advent-test.ts](../../apps/web/src/app/pages/advent-test/advent-test.ts) : `answerState === 'recorded'` sert actuellement plusieurs chemins, dont la confirmation et la réconciliation ; `selectDay`, `enterAt`, `clockDate`, `recordedLate` et les gardes de contexte sont des points à préserver.
- Réutiliser les styles et ressources sous `apps/web/src/app/shared/advent/` et `apps/web/public/advent/` lorsque adaptés. La planche est une référence artistique ; produire une ressource exploitable respectant le contrat visuel sans embarquer de texte dans l’illustration.
- Étendre les tests de `advent-test.spec.ts` et le parcours navigateur Avent existant ; utiliser des données fictives et vérifier l’absence de fuite ou de données périmées entre comptes et modes.

### Explicit non-goals

- Changer les règles de score, de révélation, de classement, d’entrée, de notifications ou de rejeu ; ajouter un quiz le 25 ; déployer ou toucher aux données de production.

### Dependencies

Stories 25.2, 25.3, 25.5, 25.6, 25.8 et 25.10 livrées ; conserver leur historique et leurs comportements.

## Dev Agent Record

### Agent Model Used

Non renseigné lors de l’implémentation.

### Completion Notes List

- Implémentation intégrée à `v2` par le commit de fusion `92b1bfb0`, après le commit de fonctionnalité `8dc53415` et la clôture du suivi `3432fcc5`.
- Les résultats des tests, la comparaison visuelle et leurs limites sont consignés dans la [spécification d'implémentation](spec-25-12-retrouver-le-lutin-endormi-apres-avoir-joue.md#verification). La couverture clavier et contraste n'était pas exhaustive ; la vidéo du parcours complet précédait les derniers correctifs de revue.

### File List

- Voir les fichiers du commit `8dc53415` et la spécification d'implémentation liée ci-dessus.

### Change Log

- 2026-11-01 : création de la story.
- 2026-11-01 : statut et notes alignés sur l'implémentation intégrée et le suivi du sprint.
