---
title: "Calendrier de l’Avent La Malice"
status: final
created: 2026-10-28
updated: 2026-10-29
---

# PRD — Calendrier de l’Avent La Malice

## Vision et contexte

Proposée par Toinou, membre de la commission Vie Associative, cette animation surprise de Noël 2026 permet aux membres de La Malice de découvrir des anecdotes les uns sur les autres. Intégrée à HatCast, elle associe 25 cases, des quiz et un classement amical pour susciter plaisir, échanges et cohésion. L’animation est ponctuelle et doit être prête et vérifiée avant le 1er décembre, avec une marge de test.

## Public et parcours

Tous les membres de La Malice peuvent jouer, y compris les personnes présentées. Patrice et Toinou jouent aussi, mais leurs comptes sont exclus du classement : ils connaissent les réponses. Une personne qui ne souhaite pas être présentée est remplacée et reste libre de participer.

**UJ-1 — Camille joue le quiz du jour.** Entre le 1er et le 25 décembre, Camille ouvre HatCast ou suit une notification. Elle découvre le portrait et trois affirmations, sélectionne celle qu’elle croit vraie et confirme. Elle voit si elle a trouvé, les points gagnés et, en cas d’erreur, la bonne affirmation. Elle accède ensuite au classement et au calendrier. Une interruption après enregistrement ne doit pas lui faire perdre le résultat.

**UJ-2 — Camille rattrape une case.** Depuis le classement, Camille ouvre une case passée non jouée, répond et voit son résultat. Elle revient au calendrier pour ouvrir éventuellement une autre case ; le classement reste accessible. Elle peut aussi revoir son choix, la bonne réponse et ses points sur une case déjà jouée.

**UJ-3 — Patrice et Toinou préparent la surprise.** Toinou recueille les anecdotes et les transmet à Patrice, qui dispose déjà des portraits et intègre les contenus. Avant décembre, ils parcourent et testent le calendrier sur le serveur de développement isolé, sans affecter le jeu réel.

## Définitions

- **Case** : jour numéroté du 1 au 25, associé à un quiz lorsqu’un contenu est disponible.
- **Quiz** : portrait d’un membre et trois affirmations, dont une seule est vraie.
- **Jour prévu** : date de la case, de minuit à minuit, heure de Paris.
- **Réponse en retard** : réponse à une case passée, confirmée avant le 26 décembre à 00 h 00, heure de Paris.
- **Classement final** : classement arrêté à la fin du 25 décembre et consultable jusqu’au 15 janvier 2027 inclus.

## Fonctionnalités et exigences

### Découverte et accès

**FR-1.** En production, l’animation est invisible avant le 1er décembre pour les membres ; aucun mode test n’y est disponible. Du 1er décembre au 15 janvier 2027 inclus, une icône Père Noël, située près de Mon compte, permet d’accéder à l’animation. Sa micro-animation est discrète et festive ; ses détails sont à définir en UX. L’accès disparaît à partir du 16 janvier 2027.

**FR-2.** Du 1er au 25 décembre, lorsqu’un quiz du jour est disponible et que le membre n’y a pas répondu, il s’ouvre automatiquement lors de sa première ouverture pertinente de HatCast. Le membre peut le fermer ; une fois fermé, il ne s’ouvre plus automatiquement ce jour-là sur aucun appareil du membre et reste accessible par l’icône. Une réponse déjà enregistrée sur un autre appareil empêche aussi l’ouverture automatique. Une visite sans quiz disponible ne consomme pas cette ouverture : si le quiz paraît plus tard, il peut s’ouvrir lors d’une visite ultérieure, sauf si le calendrier a déjà été fermé ce jour-là.

**FR-3.** À 9 h, heure de Paris, du 1er au 25 décembre, une invitation utilisant les notifications habituelles de HatCast est prévue pour les membres qui n’ont pas répondu au quiz du jour. Elle ouvre le quiz. Aucune notification n’est envoyée si le quiz n’est pas disponible à 9 h ; il n’y a pas de rattrapage si le quiz est publié plus tard. Les notifications restent soumises à leur activation habituelle par le membre.

### Jouer et découvrir

**FR-4.** Le quiz du jour disponible et non répondu est le premier écran de l’animation, avant l’accès au classement et aux autres cases. Le membre sélectionne une affirmation puis confirme ; une réponse enregistrée est définitive. Chaque personne présentée peut jouer à son propre quiz.

**FR-5.** Une bonne réponse rapporte 3 points si elle est confirmée le jour prévu, ou 1 point si elle est confirmée en retard ; une mauvaise réponse rapporte 0 point. Une seule réponse est enregistrée par case. Un bonus de régularité de 1 point est attribué pour une réponse à la case du jour si la case de la veille a aussi été répondue le jour prévu, quelle que soit la justesse des réponses. Aucun bonus le 1er décembre ; les réponses en retard ne donnent pas de bonus et ne comptent pas pour la série. Une journée sans quiz interrompt la série pour tous les membres. Le maximum théorique est de 99 points (75 pour les réponses et 24 de bonus). Une réponse ouverte avant minuit mais confirmée après minuit est traitée comme une réponse en retard, dans la limite de la période de jeu.

