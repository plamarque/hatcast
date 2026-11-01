---
feature_branch: feat/25-7-invite-members-to-the-daily-quiz
baseline_commit: 5b47725c685a8896fa814e3af722d2d584c5657b
prior_e2e_evidence: _bmad-output/implementation-artifacts/e2e-evidence/25-7-invite-members-to-the-daily-quiz.json
---

# Story 25.7 : Inviter les membres au quiz quotidien

Status: done

## Story

En tant que membre éligible, je veux activer un rappel du quiz de l'Avent, afin de ne pas manquer une journée et ses possibilités de gagner des points.

## Acceptance Criteria

1. **Given** les rappels Avent sont activés, **when** le traitement planifié s'exécute du 1er au 24 décembre à 10 h Europe/Paris ou en retard le même jour, **then** il vérifie à l'exécution le quiz du jour, l'appartenance active à la troupe configurée, l'absence de réponse et les conditions de notification ; il tente au maximum une invitation par membre et par quiz. Aucun envoi si le quiz manque ou si le traitement ne s'exécute pas ; aucune reprise ni garantie de livraison. [FR-3, FR-12, AD-5]
2. **Given** une invitation, **when** le membre la suit, **then** il retrouve le parcours du jour après la première découverte et toute révélation prioritaire ; son contenu ne révèle ni anecdote, ni réponse, ni résultat. Pas d'invitation avant l'ouverture réelle du jour, ni de spectacle fictif. [AD-1, AD-2, AD-5]
3. **Given** un écran d'attente après réponse ou un écran de résultat, **when** il s'affiche, **then** une case à cocher Avent « Ne rate aucun quiz ! » est placée à un emplacement cohérent, avant l'action principale, avec une explication : rappel à 10 h si le quiz existe et si le membre n'a pas joué. Elle est accessible sur les résultats positifs, négatifs et historiques ; elle ne révèle aucun résultat sur l'attente. Le storyboard [validé](25-7-assets/storyboard-notifications-avent.png) guide la disposition, pas les textes ou éléments inventés par l'image.
4. **Given** les rappels Avent sont désactivés, **when** le membre coche la case et que son appareil dispose déjà d'un abonnement push HatCast valide, **then** activer et persister sa préférence Avent sans redemander l'autorisation système. Sinon, sur son geste, demander l'autorisation et enregistrer l'abonnement HatCast existant ; ne confirmer l'activation qu'après succès. Si refus, indisponibilité ou erreur, laisser la préférence désactivée et expliquer comment réessayer ou modifier les réglages.
5. **Given** les rappels Avent sont activés, **when** le membre décoche la case, **then** désactiver seulement cette préférence partagée entre ses appareils, sans supprimer l'abonnement HatCast ni modifier les autres notifications. La case conserve son état après navigation et reconnexion. Une activation sur un autre appareil ne prouve pas que cet appareil est abonné : expliquer l'état local et proposer son activation sans désactiver la préférence partagée en cas de refus local.
6. **Given** un appareil non pris en charge, une permission déjà refusée ou une requête en cours ou échouée, **when** le membre utilise la case, **then** présenter l'état et l'action possible sans fausse confirmation, répétition automatique de la demande, ni perte d'un choix déjà enregistré ; la participation au quiz reste possible.
7. **Given** les préférences HatCast, **when** elles sont consultées, **then** aucune commande Avent ne s'y mélange ; avant le 1er décembre aucune préférence ou notification ne divulgue le quiz. L'interface de cette préférence est limitée au parcours Avent.
8. **Given** des données de développement isolées, **when** les tests exécutent les rappels et les cas de concurrence, **then** ils ne produisent aucun effet sur les membres, invitations ou notifications de production ; couvrir quiz absent ou publié tardivement, réponse déjà donnée, préférence désactivée, appartenance inactive, déduplication concurrente, limites de dates Paris et dates réelles séparément. Aucun aperçu ne déclenche de notification ou ne modifie les invitations d'autrui. [FR-13, AD-2, AD-5]

## Acceptance Criteria — Material 3 (UI)

