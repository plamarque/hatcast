---
title: "Calendrier de l’Avent La Malice"
status: final
created: 2026-10-28
updated: 2026-10-29
---

# PRD — Calendrier de l’Avent La Malice

## Vision et contexte

Proposée par Toinou, membre de la commission Vie Associative, cette animation surprise de Noël 2026 permet aux membres de La Malice de découvrir des anecdotes les uns sur les autres. Intégrée à HatCast, elle associe 24 quiz quotidiens, une révélation le lendemain et un classement amical pour susciter plaisir, échanges et cohésion. Le ton recherché est drôle, décalé et festif. L’animation est ponctuelle et doit être prête et vérifiée avant le 1er décembre, avec une marge de test.

## Public et parcours

Tous les membres de La Malice peuvent jouer, y compris les personnes présentées. Patrice et Toinou jouent aussi, mais leurs comptes sont exclus du classement : ils connaissent les réponses. Une personne qui ne souhaite pas être présentée est remplacée et reste libre de participer.

**UJ-1 — Camille joue.** Du 1er au 24 décembre, Camille ouvre HatCast ou suit une notification. Elle découvre le portrait d’un membre et trois anecdotes, dont deux vraies et une fausse. Elle sélectionne celle qu’elle croit fausse et confirme. Un accusé de réception lui propose de revenir demain et de voir le classement, sans révéler si elle a trouvé ni les points gagnés.

**UJ-2 — Camille revient.** Dès minuit le lendemain, heure de Paris, Camille découvre le plus récent résultat révélable qu’elle n’a pas encore vu : son choix, la fausse anecdote, les points gagnés et, s’il existe, un complément d’anecdote. Elle peut ensuite accéder au quiz du jour. Le 25 décembre, elle découvre le résultat du 24, puis un message de Noël et son bilan personnel.

**UJ-3 — Camille consulte le calendrier.** Elle peut revoir ses réponses et résultats révélés, ou découvrir une case passée qu’elle n’a pas jouée, sans pouvoir y répondre ni gagner de points. Les cases futures restent fermées.

**UJ-4 — Patrice et Toinou préparent la surprise.** Toinou recueille les anecdotes et les transmet à Patrice, qui dispose déjà des portraits et intègre les contenus. Avant décembre, ils parcourent et testent le calendrier dans un environnement de développement isolé, sans affecter le jeu réel.

## Définitions

- **Quiz** : portrait d’un membre et trois anecdotes, dont deux vraies et une fausse à identifier.
- **Jour de jeu** : date du quiz, de 00 h 00 inclus à 00 h 00 le lendemain exclu, en heure civile de Paris. La réception de la confirmation par l’API fait foi, sous réserve de son enregistrement effectif.
- **Révélation** : mise à disposition de la justesse, de la fausse anecdote et des points à partir de 00 h 00 le lendemain du jour de jeu, heure de Paris.
- **Série de bonnes réponses** : succession de réponses correctes enregistrées ; une réponse incorrecte la rompt, une journée sans réponse ne la rompt pas. Un bonus est attribué à chaque groupe de trois bonnes réponses consécutives, sans chevauchement.
- **Classement final** : classement établi après la révélation des résultats du 24 décembre, dès le 25 à 00 h 00, consultable jusqu’au 15 janvier 2027 inclus.

## Fonctionnalités et exigences

### Découverte et accès

**FR-1.** En production, l’animation est invisible avant le 1er décembre pour les membres ; aucun mode test n’y est disponible. Du 1er décembre au 15 janvier 2027 inclus, une icône Père Noël près de Mon compte permet d’accéder à l’animation. Sa micro-animation est discrète et festive ; ses détails sont à définir en UX. L’accès disparaît à partir du 16 janvier.

**FR-2.** Du 1er au 24 décembre, lorsqu’un quiz du jour est disponible et que le membre n’y a pas répondu, il s’ouvre automatiquement lors de sa première ouverture pertinente de HatCast, après l’éventuelle révélation prioritaire prévue par FR-7. Le membre peut le fermer ; une fois fermé, il ne s’ouvre plus automatiquement ce jour-là sur aucun appareil du membre et reste accessible par l’icône. Une réponse enregistrée sur un autre appareil empêche aussi l’ouverture automatique. Une visite sans quiz disponible ne consomme pas cette ouverture : si le quiz paraît plus tard, il peut s’ouvrir lors d’une visite ultérieure, sauf si l’expérience a déjà été fermée ce jour-là.

