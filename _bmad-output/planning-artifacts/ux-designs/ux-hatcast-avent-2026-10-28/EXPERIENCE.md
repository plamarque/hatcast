---
name: Calendrier de l’Avent La Malice
status: final
updated: 2026-10-31
visual_amendment: in-progress
calendar_amendment: in-progress
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
| Révélation prioritaire | Après la première découverte, au retour, résultat révélable non vu le plus récent, même si une réponse plus récente attend encore sa révélation, avant le parcours du jour ; aucun accès au calendrier sur cet écran. |
| Porte et quiz du jour | Du 1er au 24, quiz disponible et non répondu : ouverture automatique selon FR-2, ou accès par icône et notification ; une fermeture supprime l’ouverture automatique du jour sur tous les appareils. |
| Confirmation | Accusé sans résultat ni points, invitation à revenir demain et action vers le classement. |
| Classement | Dans la story 25.4, l’accusé après réponse donne accès par « Voir le classement » au score personnel, à la position et à la liste, sous réserve de la révélation prioritaire. En production les scores sont révélés ; en test isolé ils incluent toutes les réponses notées enregistrées, y compris celles en attente. |
| Calendrier | Grille ordonnée des 24 quiz et du 25 ; accès aux contenus passés et au quiz du jour disponible. Cases futures bloquées en parcours ordinaire. |
| 25 décembre | Après l’éventuelle révélation prioritaire du 24 : message de joyeux Noël, invitation à profiter des fêtes, félicitations, rappel du score personnel et rendez-vous à la rentrée ; accès au classement et au calendrier. Père Noël et boîte au-dessus du message, puis score bien visible. |
| Mode test | Développement isolé, indication visible ; rejeu personnel de sa propre réponse et remise à zéro ciblée. Date simulée propre à l’onglet opérateur, validée côté serveur : le numéro du jour simulé est visible et annoncé entre les flèches ; les flèches avancent ou reculent d’un jour sans effacer les réponses ni modifier la date des autres membres ; le résultat est révélé le lendemain simulé. Le classement affiche le score actuel de toutes les réponses notées enregistrées, indépendamment de la date simulée ; il peut donc donner un indice sur les points en attente. Le parcours et le CTA restent les mêmes. Un reset ciblé redémarre la partie. |

L’icône cadeau près de Mon compte donne accès du 1er décembre au 15 janvier inclus. Une visite sans quiz disponible ne consomme pas l’ouverture automatique ; la fermeture de l’expérience ce jour-là empêche une ouverture automatique ultérieure. Si le quiz manque, l’icône affiche « Il n’y a rien ici. Reviens plus tard ! » et permet d’accéder au classement ; la révélation prioritaire précède cet état. Après réponse normale encore en attente, l’icône ouvre la scène de décompte, sous réserve de la révélation prioritaire. Après le 24, aucun quiz ne s’ouvre automatiquement ; classement final et calendrier restent accessibles à tous jusqu’au 15 janvier inclus.

## Voice and Tone

Français, tutoiement, ton festif et encourageant. Après confirmation : accusé de réception, rendez-vous demain et « Voir le classement ». En production, aucun indice sur la justesse ou les points en attente ; en test isolé le classement courant peut en donner un. En cas d’erreur à la révélation, encourager sans dramatiser. Message pour une case sans contenu : « Il n’y a rien ici. Reviens plus tard ! » Le 25, y compris pour une personne qui n’a pas joué, présenter le score personnel révélé (0 si aucune réponse), puis les accès au classement final et au calendrier. Le 25 : souhaiter un joyeux Noël, inviter à profiter des fêtes, féliciter la personne, rappeler son score et lui donner rendez-vous à la rentrée. La formulation exacte reste à affiner. Le Père Noël tend une boîte au logo de La Malice, décorative pour l’instant ; aucune ouverture ni contenu associé ne sont demandés à ce stade.

## Component Patterns

