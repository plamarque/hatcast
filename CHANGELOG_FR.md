# Journal des modifications


## [0.9.2] - 07/09/2025

### ✨ Nouvelles fonctionnalités
- appliquer les préférences de rôle uniquement aux joueurs favoris
- refonte de la fenêtre de saisie de disponibilité
- ajouter une personnalisation d'avatar basée sur le genre et une icône d'édition
- ajouter une écriture inclusive avec un point central pour les libellés de rôle
- implémenter un système complet de traduction du journal des modifications côté serveur
- implémenter un système complet de traduction du journal des modifications côté serveur
- implémenter un script de traduction et de renommage du journal des modifications côté serveur

### 🐛 Corrections de bugs
- protéger l'accès au menu d'édition des joueurs par une vérification par mot de passe
- remplacer « volontaire » par « bénévole »
- résoudre les problèmes de superposition des modes et de formulaire d'édition d'événements
- améliorer le positionnement du menu déroulant des filtres
- corriger la traduction de « modique » en « modale » dans le journal des modifications
- supprimer l'entrée 0.9.1 en double dans le journal des modifications
- résoudre problèmes d'affichage du journal des modifications dans la page d'aide

---

## [0.9.1] - 05/09/2025

### 🐛 Corrections de bugs
- correction des problèmes d'affichage du journal des modifications dans la page d'aide

---

## [0.9.0] - 04/09/2025

### ✨ Nouvelles fonctionnalités
- ajout d'un système complet de journal des modifications avec traduction automatique et gestion des versions
- ajout d'un script de déploiement de production intelligent avec versioning automatique et mode dry-run
- ajout de l'authentification Google et du système d'affichage des avatars
- ajout du système de protection des joueurs avec disponibilité multi-rôles et flux de confirmation
- ajout d'un système de filtrage avancé avec interface dropdown
- ajout d'une piste d'audit complète et d'outils de développement
- ajout du support PWA avec invites d'installation et notifications push
- ajout d'un système d'aide complet et d'intégration utilisateur
- ajout de la gestion des événements et de la fonctionnalité d'archivage

### 🔧 Améliorations
- amélioration de la centralisation de la détection d'environnement et de la configuration CORS
- amélioration de la migration vers firestoreService pour une meilleure gestion des données
- amélioration de la réactivité mobile et de la cohérence de l'interface utilisateur
- amélioration de l'optimisation des performances et de la réduction de la duplication de code
- amélioration de l'interface mobile et du design responsive

### 🐛 Corrections de bugs
- correction du flux de protection des joueurs et d'authentification
- correction des problèmes d'interface mobile et de positionnement des modales
- correction des problèmes de synchronisation des données et de gestion d'état

### 📝 Autres modifications
- documentation : mise à jour de la documentation de déploiement avec des permissions IAM complètes
- documentation : ajout de directives de message de commit suivant les commits conventionnels
- tâche : ajout d'une suite de tests automatisés avec Playwright
- tâche : ajout de workflows de déploiement spécifiques à l'environnement (développement/staging/production)
- tâche : migration complète vers firestoreService et nettoyage du code legacy
- correction des problèmes de migration Firebase et des conflits de base de données
- correction des conflits de déploiement et de workflow

---

## [0.8.0] - 04/08/2025

### ✨ Nouvelles fonctionnalités
- ajout d'un système complet de gestion et de protection des joueurs
- ajout de la gestion des saisons et des événements avec suivi de disponibilité
- ajout d'un design responsive mobile-first avec support PWA
- ajout des notifications push et du système de notifications par email
- ajout de l'authentification utilisateur et de la gestion des comptes
- ajout de l'algorithme de sélection automatique et du système de rappels
- ajout d'une piste d'audit complète et d'outils de développement

### 🐛 Corrections de bugs
- correction des problèmes de sélection de disponibilité et d'authentification
- correction des problèmes d'affichage de l'interface et de synchronisation des données
- correction des problèmes d'envoi d'emails et de navigation

### 🔧 Améliorations
- amélioration de la réactivité mobile et de l'expérience utilisateur
- amélioration de l'optimisation des performances et des requêtes de base de données
- amélioration de la sécurité et des performances de chargement

### 🎨 Interface/Expérience utilisateur
- implémentation d'un design moderne mobile-first avec support PWA
- amélioration de l'accessibilité, de la facilité d'utilisation et du design visuel
