---
name: Calendrier de l’Avent La Malice
status: final
updated: 2026-10-30
visual_amendment: in-progress
sources:
  - ../../prds/prd-hatcast-2026-10-28/prd.md
  - ../../../../docs/v2/technical/FRONTEND_UI.md
---

# Expérience — Calendrier de l’Avent La Malice

## Foundation

Animation intégrée à HatCast, mobile-first et utilisable sur desktop ; Angular Material 3 et usages HatCast. [DESIGN.md](DESIGN.md) porte l’identité visuelle. Le PRD révisé est final ; ce document réconcilie ses règles et conserve explicitement les points en attente. La [maquette du parcours révisé](mockups/parcours-revise.html) est approuvée globalement ; sa direction graphique est supplantée par le kit approuvé du 30 octobre. Les deux documents UX prévalent sur les maquettes ; les parcours, scores et rangs de [l’ancienne maquette](mockups/ecrans-cles.html) sont obsolètes.

## Information Architecture

| Surface | Accès et rôle |
|---|---|
| Révélation prioritaire | Au retour, résultat révélable non vu le plus récent, même si une réponse plus récente attend encore sa révélation, avant le parcours du jour ; aucun accès au calendrier sur cet écran. |
| Porte et quiz du jour | Du 1er au 24, quiz disponible et non répondu : ouverture automatique selon FR-2, ou accès par icône et notification ; une fermeture supprime l’ouverture automatique du jour sur tous les appareils. |
| Confirmation | Accusé sans résultat ni points, invitation à revenir demain et action vers le classement. |
| Classement | Dans la story 25.4, l’accusé après réponse donne accès par « Voir le classement » au score personnel, à la position et à la liste, sous réserve de la révélation prioritaire. En production les scores sont révélés ; en test isolé ils incluent toutes les réponses enregistrées. |
| Calendrier | Grille ordonnée des 24 quiz et du 25 ; accès aux contenus passés et au quiz du jour disponible. Cases futures bloquées. |
| 25 décembre | Après l’éventuelle révélation prioritaire du 24 : message de joyeux Noël, invitation à profiter des fêtes, félicitations, rappel du score personnel et rendez-vous à la rentrée ; accès au classement et au calendrier. Père Noël et boîte au-dessus du message, puis score bien visible. |
| Mode test | Développement isolé, indication visible ; rejeu personnel de sa propre réponse et remise à zéro ciblée. Date simulée propre à l’onglet opérateur, validée côté serveur : le numéro du jour simulé est visible et annoncé entre les flèches ; les flèches avancent ou reculent d’un jour sans effacer les réponses ni modifier la date des autres membres ; le résultat est révélé le lendemain simulé. Le classement affiche le score actuel de toutes les réponses enregistrées, indépendamment de la date simulée ; il peut donc donner un indice sur les points en attente. Le parcours et le CTA restent les mêmes. Un reset ciblé redémarre la partie. |

L’icône Père Noël près de Mon compte donne accès du 1er décembre au 15 janvier inclus. Une visite sans quiz disponible ne consomme pas l’ouverture automatique ; la fermeture de l’expérience ce jour-là empêche une ouverture automatique ultérieure. Si le quiz manque, l’icône affiche « Il n’y a rien ici. Reviens plus tard ! » et permet d’accéder au classement ; la révélation prioritaire précède cet état. Après réponse, l’icône ouvre le classement sous la même réserve. Après le 24, aucun quiz ne s’ouvre automatiquement ; classement final et calendrier restent accessibles à tous jusqu’au 15 janvier inclus.

## Voice and Tone

Français, tutoiement, ton festif et encourageant. Après confirmation : accusé de réception, rendez-vous demain et « Voir le classement ». En production, aucun indice sur la justesse ou les points en attente ; en test isolé le classement courant peut en donner un. En cas d’erreur à la révélation, encourager sans dramatiser. Message pour une case sans contenu : « Il n’y a rien ici. Reviens plus tard ! » Le 25, y compris pour une personne qui n’a pas joué, présenter le score personnel révélé (0 si aucune réponse), puis les accès au classement final et au calendrier. Le 25 : souhaiter un joyeux Noël, inviter à profiter des fêtes, féliciter la personne, rappeler son score et lui donner rendez-vous à la rentrée. La formulation exacte reste à affiner. Le Père Noël tend une boîte au logo de La Malice, décorative pour l’instant ; aucune ouverture ni contenu associé ne sont demandés à ce stade.

## Component Patterns

