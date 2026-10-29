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

Animation intégrée à HatCast, mobile-first et utilisable sur desktop. Angular Material 3 et les usages HatCast s’appliquent ; DESIGN.md décrit les intentions visuelles. Les règles de disponibilité, de score, de confidentialité et de notification du PRD restent applicables.

## Information Architecture

[Maquette des écrans clés](mockups/ecrans-cles.html) : porte, quiz, résultat, calendrier et classement. Les deux documents UX prévalent sur cette référence illustrative.

| Surface | Accès et rôle |
|---|---|
| Porte du jour | Première entrée pertinente lorsque le quiz du jour est disponible et non répondu ; également accessible par l’icône ou la notification selon les règles du PRD. |
| Porte d’une case passée | Depuis Calendrier ; même geste pour découvrir une case disponible, absente ou consultable après le jeu. |
| Quiz et résultat | Le quiz suit l’ouverture ; le résultat le remplace sur la même page. Une case jouée réutilise l’écran de résultat en consultation. |
| Classement | Onglet ouvert par « Voir le classement » ; score et rang personnels rappelés en haut, liste complète ensuite. |
| Calendrier | Onglet contenant les 25 cases ; accès aux rattrapages et récapitulatifs. |
| Mode test | Sur le serveur de développement isolé uniquement ; mêmes surfaces, indication « Mode test » bien visible et cases disponibles accessibles avant leur jour prévu. |

Le quiz du jour non répondu reste prioritaire sur les onglets. Camille peut fermer la découverte ou le quiz automatique et revenir à HatCast : il ne se rouvre plus automatiquement ce jour-là sur ses appareils et reste accessible par l’icône. Une visite sans quiz disponible ne consomme pas l’ouverture automatique ; les autres conditions de FR-2 restent applicables. Après réponse au quiz du jour, l’icône ouvre le classement. Si aucun quiz du jour n’est disponible, le message d’absence permet d’accéder au classement, même sans participation. Du 26 décembre au 15 janvier 2027 inclus, l’icône ouvre le classement final pour tous et les deux onglets restent accessibles ; il n’y a plus d’ouverture automatique.

## Voice and Tone

Français, tutoiement, ton festif et encourageant. Message de case sans contenu : « Il n’y a rien ici. Reviens plus tard ! » ; même texte pour le quiz du jour absent. Le 25 décembre, ajouter « Joyeux Noël ! » et « Voir le classement », tant au résultat qu’en l’absence de quiz. Après une mauvaise réponse, révéler la bonne affirmation avec un message encourageant et un rendez-vous le lendemain, conformément à FR-6. Les autres libellés restent à définir.

## Component Patterns

- **Porte** : toucher directement la grande case pour ouvrir et révéler son contenu. Une case passée sans contenu ressemble à une porte fermée et révèle le message après ouverture.
- **Choix** : toucher une affirmation la sélectionne ; le choix peut être changé jusqu’à « Confirmer ». Une seule réponse peut être enregistrée et elle est définitive.
- **Résultat** : indique succès ou erreur et points calculés au moment de la confirmation, sans message préalable si minuit est passé ; révèle la bonne affirmation en cas d’erreur. Une case déjà jouée affiche le choix, la bonne réponse et les points, dont le détail du bonus obtenu, sans rejouer l’animation, avec retour au calendrier. Le résultat met le total en grand ; l’animation présente successivement les points de réponse et le bonus éventuel avant le total. Le détail reste disponible sans mouvement. Si le bonus est obtenu : « Bravo, tu es au rendez-vous ! +1 point de régularité ». Si aucun bonus n’est obtenu sur la case du jour, inviter à revenir demain sans insister sur le point manqué ; le 25 décembre, « Joyeux Noël ! » remplace cette invitation. Pour un rattrapage, afficher seulement les points gagnés, sans mention du bonus. Le bonus n’est pas présenté avant la réponse ; il est découvert au résultat lorsqu’il est attribué. Les points peuvent apparaître successivement même après une erreur ; seule une bonne réponse déclenche des confettis qui jaillissent puis retombent. Les mouvements sont supprimés si la préférence de réduction est activée.
- **Onglets** : Calendrier et Classement sont séparés ; « Voir le classement » ouvre le classement. Le calendrier permet ensuite de rattraper ou revoir une case.
- **Classement** : rappel « Ta position », suivi du rang et du score personnels en haut, et ligne à sa place dans la liste. Tous les membres classables figurent dans la liste dès le départ avec 0 point et un rang, même sans réponse ; les égalités à 0 point suivent la même règle. Patrice et Toinou voient leur score séparément sans rang ; ils ne figurent pas dans la liste. Le classement affiche uniquement les totaux, bonus compris, sans détail. Les ex æquo partagent le rang : 1, 1, 3.
- **Test** : les réponses sont définitives ; une remise à zéro ciblée des données du calendrier de développement permet de recommencer. Les données restent isolées du jeu réel.

## State Patterns