- **Porte et choix** : toucher la grande porte pour découvrir le contenu ; sélectionner une des trois anecdotes supposée fausse, changer librement avant confirmation. En production, une réponse enregistrée est définitive hors prévisualisation autorisée ; en mode test isolé ou en prévisualisation personnelle autorisée, la commande de rejeu personnel permet d’effacer sa propre réponse et rejouer la case selon le contrat existant.
- **Confirmation** : sur la surface du quiz, confirmer l’enregistrement sans révéler justesse, fausse anecdote ou points ; en production, ne pas exposer d’indice par les scores ou le classement ; en test isolé, le classement courant fait exception comme précisé ci-dessus. En cas d’échec, proposer de réessayer tant que le quiz est jouable. Si l’enregistrement est incertain après une coupure, vérifier l’état enregistré avant de proposer un nouveau geste : si la réponse existe, afficher la confirmation ; sinon permettre le réessai avant minuit, ou expliquer la clôture après minuit. La résolution technique et les conflits entre appareils relèvent de l’architecture.
- **Révélation** : dès minuit le lendemain, heure de Paris, montrer la justesse et la fausse anecdote, ainsi que le choix lorsque celui-ci diffère ; afficher uniquement les points gagnés ce jour (réponse, participation et éventuel bonus additionnés). Présenter aussi le complément facultatif lorsqu’il existe. Mettre les points du jour en évidence et la célébration validée pour une bonne réponse, avec alternative sans mouvement. La consultation ultérieure ne rejoue pas la célébration.
- **Accès au calendrier et au classement** : après l’enregistrement de sa réponse, le membre peut ouvrir le classement depuis l’accusé. Les icônes de la barre donnent accès directement au calendrier et au classement ; elles sont désactivées pendant la révélation prioritaire.
- **Classement** : rappel de la position et du score révélés, puis tous les membres classables nommés, y compris à zéro. Une légende accessible explique le barème : 10 points pour une bonne réponse, 0 pour une mauvaise, 1 point de participation par réponse et 2 points de bonus par groupe non chevauchant de trois bonnes réponses consécutives ; une mauvaise réponse remet la série à zéro, un jour manqué ne la rompt pas. Sa présentation reste à préciser pour la story 25.4. Les ex æquo reçoivent le rang le plus bas de leur groupe : 1, 3, 3, 4 ; si tous les N membres sont à égalité, tous sont Nᵉ. Patrice et Toinou voient séparément leur score sans rang et ne figurent pas dans la liste. En production, les totaux excluent les points non révélés, sans détail permettant de les déduire. En test isolé, ils incluent toutes les réponses notées enregistrées même avant leur révélation, quelle que soit la date simulée.

## State Patterns

| État | Traitement |
|---|---|
| Quiz du jour disponible, non répondu | Porte du jour, sans cadenas ; accès possible depuis calendrier et icône. |
| Réponse enregistrée avant révélation | Ouvrir l’accusé « Réponse enregistrée ! Reviens demain pour découvrir la réponse. » avec accès au classement, et au calendrier depuis son icône dans la barre, sans afficher le choix, la justesse ou les points du jour. |
| Résultat de la dernière réponse révélable et non vu | Révélation prioritaire, avant quiz du jour ; pas d’accès au calendrier sur cet écran. Marquer vu dès que l’écran de révélation est effectivement affiché ; une fermeture ultérieure ne le rend pas à nouveau prioritaire. Une interruption avant affichage le laisse prioritaire au prochain accès. Consultation partagée entre appareils ; préciser en architecture comment garantir ce contrat. |
| Résultats plus anciens révélables et non vus | Consultation dans leur case du calendrier, sans enchaînement automatique ; leur résultat personnel est indiqué dans le récapitulatif dès qu’il est révélable, selon les règles ci-dessous. |
| Case jouée et révélée | Consultation de la fausse anecdote, du choix s’il diffère et des points gagnés ce jour, sans rejouer l’animation. L’action « Voir le classement » permet de poursuivre, que la réponse soit juste ou fausse. La représentation future par cadeau et résultat suit les arbitrages ci-dessous. |
| Case passée non jouée | Après sa date, ouvrir le cadeau puis répondre une fois pour le plaisir ; le résultat personnel est immédiat et vaut zéro, sans effet sur score ni série. Le texte indique cette règle avant confirmation. Les consultations suivantes ouvrent directement le résultat. |
| Case future | Case numérotée et verrouillée ; contenu inaccessible. Le 25 futur reste sombre et verrouillé malgré son caractère distinctif. |
| Case sans contenu | Après ouverture, message d’absence ; une publication tardive pendant le jour rend le quiz jouable jusqu’à minuit. |
| Confirmation reçue à partir de minuit Paris | Réponse refusée ; expliquer que le quiz est terminé et permettre l’accès au calendrier et au classement. |
| 25 décembre | Pas de quiz ; révélation éventuelle du 24, puis message de Noël et bilan personnel. Classement final disponible dès minuit. |
| 26 décembre–15 janvier inclus | Classement final et calendrier accessibles ; une case passée non jouée reste jouable une fois sans point. |

