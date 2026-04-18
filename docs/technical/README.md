# 🔧 Documentation Technique HatCast

Ce dossier contient la documentation technique et d'implémentation du projet HatCast.

## Monorepo V1 / V2

- **[MONOREPO.md](MONOREPO.md)** — Structure `legacy/`, `apps/web/`, `services/api/` et règles d’import.
- **[BRANCH_ENVIRONMENTS.md](BRANCH_ENVIRONMENTS.md)** — Branches Git, déploiements, environnements.
- **[MERGE_V2_TO_MAIN_CHECKLIST.md](MERGE_V2_TO_MAIN_CHECKLIST.md)** — Avant merge `v2` → `main`.

## 🏗️ Architecture et implémentation

### 🎭 Interface utilisateur
- **[Implémentation des Filtres](filters-implementation.md)** - Détails techniques du système de filtres de la grille

### 🔧 Composants principaux
- **GridBoard.vue** : Grille principale avec gestion des événements et participants
- **Système de filtres** : Logique de filtrage et interface utilisateur
- **Gestion des événements** : CRUD et logique métier

## 🎯 Concepts techniques

### Vue.js 3 Composition API
- **Refs réactifs** : `ref()`, `computed()`, `watch()`
- **Lifecycle hooks** : `onMounted()`, `onUnmounted()`
- **Réactivité** : Système de dépendances automatique

### Gestion d'état
- **Variables locales** : État des composants
- **Props** : Communication parent-enfant
- **Emits** : Communication enfant-parent

### CSS et design
- **Tailwind CSS** : Classes utilitaires
- **Z-index** : Gestion des couches d'interface
- **Responsive** : Design mobile-first

## 🐛 Débogage et résolution de problèmes

### Problèmes courants
1. **Z-index** : Conflits de superposition d'éléments
2. **Positionnement** : Dropdowns et modales mal positionnés
3. **Réactivité** : Variables non mises à jour

### Outils de débogage
- **Vue DevTools** : Inspection des composants et de l'état
- **Console browser** : Logs et erreurs JavaScript
- **Audit logs** : Traçabilité des actions utilisateur

## 📱 Responsive et PWA

### Mobile-first
- **Breakpoints** : sm (640px), md (768px), lg (1024px)
- **Touch targets** : Boutons minimum 36x36px
- **Scroll** : Gestion optimisée pour mobile

### PWA
- **Service Worker** : Cache et fonctionnement hors ligne
- **Manifest** : Installation et métadonnées
- **HTTPS** : Requis pour les fonctionnalités PWA

## 🔄 Performance

### Optimisations
- **Computed properties** : Mise en cache des calculs
- **Lazy loading** : Chargement à la demande
- **Debouncing** : Limitation des appels fréquents

### Monitoring
- **Lighthouse** : Audit de performance
- **Core Web Vitals** : Métriques de performance
- **Bundle analyzer** : Analyse de la taille des bundles

## 🚀 Déploiement

### Build
- **Vite** : Outil de build et développement
- **Optimisations** : Minification, tree-shaking
- **PWA** : Génération automatique des assets

### Firebase
- **Hosting** : Déploiement automatique
- **Firestore** : Base de données
- **Functions** : Logique backend

### Workflows GitHub Actions
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Architecture de déploiement et workflows automatisés

## 📚 Ressources

### Documentation officielle
- [Vue.js 3](https://vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [Firebase](https://firebase.google.com/)

### Bonnes pratiques
- **Code splitting** : Division en chunks
- **Type safety** : Validation des types
- **Testing** : Tests unitaires et d'intégration
- **Accessibility** : Standards WCAG