- **Porte et choix** : toucher la grande porte pour découvrir le contenu ; sélectionner une des trois anecdotes supposée fausse, changer librement avant confirmation. En production, une réponse enregistrée est définitive ; en mode test isolé uniquement, la commande de rejeu personnel permet d’effacer sa propre réponse et rejouer la case selon le contrat existant.
- **Confirmation** : sur la surface du quiz, confirmer l’enregistrement sans révéler justesse, fausse anecdote ou points ; en production, ne pas exposer d’indice par les scores ou le classement ; en test isolé, le classement courant fait exception comme précisé ci-dessus. En cas d’échec, proposer de réessayer tant que le quiz est jouable. Si l’enregistrement est incertain après une coupure, vérifier l’état enregistré avant de proposer un nouveau geste : si la réponse existe, afficher la confirmation ; sinon permettre le réessai avant minuit, ou expliquer la clôture après minuit. La résolution technique et les conflits entre appareils relèvent de l’architecture.
- **Révélation** : dès minuit le lendemain, heure de Paris, montrer la justesse et la fausse anecdote, ainsi que le choix lorsque celui-ci diffère ; afficher uniquement les points gagnés ce jour (réponse, participation et éventuel bonus additionnés). Présenter aussi le complément facultatif lorsqu’il existe. Mettre les points du jour en évidence et la célébration validée pour une bonne réponse, avec alternative sans mouvement. La consultation ultérieure ne rejoue pas la célébration.
- **Accès au classement de la story 25.4** : après l’enregistrement de sa réponse, le membre utilise le bouton « Voir le classement » dans l’accusé ; le retour le ramène à cet accusé. Ne pas ajouter de navigation ou de parcours supplémentaire pour cette story. La révélation prioritaire précède l’accès au classement. Le calendrier et les parcours du 25 et de fin de saison restent les sujets des stories ultérieures ; cette story ne les réalise pas.
- **Classement** : rappel de la position et du score révélés, puis tous les membres classables nommés, y compris à zéro. Une légende accessible explique le barème : 10 points pour une bonne réponse, 0 pour une mauvaise, 1 point de participation par réponse et 2 points de bonus par groupe non chevauchant de trois bonnes réponses consécutives ; une mauvaise réponse remet la série à zéro, un jour manqué ne la rompt pas. Sa présentation reste à préciser pour la story 25.4. Les ex æquo reçoivent le rang le plus bas de leur groupe : 1, 3, 3, 4 ; si tous les N membres sont à égalité, tous sont Nᵉ. Patrice et Toinou voient séparément leur score sans rang et ne figurent pas dans la liste. En production, les totaux excluent les points non révélés, sans détail permettant de les déduire. En test isolé, ils incluent toutes les réponses enregistrées même avant leur révélation, quelle que soit la date simulée.

## State Patterns

| État | Traitement |
|---|---|
| Quiz du jour disponible, non répondu | Porte du jour, sans cadenas ; accès possible depuis calendrier et icône. |
| Réponse enregistrée avant révélation | Ouvrir l’accusé « Réponse enregistrée ! Reviens demain pour découvrir la réponse. » avec accès au classement et au calendrier, sans afficher le choix, la justesse ou les points du jour. |
| Résultat de la dernière réponse révélable et non vu | Révélation prioritaire, avant quiz du jour ; pas d’accès au calendrier sur cet écran. Marquer vu dès que l’écran de révélation est effectivement affiché ; une fermeture ultérieure ne le rend pas à nouveau prioritaire. Une interruption avant affichage le laisse prioritaire au prochain accès. Consultation partagée entre appareils ; préciser en architecture comment garantir ce contrat. |
| Résultats plus anciens révélables et non vus | Consultation dans leur case du calendrier, sans repère particulier et sans enchaînement automatique. |
| Case jouée et révélée | Porte ouverte ; consultation de la fausse anecdote, du choix s’il diffère et des points gagnés ce jour, sans rejouer l’animation. |
| Case passée non jouée | Après sa date de révélation, portrait, anecdotes et fausse anecdote consultables, sans réponse ni points. Pas de rattrapage. |
| Case future | Porte numérotée et verrouillée ; contenu inaccessible. |
| Case sans contenu | Après ouverture, message d’absence ; une publication tardive pendant le jour rend le quiz jouable jusqu’à minuit. |
| Confirmation reçue à partir de minuit Paris | Réponse refusée ; expliquer que le quiz est terminé et permettre l’accès au calendrier et au classement. |
| 25 décembre | Pas de quiz ; révélation éventuelle du 24, puis message de Noël et bilan personnel. Classement final disponible dès minuit. |
| 26 décembre–15 janvier inclus | Classement final et calendrier accessibles, sans réponse possible. |