La représentation du 25 et le traitement des cases manquées restent à préciser ci-dessous. Les états sont compréhensibles sans la couleur seule.

## Interaction Primitives

Toucher la porte ou une affirmation ; confirmer explicitement. Ouverture et célébration courtes ; un reflet doré traverse l’icône cadeau puis deux étincelles apparaissent brièvement, une fois à l’ouverture de HatCast, pendant 2,5 secondes ; le mouvement réduit supprime cette animation. Aucun mouvement n’est nécessaire pour accéder au contenu.

## Accessibility Floor

Cibles 48 × 48 px privilégiées, minimum 44 × 44 px. Clavier, focus visible, libellés et états accessibles ; annoncer transitions et erreurs, placer le focus dans la surface automatique puis le restaurer au retour lorsque pertinent, sans piège clavier. Exposer numéro et état des cases sans divulguer de contenu ou résultat avant l’heure autorisée ; lecture de gauche à droite. Alternatives pertinentes pour les portraits, sémantique de choix unique, contraste et agrandissement sans perte. Avec mouvement réduit, supprimer les animations tout en donnant immédiatement le même contenu. L’objectif de quiz sans défilement ne prime jamais sur l’accessibilité.

## Responsive & Platform

Grille de quatre colonnes ordonnées, défilement accepté ; téléphone d’abord, puis tablette et desktop. Vérifier petites largeurs, textes réels, zoom et agrandissement ; permettre défilement ou réorganisation sans troncature ni réduction indue des cibles. Palette Avent à traduire en tokens isolés et à vérifier.

## Key Flows

### UJ-1 — Camille joue

1. Après sa première découverte du calendrier, Camille ouvre HatCast ou suit la notification de 10 h ; la révélation prioritaire éventuelle passe d’abord.
2. Elle ouvre la porte, découvre le portrait et les trois anecdotes et choisit celle qu’elle croit fausse.
3. **Confirmation :** sa réponse est enregistrée ; l’accusé lui donne rendez-vous demain et accès au classement sans indice sur le résultat. En cas d’échec, elle peut réessayer avant minuit ; après clôture, la réponse est refusée et elle peut consulter classement et calendrier.

### UJ-2 — Camille revient

1. Dès minuit Paris, si un résultat révélable n’a pas été vu, Camille découvre le plus récent de ces résultats : son choix, la fausse anecdote, ses points et le complément éventuel.
2. **Révélation :** elle découvre si elle a trouvé ; le calendrier n’est pas accessible sur cet écran prioritaire.
3. Si le quiz du jour existe, « Découvrir la case du jour » y mène. S’il manque, continuer vers le message d’absence, avec accès au classement et au calendrier. Le 25, continuer vers le message et le bilan ; du 26 décembre au 15 janvier, vers le classement final et le calendrier. « Fermer » revient à HatCast. Les réponses antérieures révélées restent consultables dans le calendrier.

### UJ-3 — Camille consulte le calendrier

1. Camille ouvre Calendrier depuis l’expérience et choisit une case passée.
2. Si elle a joué, elle revoit son résultat sans célébration ; sinon elle ouvre le cadeau et répond une fois sans point, puis découvre immédiatement son résultat.
3. Si le contenu manque, elle voit le message d’absence ; les cases futures restent verrouillées en parcours ordinaire.

### UJ-4 — Patrice et Toinou préparent la surprise

La collecte et la transmission des anecdotes ainsi que l’intégration des contenus se font hors de cette interface ; le parcours ci-dessous couvre le test.

