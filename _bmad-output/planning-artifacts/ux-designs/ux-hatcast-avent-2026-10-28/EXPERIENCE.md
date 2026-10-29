---
name: Calendrier de l’Avent La Malice
status: final
updated: 2026-10-29
sources:
  - ../../prds/prd-hatcast-2026-10-28/prd.md
  - ../../../../docs/v2/technical/FRONTEND_UI.md
---

# Expérience — Calendrier de l’Avent La Malice

## Foundation

Animation intégrée à HatCast, mobile-first et utilisable sur desktop ; Angular Material 3 et usages HatCast. [DESIGN.md](DESIGN.md) porte l’identité visuelle. Le PRD révisé est final ; ce document réconcilie ses règles et conserve explicitement les points en attente. La [maquette du parcours révisé](mockups/parcours-revise.html) est approuvée globalement ; son design sera affiné pendant les stories. Les deux documents UX prévalent sur les maquettes ; les parcours, scores et rangs de [l’ancienne maquette](mockups/ecrans-cles.html) sont obsolètes.

## Information Architecture

| Surface | Accès et rôle |
|---|---|
| Révélation prioritaire | Au retour, résultat révélable non vu le plus récent, même si une réponse plus récente attend encore sa révélation, avant le parcours du jour ; aucun accès au calendrier sur cet écran. |
| Porte et quiz du jour | Du 1er au 24, quiz disponible et non répondu : ouverture automatique selon FR-2, ou accès par icône et notification ; une fermeture supprime l’ouverture automatique du jour sur tous les appareils. |
| Confirmation | Accusé sans résultat ni points, invitation à revenir demain et action vers le classement. |
| Classement | Score révélé et position, puis liste ; accès après réponse ou via l’expérience, sous réserve de la révélation prioritaire. |
| Calendrier | Grille ordonnée des 24 quiz et du 25 ; accès aux contenus passés et au quiz du jour disponible. Cases futures bloquées. |
| 25 décembre | Après l’éventuelle révélation prioritaire du 24 : message de joyeux Noël, invitation à profiter des fêtes, félicitations, rappel du score personnel et rendez-vous à la rentrée ; accès au classement et au calendrier. Père Noël et boîte au-dessus du message, puis score bien visible. |
| Mode test | Développement isolé, indication visible ; cases disponibles ouvrables avant leur jour, réponses définitives et remise à zéro ciblée. Horloge simulée serveur commune avançant seulement ; répondre à une case future avance au jour correspondant et le résultat est révélé le lendemain simulé. Un reset ciblé permet de revenir en arrière. |

L’icône Père Noël près de Mon compte donne accès du 1er décembre au 15 janvier inclus. Une visite sans quiz disponible ne consomme pas l’ouverture automatique ; la fermeture de l’expérience ce jour-là empêche une ouverture automatique ultérieure. Si le quiz manque, l’icône affiche « Il n’y a rien ici. Reviens plus tard ! » et permet d’accéder au classement ; la révélation prioritaire précède cet état. Après réponse, l’icône ouvre le classement sous la même réserve. Après le 24, aucun quiz ne s’ouvre automatiquement ; classement final et calendrier restent accessibles à tous jusqu’au 15 janvier inclus.

## Voice and Tone

Français, tutoiement, ton festif et encourageant. Après confirmation : accusé de réception, rendez-vous demain et « Voir le classement », sans indice sur la justesse ou les points. En cas d’erreur à la révélation, encourager sans dramatiser. Message pour une case sans contenu : « Il n’y a rien ici. Reviens plus tard ! » Le 25, y compris pour une personne qui n’a pas joué, présenter le score personnel révélé (0 si aucune réponse), puis les accès au classement final et au calendrier. Le 25 : souhaiter un joyeux Noël, inviter à profiter des fêtes, féliciter la personne, rappeler son score et lui donner rendez-vous à la rentrée. La formulation exacte reste à affiner. Le Père Noël tend une boîte au logo de La Malice, décorative pour l’instant ; aucune ouverture ni contenu associé ne sont demandés à ce stade.

## Component Patterns