- **Given** la case sur une surface Avent, **when** elle est utilisée au clavier ou au tactile, **then** utiliser un contrôle de case à cocher accessible avec libellé et état explicites, focus visible, cible de 44 × 44 px minimum (48 préférés), messages d'erreur accessibles et aucune information portée seulement par la couleur.
- **Given** les écrans mobiles, **when** ils sont affichés à 320, 375, 390 et 430 px, sur tablette ou avec texte agrandi, **then** le contenu reste lisible et défilable sans chevauchement ; respecter le mouvement réduit et la checklist de [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md).
- **Given** la DA, **when** la case et ses états sont rendus, **then** appliquer les tokens et composants isolés Avent sans modifier le thème HatCast ; vérifier visuellement les états et l'absence d'effet sur HatCast. Respecter [DESIGN](../planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/DESIGN.md), [EXPERIENCE](../planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/EXPERIENCE.md), [AD-7](../planning-artifacts/architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md) et la [stratégie de tests](../test-artifacts/test-design-advent-visual-isolation.md).

## Tasks / Subtasks

- [ ] Vérifier le contrat existant, les dépendances et les changements parallèles avant développement ; exécuter `story-branch.sh assert` depuis l'unité. (Tous AC)
- [ ] Étendre `services/api/src/main/kotlin/com/hatcast/api/notification/` pour planification, éligibilité, dispatch et déduplication atomique par quiz et destinataire sans spectacle fictif ; préserver les préférences existantes et l'isolation. (AC 1–2, 8)
- [ ] Ajouter une préférence Avent partagée et ses accès autorisés, sans divulgation anticipée ; préserver la compatibilité et documenter les changements de données et de comportement. (AC 3–8)
- [ ] Dans `apps/web/src/app/pages/advent-test/`, intégrer la case aux écrans d'attente et résultat ; réutiliser `apps/web/src/app/core/push/push-notifications.service.ts` pour l'autorisation et l'abonnement de l'appareil, sans toucher aux autres catégories. (AC 3–7, M3)
- [ ] Ajouter des tests API, Angular et E2E ciblés, notamment concurrence et frontières Paris, puis exécuter les suites pertinentes et la checklist UI. (AC 1–8, M3)

## Dev Notes

- La case représente un choix Avent partagé ; l'autorisation et l'abonnement sont propres à l'appareil. Une notification est une tentative, non une garantie de livraison.
- Ne pas intégrer de décompte, de changement des écrans de résultat ou de dialogue système personnalisé au seul motif qu'ils figurent dans le storyboard ; le contenu et l'apparence du dialogue natif dépendent de l'appareil.
- Les points de participation sont attribués par réponse normale jouée à temps ; une journée manquée ne rompt pas une série de bonnes réponses. Préserver les règles de révélation et l'absence de résultat sur l'accusé.
- Les données de production observées le 1er novembre ne garantissent pas l'état actuel d'autorisation sur les appareils.
- La base choisie est `origin/v2` au commit indiqué ; les modifications non commitées du checkout principal, notamment celles liées aux aperçus, ne sont pas dans cette unité. Les réconcilier avant intégration sans les écraser.
- Références : [Epic 25, story 25.7](../planning-artifacts/hatcast-avent/epics.md), [architecture Avent](../planning-artifacts/architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md), [workflow story](../../_bmad/custom/story-branch-workflow.md).

## Dev Agent Record

### Completion Notes List

- Parcours de la case et storyboard validés par Patrice ; développement non commencé.

### File List

- `_bmad-output/implementation-artifacts/25-7-invite-members-to-the-daily-quiz.md`
- `_bmad-output/implementation-artifacts/25-7-assets/storyboard-notifications-avent.png`

### Change Log

- 2026-11-01 : story préparée et parcours de notification intégré.

### Travail en cours — 1er novembre 2026

Une première implémentation de la préférence partagée, de l’abonnement propre à l’appareil et du traitement de rappel est présente dans le worktree. La story reste ouverte : la non-régression croisée complète des notifications et la recette visuelle/accessibilité restent à vérifier avant intégration.