1. En développement isolé, ils ouvrent une case disponible en mode test clairement identifié.
2. Ils vérifient réponse unique, rejeu personnel de test, attente, révélation et classement en simulant les dates avec l’horloge simulée et le reset définis en architecture. Le classement reste calculé sur toutes les réponses notées enregistrées même si l’horloge est reculée ; les réponses tardives sans point sont exclues.
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
| 25.4 | Classement, score personnel et états accessibles | CTA après réponse ; en production aucun indice sur les points en attente, en test isolé classement de toutes les réponses notées enregistrées. |
| 25.5 | Calendrier, cases passées, contenu manquant et présentation du 25 | Décliner les composants sans dépendre de la couleur ; respecter la grille ordonnée et le parcours de Noël. |
| 25.6 | Entrée, ouverture et contenu manquant | Appliquer la DA dans l'expérience Avent et préserver le chrome HatCast hors de cette frontière. |
| 25.7, 25.9 | Invitations et mesure | Aucun écran supplémentaire déduit du kit. |

Chaque story UI référence DESIGN.md, EXPERIENCE.md, AD-7 et la stratégie de tests Avent ; elle vérifie les états réellement livrés ainsi que l'absence d'effet sur les écrans HatCast.

### Parcours partagé et commandes de développement

Tous les membres empruntent le même parcours et voient la même partie. En développement isolé vérifié, seuls les deux opérateurs autorisés voient les commandes de date locale à leur onglet, de rejeu personnel et de réinitialisation explicite ; les autres membres ne voient que les points révélables. La confirmation du reset annonce son effet sur les réponses de tous les membres.

### Fermeture ciblée en développement isolé

Dans le calendrier uniquement, une commande dans la barre de test permet aux opérateurs autorisés de refermer leur propre cadeau du jour simulé sans quitter le calendrier. Elle est désactivée si ce jour du 1er au 24 décembre ne comporte pas de réponse personnelle, ainsi que pendant une opération. Elle efface cette seule réponse, respecte la priorité de révélation et laisse les autres réponses et la date inchangées. Aucun membre ordinaire ne voit cette commande.

### Accès au calendrier — clarification du 31 octobre

La barre de l’Avent comporte à droite les icônes calendrier, classement et fermeture sur les écrans du parcours. Le calendrier et le classement sont désactivés pendant la révélation prioritaire. Ils remplacent le bouton de retour en bas des résultats historiques ; chaque icône ouvre directement sa destination.

## Évolution du calendrier personnel — 31 octobre 2026

**Décisions retenues par Patrice et Toinou :** faire évoluer la grille livrée par la story 25.5 en un récapitulatif personnel de 25 cadeaux inspirés de ceux de l’éditeur. La forme ouverte ou fermée exprime l’ouverture ; le résultat personnel est vert ou rouge avec un indice accessible, neutre en l’absence de résultat ; les jours futurs sont sombres et le cadeau du 25 distinctif. DESIGN.md porte la cible visuelle approuvée et les détails encore à valider. Le 25 reste un bilan sans quiz.

**Confidentialité :** avant l’heure de révélation autorisée, aucun état visuel, libellé accessible ou donnée du calendrier ne donne d’indice sur la justesse ou les points. L’heure et les droits sont déterminés côté serveur selon l’architecture Avent. La priorité de révélation et les règles de test existantes restent applicables : l’exception de classement en test isolé ne crée aucune exception pour les cases. Les résultats des autres personnes ne figurent pas dans ce récapitulatif personnel.

**États précisés par Patrice :** un cadeau est ouvert dès que la réponse est enregistrée. Avant l’heure autorisée il reste neutre, sans indice de justesse ; dès que le résultat devient révélable, il devient vert ou rouge avec un indice accessible, même si le résultat n’a pas encore été consulté. Après la première découverte, la révélation prioritaire continue de s’appliquer. Ouvrir la scène de découverte ne change pas à lui seul la silhouette de la case : celle-ci ne s’ouvre qu’à l’enregistrement de la réponse. Un jour passé non joué reste fermé et neutre, sans indication « jour manqué » ; lorsqu’un quiz existe, il peut être joué une fois sans point. Les jours sans contenu doivent rester distincts des jours manqués par un indice accessible ; sa forme visuelle reste à valider. Une réponse tardive donne un résultat immédiat sans point ni effet sur la série ou le classement. Vert signifie bonne réponse et rouge mauvaise réponse ; les formes exactes des indices non chromatiques restent à valider. Le 25 accessible mène au bilan et ne représente aucun résultat de quiz ; sa silhouette précise reste à valider.