| État | Traitement |
|---|---|
| Case jouée | Porte visiblement ouverte ; accès au récapitulatif. |
| Case passée non jouée | Porte fermée distincte d’une porte ouverte, sans texte ni points sur la case. |
| Case du jour | Porte fermée numérotée, sans cadenas ; une couleur différente peut attirer discrètement l’attention. Son état est explicité dans son libellé accessible, sans dépendre de la couleur. |
| Case future | Porte fermée avec numéro et cadenas ; contenu inaccessible. |
| Case passée sans contenu | Porte fermée ; message d’absence après ouverture. |
| Réponse enregistrée, résultat non vu, retour le même jour | Résultat affiché en premier avant classement. |
| Résultat non vu, retour un autre jour | Parcours normal du jour : nouveau quiz s’il est disponible, sinon message d’absence ; du 26 décembre au 15 janvier 2027 inclus, classement final. Ancien résultat consultable depuis sa case, sans interposition avant classement. |
| 26 décembre–15 janvier 2027 inclus | Classement final consultable ; cases non jouées avec contenu ouvrables pour découvrir portrait et bonne affirmation, sans réponse ni points. L’animation d’ouverture demeure. Pour une case sans contenu, afficher après ouverture « Il n’y a rien ici. Reviens plus tard ! ». |
| Confirmation après clôture | Réponse non enregistrée ; message indiquant que le jeu est terminé, avec accès au classement et au calendrier. |
| Erreur d’enregistrement | Réessai possible tant que la case reste jouable ; ne pas présenter un résultat comme enregistré s’il ne l’est pas. |

La règle de retour du résultat non vu est précisée dans FR-7 du PRD.

## Interaction Primitives

Toucher la porte ou une affirmation ; confirmer explicitement la réponse. Ouverture et célébration restent courtes ; l’icône Père Noël bouge une fois à l’ouverture de HatCast, moins de cinq secondes. Aucun mouvement n’est nécessaire pour accéder au contenu.

## Accessibility Floor

Cibles tactiles de 48 × 48 px privilégiées ; 40 × 40 px minimum avec dérogation documentée. Contrôles au clavier, libellés et états accessibles et focus visible. Lors de l’ouverture automatique, placer le focus dans la surface ouverte ; annoncer les changements porte → contenu, quiz → résultat et les erreurs, puis restaurer le focus vers le contrôle d’origine au retour lorsque pertinent, sans piège clavier. Chaque case expose son numéro et son état accessible, y compris le verrouillage, sans révéler le contenu futur ; l’ordre de navigation suit les numéros de gauche à droite. Donner aux portraits une alternative textuelle pertinente. Choix unique exposé comme tel ; états du calendrier compréhensibles sans couleur seule. En cas de réduction des mouvements, supprimer les animations de porte, de célébration et de l’icône tout en donnant immédiatement accès au même contenu. Respecter les contrastes HatCast et permettre l’agrandissement du texte sans perte de contenu ou d’action. La contrainte sans défilement est un objectif aux tailles usuelles, pas au prix de l’accessibilité.

## Responsive & Platform

Tester téléphone d’abord, puis tablette et desktop. La grille à quatre cases par ligne accepte le défilement ; le quiz complet sans défilement est un objectif à vérifier face aux dimensions réelles, longueurs des affirmations, zoom et tailles de texte. Si ces objectifs ne tiennent pas, autoriser le défilement ou une réorganisation accessible sans tronquer les textes ni réduire indûment les cibles. Les résolutions PostHog sont une source potentielle de dimensions de référence, sans analyse réalisée à ce stade.

## Key Flows

### UJ-1 — Camille joue le quiz du jour

1. Camille ouvre HatCast ou suit l’invitation, selon les conditions du PRD.
2. Elle voit une grande porte isolée et la touche.
3. **Découverte :** la porte s’ouvre et révèle portrait et affirmations.
4. Elle choisit, peut changer d’avis, puis confirme.
5. Le résultat remplace le quiz ; Camille voit ses points et accède au classement.

### UJ-2 — Camille rattrape ou consulte une case

1. Depuis Classement, Camille ouvre Calendrier et choisit une case passée.
2. Si elle n’est pas jouée, elle ouvre la grande porte et découvre le quiz ou le message d’absence.
3. Elle répond si le jeu est encore ouvert, puis voit son résultat et revient directement à l’onglet Calendrier ; l’onglet Classement reste accessible.
4. Si elle l’a déjà jouée, elle consulte son résultat. Du 26 décembre au 15 janvier 2027 inclus, elle découvre le contenu disponible d’une case non jouée sans répondre ni gagner de points ; si aucun contenu n’est disponible, elle voit le message d’absence.

### UJ-3 — Patrice et Toinou testent

1. Avant décembre, ils accèdent au mode test clairement identifié sur le serveur de développement.
2. Ils ouvrent librement une case disponible et confirment une réponse définitive.
3. **Vérification :** ils consultent le résultat et le classement ; une remise à zéro ciblée permet de recommencer sans toucher aux données réelles.

## Vérifications sur appareils et lors de l’implémentation

- Tester téléphone d’abord, notamment petites largeurs et hauteurs, puis tablette et desktop ; mesurer les cibles, viser 48 × 48 px et documenter toute dérogation à 40 px selon les règles HatCast.
- Vérifier portrait, affirmations de longueur réelle et confirmation ensemble sans défilement aux tailles usuelles ; autoriser défilement ou adaptation avec agrandissement, zoom ou contenu long sans troncature.
- Vérifier ordre de lecture et navigation clavier, focus et annonces des transitions, libellés et états des cases, portraits, contrastes et lisibilité sans couleur seule.
- Vérifier ouverture, confettis et mouvements, y compris préférence de réduction des animations ; traduire la palette illustrative en thème et tokens HatCast.
- Les résolutions PostHog pourront aider à choisir des appareils de référence ; aucune analyse n’a été réalisée dans ce cadrage.

## À traiter en architecture et exploitation

- Conditions d’accès à la troupe configurée et protection des contenus futurs ; accès au mode test en développement, isolation des données et remise à zéro ciblée.
- Persistance multi-appareil de la fermeture et des réponses, résultats non vus, idempotence, classement et arrêt du classement final.
- Notifications habituelles à 9 h, fuseau de Paris, publication tardive et gestion de la clôture.
- Modalités de comptage PostHog et devenir des données après l’animation ; ces sujets restent à décider, sans collecte ni analyse effectuées ici.