**FR-3.** Du 1er au 24 décembre, HatCast tente d’envoyer à 10 h, heure de Paris, une invitation habituelle aux membres qui n’ont pas répondu au quiz du jour. Le traitement vérifie la disponibilité du quiz lorsqu’il s’exécute et respecte les préférences habituelles. Si le quiz manque ou si le traitement ne se déclenche pas, aucune invitation n’est envoyée ; un envoi tardif ou manqué est acceptable, sans reprise particulière. L’invitation mène au parcours du jour en respectant la priorité de révélation de FR-7.

### Jouer, attendre et découvrir

**FR-4.** Le membre sélectionne l’anecdote qu’il estime fausse parmi trois, puis confirme ; en production, une réponse enregistrée est définitive et unique par quiz. Le rejeu personnel prévu par FR-13 est réservé au mode test isolé. Chaque personne présentée peut jouer à son propre quiz. Le quiz est jouable uniquement pendant son jour de jeu ; aucun rattrapage n’est possible. À minuit, toute confirmation attendant encore le verrou est fermée, même si elle a été reçue avant minuit. La révélation attend la fin d’une transaction déjà en cours.

**FR-5.** Une bonne réponse rapporte 10 points, une mauvaise 0. Chaque jour répondu rapporte en outre 1 point de participation, dès le premier jour et quelle que soit la justesse ; un jour manqué ne rapporte aucun point. Un bonus de 2 points est attribué pour chaque groupe de trois bonnes réponses consécutives : une mauvaise réponse remet la série à zéro, une journée manquée la laisse intacte. Après un bonus, le décompte repart pour le groupe de trois suivant : les groupes ne se chevauchent pas. Les bonus sont donc attribués aux 3ᵉ, 6ᵉ, 9ᵉ bonnes réponses consécutives, et ainsi de suite. Les points deviennent visibles et comptent dans le classement à la révélation, pas avant. Le maximum théorique est de 280 points : 240 de bonnes réponses, 24 de participation et 16 de bonus.

**FR-6.** Après confirmation, afficher uniquement un accusé de réception, une invitation à revenir demain et une action pour voir le classement. Ne donner aucun indice sur la justesse ou les points du quiz en attente : notamment, le classement et les scores visibles ne doivent pas permettre de les déduire. À la révélation, afficher le choix du membre, la fausse anecdote, la justesse et les points gagnés, avec un complément d’anecdote facultatif s’il existe. Distinguer les points de réponse, de participation et le bonus lorsqu’il est acquis.

**FR-7.** Si une réponse n’a pas été enregistrée, le membre peut réessayer tant que le quiz reste jouable. Au retour, si un résultat révélable n’a pas été vu, le plus récent de ces résultats est présenté avant le quiz du jour, même si une réponse plus récente attend sa révélation ; proposer ensuite ce quiz lorsqu’il est disponible. Aucun accès au calendrier n’est proposé sur cet écran de révélation prioritaire. L’état de consultation est partagé entre appareils ; une interruption après enregistrement ne fait pas perdre le résultat. Les résultats révélables plus anciens non vus restent consultables dans leurs cases du calendrier, sans repère particulier ni enchaînement automatique.

### Classement, calendrier et 25 décembre

**FR-8.** Le classement présente sous leur nom tous les membres classables dès le départ, y compris ceux qui n’ont pas encore joué, à 0 point. Il met en évidence la position du membre connecté. Les ex æquo reçoivent tous le rang le plus bas de leur groupe : par exemple 1, 3, 3, 4 ; si tous les N membres sont à égalité, ils sont tous Nᵉ. Patrice et Toinou ne figurent pas dans ce classement ; chacun voit son score personnel séparément, sans rang. Le départage éventuel pour les lots reste à discuter et n’est pas automatisé dans ce périmètre.

**FR-9.** Après réponse au quiz du jour, l’accès à l’animation ouvre le classement, sous réserve de la priorité de FR-7. Le 25 décembre, après l’éventuelle révélation du 24, présenter un message de Noël et un bilan personnel ; son contenu spécial et une éventuelle animation restent à discuter. Le classement est final dès la révélation du 24. Jusqu’au 15 janvier 2027 inclus, tous les membres peuvent consulter le classement final et le calendrier, même sans avoir joué ; après le 24, aucune réponse n’est possible et aucun quiz ne s’ouvre automatiquement.

**FR-10.** Le calendrier représente les 24 quiz et le 25 décembre, dont la présentation reste à définir en UX. Il distingue les quiz joués, passés non joués, celui du jour et les futurs bloqués. Une case passée non jouée peut être consultée après sa date de révélation : portrait, anecdotes et fausse anecdote disponibles, sans réponse ni points. Une case jouée montre le choix, la fausse anecdote et les points obtenus uniquement après leur révélation. Une case sans contenu affiche « Il n’y a rien ici. Reviens plus tard ! ». Le calendrier et le classement restent accessibles depuis l’expérience, sauf sur l’écran prioritaire de révélation de FR-7.