**Vérifications :** grille ordonnée, lecture du numéro et de l’état au clavier, repère non chromatique, cibles tactiles et focus, contraste, mouvement réduit et zoom ; éprouver visuellement le cadeau ouvert à la taille réelle, y compris à 320 px. Vérifier les limites de révélation à minuit Paris, les résultats non consultés, le 25, les jours manqués et sans contenu, ainsi que l’isolation du thème Avent et des comptes. Le calendrier projette les résultats personnels autorisés avec un signe en complément de la couleur.

**Données et accessibilité :** au changement de compte ou au recul de la date simulée, retirer les états et résultats précédemment affichés et recharger les seules données autorisées pour le compte et l’instant serveur ; respecter les règles de cache privé de l’architecture. Un calendrier déjà ouvert n’expose un nouveau résultat qu’après lecture autorisée du serveur, sans promettre une actualisation exactement à minuit. Chaque case annonce son numéro et son état autorisé, par exemple « jour 3, réponse enregistrée, résultat en attente », « jour 4, bonne réponse », « jour 5, mauvaise réponse », « jour 6, sans contenu », « jour 7, verrouillé » ou « 25 décembre, bilan » ; aucune mention de jour manqué. Préserver clavier, focus et état verrouillé accessibles.

### Choix du mode test

Un testeur autorisé commence en mode membre : le temps, les réponses et le classement suivent les règles normales. Il peut activer le mode test depuis la barre de l’Avent, y compris lorsque le parcours normal est indisponible ; une barre contextuelle affiche alors les actions applicables. Le choix reste actif pendant la navigation dans l’Avent. Le désactiver recharge la projection membre sans effacer de réponse ni réinitialiser la partie. Une mutation en cours se termine avant le changement ; les anciennes réponses réseau ne doivent pas remplacer la nouvelle projection. Le reset global reste confirmé ; refermer son cadeau indique que la réponse personnelle sera effacée.

Dans cette barre, un menu à trois points placé à droite regroupe les actions de réinitialisation, d’effacement personnel et de rejeu de l’ouverture à la connexion, ainsi que la prévisualisation de l’accusé depuis le calendrier. Chaque action disponible conserve son icône et porte un libellé explicite ; ses confirmations et ses conditions restent inchangées. Les flèches de date restent directement accessibles.

À l’activation du mode test, une révélation non vue reste prioritaire ; sinon, avant le 25 décembre, afficher l’état de la case du jour simulé, y compris l’accusé neutre si sa réponse est déjà enregistrée. Ce parcours remplace l’écran calendrier ou classement précédemment ouvert.

Lorsqu’un testeur rejoue une réponse initialement tardive en revenant au jour simulé correspondant, le rejeu reste sans points et l’interface l’indique ; sa réponse et son résultat restent masqués jusqu’à la révélation autorisée.


### Vérifications visuelles de la reprise 25.8

Patrice privilégie la lisibilité des écritures et de grandes cibles tactiles. Pour le quiz Avent, le test au lecteur d’écran et un seuil chiffré de contraste ne sont pas des critères de validation obligatoires ; vérifier visuellement les textes, états et commandes. Conserver les comportements clavier, focus, sémantique et mouvement réduit existants lorsqu’ils sont compatibles avec la direction artistique.

### Première découverte du calendrier

La première visite affiche une invitation avant tout résultat ou quiz. L’action explicite « Découvrir mon calendrier de l’Avent » enregistre la découverte et ouvre le calendrier. Fermer avant cette action laisse l’invitation disponible ; une erreur permet de réessayer. Un résultat préexistant ne devient pas vu par la récupération du calendrier et reste prioritaire lors des visites suivantes.

### Prévisualisation de l’accueil en test

Le titre « Quiz de l’Avent » dans la barre supérieure permet à chaque membre de revoir l’accueil sans modifier l’état de découverte ni les réponses. Il est indisponible pendant une révélation prioritaire ou une opération en cours. L’action de l’accueil ouvre le calendrier selon les contrôles habituels, notamment la priorité de révélation.

