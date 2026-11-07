---
name: Calendrier de l’Avent La Malice
status: final
description: Une surprise festive intégrée à HatCast, simple et rapide au quotidien.
updated: 2026-10-31
status_note: Direction artistique approuvée ; évolution du calendrier en cours d’arbitrage
sources:
  - ../../prds/prd-hatcast-2026-10-28/prd.md
  - ../../../../docs/v2/technical/FRONTEND_UI.md
---

## Brand & Style

Direction artistique Advent Quiz approuvée sans réserve par Patrice le 30 octobre 2026 : univers chaleureux et joyeux, crème, rouge de Noël, vert sapin et or, neige, houx, étoiles, cadeaux et lutins expressifs. Les [dix références](imports/advent-quiz-design-system-reference.png), la [confirmation](imports/confirmation-reference.png) et le [handoff](imports/BMAD-HANDOFF.md) définissent l'intention graphique. Ce sont des références artistiques, pas des écrans statiques ni des décisions métier. Le présent document et EXPERIENCE.md prévalent pour les parcours et les états.

L'Avent possède une identité indépendante de HatCast. Angular Material 3 reste une base de comportements et d'accessibilité ; son adaptation visuelle est limitée à l'Avent et ne modifie pas le design system de l'application.

## Colors

Palette de départ indicative, à ajuster selon la lisibilité visuelle : crème `#FFF6E4`, rouge `#B52235`, vert sapin `#075441`, or `#DEA537`. Le kit indique que ces valeurs sont des approximations ; la planche contient d'autres valeurs indicatives. Définir des rôles sémantiques propres à l'Avent pour les surfaces, textes, actions, contours, focus et états, avec couples de couleurs vérifiés. Aucun texte de réponse pâle. La couleur seule ne distingue jamais un état. Patrice privilégie des textes bien lisibles et de grandes cibles tactiles : contrôler visuellement la lisibilité des textes et des états ; aucun seuil numérique de contraste ne constitue une condition de validation pour le quiz Avent.

Rôles minimaux du système, à définir sous la racine Avent et à partager entre composants : `surface`, `surface-card`, `text`, `text-muted`, `primary`, `on-primary`, `accent`, `border`, `focus`, `selected`, `disabled` et `error`. Les couples proposés vert/crème et rouge/blanc atteignent respectivement 8,31:1 et 6,47:1 avec les valeurs indicatives ; or/crème atteint seulement 2,05:1 et reste décoratif, jamais un texte ou indicateur essentiel seul. Vérifier visuellement les couleurs effectivement rendues et tous les états avant livraison.

## Typography

Titres expressifs arrondis dans l'esprit de Fredoka ; texte courant sans sérif lisible dans l'esprit de Nunito. Les choix exacts, licences, chargement et replis sont à vérifier. Appliquer les familles uniquement dans la racine Avent. Cibles fluides en pixels CSS : titre héros 36–44, titre d'écran 28–32, question 24–28, choix 18–20, texte secondaire 18–22, utilitaires 14–16. Adapter aux petites largeurs et au zoom sans couper les textes.

## Layout & Spacing

Mobile d'abord, avec adaptation tablette et desktop. Marges horizontales mobiles visées de 20–24 px, ajustables à 320 px et au zoom. Cibles tactiles au moins 44 × 44 px, 48 px de hauteur préférés ; action principale visée à 56–64 px. La lecture et l'accès aux commandes priment sur l'absence de défilement. Le calendrier conserve quatre colonnes ordonnées ; permettre le défilement sans perte de lisibilité ou de taille des cibles.

## Elevation & Depth

Panneaux chaleureux, contours dorés, neige et ombres douces inspirés des références ; les décors restent secondaires devant le texte et les commandes. Les effets ne portent aucune information indispensable.

## Shapes

La grille livrée évoque des portes. Pour son évolution, Patrice et Toinou retiennent des cadeaux ouverts ou fermés ; un cadeau s’ouvre dès qu’une réponse est enregistrée. Les cases futures restent verrouillées en parcours ordinaire. La grande porte comporte des étoiles et flocons flottants et une bordure animée ; une lumière douce apparaît à l’ouverture, avec alternative sans mouvement. Dans la grille livrée, la case du jour est fermée et numérotée, sans cadenas ; une couleur distincte peut attirer discrètement l’attention. Chaque case conserve un numéro visible.