### Contenus manquants et préparation

**FR-11.** L’animation peut commencer sans les 24 quiz. Patrice peut ajouter les contenus par une nouvelle release ; un quiz publié pendant son jour devient jouable dès sa disponibilité et jusqu’à minuit. Un contenu publié après son jour n’est pas jouable ; il peut être consulté comme contenu passé après révélation. Patrice vérifie les anecdotes avant publication ; la fausse anecdote ne change pas une fois qu’un membre a répondu.

**FR-12.** Un jour de jeu sans quiz disponible, il n’y a ni notification ni ouverture automatique. L’icône mène au message « Il n’y a rien ici. Reviens plus tard ! » et à un accès au classement pour tous, même sans participation, après l’éventuelle révélation prioritaire. Le 25 décembre suit FR-9 et ne comporte pas de quiz.

**FR-13.** Avant décembre, Patrice et Toinou peuvent tester et présenter le calendrier dans un environnement de développement isolé de la production. Le mode test permet aux membres actifs de la troupe configurée d’ouvrir librement les cases disponibles avant leur jour prévu ; il doit permettre de vérifier les nouvelles règles de jeu et de révélation, sans affecter la partie réelle. En mode test isolé uniquement, chaque testeur peut effacer sa propre réponse et rejouer la case, même passée, sans modifier les réponses des autres ni reculer l’horloge commune ; une remise à zéro ciblée des données du calendrier permet de recommencer toute la partie. En production, les réponses restent définitives. La troupe peut être choisie par environnement. Aucun mode test n’est disponible en production. Une horloge simulée commune côté serveur avance seulement ; répondre à une case future la fait avancer jusqu’au jour de cette case. Le barème normal s’applique et le résultat est révélé le lendemain simulé. Revenir en arrière exige de réinitialiser la partie de test et son horloge. Les limites réelles sont vérifiées séparément.

## Contraintes et qualité

- Réserver l’accès aux membres de La Malice, préserver la surprise, les contenus futurs et la justesse des réponses en attente. Les portraits et anecdotes sont recueillis avec l’accord des personnes présentées.
- Garantir qu’une réponse enregistrée ne soit pas comptée plusieurs fois et que les points et le classement correspondent aux réponses révélées, y compris en cas d’interruption, de concurrence ou d’usage sur plusieurs appareils.
- Assurer une expérience accessible et cohérente avec les usages et le design HatCast ; étudier les détails d’interaction, de mise en page et d’animation en UX.
- Patrice intègre les contenus par release ; aucun back-office de saisie n’est demandé.

## Périmètre exclu et pistes

Sont exclus : gestion générique pour d’autres troupes ou occasions, administration des contenus, départage automatisé des lots, rattrapage, questions inversées, chronomètre, bonus de rapidité, vidéo de réponse, lettres et puzzle, réponses multiples et accès aux quiz futurs pour les joueurs en production.

Des lutins aux visages des membres portant des cadeaux sont une piste graphique à explorer, non une exigence. Une vidéo de présentation au lancement est une idée de communication, distincte de la vidéo de réponse abandonnée ; elle n’est pas décidée. Les idées de plusieurs lots ou d’une question d’estimation pour départager les gagnants restent des propositions.

## Réussite

Le succès recherché est le plaisir des membres, la découverte mutuelle et les échanges favorisant la cohésion. Patrice et Toinou recueilleront des retours informels. Le nombre de participants sera suivi via PostHog, sans cible chiffrée fixée. La recherche de participation ne doit pas prendre le pas sur le plaisir ou la surprise.

## Points ouverts et passage de relais

- **Patrice et Toinou — avant décision sur les lots :** nombre de lots et éventuel départage ; la convention d’affichage des rangs est décidée séparément.
- **Patrice et Toinou avec UX — avant conception du 25 :** contenu spécial et éventuelle animation, ainsi que contenu du bilan personnel. Explorer les lutins sans les imposer.
- **UX — en story :** affiner le traitement graphique des cases manquées et du 25, ainsi que l’éventuelle animation du 25 ; conserver les parcours et exigences d’accessibilité validés.
- **Architecture — validée :** appliquer AD-1–AD-6, notamment confidentialité, temps, état partagé, simulation, invitations et conservation.
- **Spec — réconciliée :** appliquer les capacités CAP-1–CAP-7 et les compagnons adoptés.
- **Epic 25 et stories — validés :** les critères et dépendances révisés ont été validés avec Patrice le 29 octobre 2026.

La spec et l’epic 25 sont réconciliés avec le présent PRD, l’UX et l’architecture révisée ; les arbitrages sur les lots et la présentation graphique demeurent ouverts.
