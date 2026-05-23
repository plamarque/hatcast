# 🔧 Implémentation du Système de Filtres

## Vue d'ensemble technique

Ce document décrit l'implémentation technique du système de filtres d'affichage dans `GridBoard.vue`.

## 🏗️ Architecture

### Composants impliqués
- **GridBoard.vue** : Composant principal contenant la logique de filtrage
- **Interface** : Bouton de filtres avec dropdown et indicateurs visuels

### Variables réactives
```javascript
const showArchived = ref(false)        // Filtre pour les événements archivés
const showPast = ref(false)            // Filtre pour les événements passés
const showFiltersDropdown = ref(false) // État d'ouverture du dropdown
```

## 🎯 Logique de filtrage

Un événement est considéré **passé** (`isPast` / `_isPast`) seulement **après la fin du jour civil en `Europe/Paris`** (23:59:59.999), pas dès que l’instant UTC dépasse minuit pour une date `YYYY-MM-DD`. Voir [`src/utils/eventPastParis.js`](../../src/utils/eventPastParis.js) (`isEventPastParis`).

### Fonction `displayedEvents`
```javascript
import { isEventPastParis } from '../utils/eventPastParis.js'

const displayedEvents = computed(() => {
  const list = sortedEvents.value
  const now = new Date()
  return list.filter(e => {
    const isArchived = !!e.archived
    const isPast = !!(e.date && isEventPastParis(e.date, now))
    
    // Si les deux filtres sont cochés, afficher tout
    if (showArchived.value && showPast.value) {
      return true
    }
    // Si seulement Archivés est coché, afficher les archivés
    else if (showArchived.value) {
      return isArchived
    }
    // Si seulement Passés est coché, afficher les passés
    else if (showPast.value) {
      return isPast
    }
    // Par défaut (aucun coché) : afficher ni archivés ni passés
    else {
      return !isArchived && !isPast
    }
  })
})
```

### Matrice de filtrage
| Archivés | Passés | Résultat | Logique |
|----------|--------|----------|---------|
| ❌ | ❌ | Événements actifs/futurs | `!isArchived && !isPast` |
| ✅ | ❌ | Événements archivés | `isArchived` |
| ❌ | ✅ | Événements passés | `isPast` |
| ✅ | ✅ | Tous les événements | `true` |

## 🎨 Interface utilisateur

### Bouton de filtres
- **Icône** : Entonnoir (filtre) avec SVG
- **Position** : En haut à droite de l'en-tête noire
- **Z-index** : `z-[150]` pour éviter les conflits

### Dropdown
- **Positionnement** : `fixed` avec calcul dynamique de position
- **Z-index** : `z-[1000]` (priorité maximale, au-dessus de tous les éléments)
- **Contexte de stacking** : Placé en dehors du conteneur parent pour éviter les limitations
- **Fermeture** : Automatique au clic extérieur

### Indicateurs visuels
- **Point violet** : Apparaît quand `showArchived || showPast`
- **Badge "📁 Archivé"** : En bas des en-têtes d'événements archivés
- **Style atténué** : CSS `.archived-header` et `.archived-col`

## 🔄 Gestion des événements

### Positionnement simple
```html
<div class="absolute top-12 right-0 w-48 bg-gray-900 border border-white/20 rounded-xl shadow-2xl z-[1000] overflow-hidden">
  <!-- Contenu du dropdown -->
</div>
```

### Fermeture automatique
```javascript
onMounted(() => {
  document.addEventListener('click', (event) => {
    const filtersButton = document.querySelector('[data-filters-button]')
    const filtersDropdown = document.querySelector('[data-filters-dropdown]')
    
    if (filtersButton && !filtersButton.contains(event.target) && 
        filtersDropdown && !filtersDropdown.contains(event.target)) {
      closeFiltersDropdown()
    }
  })
})
```

## 🐛 Résolution de problèmes

### Problèmes rencontrés
1. **Z-index** : Dropdown masqué par le bouton → Résolu avec `z-[200]`
2. **Positionnement** : Dropdown en dessous de la grille → Résolu avec `fixed` + calcul dynamique
3. **Logique inverse** : Filtre "Passés" affichait les non-passés → Résolu avec `return isPast`
4. **Conflit avec popup changelog** : Dropdown masqué par le popup de changelog → Résolu avec `z-[1000]`
5. **Positionnement CSS simple** : Dropdown positionné avec `absolute top-12 right-0` → Plus de calculs dynamiques complexes
6. **Conflit avec zone de saisie** : Dropdown masqué par les zones de saisie → Résolu en sortant le dropdown du contexte de stacking parent

### Bonnes pratiques
- Utilisation de `computed()` pour la réactivité
- Gestion des événements de clic avec `onMounted`
- Positionnement dynamique basé sur `getBoundingClientRect()`
- Z-index cohérents et documentés

## 📱 Responsive design

- **Mobile-first** : Interface adaptée aux petits écrans
- **Transitions** : Animations fluides avec `transition-all duration-200`
- **Touch-friendly** : Boutons de taille suffisante (36x36px minimum)

## 🔮 Évolutions futures

- **Filtres additionnels** : Par statut, par nombre de participants
- **Sauvegarde** : Persistance des préférences de filtres
- **Raccourcis** : Claviers pour activer/désactiver rapidement
- **Présets** : Combinaisons de filtres prédéfinies