La représentation de la case 25 et le traitement graphique des cases manquées restent à affiner en story. Les états sont compréhensibles sans la couleur seule.

## Interaction Primitives

Toucher la porte ou une affirmation ; confirmer explicitement. Ouverture et célébration courtes ; l’icône Père Noël bouge une fois à l’ouverture de HatCast, moins de cinq secondes. Aucun mouvement n’est nécessaire pour accéder au contenu.

## Accessibility Floor

Cibles 48 × 48 px privilégiées, minimum 44 × 44 px. Clavier, focus visible, libellés et états accessibles ; annoncer transitions et erreurs, placer le focus dans la surface automatique puis le restaurer au retour lorsque pertinent, sans piège clavier. Exposer numéro et état des cases sans divulguer leur contenu ; lecture de gauche à droite. Alternatives pertinentes pour les portraits, sémantique de choix unique, contraste et agrandissement sans perte. Avec mouvement réduit, supprimer les animations tout en donnant immédiatement le même contenu. L’objectif de quiz sans défilement ne prime jamais sur l’accessibilité.

## Responsive & Platform

Grille de quatre colonnes ordonnées, défilement accepté ; téléphone d’abord, puis tablette et desktop. Vérifier petites largeurs, textes réels, zoom et agrandissement ; permettre défilement ou réorganisation sans troncature ni réduction indue des cibles. Palette Avent à traduire en tokens isolés et à vérifier.

## Key Flows

### UJ-1 — Camille joue

1. Camille ouvre HatCast ou suit la notification de 10 h ; la révélation prioritaire éventuelle passe d’abord.
2. Elle ouvre la porte, découvre le portrait et les trois anecdotes et choisit celle qu’elle croit fausse.
3. **Confirmation :** sa réponse est enregistrée ; l’accusé lui donne rendez-vous demain et accès au classement sans indice sur le résultat. En cas d’échec, elle peut réessayer avant minuit ; après clôture, la réponse est refusée et elle peut consulter classement et calendrier.

### UJ-2 — Camille revient

1. Dès minuit Paris, si un résultat révélable n’a pas été vu, Camille découvre le plus récent de ces résultats : son choix, la fausse anecdote, ses points et le complément éventuel.
2. **Révélation :** elle découvre si elle a trouvé ; le calendrier n’est pas accessible sur cet écran prioritaire.
3. Si le quiz du jour existe, « Découvrir la case du jour » y mène. S’il manque, continuer vers le message d’absence, avec accès au classement et au calendrier. Le 25, continuer vers le message et le bilan ; du 26 décembre au 15 janvier, vers le classement final et le calendrier. « Fermer » revient à HatCast. Les réponses antérieures révélées restent consultables dans le calendrier.

### UJ-3 — Camille consulte le calendrier

1. Camille ouvre Calendrier depuis l’expérience et choisit une case passée.
2. Si elle a joué et que le résultat est révélé, elle revoit son résultat ; sinon elle découvre le contenu passé disponible et la fausse anecdote, sans pouvoir répondre ni marquer de points.
3. Si le contenu manque, elle voit le message d’absence ; les cases futures restent verrouillées.

### UJ-4 — Patrice et Toinou préparent la surprise

La collecte et la transmission des anecdotes ainsi que l’intégration des contenus se font hors de cette interface ; le parcours ci-dessous couvre le test.

1. En développement isolé, ils ouvrent une case disponible en mode test clairement identifié.
2. Ils vérifient réponse unique, rejeu personnel de test, attente, révélation et classement en simulant les dates avec l’horloge simulée et le reset définis en architecture. Le classement reste calculé sur toutes les réponses enregistrées même si l’horloge est reculée.
3. Une remise à zéro ciblée permet de recommencer sans toucher aux données réelles.

## Arbitrages et passage de relais

- **UX / Patrice et Toinou** : éventuelle animation du 25 ; réalisation graphique du Père Noël classique, de sa boîte décorative au logo de La Malice et du village éventuel ; présentation des cases manquées.
- **Barème confirmé dans le PRD final** : 10 points pour une bonne réponse, 0 pour une mauvaise, 1 point de participation par réponse ; +2 par groupe de trois bonnes réponses consécutives, une mauvaise rompt la série, un jour manqué ne la rompt pas. Les groupes ne se chevauchent pas : bonus aux 3e, 6e, 9e bonnes réponses consécutives, même si des jours sont manqués ; maximum théorique de 280 points.
- **Architecture** : confidentialité des réponses et points en attente, y compris déduction via classement ; limites de minuit Paris, état vu et fermeture partagés, interruption et concurrence ; séries, notification à 10 h, publication tardive, test isolé et simulation ; rétention et mesure PostHog.
- **Spec** : réconcilier contrats d’accès, divulgation différée, calcul, historique et cas manqués après arbitrages ; préserver les décisions compatibles.
- **Epic 25 et stories** : critères et dépendances révisés validés avec Patrice le 29 octobre 2026. Appliquer les règles actuelles et les critères M3 ; vérifier les parcours sur appareils, au clavier, avec contraste et mouvement réduit.

