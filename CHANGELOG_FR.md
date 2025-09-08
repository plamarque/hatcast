# Journal des modifications



## [0.9.3] - 08/09/2025

### ✨ Nouvelles fonctionnalités
- implémentation d’un système complet de hiérarchie z-index avec documentation complète
- unification des systèmes de réinitialisation de mot de passe sur Firebase Auth
- utilisation du sexe du joueur pour les libellés de rôle dans les cellules de disponibilité
- ajout d’un type d’émission longue durée avec 4 joueurs, 1 MC, 1 DJ

### 🔧 Améliorations
- remplacement de console.log par des appels de journalisation dans PasswordReset.vue

### 🐛 Corrections de bugs
- amélioration de waitForInitialization pour gérer les appels précoces
- attente de l’initialisation de Firebase avant le service d’authentification
- déplacement de waitForInitialization au tout début de onMounted
- ajout d’une gestion des erreurs spécifique pour les échecs de waitForInitialization
- déplacement de l’accès à l’authentification après waitForInitialization pour éviter les plantages
- remplacement des appels de journalisation par console.log pour éviter la dépendance à Firebase
- utilisation du service waitForInitialization existant pour la préparation à l'authentification
- résolution du problème de vérification du jeton de réinitialisation de mot de passe
- conservation du type de modèle d'événement et amélioration de la structure du modèle

### 📝 Autres modifications
- remplacement du système de lien magique par Firebase Auth pour la protection des joueurs
- ajout d'instructions console.log pour le débogage de la réinitialisation du mot de passe

---

## [0.9.2] - 07/09/2025

### ✨ Nouvelles fonctionnalités
- application des préférences de rôle uniquement aux joueurs favoris
- refonte de la fenêtre modale de disponibilité
- ajout d'une personnalisation d'avatar basée sur le sexe et d'une icône d'édition
- ajout d'un point central pour les libellés de rôle
- implémentation d'un système complet de traduction du journal des modifications côté serveur
- implémentation d'un système complet de traduction du journal des modifications côté serveur
- implémentation d'un système complet de traduction du journal des modifications côté serveur et renommage du script de déploiement

### 🐛 Corrections de bugs
- protection de l'accès à la fenêtre modale d'édition des joueurs par la vérification du mot de passe
- remplacement de « volontaire » par « bénévole »
- résolution des problèmes de superposition modale et de formulaire d’édition d’événements
- amélioration du positionnement du menu déroulant des filtres
- correction de la traduction de « modique » en « modale » dans le journal des modifications
- suppression de l’entrée 0.9.1 en double dans le journal des modifications
- résolution des problèmes d’affichage du journal des modifications dans la page d’aide

---

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
