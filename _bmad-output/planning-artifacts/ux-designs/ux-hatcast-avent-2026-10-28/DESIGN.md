---
name: Calendrier de l’Avent La Malice
status: final
description: Une surprise festive intégrée à HatCast, simple et rapide au quotidien.
updated: 2026-10-30
status_note: Direction artistique approuvée ; traduction technique et vérification de contraste à réaliser
sources:
  - ../../prds/prd-hatcast-2026-10-28/prd.md
  - ../../../../docs/v2/technical/FRONTEND_UI.md
---

## Brand & Style

Direction artistique Advent Quiz approuvée sans réserve par Patrice le 30 octobre 2026 : univers chaleureux et joyeux, crème, rouge de Noël, vert sapin et or, neige, houx, étoiles, cadeaux et lutins expressifs. Les [dix références](imports/advent-quiz-design-system-reference.png), la [confirmation](imports/confirmation-reference.png) et le [handoff](imports/BMAD-HANDOFF.md) définissent l'intention graphique. Ce sont des références artistiques, pas des écrans statiques ni des décisions métier. Le présent document et EXPERIENCE.md prévalent pour les parcours et les états.

L'Avent possède une identité indépendante de HatCast. Angular Material 3 reste une base de comportements et d'accessibilité ; son adaptation visuelle est limitée à l'Avent et ne modifie pas le design system de l'application.

## Colors

Palette de départ indicative, à ajuster après mesure des contrastes : crème `#FFF6E4`, rouge `#B52235`, vert sapin `#075441`, or `#DEA537`. Le kit indique que ces valeurs sont des approximations ; la planche contient d'autres valeurs indicatives. Définir des rôles sémantiques propres à l'Avent pour les surfaces, textes, actions, contours, focus et états, avec couples de couleurs vérifiés. Aucun texte de réponse pâle. La couleur seule ne distingue jamais un état. Contraste minimal 4,5:1 pour le texte courant et 3:1 pour le grand texte admissible ; vérifier également contrôles et focus.

Rôles minimaux du système, à définir sous la racine Avent et à partager entre composants : `surface`, `surface-card`, `text`, `text-muted`, `primary`, `on-primary`, `accent`, `border`, `focus`, `selected`, `disabled` et `error`. Les couples proposés vert/crème et rouge/blanc atteignent respectivement 8,31:1 et 6,47:1 avec les valeurs indicatives ; or/crème atteint seulement 2,05:1 et reste décoratif, jamais un texte ou indicateur essentiel seul. Vérifier les valeurs effectivement rendues et tous les états avant livraison.

## Typography

Titres expressifs arrondis dans l'esprit de Fredoka ; texte courant sans sérif lisible dans l'esprit de Nunito. Les choix exacts, licences, chargement et replis sont à vérifier. Appliquer les familles uniquement dans la racine Avent. Cibles fluides en pixels CSS : titre héros 36–44, titre d'écran 28–32, question 24–28, choix 18–20, texte secondaire 18–22, utilitaires 14–16. Adapter aux petites largeurs et au zoom sans couper les textes.

## Layout & Spacing

Mobile d'abord, avec adaptation tablette et desktop. Marges horizontales mobiles visées de 20–24 px, ajustables à 320 px et au zoom. Cibles tactiles au moins 44 × 44 px, 48 px de hauteur préférés ; action principale visée à 56–64 px. La lecture et l'accès aux commandes priment sur l'absence de défilement. Le calendrier conserve quatre colonnes ordonnées ; permettre le défilement sans perte de lisibilité ou de taille des cibles.

## Elevation & Depth

Panneaux chaleureux, contours dorés, neige et ombres douces inspirés des références ; les décors restent secondaires devant le texte et les commandes. Les effets ne portent aucune information indispensable.

## Shapes