## Components

[Maquette du parcours révisé](mockups/parcours-revise.html) : dispositions de référence approuvées globalement, graphisme à affiner en story. [Ancienne maquette](mockups/ecrans-cles.html) : archive supplantée par le kit du 30 octobre pour le graphisme ; ses parcours, scores et rangs sont obsolètes. Les décisions de DESIGN.md et EXPERIENCE.md prévalent sur la maquette.

- **Porte de découverte** : scène de découverte en pleine page avec cadeau ou porte ouvrable, lutin et décorations de flocons et d’étoiles ; ouverture courte révélant une lumière douce.
- **Choix du quiz** : cartes de choix arrondies lisibles, états non sélectionné, sélectionné, désactivé et erreur clairement différenciés, avec sémantique de choix unique.
- **Révélation différée** : reprend la surface du quiz après minuit, heure de Paris ; célébration à la bonne réponse : confettis qui jaillissent puis retombent et points de couleur vive animés brièvement, avec alternative sans mouvement. En cas d’erreur, message encourageant dans la même ambiance festive.
- **Confirmation et attente** : composition illustrée selon la référence de confirmation, message en texte réel et action de classement quand disponible ; aucun indice sur la réponse ou les points.
- **Calendrier et classement** : la grille de 25 cadeaux constitue un récapitulatif visuel personnel, inspiré des cadeaux portés par les lutins ; le classement conserve rang et score lisibles. Le [lutin générique](../../../../services/api/src/main/resources/advent/lutin-generique-net.png) fournit une référence existante : boîte rectangulaire, couvercle, ruban et grand nœud ; adapter et simplifier ces éléments pour la grille. Direction retenue : cadeau ouvert ou fermé pour exprimer l’ouverture, vert ou rouge pour le résultat personnel autorisé, neutre sans résultat, sombre pour les jours futurs ; le 25 est distinctif. Les états et leurs conditions de révélation sont précisés dans EXPERIENCE.md. Distinguer les résultats par un indice lisible et accessible en plus de la couleur.
- **Propositions à valider** : cadeau du 25 plus grand et centré, sombre et verrouillé avant sa date, puis coloré et accessible au bilan. L’or ne porte pas seul une information essentielle ; toute animation est décorative et supprimée en mouvement réduit. La [maquette des cadeaux](mockups/calendrier-cadeaux-proposition.png) est la cible visuelle approuvée ; elle ne spécifie pas les états : ses couleurs et son 25 visible en avance ne font pas autorité. Vérifier sur un prototype à taille réelle, notamment à 320 px et au zoom, que les silhouettes ouvert/fermé se distinguent et que numéro, indice, contraste, focus et cible tactile restent lisibles ; la grille actuelle ne prouve pas la lisibilité d’un cadeau ouvert.
- **25 décembre** : Pour le 25, Patrice retient un Père Noël à tête classique, dessiné dans le même style que les lutins, tendant une boîte décorative portant le logo de La Malice. Le personnage et sa boîte se placent au-dessus du message ; le podium final et les accès au classement et au calendrier suivent. Un village est un décor possible ; la réalisation graphique reste à préciser. La boîte ne propose pas d’ouverture pour l’instant.
- **Navigation** : dans la barre rouge, icônes accessibles Calendrier, Classement et Fermer ; les deux premières sont désactivées pendant la révélation prioritaire.
- **Icône cadeau** : près de Mon compte, reprendre le cadeau fermé du calendrier, sans fond circulaire. Un reflet doré le traverse puis deux étincelles apparaissent brièvement ; l’effet dure 2,5 secondes, une fois à l’ouverture de HatCast, et est supprimé en mouvement réduit.

### États et illustrations réutilisables