En mode test autorisé, une commande du calendrier permet également de prévisualiser l’accusé de réponse avec un lutin fictif, sans enregistrer ni effacer de réponse.

### Retour à la case jouée du jour

Depuis le calendrier, revenir sur une réponse normale enregistrée et encore en attente affiche une scène distincte de la confirmation immédiate. Un décompte indique le temps avant le résultat, jusqu’au prochain minuit parisien. Une vérification serveur est nécessaire avant toute révélation ; une erreur reste récupérable. En mode test, la date simulée reste explicite et seul son changement déclenche la révélation correspondante. Le 25 décembre est un bilan, sans nouveau quiz.


### Prévisualisation privée de production

La route directe réservée aux deux personnes autorisées ouvre le calendrier et ses cases futures ; son résultat personnel et son explication sont immédiatement consultables et récupérables. Identifier clairement la prévisualisation avec une action confirmée pour effacer uniquement sa réponse au jour sélectionné et rejouer, sans contrôle de simulation ou de remise à zéro commune. Préserver clavier, focus, mouvement réduit, lisibilité mobile et isolation visuelle Advent. Dans la navigation ordinaire, aucune erreur ne révèle l’Avent avant son ouverture.

### Rejouer l’ouverture à la connexion (mode test)

La barre de test propose à l’opérateur autorisé une action explicite pour préparer sa prochaine connexion. La confirmation indique la date ordinaire de développement et prévient que sa réponse à cette date sera effacée avant la déconnexion. Une date simulée différente ne change pas cette cible. Une date hors période, un quiz manquant ou un échec sont expliqués sans annoncer une réussite ; les résultats non vus conservent leur priorité normale.

Dans le classement, les testeurs autorisés en mode test isolé peuvent générer des scores fictifs, puis régénérer ou revenir au classement calculé. La projection disparaît en quittant le classement, au rechargement ou au changement de mode, compte ou session ; elle ne modifie aucune réponse.


### Accès anticipé en test de développement isolé

En développement isolé, le testeur autorisé par le serveur peut, sans activer le mode test, ouvrir et répondre à un quiz futur disponible ; son résultat personnel détaillé reste indisponible jusqu’à minuit Europe/Paris suivant le jour du cadeau, y compris en mode test. Le classement du mode test explicitement activé peut toutefois afficher des points avant révélation et donner un indice ; une date simulée peut atteindre cette échéance. La sélection ne change pas la date simulée ni l’horloge partagée ; les réponses et le rejeu restent personnels. Les cadeaux futurs conservent leur apparence habituelle ; le 25 ouvre un aperçu provisoire du podium, et les contenus manquants conservent leur comportement existant. Les règles de production, de classement et de révélation du jour restent inchangées.

### Bilan de Noël — podium

Après la révélation prioritaire, le bilan présente jusqu’aux trois premiers membres classables ayant un score positif. Une phrase courte explique le critère décisif d’une égalité affectant le podium, y compris avec la quatrième place. En l’absence de score positif, afficher les vœux et la navigation sans podium ni présomption de participation. Le membre est remercié pour sa participation seulement si son score personnel est positif, y compris hors classement. Les aperçus anticipés autorisés sont explicitement provisoires. Le calendrier, le classement final et le retour à HatCast restent accessibles.

### Découverte des récits

Sélectionner une proposition ouvre automatiquement son récit lorsqu’il existe ; la commande de lecture reste utilisable indépendamment de la sélection.

Dans un quiz jouable autorisé, chaque récit fourni peut être ouvert indépendamment sous son choix, sans modifier la sélection ; ses paragraphes restent complets. Après révélation autorisée, le rappel des récits reste disponible. Les parcours sans récit et l’explication existante restent inchangés.

### Rappel de test sur appareil

Dans la barre du mode test autorisé, une commande distincte de la case simulée demande un rappel immédiat sur cet appareil. Elle explique le refus ou l’absence d’autorisation et distingue l’acceptation de l’envoi de la réception effective. La date simulée détermine la case ; l’ouverture respecte la découverte et la révélation prioritaire. Une case manquante ou inaccessible conduit au calendrier et à une explication.

Un lien vers une case verrouillée, absente ou indisponible ouvre le calendrier avec une explication, sans divulguer de contenu protégé.