**FR-6.** Après une réponse, le membre voit s’il a trouvé, les points gagnés et l’information sur le bonus de régularité pour encourager à revenir le lendemain. En cas d’erreur, la bonne affirmation est révélée, avec un rendez-vous le lendemain. Un bouton permet de voir le classement. Le 25 décembre, le message souhaite joyeux Noël et propose « Voir le classement » ; celui-ci est présenté comme final à partir du 26. Après une case rattrapée, le membre revient au calendrier ; le classement reste accessible dans l’autre onglet.

**FR-7.** Si une réponse n’a pas été enregistrée, le membre peut réessayer tant que la case reste jouable. Si elle a été enregistrée mais qu’une interruption a empêché la consultation du résultat, celui-ci apparaît en premier si le membre revient le même jour. À partir du lendemain, le parcours normal est prioritaire et le résultat reste consultable dans le calendrier.

### Classement et calendrier

**FR-8.** Le classement présente sous leur nom tous les membres classables dès le départ, y compris ceux qui n’ont pas encore joué : leur score initial est de 0 point. Il met en évidence la position du membre connecté. Les scores égaux partagent le même rang ; le rang suivant tient compte du nombre de personnes placées devant (par exemple 1, 1, 3). Patrice et Toinou ne figurent pas dans ce classement ; chacun voit son score personnel séparément, sans rang. Un tirage au sort entre les premiers ex æquo est envisagé pour le cadeau ; son organisation par La Malice est extérieure au jeu.

**FR-9.** Après réponse au quiz du jour, l’accès à l’animation ouvre le classement. Du 26 décembre au 15 janvier 2027 inclus, tous les membres peuvent consulter le classement final et le calendrier via les deux onglets, même sans avoir joué ; il n’y a plus d’ouverture automatique ni de réponse possible.

**FR-10.** Les 25 cases sont visibles et distinguent les cases jouées, les cases passées non jouées, la case du jour et les cases futures bloquées. Une case passée sans contenu s’ouvre sur l’écran de quiz avec le message « Il n’y a rien ici. Reviens plus tard ! ». Les cases passées disponibles et non jouées peuvent être jouées jusqu’à la fin du 25 décembre. Une case jouée montre le choix du membre, la bonne réponse et les points obtenus. Le calendrier et le classement sont accessibles par deux onglets. Du 26 décembre au 15 janvier 2027 inclus, une case non jouée peut être ouverte pour consulter le portrait et la bonne réponse si son contenu existe, sans répondre ni gagner de points ; une case sans contenu affiche le message d’absence.

### Contenus manquants et préparation

**FR-11.** L’animation peut commencer sans les 25 quiz. Patrice peut ajouter les contenus par une nouvelle release ; un quiz publié pendant son jour prévu devient jouable dès sa disponibilité et jusqu’à minuit, puis reste rattrapable jusqu’à la fin du 25 décembre. Un quiz publié après son jour prévu devient immédiatement jouable en retard jusqu’à cette même échéance. Patrice vérifie les questions avant publication ; la bonne réponse ne change pas une fois qu’un membre y a répondu.

**FR-12.** Un jour sans quiz disponible, il n’y a ni notification ni ouverture automatique. L’icône mène au message « Il n’y a rien ici. Reviens plus tard ! » et à un accès au classement pour tous, même sans participation. Le 25 décembre, le message souhaite joyeux Noël et propose « Voir le classement ».

**FR-13.** Avant décembre, Patrice et Toinou peuvent tester et présenter le calendrier sur un serveur de développement isolé de la production. Le mode test permet à tous les membres actifs de la troupe configurée d’ouvrir librement les cases disponibles avant leur jour prévu ; une bonne réponse à une case future rapporte 3 points. Les réponses y sont définitives ; une remise à zéro ciblée des données du calendrier permet de recommencer. La troupe à laquelle le calendrier est rattaché peut être choisie par environnement. Aucun mode test n’est disponible en production.

## Contraintes et qualité

- Respecter l’accès réservé aux membres de La Malice et préserver la surprise et les contenus futurs. Les portraits et anecdotes sont recueillis avec l’accord des personnes présentées.
- Garantir qu’une réponse enregistrée ne soit pas comptée plusieurs fois et que les points et le classement correspondent aux réponses enregistrées, y compris en cas d’interruption ou d’usage sur plusieurs appareils.
- Assurer une expérience accessible et cohérente avec les usages et le design HatCast ; les détails d’interaction, de mise en page et d’animation seront étudiés en UX.
- Les contenus sont intégrés par Patrice ; aucun back-office de saisie n’est demandé. Les modifications passent par une release.

## Périmètre exclu

- Gestion générique d’animations pour d’autres troupes ou d’autres occasions.
- Interface d’administration des contenus et tirage au sort automatisé.
- Bonus de rapidité, réponses multiples et accès aux quiz futurs pour les joueurs.

## Réussite

Le succès recherché est le plaisir des membres, la découverte mutuelle et les échanges favorisant la cohésion. Patrice et Toinou recueilleront des retours informels. Le nombre de participants sera suivi via PostHog, sans cible chiffrée fixée. La recherche de participation ne doit pas prendre le pas sur le plaisir ou la surprise.

## Points ouverts pour la suite

1. Préciser en architecture les modalités de test, d’accès et de notification programmée.
2. Définir les modalités de comptage PostHog et le devenir des données après la fin de l’animation.