Chaque commande expose les états repos, survol si applicable, focus visible, sélection, désactivation, chargement et erreur selon son rôle ; les états conservent libellé, contraste et signal non chromatique. Les cartes et panneaux accueillent du contenu réel et redimensionnable. Les lutins, cadeaux, neige, houx et étoiles peuvent être des illustrations distinctes et décoratives ; les portraits individuels protégés restent fournis par l'API autorisée. Les images de référence ne sont jamais des fonds d'écran contenant les libellés. Les animations sont brèves, non indispensables et supprimées sous mouvement réduit.

## Do's and Don'ts

- Préserver la surprise sans cacher les états nécessaires à la compréhension.
- Isoler les tokens, styles, composants, animations et typographies Avent ; ne pas modifier le thème HatCast global.
- Rendre les textes, choix et actions en HTML accessible ; les illustrations ne remplacent pas les interfaces.
- Décliner les états chargement, erreur, indisponible, sélection, désactivation et focus dans le même univers sans inventer de fonctionnalité.
- Prévoir une expérience équivalente avec mouvement réduit.

Pour le 25, Patrice retient un Père Noël à tête classique, dessiné dans le même style que les lutins, tendant une boîte décorative portant le logo de La Malice. Le personnage et sa boîte se placent au-dessus du message ; le podium final et les accès au classement et au calendrier suivent. Un village est un décor possible ; la réalisation graphique reste à préciser. La boîte ne propose pas d’ouverture pour l’instant.

### Mode test activé volontairement

Pour les testeurs autorisés, une commande accessible placée à gauche de la barre rouge active ou désactive le mode test, initialement désactivé. La barre de commandes contextuelle apparaît sur une ligne sous la barre rouge et repousse le contenu ; elle reste présente dans le parcours tant que le mode est actif. Les actions sont adaptées à l’écran, avec des libellés accessibles et des cibles tactiles utilisables. Le style demeure isolé dans l’Avent.


### Reprise graphique — story 25.8

La scène de découverte présente chaque lutin dans un décor de Noël illustré, personnalisé et adapté à sa posture et à son cadeau, dans le style chaleureux de la planche de référence. L’illustration reste entière : le bouton « Découvrir le quiz » est placé sous elle et toute la carte reste cliquable, afin de ne masquer ni le cadeau ni le décor. Sur cet écran, les sapins enneigés fixes du fond sont supprimés pour ne pas se superposer au décor de la carte ; sur les autres écrans concernés, ils restent fixés au bas de la zone visible, derrière les contenus qui défilent. Les actions principales prennent la forme de boutons rouges arrondis, avec neige déposée sur les coins supérieurs, libellé Nunito centré et éventuelle flèche placée à droite sans décentrer le texte. Sur la scène du jour, « Découvrir le quiz » reprend ce traitement et tient sur une ligne aux largeurs mobiles usuelles. Les actions secondaires, dont « Revenir à HatCast », utilisent un fond crème, un contour et un libellé rouges et une forme arrondie. Pour « Revenir à HatCast », une flèche pointant vers la gauche précède le libellé. La confirmation associe un lutin générique joyeux et un panneau crème enneigé ; la révélation emploie des expressions génériques distinctes selon le résultat ; le portrait personnel fourni par l’API est placé en médaillon en haut à droite, pour une bonne comme pour une mauvaise réponse. Les illustrations sont décoratives et ne remplacent jamais les libellés ni les données. Les ressources génériques ne contiennent aucun portrait personnel.

Décision de Patrice : pour le quiz Avent, de grandes écritures lisibles et de grandes zones tactiles priment ; un test au lecteur d’écran et un seuil chiffré de contraste ne sont pas des critères de validation obligatoires. Les comportements accessibles existants restent préservés lorsqu’ils sont compatibles avec la direction artistique. Cette décision ne modifie pas les règles du reste de HatCast.

### Première découverte du calendrier

La première visite présente une scène hivernale avec lutin, cadeau, village et lumières, sans portes numérotées ; le texte incliné et l’action de découverte restent de vrais éléments accessibles.

### Accueil de découverte — ajustement validé

