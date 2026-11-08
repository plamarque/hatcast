---
feature_branch: feat/25-26-modifier-un-quiz-avent-avant-son-jour
baseline_commit: 734be68260f37eabd294bf5760d9c8aa02558bf8
---

# Story 25.26 : Modifier un quiz Avent avant son jour

Status: done

## Story

En tant qu’**Antoine, responsable du contenu Avent, ou Patrice**,
je veux **corriger le contenu d’un quiz déjà en place avant le début de son jour**,
afin de **mettre à jour le contenu publié sans redéployer l’application**.

## Acceptance Criteria

1. **Accès privé.** Seuls Antoine et Patrice, authentifiés, avec adresse vérifiée et membres actifs autorisés, peuvent accéder au formulaire et à ses données et enregistrer une modification. Le serveur contrôle lui-même ces droits pour chaque lecture et écriture ; masquer le bouton ne suffit pas. Les autres comptes et requêtes non authentifiées ne reçoivent ni contenu réservé ni réponse fausse. Préserver `no-store`, confidentialité et règles existantes de révélation. [Source : demande produit du 8 novembre 2026 ; stories 25.15 et 25.18]
2. **Quiz existants.** Depuis le parcours privé, une commande « Modifier » permet d’ouvrir un quiz déjà présent de jour 1 à 24. Le formulaire est prérempli avec les trois propositions dans l’ordre, leurs histoires facultatives respectives, la proposition fausse et la phrase de résultat (explication facultative). Il ne permet ni création ni suppression, ni modification du jour, du nom de la personne ou du portrait. Une case sans quiz ne peut pas être créée par cette interface. [Source : demande produit]
3. **Enregistrement.** Avant la limite du jour, enregistrer remplace les seuls champs modifiables de ce quiz dans la base de l’environnement courant, sans redéploiement ; un succès est visible et une lecture ultérieure restitue les changements. Les trois propositions doivent être non vides et une seule fausse proposition est choisie parmi elles ; conserver les textes multilignes et l’association de chaque récit à sa proposition. Les champs facultatifs peuvent être vides. Une erreur de validation ou d’enregistrement conserve la saisie et ne modifie aucun champ partiellement. [Source : demande produit ; migrations V75 et V84]
4. **Limite temporelle.** L’écriture est interdite à partir de 00 h 00, heure de Paris, le jour du quiz, y compris après ce jour. Le serveur utilise l’heure réelle, indépendamment de l’horloge du navigateur et de toute date simulée de test, et vérifie cette limite au moment effectif de l’écriture. Une page ouverte avant minuit ne permet pas d’enregistrer après minuit : afficher une explication et conserver la saisie. La disponibilité de la commande reflète cette règle sans se substituer au contrôle serveur. [Source : décision produit du 8 novembre 2026]
5. **Modifications concurrentes.** Si le quiz a changé depuis son chargement, refuser l’enregistrement périmé sans écraser la modification et proposer de recharger ; conserver la saisie non enregistrée pour permettre sa récupération. La vérification de version, la limite temporelle et l’écriture sont atomiques. [Source : proposition acceptée dans le cadrage de la conversation]
6. **Référence et synchronisation.** Après déploiement de cette capacité, la base de chaque environnement est la référence du contenu qu’il sert ; une modification en production ne modifie pas les autres bases. Adapter la procédure et les outils de contribution/synchronisation utilisés par la skill Avent pour que les ajouts et mises à jour en masse restent possibles avec vérification explicite de la cible, comparaison et traitement des divergences : ne jamais écraser silencieusement les modifications issues du formulaire avec un catalogue ancien. Documenter le nouveau rôle du catalogue privé et la marche à suivre pour réconcilier les contenus ; aucun contenu réel ni réponse dans Git ou les logs. [Source : décision produit ; `AVENT_CATALOGUE.md` et architecture AD-4]
7. **Effets limités.** Aucune modification des réponses, scores, sessions, jours ou portraits ; préserver les parcours membre, aperçu et test et les droits d’accès aux jours futurs. Une seule installation de la fonctionnalité nécessite son déploiement ; les modifications ultérieures de contenu n’en nécessitent pas. La story n’autorise aucune écriture de contenu réel ni synchronisation ou déploiement en production. [Source : demande produit ; contrat Avent]

