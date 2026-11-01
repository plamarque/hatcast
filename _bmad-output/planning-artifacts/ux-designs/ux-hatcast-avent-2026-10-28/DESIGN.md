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

Palette de départ indicative, à ajuster après mesure des contrastes : crème `#FFF6E4`, rouge `#B52235`, vert sapin `#075441`, or `#DEA537`. Le kit indique que ces valeurs sont des approximations ; la planche contient d'autres valeurs indicatives. Définir des rôles sémantiques propres à l'Avent pour les surfaces, textes, actions, contours, focus et états, avec couples de couleurs vérifiés. Aucun texte de réponse pâle. La couleur seule ne distingue jamais un état. Contraste minimal 4,5:1 pour le texte courant et 3:1 pour le grand texte admissible ; vérifier également à 3:1 les indicateurs graphiques et de focus applicables sur les couleurs effectivement rendues.

Rôles minimaux du système, à définir sous la racine Avent et à partager entre composants : `surface`, `surface-card`, `text`, `text-muted`, `primary`, `on-primary`, `accent`, `border`, `focus`, `selected`, `disabled` et `error`. Les couples proposés vert/crème et rouge/blanc atteignent respectivement 8,31:1 et 6,47:1 avec les valeurs indicatives ; or/crème atteint seulement 2,05:1 et reste décoratif, jamais un texte ou indicateur essentiel seul. Vérifier les valeurs effectivement rendues et tous les états avant livraison.

## Typography

Titres expressifs arrondis dans l'esprit de Fredoka ; texte courant sans sérif lisible dans l'esprit de Nunito. Les choix exacts, licences, chargement et replis sont à vérifier. Appliquer les familles uniquement dans la racine Avent. Cibles fluides en pixels CSS : titre héros 36–44, titre d'écran 28–32, question 24–28, choix 18–20, texte secondaire 18–22, utilitaires 14–16. Adapter aux petites largeurs et au zoom sans couper les textes.

## Layout & Spacing

Mobile d'abord, avec adaptation tablette et desktop. Marges horizontales mobiles visées de 20–24 px, ajustables à 320 px et au zoom. Cibles tactiles au moins 44 × 44 px, 48 px de hauteur préférés ; action principale visée à 56–64 px. La lecture et l'accès aux commandes priment sur l'absence de défilement. Le calendrier conserve quatre colonnes ordonnées ; permettre le défilement sans perte de lisibilité ou de taille des cibles.

## Elevation & Depth

Panneaux chaleureux, contours dorés, neige et ombres douces inspirés des références ; les décors restent secondaires devant le texte et les commandes. Les effets ne portent aucune information indispensable.

## Shapes

La grille livrée évoque des portes. Pour son évolution, Patrice et Toinou retiennent des cadeaux ouverts ou fermés ; un cadeau s’ouvre dès qu’une réponse est enregistrée. Les futures restent verrouillées. La grande porte comporte des étoiles et flocons flottants et une bordure animée ; une lumière douce apparaît à l’ouverture, avec alternative sans mouvement. Dans la grille livrée, la case du jour est fermée et numérotée, sans cadenas ; une couleur distincte peut attirer discrètement l’attention. Chaque case conserve un numéro visible.

## Components

[Maquette du parcours révisé](mockups/parcours-revise.html) : dispositions de référence approuvées globalement, graphisme à affiner en story. [Ancienne maquette](mockups/ecrans-cles.html) : archive supplantée par le kit du 30 octobre pour le graphisme ; ses parcours, scores et rangs sont obsolètes. Les décisions de DESIGN.md et EXPERIENCE.md prévalent sur la maquette.

- **Porte de découverte** : scène de découverte en pleine page avec cadeau ou porte ouvrable, lutin et décorations de flocons et d’étoiles ; ouverture courte révélant une lumière douce.
- **Choix du quiz** : cartes de choix arrondies lisibles, états non sélectionné, sélectionné, désactivé et erreur clairement différenciés, avec sémantique de choix unique.
- **Révélation différée** : reprend la surface du quiz après minuit, heure de Paris ; célébration à la bonne réponse : confettis qui jaillissent puis retombent et points de couleur vive animés brièvement, avec alternative sans mouvement. En cas d’erreur, message encourageant dans la même ambiance festive.
- **Confirmation et attente** : composition illustrée selon la référence de confirmation, message en texte réel et action de classement quand disponible ; aucun indice sur la réponse ou les points.
- **Calendrier et classement** : la grille de 25 cadeaux constitue un récapitulatif visuel personnel, inspiré des cadeaux portés par les lutins ; le classement conserve rang et score lisibles. Le [lutin générique](../../../../services/api/src/main/resources/advent/lutin-generique-net.png) fournit une référence existante : boîte rectangulaire, couvercle, ruban et grand nœud ; adapter et simplifier ces éléments pour la grille. Direction retenue : cadeau ouvert ou fermé pour exprimer l’ouverture, vert ou rouge pour le résultat personnel autorisé, neutre sans résultat, sombre pour les jours futurs ; le 25 est distinctif. Les états et leurs conditions de révélation sont précisés dans EXPERIENCE.md. Distinguer les résultats par un indice lisible et accessible en plus de la couleur.
- **Propositions à valider** : cadeau du 25 plus grand et centré, sombre et verrouillé avant sa date, puis coloré et accessible au bilan. L’or ne porte pas seul une information essentielle ; toute animation est décorative et supprimée en mouvement réduit. La [maquette des cadeaux](mockups/calendrier-cadeaux-proposition.png) est la cible visuelle approuvée ; elle ne spécifie pas les états : ses couleurs et son 25 visible en avance ne font pas autorité. Vérifier sur un prototype à taille réelle, notamment à 320 px et au zoom, que les silhouettes ouvert/fermé se distinguent et que numéro, indice, contraste, focus et cible tactile restent lisibles ; la grille actuelle ne prouve pas la lisibilité d’un cadeau ouvert.
- **25 décembre** : Pour le 25, Patrice retient un Père Noël à tête classique, dessiné dans le même style que les lutins, tendant une boîte décorative portant le logo de La Malice. Le personnage et sa boîte se placent au-dessus du message ; le score bien visible et les accès au classement et au calendrier suivent. Un village est un décor possible ; la réalisation graphique reste à préciser. La boîte ne propose pas d’ouverture pour l’instant.
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

Pour le 25, Patrice retient un Père Noël à tête classique, dessiné dans le même style que les lutins, tendant une boîte décorative portant le logo de La Malice. Le personnage et sa boîte se placent au-dessus du message ; le score bien visible et les accès au classement et au calendrier suivent. Un village est un décor possible ; la réalisation graphique reste à préciser. La boîte ne propose pas d’ouverture pour l’instant.

### Mode test activé volontairement

Pour les testeurs autorisés, une commande accessible placée à gauche de la barre rouge active ou désactive le mode test, initialement désactivé. La barre de commandes contextuelle apparaît sur une ligne sous la barre rouge et repousse le contenu ; elle reste présente dans le parcours tant que le mode est actif. Les actions sont adaptées à l’écran, avec des libellés accessibles et des cibles tactiles utilisables. Le style demeure isolé dans l’Avent.