Le panneau crème présente le logo de La Malice centré, le titre « Le Quizz de l’Avent » et le sous-titre « Chaque jour, les lutins malicieux te confient leurs secrets ! ». Le lutin est placé juste au-dessus. Sous le panneau, le bouton principal enneigé « Commencer à jouer » ouvre le calendrier ; le bouton secondaire crème bordé de vert « Revenir à HatCast » ferme l’expérience comme la croix.

### Retour à une réponse en attente

La consultation ultérieure de la case du jour déjà jouée présente un lutin endormi dans la neige, au bonnet vert et à la clochette, dans une nuit éclairée. « Reviens demain ! », l’explication et le décompte jusqu’au résultat restent des textes adaptables ; la confirmation immédiatement après réponse conserve sa composition.


### Prévisualisation privée de production

La route directe réservée aux deux testeurs autorisés, exclus de la liste des joueurs du classement, ouvre le calendrier et ses cases futures ; leur résultat personnel et son explication sont immédiatement consultables et récupérables. Après confirmation, chaque testeur peut effacer uniquement sa propre réponse et rejouer la case. Pour les joueurs du classement, une réponse enregistrée est définitive. Identifier clairement la prévisualisation sans afficher de contrôles de simulation ou de remise à zéro commune. Préserver clavier, focus, mouvement réduit, lisibilité mobile et isolation visuelle Advent. Dans la navigation ordinaire, aucune erreur ne révèle l’Avent avant son ouverture.

En mode test isolé activé, le menu à trois points du mode test permet de générer une projection fictive ; une action permet de revenir au classement calculé ; une indication textuelle permanente signale les scores fictifs. Les commandes restent adaptées au mobile et au zoom.

### Résultats — composition validée

La bonne réponse associe un lutin joyeux sur fond vert et un bandeau crème courbe ; la mauvaise réponse présente un lutin déçu sur fond rouge et un titre encourageant. Les points et anecdotes sont intégrés au fond clair, sans empiler de panneaux dorés. Le portrait personnel reste en médaillon ; les informations, les commandes et les règles de révélation restent inchangées. Sur les écrans étroits avec texte agrandi, la composition se réorganise pour préserver lisibilité et accès aux commandes.


### Accès anticipé en test de développement isolé

En développement isolé, le testeur autorisé par le serveur peut, sans activer le mode test, ouvrir et répondre à un quiz futur disponible ; son résultat personnel détaillé reste indisponible jusqu’à minuit Europe/Paris suivant le jour du cadeau, y compris en mode test. Le classement du mode test explicitement activé peut toutefois afficher des points avant révélation et donner un indice ; une date simulée peut atteindre cette échéance. La sélection ne change pas la date simulée ni l’horloge partagée ; les réponses et le rejeu restent personnels. Les cadeaux futurs conservent leur apparence habituelle ; le 25 ouvre un aperçu provisoire du podium, et les contenus manquants conservent leur comportement existant. Les règles de production, de classement et de révélation du jour restent inchangées.

### Bilan de Noël — podium

La scène conserve le Père Noël et le cadeau La Malice. Le podium affiche jusqu’à trois membres classables ayant un score positif, leurs noms, rangs et scores ; une phrase courte indique le seul critère décisif d’une égalité affectant le podium. Un remerciement de participation apparaît seulement si le score personnel est positif ; à zéro, il ne paraît pas. Sans joueur classé positif, aucun podium ne paraît. Les actions Material donnent accès au classement final, au calendrier et au retour à HatCast ; les aperçus anticipés sont signalés comme provisoires. L’identité Avent reste isolée.

### Récits complets

Sélectionner une proposition ouvre automatiquement son récit lorsqu’il existe ; la commande de lecture reste utilisable indépendamment de la sélection.

Dans le quiz jouable, présenter chaque récit disponible sous son choix, avec une commande indépendante de la sélection. Après la carte de résultat et son explication éventuelle, présenter aussi les récits disponibles dans des panneaux repliés, chacun identifié par son choix. Préserver les paragraphes, le défilement et la lisibilité à petite largeur et avec texte agrandi ; conserver les contrôles accessibles dans le thème isolé Avent. Sans récit, ne pas afficher la section.