Les cases évoquent des portes de calendrier : ouvertes après avoir joué, fermées avant découverte ; les futures portent un petit cadenas. La grande porte comporte des étoiles et flocons flottants et une bordure animée ; une lumière douce apparaît à l’ouverture, avec alternative sans mouvement. La case du jour est fermée et numérotée, sans cadenas ; une couleur distincte peut attirer discrètement l’attention. Les cases jouées montrent une petite porte ouverte et un numéro visible.

## Components

[Maquette du parcours révisé](mockups/parcours-revise.html) : dispositions de référence approuvées globalement, graphisme à affiner en story. [Ancienne maquette](mockups/ecrans-cles.html) : archive supplantée par le kit du 30 octobre pour le graphisme ; ses parcours, scores et rangs sont obsolètes. Les décisions de DESIGN.md et EXPERIENCE.md prévalent sur la maquette.

- **Porte de découverte** : scène de découverte en pleine page avec cadeau ou porte ouvrable, lutin et décorations de flocons et d’étoiles ; ouverture courte révélant une lumière douce.
- **Choix du quiz** : cartes de choix arrondies lisibles, états non sélectionné, sélectionné, désactivé et erreur clairement différenciés, avec sémantique de choix unique.
- **Révélation différée** : reprend la surface du quiz après minuit, heure de Paris ; célébration à la bonne réponse : confettis qui jaillissent puis retombent et points de couleur vive animés brièvement, avec alternative sans mouvement. En cas d’erreur, message encourageant dans la même ambiance festive.
- **Confirmation et attente** : composition illustrée selon la référence de confirmation, message en texte réel et action de classement quand disponible ; aucun indice sur la réponse ou les points.
- **Calendrier et classement** : grille et liste utilisent les composants accessibles et les rôles visuels propres à l’Avent ; différencier les états par texte et forme, et conserver le rang et le score lisibles. Les détails graphiques des cases manquées, en attente et du 25 seront affinés en story.
- **25 décembre** : Pour le 25, Patrice retient un Père Noël à tête classique, dessiné dans le même style que les lutins, tendant une boîte décorative portant le logo de La Malice. Le personnage et sa boîte se placent au-dessus du message ; le score bien visible et les accès au classement et au calendrier suivent. Un village est un décor possible ; la réalisation graphique reste à préciser. La boîte ne propose pas d’ouverture pour l’instant.
- **Onglets** : onglets accessibles Calendrier et Classement adaptés à la DA Avent.
- **Icône Père Noël** : près de Mon compte ; léger mouvement discret de moins de cinq secondes, une fois à l’ouverture de HatCast.

### États et illustrations réutilisables

Chaque commande expose les états repos, survol si applicable, focus visible, sélection, désactivation, chargement et erreur selon son rôle ; les états conservent libellé, contraste et signal non chromatique. Les cartes et panneaux accueillent du contenu réel et redimensionnable. Les lutins, cadeaux, neige, houx et étoiles peuvent être des illustrations distinctes et décoratives ; les portraits individuels protégés restent fournis par l'API autorisée. Les images de référence ne sont jamais des fonds d'écran contenant les libellés. Les animations sont brèves, non indispensables et supprimées sous mouvement réduit.

## Do's and Don'ts

- Préserver la surprise sans cacher les états nécessaires à la compréhension.
- Isoler les tokens, styles, composants, animations et typographies Avent ; ne pas modifier le thème HatCast global.
- Rendre les textes, choix et actions en HTML accessible ; les illustrations ne remplacent pas les interfaces.
- Décliner les états chargement, erreur, indisponible, sélection, désactivation et focus dans le même univers sans inventer de fonctionnalité.
- Prévoir une expérience équivalente avec mouvement réduit.

La représentation de la case du 25 reste à explorer. Pour le 25, Patrice retient un Père Noël à tête classique, dessiné dans le même style que les lutins, tendant une boîte décorative portant le logo de La Malice. Le personnage et sa boîte se placent au-dessus du message ; le score bien visible et les accès au classement et au calendrier suivent. Un village est un décor possible ; la réalisation graphique reste à préciser. La boîte ne propose pas d’ouverture pour l’instant.
