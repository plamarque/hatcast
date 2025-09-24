# Hiérarchie des Z-Index

Ce document décrit la hiérarchie des z-index utilisés dans l'application pour éviter les conflits de superposition d'éléments.

## Vue d'ensemble

Les z-index sont organisés par plages pour faciliter la maintenance :

- **0-99** : Éléments de base (contenu principal)
- **100-199** : Éléments flottants (boutons de navigation, indicateurs)
- **1000-1999** : Modales et overlays
- **2000+** : Éléments critiques (erreurs, confirmations)

## Hiérarchie détaillée

### Éléments de base (0-99)
- **z-10** : `AvailabilityCell` - Cellules de disponibilité (pour s'assurer qu'elles sont cliquables)

### Éléments flottants (100-199)
- **z-110** : Boutons de navigation horizontale (précédent/suivant)
- **z-120** : Overlay de chargement pleine page
- **z-100** : Indicateur de chargement progressif

### Modales et overlays (1000-1999)

#### Modales de contenu (1300-1399)
- **z-1300** : Modale de création de joueur
- **z-1320** : Modale de confirmation de suppression de joueur
- **z-1340** : Modal de vérification du mot de passe du joueur
- **z-1350** : Modal de vérification du mot de passe pour les disponibilités
- **z-1360** : **Modale de détails d'événement** (principale)
- **z-1370** : Modal de prompt pour annoncer après création/modification
- **z-1380** : Modale de confirmation de suppression

#### Modales de niveau supérieur (1400-1499)
- **z-1400** : Modal mot de passe oublié pour la suppression de joueur
- **z-1400** : Modale des chances détaillées
- **z-1410** : Modal mot de passe oublié pour les disponibilités

#### Modales de niveau critique (1500+)
- **z-1500** : **AvailabilityModal** - Modale de disponibilité (au-dessus de tout)

### Messages et notifications (9999+)
- **z-9999** : Messages de succès et d'erreur (toasts)

## Règles importantes

### 1. Modale de détails d'événement (z-1360)
Cette modale contient l'onglet "Ma Dispo" avec les `AvailabilityCell`. Ces cellules ont un z-index de 10 pour s'assurer qu'elles sont cliquables.

### 2. AvailabilityModal (z-1500)
Cette modale doit toujours apparaître au-dessus de la modale de détails d'événement pour permettre la modification des disponibilités.

### 3. Conflits potentiels
- Les `AvailabilityCell` dans la modale de détails d'événement doivent avoir un z-index suffisant pour être cliquables
- L'`AvailabilityModal` doit avoir un z-index supérieur à la modale de détails d'événement

## Maintenance

### Ajouter un nouvel élément
1. Identifier la plage appropriée selon le type d'élément
2. Utiliser le prochain z-index disponible dans la plage
3. Mettre à jour ce document

### Résoudre un conflit de z-index
1. Vérifier que l'élément parent n'a pas de `overflow: hidden`
2. S'assurer que l'élément a un `position` (relative, absolute, fixed)
3. Augmenter le z-index si nécessaire
4. Mettre à jour ce document

## Exemples d'utilisation

```css
/* Cellule de disponibilité cliquable */
.availability-cell {
  position: relative;
  z-index: 10;
}

/* Modale de détails d'événement */
.event-details-modal {
  position: fixed;
  z-index: 1360;
}

/* Modale de disponibilité */
.availability-modal {
  position: fixed;
  z-index: 1500;
}
```

## Dépannage

### Problème : Clic ne fonctionne pas sur AvailabilityCell
1. Vérifier que l'`AvailabilityCell` a `z-index: 10`
2. Vérifier que l'élément parent n'a pas `pointer-events: none`
3. Vérifier qu'aucun autre élément ne capture les clics

### Problème : Modale ne s'affiche pas au-dessus
1. Vérifier le z-index de la modale
2. Vérifier que l'élément parent n'a pas `overflow: hidden`
3. S'assurer que la modale a `position: fixed`