- **Porte et choix** : toucher la grande porte pour découvrir le contenu ; sélectionner une des trois anecdotes supposée fausse, changer librement avant confirmation. Une réponse enregistrée est définitive.
- **Confirmation** : sur la surface du quiz, confirmer l’enregistrement sans révéler justesse, fausse anecdote ou points ; ne pas exposer d’indice par les scores ou le classement. En cas d’échec, proposer de réessayer tant que le quiz est jouable. Si l’enregistrement est incertain après une coupure, vérifier l’état enregistré avant de proposer un nouveau geste : si la réponse existe, afficher la confirmation ; sinon permettre le réessai avant minuit, ou expliquer la clôture après minuit. La résolution technique et les conflits entre appareils relèvent de l’architecture.
- **Révélation** : dès minuit le lendemain, heure de Paris, montrer le choix, la fausse anecdote, la justesse et les points : réponse, participation et bonus lorsqu’acquis. Présenter aussi le complément facultatif lorsqu’il existe. Conserver le total en évidence et la célébration validée pour une bonne réponse, avec alternative sans mouvement. La consultation ultérieure ne rejoue pas la célébration.
- **Onglets** : reprendre les onglets HatCast pour Calendrier et Classement. Ils restent accessibles depuis l’expérience sauf sur la révélation prioritaire ; après celle-ci proposer le quiz du jour lorsqu’il est disponible, ou le parcours du 25 le 25 décembre. Sur la porte et le quiz, fournir les accès au classement et au calendrier ; après confirmation, « Voir le classement » ouvre le classement et l’onglet Calendrier reste accessible. Le message d’absence donne accès aux deux.
- **Classement** : rappel de la position et du score révélés, puis tous les membres classables nommés, y compris à zéro. Les ex æquo reçoivent le rang le plus bas de leur groupe : 1, 3, 3, 4 ; si tous les N membres sont à égalité, tous sont Nᵉ. Patrice et Toinou voient séparément leur score sans rang et ne figurent pas dans la liste. Les totaux excluent les points non révélés, sans détail permettant de les déduire.

## State Patterns

| État | Traitement |
|---|---|
| Quiz du jour disponible, non répondu | Porte du jour, sans cadenas ; accès possible depuis calendrier et icône. |
| Réponse enregistrée avant révélation | Ouvrir l’accusé « Réponse enregistrée ! Reviens demain pour découvrir la réponse. » avec accès au classement et au calendrier, sans afficher le choix, la justesse ou les points du jour. |
| Résultat de la dernière réponse révélable et non vu | Révélation prioritaire, avant quiz du jour ; pas d’accès au calendrier sur cet écran. Marquer vu dès que l’écran de révélation est effectivement affiché ; une fermeture ultérieure ne le rend pas à nouveau prioritaire. Une interruption avant affichage le laisse prioritaire au prochain accès. Consultation partagée entre appareils ; préciser en architecture comment garantir ce contrat. |
| Résultats plus anciens révélables et non vus | Consultation dans leur case du calendrier, sans repère particulier et sans enchaînement automatique. |
| Case jouée et révélée | Porte ouverte ; consultation du choix, de la fausse anecdote et du détail des points, sans rejouer l’animation. |
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

Cibles 48 × 48 px privilégiées, 40 × 40 px minimum seulement avec dérogation documentée. Clavier, focus visible, libellés et états accessibles ; annoncer transitions et erreurs, placer le focus dans la surface automatique puis le restaurer au retour lorsque pertinent, sans piège clavier. Exposer numéro et état des cases sans divulguer leur contenu ; lecture de gauche à droite. Alternatives pertinentes pour les portraits, sémantique de choix unique, contraste et agrandissement sans perte. Avec mouvement réduit, supprimer les animations tout en donnant immédiatement le même contenu. L’objectif de quiz sans défilement ne prime jamais sur l’accessibilité.

## Responsive & Platform

Grille de quatre colonnes ordonnées, défilement accepté ; téléphone d’abord, puis tablette et desktop. Vérifier petites largeurs, textes réels, zoom et agrandissement ; permettre défilement ou réorganisation sans troncature ni réduction indue des cibles. Palette illustrative à traduire dans les tokens HatCast et à vérifier.

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
2. Ils vérifient réponse définitive, attente, révélation et classement en simulant les dates avec l’horloge simulée et le reset définis en architecture.
3. Une remise à zéro ciblée permet de recommencer sans toucher aux données réelles.

## Arbitrages et passage de relais

- **UX / Patrice et Toinou** : éventuelle animation du 25 ; réalisation graphique du Père Noël classique, de sa boîte décorative au logo de La Malice et du village éventuel ; présentation des cases manquées.
- **Barème confirmé dans le PRD final** : 10 points pour une bonne réponse, 0 pour une mauvaise, 1 point de participation par réponse ; +2 par groupe de trois bonnes réponses consécutives, une mauvaise rompt la série, un jour manqué ne la rompt pas. Les groupes ne se chevauchent pas : bonus aux 3e, 6e, 9e bonnes réponses consécutives, même si des jours sont manqués ; maximum théorique de 280 points.
- **Architecture** : confidentialité des réponses et points en attente, y compris déduction via classement ; limites de minuit Paris, état vu et fermeture partagés, interruption et concurrence ; séries, notification à 10 h, publication tardive, test isolé et simulation ; rétention et mesure PostHog.
- **Spec** : réconcilier contrats d’accès, divulgation différée, calcul, historique et cas manqués après arbitrages ; préserver les décisions compatibles.
- **Epic 25 et stories** : critères et dépendances révisés validés avec Patrice le 29 octobre 2026. Appliquer les règles actuelles et les critères M3 ; vérifier les parcours sur appareils, au clavier, avec contraste et mouvement réduit.
