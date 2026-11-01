# Advent Quiz — stratégie de tests visuels et d’isolation

Statut : plan de vérification proposé, 30 octobre 2026. Sources : DESIGN.md, EXPERIENCE.md, Epic 25, architecture AD-1–AD-7 et kit approuvé. Les tests sont à réaliser au fil de l'implémentation ; ce document ne prétend pas qu'ils ont été exécutés.

| Risque | Vérification et preuve attendue |
|---|---|
| Fuite de thème vers HatCast | Capturer une page HatCast représentative avant/après, même navigateur et données ; comparer captures et styles calculés (police, couleurs, boutons et variables). Tester aussi après navigation vers et depuis Avent, et les overlays éventuels. |
| UI Avent incohérente ou illisible | Captures reproductibles avec données fictives pour découverte, question et choix, confirmation, erreurs, puis chaque résultat, classement et calendrier implémentés. Comparaison humaine à la planche et à la confirmation ; aucun écran sous forme d'image. |
| Responsive et contenu tronqué | 320, 375, 390, 430 px, tablette et desktop ; longues affirmations et zoom/texte agrandi ; pas de défilement horizontal ni perte d'action. Cibles au moins 44 × 44 px, 48 préférés. |
| Accessibilité | Contrastes texte 4,5:1 et grand texte admissible 3:1 ; contraste des composants et focus ; clavier, groupe radio, libellés, annonces, erreurs, focus et retour, lecteur d'écran, mouvement réduit. Vérifier les états sélectionné, désactivé et invalide sans dépendance à la couleur. |
| Divulgation prématurée | Tests API et navigateur avant/après minuit Paris : aucune justesse, réponse correcte, points ou déduction par le classement avant révélation ; accusé neutre et contrôle des caches. |
| Régression de jeu | Exécuter et compléter les tests existants de sélection unique, réponse définitive, concurrence, réconciliation après coupure, accès, état et simulation isolée ; conserver les tests de limites temporelles réelles. |
| Erreurs et disponibilité | Tester chargement, erreur réseau, réessai, état incertain et quiz fermé ; conserver le comportement existant et les annonces accessibles. |

Références existantes : `apps/web/src/app/pages/advent-test/advent-test.spec.ts`, `advent-test.motion.browser.cjs`, `apps/web/e2e/advent-answer.spec.ts` et tests API associés. Fixer les données, polices et animations pour les captures ; les mettre à jour uniquement après revue du changement attendu. Vérifier également les règles globales existantes de bannière PWA sans supposer qu'elles sont inutiles.

## État des preuves — 30 octobre 2026

- Tests unitaires de l’aperçu : 15 réussis ; tests navigateur mouvement réduit et bannière PWA : 2 réussis ; build web réussi.
- Sept E2E réussis : parcours clavier, texte agrandi, différentes largeurs, confirmation neutre, police Fredoka chargée et contraste du texte du choix sélectionné ≥ 4,5:1 ; retour à l’accueil après réponse avec comparaison de capture complète et de styles de titre et bouton à 320, 375, 390, 430, 768 et 1280 px. Les réponses API sont simulées.
- Les captures avant/après de l’accueil comparent la même version de l’application : elles vérifient la fuite pendant le parcours mais ne constituent pas une comparaison indépendante avec le rendu avant refonte.
- Restent à établir : référence HatCast indépendante, captures reproductibles de tous les états et tailles, évaluation de tous les contrastes et des technologies d’assistance, ainsi que les tests propres aux futures surfaces lorsqu’elles seront implémentées. Aucun overlay Avent n’est actuellement exercé.

## Complément de vérification — 30 octobre 2026

- Le test d'isolation capture désormais la page complète ; ses six cas ont réussi après correction. Les sept E2E ciblés et les deux tests navigateur de mouvement et de bannières ont aussi réussi sur cette reprise.
- Une comparaison indépendante de l'accueil entre le commit `e6940c9b` et l'arbre courant, avec données fictives identiques, a produit des captures pleine page et des styles calculés de titres et boutons identiques aux six largeurs. Ce commit contient déjà une partie de la refonte ; il ne prouve pas l'absence de régression par rapport à l'état antérieur à son intégration. Les captures et le script ponctuel sont conservés dans `/private/tmp`, pas comme référence pérenne du dépôt.
- Le build web a réussi avec un avertissement : les styles du composant Avent atteignent 10,56 Ko pour un budget de 9 Ko. La comparaison des écrans Avent aux deux références, les contrastes de tous les états et la vérification par technologie d'assistance restent à faire.
