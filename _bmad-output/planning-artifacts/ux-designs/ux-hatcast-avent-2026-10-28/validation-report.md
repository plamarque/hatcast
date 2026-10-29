# Validation — Calendrier de l’Avent

- **DESIGN.md :** `DESIGN.md`
- **EXPERIENCE.md :** `EXPERIENCE.md`
- **Date :** 2026-10-29T21:02:52+01:00

## Synthèse

La structure essentielle du parcours révisé est présente : réponse sans résultat, révélation différée, calendrier, classement et clôture du 25. Le contrat n’est toutefois pas encore suffisamment précis pour implémenter sans choix supplémentaires la fin de la révélation prioritaire, l’état « vu » et la navigation depuis certaines surfaces. Les références au statut et au barème du PRD sont périmées : le PRD actuel est final et le barème confirmé y figure déjà.

## Verdicts par catégorie

- 1. Flow coverage — adequate
- 2. Token completeness — thin
- 3. Component coverage — thin
- 4. State coverage — thin
- 5. Visual reference coverage — adequate
- 6. Bloat & overspecification — adequate
- 7. Inheritance discipline — thin
- 8. Shape fit — adequate

## Constats par gravité

### Critiques (0)

Aucun.

### Élevés (3)

- **1. Flow coverage** — La révélation prioritaire ne définit l’action suivante que lorsque le quiz du jour existe ou le 25 ; elle ne précise pas le chemin si aucun quiz n’est disponible, si l’on revient du 26 décembre au 15 janvier, ni ce que fait « Fermer ». Le PRD impose notamment l’accès au message d’absence et au classement après révélation (EXPERIENCE.md:20-28, 38-39, 80-84 ; PRD:52, 58, 66). *Fix:* décrire les destinations et actions de sortie de la révélation pour chacun de ces cas, conformément au PRD, en laissant les choix UX non tranchés explicitement ouverts.
- **4. State coverage** — « Vu » est partagé entre appareils mais le moment où une révélation devient vue, notamment si elle est fermée ou interrompue, n’est pas défini ; la maquette montre « Fermer » sans en indiquer l’effet (EXPERIENCE.md:20, 48 ; mockups/parcours-revise.html:8 ; PRD:52). *Fix:* arbitrer le déclencheur de consultation et le comportement après fermeture/interruption, puis transmettre son contrat à l’architecture sans supposer sa mise en œuvre.
- **4. State coverage** — La case jouée dont le résultat est encore en attente ne précise ni le libellé, ni l’action, ni le retour en cas de consultation le jour même ; le seul interdit est la divulgation (EXPERIENCE.md:46-50 ; PRD:50, 60). *Fix:* définir un état et une interaction sans indice, compatibles avec l’accusé de réception et les accès exigés.

### Moyens (6)

- **1. Flow coverage** — UJ-4 dans le PRD couvre aussi le recueil et la transmission des anecdotes ainsi que l’intégration des contenus ; le parcours UX ne couvre que le test (EXPERIENCE.md:92-96 ; PRD:24, 64). *Fix:* expliciter que cette partie relève de la préparation hors interface et n’appelle pas de surface UX ; maintenir le parcours de test dédié.
- **2. Token completeness** — L’héritage reste trop générique pour relier les composants et états à des rôles de couleurs, typo et composants nommés ; les couples de contraste à vérifier ne sont pas identifiés (DESIGN.md:1-9, 15-21, 33-41 ; EXPERIENCE.md:64-70). *Fix:* référencer les rôles et tokens HatCast pertinents, sans inventer de palette ad hoc, et préciser les combinaisons à vérifier ; laisser les adaptations graphiques pour les stories comme convenu.
- **3. Component coverage** — La confirmation, le classement et les états de la grille ne disposent pas tous d’une description visuelle propre dans Components ; l’état de réponse enregistrée en attente et la case du 25 restent particulièrement peu spécifiés (DESIGN.md:31-41, 49 ; EXPERIENCE.md:22-25, 44-58). *Fix:* référencer explicitement les composants Material et préciser les seuls deltas visuels et états nécessaires, en marquant ce qui reste à affiner en story.
- **4. State coverage** — Les onglets sont dits accessibles depuis l’expérience sauf révélation prioritaire, mais les accès concrets depuis porte, quiz, confirmation et message de contenu absent ne sont pas tous décrits ; seule l’action vers le classement est explicite après confirmation (EXPERIENCE.md:18-28, 37-39 ; PRD:50, 60, 66). *Fix:* expliciter les points d’entrée par surface en respectant la priorité et la non-divulgation.
- **4. State coverage** — L’erreur d’enregistrement autorise un réessai mais l’état d’incertitude (confirmation en vol ou résultat inconnu après coupure), notamment si la réponse a en réalité été enregistrée sur un autre appareil, n’est pas traité côté expérience (EXPERIENCE.md:36-37, 54 ; PRD:40, 52, 73). *Fix:* prévoir une vérification de l’état enregistré, un message et la reprise appropriée, avec la résolution technique en architecture.
- **7. Inheritance discipline** — EXPERIENCE indique que le PRD est en draft et que la confirmation du bonus est encore à y reporter, alors que son frontmatter indique `final` et que FR-5 précise déjà le non-chevauchement (EXPERIENCE.md:14, 101 ; PRD:3, 48). *Fix:* mettre à jour le constat et la mention de relais après vérification du PRD actuel, sans modifier celui-ci.

### Faibles (5)

- **1. Flow coverage** — Les chemins d’échec de sauvegarde et de clôture sont présents dans les tableaux mais pas dans le parcours UJ-1 lui-même (EXPERIENCE.md:37, 54, 74-78). *Fix:* ajouter une branche d’échec courte avec réessai et expiration pour aider les lecteurs des parcours.
- **5. Visual reference coverage** — La maquette de la révélation montre une action « Découvrir la case du jour » et « Fermer » sans variantes pour jour sans contenu ou après le 25 (mockups/parcours-revise.html:8-10). *Fix:* une fois les parcours de sortie arbitrés, compléter ou annoter la maquette ; la laisser illustrative.
- **6. Bloat & overspecification** — L’architecture d’information du 25 répète deux fois les accès au classement et calendrier (EXPERIENCE.md:25). *Fix:* fusionner les deux mentions lors d’une mise à jour éditoriale.
- **7. Inheritance discipline** — Les intitulés UJ-4 et la portée du parcours diffèrent du PRD (« testent » au lieu de « préparent la surprise »), malgré l’identifiant commun (EXPERIENCE.md:92 ; PRD:24). *Fix:* conserver l’intitulé source et préciser que le parcours UX décrit la partie test.
- **8. Shape fit** — Les décisions graphiques du 25 apparaissent sous Do's and Don'ts, plutôt que sous Components ou Layout & Spacing (DESIGN.md:43-49). *Fix:* déplacer ce contenu à l’endroit correspondant sans changer la décision.

## Revue source

- [review-rubric.md](review-rubric.md)
