# Système de Filtres d'Affichage

## Vue d'ensemble

Le bouton œil a été remplacé par un système de filtres plus intuitif avec un dropdown contenant deux options cochables et cumulables.

## Localisation

Le bouton de filtres se trouve en haut à droite de l'en-tête noire de la grille, au-dessus des chevrons de défilement horizontal.

## Options disponibles

### 📁 Archivés
- **Coché** : Affiche les événements archivés
- **Décoché** : Masque les événements archivés

### 📅 Passés  
- **Coché** : Affiche les événements passés (date < maintenant)
- **Décoché** : Masque les événements passés

## Logique de filtrage

| Archivés | Passés | Résultat |
|----------|--------|----------|
| ❌ | ❌ | **Par défaut** : Événements ni archivés ni passés |
| ✅ | ❌ | Événements archivés uniquement |
| ❌ | ✅ | Événements passés uniquement |
| ✅ | ✅ | **Tous** les événements (archivés + passés + futurs) |

## Indicateurs visuels

- **Bouton** : Icône de filtre (entonnoir)
- **Point violet** : Indicateur visuel quand des filtres sont actifs
- **Dropdown** : S'ouvre au clic et se ferme automatiquement au clic extérieur
- **Positionnement** : Le dropdown s'affiche au-dessus de tous les éléments avec un positionnement fixe
- **Z-index** : Priorité maximale pour garantir la visibilité complète

## Comportement

- Les filtres sont **cumulatifs** : vous pouvez combiner les options
- L'état par défaut (aucun filtre) affiche seulement les événements actifs et futurs
- Le dropdown se ferme automatiquement quand vous cliquez ailleurs
- Les changements de filtres sont appliqués en temps réel
- **Indicateurs visuels** : Les événements archivés sont identifiés par un badge "📁 Archivé" en bas de l'en-tête (sans texte entre parenthèses)