Vérifications intermédiaires : compilation Kotlin ; suites API existantes `MePushSubscriptionIntegrationTest`, `MeNotificationPreferencesIntegrationTest`, `NotificationDispatcherTest` ; 133 tests Angular ciblés ; build Angular réussi avec avertissements Sass et budgets existants. Des tests ont été ajoutés pour l’enregistrement de deux appareils sans modifier le choix push global, le refus d’un endpoint appartenant à un autre compte, le refus système local et les limites de 10 h à Paris. Le PostgreSQL local jetable a couvert deux réservations simultanées, une réponse concurrente, les quiz absents ou publiés ensuite, une préférence désactivée et une appartenance inactive, sans envoi réel. Les contrôles visuels et d’accessibilité ne sont pas encore acquis : le contrôleur E2E signale le port 4200 occupé et la source d’environnement indisponible.

- Vérification complémentaire Murat : test d’intégration des routes Avent avec deux appareils, catégories HatCast et dispatch réel vers émetteur factice ; les choix et abonnements sont conservés après activation et désactivation, y compris lorsque le push global est désactivé. La date réelle avant décembre refuse la préférence malgré une horloge de jeu avancée. Les suites ciblées correspondantes passent. La preuve Playwright et la checklist visuelle restent ouvertes.

- Playwright isolé (lancement direct `scripts/run_e2e.sh -- --project=chromium-advent-answer`, profil API H2, sans réutilisation des serveurs) : 16 scénarios réussis après correction de la fixture de découverte et de la permission explicitement refusée. Vérifications incluses : clavier, texte à 200 %, mouvement réduit, absence de débordement aux largeurs 320, 375, 390, 430 et 768 px, comparaison de l’accueil HatCast avant/après Avent jusqu’à 1280 px. Le contrôleur officiel E2E reste `not-ready` : la source `.env` du checkout d’intégration séparé est absente ; ce lancement ne constitue donc pas son attestation. Les vérifications visuelles et d’accessibilité restantes ne sont pas déduites de cette seule suite.

- Contrôle visuel complémentaire : capture de la case après refus, à 320 px et texte à 200 %, via le scénario ciblé (réussi). Le mot « notifications » se coupe en fin de ligne ; lisibilité à améliorer et contraste / lecteur d’écran restent à vérifier. La capture est un artefact local temporaire Playwright.

- Correction de lisibilité : messages de permission raccourcis, capture vérifiée à 320 px et texte 200 %, mot « navigateur » non coupé ; le contraste du message est vérifié à au moins 4,5:1. La case expose son explication comme description accessible. Les 133 tests Angular ciblés passent. Le contrôleur E2E officiel a produit une attestation `passed` après exécution isolée des 16 scénarios ; aucun serveur existant réutilisé. Un essai réel au lecteur d’écran reste ouvert.

- À la demande de Patrice, aucun essai au lecteur d’écran n’est requis pour ce quiz. La case est visible et manipulable en mode test sous forme de simulation locale sans abonnement, écriture de préférence ou envoi ; le parcours normal et ses autorisations restent inchangés. 134 tests Angular ciblés et un scénario Playwright isolé vérifient la simulation. Après ce changement, l’attestation E2E doit être renouvelée avant la recette ; les ports de recette étant occupés, aucun processus existant n’a été interrompu.

- Retour Patrice / Sally : confirmation rapprochée de la planche Avent, lutin agrandi, en-tête d’aperçu, date et médaillon retirés de la confirmation, case intégrée à une carte crème et or. Simulation et confidentialité préservées. Vérification : 134 tests Angular et 16 scénarios Playwright ciblés réussis ; ces derniers ont utilisé un serveur de test isolé pendant la recette humaine.