**Couverture produit :** epic 25, UX-DR11 ; [DESIGN](../planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/DESIGN.md), [EXPERIENCE](../planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/EXPERIENCE.md), [architecture AD-7](../planning-artifacts/architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md).

## Acceptance Criteria — Material 3 (UI)

- **M3-1.** Utiliser les composants Material adaptés au formulaire et aux commandes, avec libellés, erreurs accessibles, ordre clavier et gestion du focus ; préserver la saisie en cas d’échec.
- **M3-2.** Respecter la direction artistique et les tokens isolés Avent, sans modifier le thème global HatCast ; appliquer [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md), UX-DR11 et AD-7.
- **M3-3.** Vérifier mobile ≤ 480 px, notamment 320 px, texte à 200 %, défilement et absence de débordement ; cibles ≥ 44 × 44 px, 48 préférés ; respecter le mouvement réduit.
- **M3-4.** Vérifier visuellement les états d’édition, erreur, conflit et fermeture temporelle, au clavier et sur mobile ; vérifier l’absence de régression et de fuite de styles sur HatCast selon la [stratégie de tests](../test-artifacts/test-design-advent-visual-isolation.md).
- **M3-5.** Parcourir la checklist M3 de FRONTEND_UI et documenter les éventuels écarts justifiés.

## Tasks / Subtasks

- [ ] **API et données :** droits spécifiques d’édition, lecture privée, validation et écriture atomique avec heure réelle Paris et protection contre les mises à jour concurrentes (AC 1–5, 7).
- [ ] **Web :** commande et formulaire privés, états de validation, succès, conflit et limite dépassée ; conserver la saisie (AC 1–5 ; M3-1 à M3-4).
- [ ] **Opérations et documentation :** adapter la synchronisation et la procédure utilisée par la skill de contribution ; mettre à jour SPEC, DOMAIN, ARCH et la documentation catalogue concernées pour refléter la nouvelle référence et les protections (AC 6–7).
- [ ] **Vérification :** données fictives uniquement ; tests API des autorisations, champs, atomicité, conflits et frontière avant/à/après minuit Paris y compris date simulée ; tests web du formulaire et des refus, régressions de confidentialité et de parcours ; tests des outils de synchronisation et divergence. Exécuter les tests ciblés puis les vérifications pertinentes `npm run test` et `./gradlew test` selon les commandes du dépôt ; contrôle visuel et checklist M3 (AC 1–7 ; M3-1 à M3-5).

## Dev Notes

- Le changement de référence remplace explicitement le rôle canonique du catalogue énoncé dans [AVENT_CATALOGUE.md](../../docs/v2/technical/AVENT_CATALOGUE.md), [ARCH.md](../../ARCH.md) et AD-4 : adapter les documents normatifs et les outils lors de l’implémentation, sans modifier de données réelles pendant la story.
- Examiner `AdventMemberController.kt`, `AdventMemberGame.kt`, `AdventTestAnswers.kt`, migrations V75/V84, `apps/web/src/app/pages/advent-test/`, `scripts/v2/advent-catalogue-sync.mjs` et la skill `hatcast-avent-lutin`. Les droits d’aperçu existants sont un point de départ, pas une autorisation d’écriture implicite ; l’édition doit rester possible pour les jours futurs aussi pendant décembre.
- La règle de gel ne dépend pas de l’existence de réponses ; elle protège aussi les joueurs qui ouvrent le quiz au début du jour. L’aperçu personnel et les dates simulées ne doivent pas contourner le gel réel.
- **Hors périmètre :** création de quiz, édition de noms ou lutins, upload de portraits, correction des réponses ou scores, édition après début du jour, éditeur de masse et publication de contenu réel.

### Dependencies

| Story | Statut | Relation |
|-------|--------|----------|
| 25.3b | done | Catalogue privé et synchronisation à adapter. |
| 25.15 / 25.18 | done | Accès privé et prévisualisation existants. |
| 25.22 / 25.25 | done | Récits ordonnés et leur affichage. |

## Dev Agent Record

### Agent Model Used

À renseigner à l’implémentation.

### Completion Notes List

- À renseigner.

### File List

- À renseigner.

### Change Log

- 2026-11-08 : story préparée selon le cadrage produit.
- 2026-11-08 : recette locale validée ; commande crayon sur le quiz, retour après enregistrement et absence de commande sans quiz vérifiés.