## Direction artistique approuvée et couverture des états — 30 octobre 2026

La [planche](imports/advent-quiz-design-system-reference.png) et la [confirmation](imports/confirmation-reference.png) sont les références artistiques validées ; DESIGN.md fixe leur traduction et les règles d'isolation. Leurs textes et boutons illustratifs ne créent ni parcours ni fonctionnalité. Les règles de cette expérience et du PRD prévalent, notamment la révélation à minuit Paris et la priorité du résultat.

| Surface ou état réel | Référence et portée |
|---|---|
| Découverte, cadeau ou porte | Accueil et lutin ; commande accessible et alternative sans mouvement. |
| Question | Question et choix non sélectionné, sélectionné, désactivé ; erreur et enregistrement incertain selon le comportement réel. |
| Confirmation | Composition de la référence dédiée ; accusé neutre et aucun choix, résultat ou point en attente. Classement lorsque disponible. |
| Résultat | Variantes bonne et mauvaise réponse et détails, exclusivement après révélation ; points et contenu selon le contrat. |
| Calendrier et classement | Planche calendrier ; décliner le classement dans la même identité, même s'il n'y figure pas. |
| 25 décembre | Bilan et Père Noël selon le parcours établi ; la vignette « 24 décembre » ne modifie pas la date ni le contenu. |
| Absence, fermeture, chargement, erreur | Déclinaisons cohérentes ; ne pas ajouter de compte à rebours ou d'action de partage sur la seule foi des maquettes. |
| Commandes de test | Visibles uniquement en mode test autorisé ; leurs limites et disponibilités suivent les stories effectives. |

Vérifier 320, 375, 390 et 430 px, tablette, desktop et texte agrandi. Les illustrations décoratives ne se substituent pas aux textes, aux commandes ni aux annonces accessibles ; préserver le focus, les états non fondés sur la couleur et le mouvement réduit.

### Application aux stories de l’Epic 25

| Story | Surface concernée | Contrat visuel et comportemental |
|---|---|---|
| 25.1, livrée | Découverte, cadeau, chargement, indisponibilité | Appliquer la DA Avent et conserver accès, focus et mouvement réduit. |
| 25.2, livrée | Question, sélection, confirmation, vérification, fermeture et commande de test existante | Appliquer la DA sans modifier les contrôles de confidentialité, de réconciliation ou de focus de l'implémentation livrée. |
| 25.2a | Remise à zéro ciblée | Appliquer la DA uniquement si une interface est effectivement prévue ; ne pas créer d'écran. |
| 25.3 | Révélation bonne ou mauvaise, détail et continuation | DA festive ; résultat et points seulement au moment autorisé, priorité et célébration selon les règles existantes. |
| 25.4 | Classement, score personnel et états accessibles | CTA après réponse ; en production aucun indice sur les points en attente, en test isolé classement de toutes les réponses enregistrées. |
| 25.5 | Calendrier, cases passées, contenu manquant et présentation du 25 | Décliner les composants sans dépendre de la couleur ; respecter la grille ordonnée et le parcours de Noël. |
| 25.6 | Entrée, ouverture et contenu manquant | Appliquer la DA dans l'expérience Avent et préserver le chrome HatCast hors de cette frontière. |
| 25.7, 25.9 | Invitations et mesure | Aucun écran supplémentaire déduit du kit. |

Chaque story UI référence DESIGN.md, EXPERIENCE.md, AD-7 et la stratégie de tests Avent ; elle vérifie les états réellement livrés ainsi que l'absence d'effet sur les écrans HatCast.

### Parcours partagé et commandes de développement

Tous les membres empruntent le même parcours et voient la même partie. En développement isolé vérifié, seuls les deux opérateurs autorisés voient les commandes de date locale à leur onglet, de rejeu personnel et de réinitialisation explicite ; les autres membres ne voient que les points révélables. La confirmation du reset annonce son effet sur les réponses de tous les membres.
