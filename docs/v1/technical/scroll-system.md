# Système de Scroll Horizontal

## Vue d'ensemble

Le composant `GridBoard.vue` implémente un système de scroll horizontal sophistiqué pour naviguer dans la liste des événements/spectacles. Ce système utilise des chevrons flottants positionnés de manière absolue pour permettre une navigation intuitive.

## Architecture

### Composants impliqués

- **Header bar** : Zone sticky avec en-têtes des événements (`z-[100]`)
- **Colonne gauche** : Cellule sticky avec bouton "Ajouter spectacle" et icône de saison (`z-[101]`, `z-[102]`)
- **Chevrons de scroll** : Boutons flottants pour navigation (`z-[110]`)

### Structure des z-index

```css
/* Hiérarchie des couches */
z-[60]   : En-têtes des événements (contenu scrollable)
z-[85]   : Boutons de filtres et dropdown
z-[100]  : Header bar sticky
z-[101]  : Colonne gauche sticky
z-[102]  : Icône de saison
z-[110]  : Chevrons de scroll (au-dessus de tout)
z-[150]  : Boutons de filtres (top-right)
z-[200]  : Dropdown des filtres
z-[400]  : Coachmarks d'onboarding
```

## Fonctionnalités

### Chevrons de navigation

- **Positionnement** : `absolute left-2 bottom-2` (gauche) et `absolute right-2 bottom-2` (droite)
- **Visibilité** : Contrôlée par `showLeftHint` et `showRightHint`
- **Comportement** : Apparaissent uniquement quand il y a du contenu à faire défiler

### Logique de visibilité

```javascript
function updateScrollHints() {
  const el = gridboardRef.value
  if (!el) return
  const { scrollLeft, scrollWidth, clientWidth } = el
  showLeftHint.value = scrollLeft > 2
  showRightHint.value = scrollLeft < scrollWidth - clientWidth - 2
}
```

### Navigation par clic

- **Défilement incrémental** : Une colonne complète par clic
- **Mesure dynamique** : Largeur calculée à partir des cellules réelles du tableau
- **Fallback** : 60% de la largeur du conteneur si mesure impossible

```javascript
function scrollHeaderBy(direction) {
  const container = gridboardRef.value
  if (!container) return

  // Mesure d'une vraie cellule du tableau
  let oneColumnWidth = 0
  const firstEventCell = container.querySelector('tbody tr td[data-event-id]')
  if (firstEventCell) {
    oneColumnWidth = firstEventCell.getBoundingClientRect().width
  }
  
  // Fallback si mesure impossible
  if (!oneColumnWidth || !isFinite(oneColumnWidth)) {
    oneColumnWidth = container.clientWidth * 0.6
  }

  const target = container.scrollLeft + direction * oneColumnWidth
  container.scrollTo({ left: target, behavior: 'smooth' })
}
```

### Défilement continu (maintien)

- **Déclenchement** : `mousedown` / `touchstart` avec délai de 250ms
- **Rythme** : ~1/6 de colonne tous les 120ms pour une lecture fluide
- **Arrêt** : `mouseup`, `mouseleave`, `touchend`, `touchcancel`

```javascript
function startHoldScroll(direction, evt) {
  // Éviter le ghost click sur mobile
  if (evt && typeof evt.preventDefault === 'function') evt.preventDefault()
  
  // Défilement progressif
  const stepPerTick = oneColumnWidth / 6
  const tickMs = 120
  
  const tick = () => {
    if (!isHolding.value || currentHoldDirection.value === 0) return
    const next = container.scrollLeft + currentHoldDirection.value * stepPerTick
    container.scrollTo({ left: next, behavior: 'auto' })
    holdScrollTimer.value = window.setTimeout(tick, tickMs)
  }
  
  // Délai avant démarrage (distinction clic vs maintien)
  holdScrollTimer.value = window.setTimeout(tick, 250)
}
```

## Synchronisation

### Header et contenu

- **Scroll synchronisé** : Le header suit le scroll du contenu principal
- **Transform CSS** : `translateX(-${headerScrollX}px)` pour performance
- **Watcher** : Mise à jour en temps réel via event listener

```javascript
el.addEventListener('scroll', (e) => {
  updateScrollHints()
  headerScrollX.value = el.scrollLeft || 0
}, { passive: true })
```

### Responsive et mobile

- **ResizeObserver** : Détection automatique des changements de layout
- **RAF + setTimeout** : Triple vérification pour capturer les changements
- **Touch events** : Support complet des gestes tactiles

## Gestion des événements

### Événements supportés

- **Clic simple** : `@click.prevent="onChevronClick(direction, $event)"`
- **Maintien souris** : `@mousedown.prevent="startHoldScroll(direction, $event)"`
- **Maintien tactile** : `@touchstart.prevent="startHoldScroll(direction, $event)"`
- **Arrêt** : `@mouseup`, `@mouseleave`, `@touchend`, `@touchcancel`

### Prévention des conflits

- **preventDefault** : Évite les comportements par défaut du navigateur
- **Gestion des doubles événements** : Distinction clic vs maintien
- **Nettoyage automatique** : Timeouts et RAF nettoyés lors du démontage

## Optimisations

### Performance

- **Passive listeners** : `{ passive: true }` pour les événements de scroll
- **RequestAnimationFrame** : Synchronisation avec le cycle de rendu
- **Debouncing** : Mise à jour des hints optimisée

### Accessibilité

- **Titres explicites** : "Événements précédents — cliquez pour défiler"
- **Support clavier** : Navigation possible via clics
- **Indicateurs visuels** : Apparition/disparition conditionnelle des chevrons

## Dépannage

### Problèmes courants

1. **Chevron gauche invisible** : Vérifier les z-index (doit être > 102)
2. **Scroll non synchronisé** : Vérifier que `headerScrollX` est mis à jour
3. **Performance mobile** : S'assurer que `ResizeObserver` est supporté

### Debug

```javascript
// Vérifier l'état des hints
console.log('Left hint:', showLeftHint.value, 'Right hint:', showRightHint.value)

// Vérifier les dimensions
const el = gridboardRef.value
console.log('Scroll:', el.scrollLeft, 'Width:', el.scrollWidth, 'Client:', el.clientWidth)
```