- Validation visuelle par Patrice le 1er novembre 2026. Vérification technique complémentaire : 141 tests Angular ciblés, 17 scénarios Playwright sur serveur local isolé, 2 tests du service worker et suites serveur de notifications réussis. La case conserve son état antérieur pendant la sauvegarde ; l’activation n’est affichée qu’après confirmation. Les contrôles navigateur et push de ces tests utilisent des doubles fictifs ; aucune notification réelle n’a été envoyée. Les clés VAPID sont présentes sur les révisions Cloud Run development et staging consultées en lecture seule. Une recette réelle nécessite une version déployée et un contexte de date autorisé ; l’exécution du job Avent est désactivée hors production.

- Build web de production réussi après les changements validés (avertissements Sass et budgets CSS existants). L’attestation E2E du contrôleur date d’avant les dernières modifications ; les 17 scénarios ont depuis été exécutés sur un serveur isolé séparé, et devront être réattestés par le contrôleur avant la livraison. La recette push réelle n’est pas encore exécutée sur un appareil ni sur une version déployée.

- Après clarification de Patrice, la désactivation des notifications HatCast peut arrêter les rappels Avent ; décocher le rappel Avent ne doit ni désabonner le navigateur ni modifier les notifications HatCast. Les appareils et les envois Avent sont séparés côté serveur. Les 141 tests Angular ciblés et 13 tests API ciblés passent, notamment le maintien des préférences, des abonnements et du dispatch HatCast, et le contrôle du scheduler en production et en développement. L’attestation E2E officielle a été renouvelée : 17 scénarios réussis en environnement isolé. La réception réelle reste proposée dans une story de suivi, sans prétendre l’avoir vérifiée ici. L’intégration doit encore tenir compte des changements intervenus sur `v2`, notamment des numéros d’anomalies déjà réutilisés.

- Revue supplémentaire : l’état HatCast sur un appareil Avent et l’isolation du scheduler ont nécessité des corrections après cette attestation. Les vérifications et l’attestation doivent donc être relancées sur leur version corrigée. Le cas d’un changement de compte simultané sur un même endpoint est également à vérifier sur PostgreSQL.

- Vérification après corrections : 142 tests Angular, 13 tests API ciblés et 17 scénarios Playwright officiels réussis. Les deux tests PostgreSQL isolés réussissent, dont le verrouillage transactionnel d’un même endpoint ; le conteneur jetable est arrêté. Le changement de compte sur un appareil déjà associé à un autre membre reste une limitation ouverte (BUG-083), et la revue des dernières corrections reste à terminer avant clôture. Les numéros des anomalies locales doivent être réconciliés avec `v2`.

- Revue finale des corrections : le verrou PostgreSQL est vérifié directement, mais un test concurrent doit encore exercer les deux inscriptions réelles. Un rappel déjà en cours d’envoi peut également atteindre l’appareil lors d’un transfert de compte (BUG-084). Le contrôle HTTP d’identité a été renforcé avec un endpoint valide et le test passe. Les tests existants de préférences et de dispatch HatCast passent également.

- Changement de compte : le second compte peut réactiver Avent avec le même endpoint et les deux clés, sans modifier l’abonnement HatCast du premier ; des tests PostgreSQL jetables exercent désormais les deux inscriptions réelles en concurrence. L’émetteur revérifie l’association juste avant envoi. Une réconciliation automatique à la connexion a été retirée après revue, car des requêtes retardées pouvaient supprimer une association plus récente. Deux limites restent ouvertes : un second compte qui ne réactive rien laisse l’ancien appareil associé (BUG-083), et un push déjà confié au fournisseur ne peut être rappelé (BUG-084). Une story de recette réelle est préparée mais pas inscrite au tracker.

- Après retrait de la réconciliation risquée, les 32 tests API ciblés passent et l’attestation Playwright officielle est renouvelée avec 17 scénarios réussis. Une comparaison visuelle avait échoué lors d’une exécution précédente ; les deux relances suivantes ont réussi. La clôture reste en attente du traitement des limites ci-dessus et du rapprochement avec `v2`.

- Décision de Patrice : l’usage visé est un téléphone par membre ; ne pas bloquer la story sur les scénarios d’appareil partagé. Les limites BUG-083 et BUG-084 sont reportées et la vérification réelle des rappels est préparée séparément.
