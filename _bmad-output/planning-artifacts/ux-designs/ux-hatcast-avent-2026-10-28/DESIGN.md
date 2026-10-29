---
name: Calendrier de l’Avent La Malice
status: final
description: Une surprise festive intégrée à HatCast, simple et rapide au quotidien.
updated: 2026-10-29
sources:
  - ../../prds/prd-hatcast-2026-10-28/prd.md
  - ../../../../docs/v2/technical/FRONTEND_UI.md
---

## Brand & Style

Évoquer la magie et la surprise d’un calendrier de l’Avent traditionnel, dans une expérience festive, simple et rapide. L’identité reste celle de HatCast : Angular Material 3 et ses tokens sont la base. La direction validée est vive, joyeuse et festive sur l’ensemble des écrans, avec des décorations de Noël et quelques animations. La maquette illustre une palette rouge, vert et doré ; sa traduction exacte dans le thème HatCast reste à définir et vérifier.

## Colors

Hériter des tokens de thème HatCast `--mat-sys-*`. Les états des cases doivent être distinguables autrement que par la couleur. La maquette explore des tons rouges, verts et dorés ; les valeurs de production et leur contraste restent à définir via le thème HatCast, sans couleurs ad hoc dans les composants.

## Typography

Hériter de la typographie et des rôles Material de HatCast. Garder les affirmations et les résultats lisibles, y compris lorsque le texte est agrandi.

## Layout & Spacing

Mobile d’abord, desktop adaptatif. La porte à ouvrir occupe une page dédiée. Le quiz place le portrait en tête, puis les trois affirmations et la confirmation. Objectif : tout voir sans défilement aux tailles de téléphone usuelles ; ne pas couper le contenu lorsque la taille de texte ou l’écran ne le permet pas. Les tailles de référence restent à vérifier à partir de données disponibles et de tests réels.

Le calendrier est une grille de quatre cases par ligne, numérotées dans l’ordre de gauche à droite ; le défilement est accepté sur téléphone. Viser des cibles de 48 × 48 px ; minimum 40 × 40 px seulement si documenté dans la story conformément aux règles HatCast. Vérifier les petites largeurs et le zoom.

## Shapes

Les cases évoquent des portes de calendrier : ouvertes après avoir joué, fermées avant découverte ; les futures portent un petit cadenas. La grande porte comporte des étoiles et flocons flottants et une bordure animée ; une lumière douce apparaît à l’ouverture, avec alternative sans mouvement. La case du jour est fermée et numérotée, sans cadenas ; une couleur distincte peut attirer discrètement l’attention. Les cases jouées montrent une petite porte ouverte et un numéro visible.

## Components

Référence visuelle validée : [écrans clés](mockups/ecrans-cles.html). Les décisions de DESIGN.md et EXPERIENCE.md prévalent sur la maquette.

- **Porte de découverte** : grande case isolée en pleine page, évoquant une porte en carton décorée de flocons et d’étoiles ; ouverture courte révélant une lumière douce.
- **Choix du quiz** : reprendre l’apparence ronde familière de la saisie des disponibilités, avec une sémantique de choix unique.
- **Résultat** : remplace le quiz sur la même surface ; célébration à la bonne réponse : confettis qui jaillissent puis retombent et points de couleur vive animés brièvement, avec alternative sans mouvement. En cas d’erreur, message encourageant dans la même ambiance festive.
- **Onglets** : reprendre le style d’onglets HatCast pour Calendrier et Classement.
- **Icône Père Noël** : près de Mon compte ; léger mouvement discret de moins de cinq secondes, une fois à l’ouverture de HatCast.

## Do's and Don'ts

- Préserver la surprise sans cacher les états nécessaires à la compréhension.
- Utiliser les composants Material et les tokens HatCast ; pas de palette ad hoc arrêtée ici.
- Prévoir une expérience équivalente avec mouvement réduit.
