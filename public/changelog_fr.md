# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

# Changelog

---

## [0.9.1] - 05/09/2025

### 🐛 Corrections de bugs
- résolution des problèmes d’affichage du journal des modifications dans la page d’aide

---

## [0.9.0] - 04/09/2025

### ✨ Nouvelles fonctionnalités
- ajout d’un journal des modifications convivial avec traduction automatique
- ajout d’améliorations de l’affichage des versions et de la page d’aide
- affichage des nouvelles modifications uniquement dans l’aperçu du journal des modifications
- implémentation d’un essai à blanc ultra-fidèle avec les branches sandbox
- traduction du script de déploiement en anglais et suppression de l’URL de production
- affichage de l’aperçu du journal des modifications dans le script de déploiement
- génération automatique du journal des modifications
- ajout d’options de gestion des mises à jour de version (majeures/mineures/correctifs)
- ajout d’un script de déploiement de production intelligent avec gestion automatique des versions
- amélioration de l’expérience d’installation des PWA
- ajout d’icônes de type d’événement et amélioration de la largeur du menu déroulant
- ajout du partage d’événements Lien avec des libellés mobiles réactifs
- amélioration de l'interface modale de disponibilité avec affichage de l'état actuel et rôles compacts
- remplacement du logo Hatcast par un chevron arrière sur la page des saisons
- traduction des boutons d'authentification Google en français
- ajout d'une journalisation détaillée pour les appels de fonctions Cloud afin de déboguer les problèmes CORS
- implémentation d'un système de contrôle dynamique du niveau de journalisation
- préparation du workflow de déploiement en production de Firebase
- optimisation de la présentation d'EventModal et de la réactivité mobile
- amélioration du rafraîchissement des avatars après protection/déprotection
- flexibilité de PlayerAvatar et suppression des icônes d'état redondantes dans la modale du joueur
- ajout des avatars des joueurs dans la modale de détail de l'événement
- ajout des avatars des joueurs dans les modales de détail et de sélection
- ajout des avatars des joueurs dans la grille principale avec des icônes d'état
- implémentation du système d'affichage des avatars Google
- ajout de l'authentification Google
- amélioration de l'expérience utilisateur de la modale de disponibilité
- ajout d'un bouton permanent de création de saison
- implémentation du chargement différé pour les secrets Firebase
- Correction de la fenêtre modale de test des e-mails et activation de l'envoi réel d'e-mails avec Ethereal
- Désactivation de l'audit par défaut dans l'environnement de développement
- Nettoyage des logos des saisons lors de leur suppression
- Exigence d'authentification pour la création d'une saison
- Ajout d'un badge d'environnement pour le développement et la préproduction
- Migration complète de Firebase et restauration de la fonctionnalité de téléchargement de logos
- Migration des notifications vers FirestoreService et configuration de PWA pour la préproduction
- Migration des saisons vers FirestoreService et correction des problèmes de tri
- Ajout de journaux de débogage détaillés pour suivre la sélection des bases de données Firestore
- Renforcement du code pour les bases de données vides grâce à une gestion des erreurs simplifiée et à l'initialisation automatique
- Refactorisation des outils de développement et améliorations de sécurité
- Refactorisation du composant EventModal et ajout d'un badge de type d'événement
- Remplacement du bouton œil par un système de filtres avancé avec liste déroulante
- Amélioration de l'interface de la page Saisons - Alignement vertical du logo, du titre et de l'icône utilisateur - Renommer 'Saisons en cours' en 'Saisons' - Ajouter une info-bulle 'Retour à l'accueil HatCast' sur le logo - Corriger l'affichage du logo masque (proportions et largeur)
- Implémentation du système de rôles multi-disponibilité avec commentaires
- Améliorer l'UX de la présélection avec libellé 'Demander confirmation' et messages clairs
- Amélioration du système de protection des joueurs
- implémenter l'association directe des joueurs pour les utilisateurs connectés
- intégrer les tests de protection des joueurs dans la suite principale
- désactiver les déclenchements automatiques modale 'Ne Rate rien' et simplifier le message
- ajout de tests automatisés Playwright
- mise à jour Firebase SDK vers v12 pour préparer la migration Dynamic Links
- Amélioration du flux de protection de compte avec connexion automatique
- ajouter une fonction de réinitialisation de sélection et améliorer l'interface
- ajouter les messages d'équipe confirmée
- implémentation système de confirmation des sélections + UI améliorée
- ajouter un message d'annonce globale pour WhatsApp lors des sélections
- améliorer l'UX d'activation des notifications avec logique intelligente
- optimiser l'affichage de la liste des joueurs en 2 colonnes
- masquer les emojis des badges en mobile et améliorer le texte bouton agenda
- restaurer le déploiement officiel des pages GitHub avec l'environnement
- utiliser les variables GitHub pour les durées de session dans le workflow
- ajouter un workflow GitHub Actions sécurisé pour le déploiement en production
- ajouter une maquette de téléphone pour la prévisualisation des notifications push

### 🔧 Améliorations
- ajouter des instructions sur le dossier spam à tous les messages de réussite par e-mail
- remplacer 'spectacle' par 'événement' dans toute l'application
- centraliser la configuration CORS pour éliminer la duplication de code
- centraliser la détection de l'environnement à l'aide de configService
- refactorisation du service de stockage pour gérer plusieurs environnements
- style atténué pour Archives

### 🐛 Corrections de bugs
- compatibilité macOS sed pour la mise à jour de la version package.json
- correction de la commande d'affichage du journal des modificationsis pin


---

## [0.8.0] - 2025-09-04

### ✨ Nouvelles fonctionnalités
- ajout de l'affichage des versions et des améliorations de la page d'aide
- ajout d'un système de protection des joueurs
- ajout d'un design responsive pour mobile
- ajout de la prise en charge des PWA avec invites d'installation
- ajout d'un système de notifications push
- ajout d'une piste d'audit complète
- ajout d'un système de rappel automatique
- ajout du suivi de navigation
- ajout de la gestion des saisons et des événements
- ajout d'un système de disponibilité des joueurs
- ajout d'un algorithme de sélection automatique
- ajout de notifications par e-mail avec modèles
- ajout de l'authentification et des comptes utilisateurs
- ajout d'une interface de grille responsive
- ajout d'un système de filtrage pour les événements
- ajout d'outils de développement et de débogage

### 🐛 Corrections
- correction d'un bug de sélection de disponibilité
- correction d'un texte parasite dans l'affichage de la grille
- correction des problèmes d'authentification
- correction des problèmes d'envoi d'e-mails
- correction de la navigation Problèmes
- synchronisation des données correcte

### ⚡ Améliorations
- amélioration de la réactivité mobile
- optimisation des performances de chargement
- amélioration de l'expérience utilisateur
- optimisation des requêtes de base de données
- amélioration de la sécurité
- optimisation des performances

### 🎨 Interface
- mise à jour de la page d'aide
- amélioration de la mise en page du pied de page
- ajout d'un dégradé moderne
- implémentation d'une approche mobile-first
- ajout d'invites d'installation PWA



## [0.9.1] - 05/09/2025

### 🐛 Corrections de bugs
- résolution des problèmes d’affichage du journal des modifications dans la page d’aide

---

## [0.9.0] - 04/09/2025

### ✨ Nouvelles fonctionnalités
- ajout d’un journal des modifications convivial avec traduction automatique
- ajout d’améliorations de l’affichage des versions et de la page d’aide
- affichage des nouvelles modifications uniquement dans l’aperçu du journal des modifications
- implémentation d’un essai à blanc ultra-fidèle avec les branches sandbox
- traduction du script de déploiement en anglais et suppression de l’URL de production
- affichage de l’aperçu du journal des modifications dans le script de déploiement
- génération automatique du journal des modifications
- ajout d’options de gestion des mises à jour de version (majeures/mineures/correctifs)
- ajout d’un script de déploiement de production intelligent avec gestion automatique des versions
- amélioration de l’expérience d’installation des PWA
- ajout d’icônes de type d’événement et amélioration de la largeur du menu déroulant
- ajout du partage d’événements Lien avec des libellés mobiles réactifs
- amélioration de l'interface modale de disponibilité avec affichage de l'état actuel et rôles compacts
- remplacement du logo Hatcast par un chevron arrière sur la page des saisons
- traduction des boutons d'authentification Google en français
- ajout d'une journalisation détaillée pour les appels de fonctions Cloud afin de déboguer les problèmes CORS
- implémentation d'un système de contrôle dynamique du niveau de journalisation
- préparation du workflow de déploiement en production de Firebase
- optimisation de la présentation d'EventModal et de la réactivité mobile
- amélioration du rafraîchissement des avatars après protection/déprotection
- flexibilité de PlayerAvatar et suppression des icônes d'état redondantes dans la modale du joueur
- ajout des avatars des joueurs dans la modale de détail de l'événement
- ajout des avatars des joueurs dans les modales de détail et de sélection
- ajout des avatars des joueurs dans la grille principale avec des icônes d'état
- implémentation du système d'affichage des avatars Google
- ajout de l'authentification Google
- amélioration de l'expérience utilisateur de la modale de disponibilité
- ajout d'un bouton permanent de création de saison
- implémentation du chargement différé pour les secrets Firebase
- Correction de la fenêtre modale de test des e-mails et activation de l'envoi réel d'e-mails avec Ethereal
- Désactivation de l'audit par défaut dans l'environnement de développement
- Nettoyage des logos des saisons lors de leur suppression
- Exigence d'authentification pour la création d'une saison
- Ajout d'un badge d'environnement pour le développement et la préproduction
- Migration complète de Firebase et restauration de la fonctionnalité de téléchargement de logos
- Migration des notifications vers FirestoreService et configuration de PWA pour la préproduction
- Migration des saisons vers FirestoreService et correction des problèmes de tri
- Ajout de journaux de débogage détaillés pour suivre la sélection des bases de données Firestore
- Renforcement du code pour les bases de données vides grâce à une gestion des erreurs simplifiée et à l'initialisation automatique
- Refactorisation des outils de développement et améliorations de sécurité
- Refactorisation du composant EventModal et ajout d'un badge de type d'événement
- Remplacement du bouton œil par un système de filtres avancé avec liste déroulante
- Amélioration de l'interface de la page Saisons - Alignement vertical du logo, du titre et de l'icône utilisateur - Renommer 'Saisons en cours' en 'Saisons' - Ajouter une info-bulle 'Retour à l'accueil HatCast' sur le logo - Corriger l'affichage du logo masque (proportions et largeur)
- Implémentation du système de rôles multi-disponibilité avec commentaires
- Améliorer l'UX de la présélection avec libellé 'Demander confirmation' et messages clairs
- Amélioration du système de protection des joueurs
- implémenter l'association directe des joueurs pour les utilisateurs connectés
- intégrer les tests de protection des joueurs dans la suite principale
- désactiver les déclenchements automatiques modale 'Ne Rate rien' et simplifier le message
- ajout de tests automatisés Playwright
- mise à jour Firebase SDK vers v12 pour préparer la migration Dynamic Links
- Amélioration du flux de protection de compte avec connexion automatique
- ajouter une fonction de réinitialisation de sélection et améliorer l'interface
- ajouter les messages d'équipe confirmée
- implémentation système de confirmation des sélections + UI améliorée
- ajouter un message d'annonce globale pour WhatsApp lors des sélections
- améliorer l'UX d'activation des notifications avec logique intelligente
- optimiser l'affichage de la liste des joueurs en 2 colonnes
- masquer les emojis des badges en mobile et améliorer le texte bouton agenda
- restaurer le déploiement officiel des pages GitHub avec l'environnement
- utiliser les variables GitHub pour les durées de session dans le workflow
- ajouter un workflow GitHub Actions sécurisé pour le déploiement en production
- ajouter une maquette de téléphone pour la prévisualisation des notifications push

### 🔧 Améliorations
- ajouter des instructions sur le dossier spam à tous les messages de réussite par e-mail
- remplacer 'spectacle' par 'événement' dans toute l'application
- centraliser la configuration CORS pour éliminer la duplication de code
- centraliser la détection de l'environnement à l'aide de configService
- refactorisation du service de stockage pour gérer plusieurs environnements
- style atténué pour Archives

### 🐛 Corrections de bugs
- compatibilité macOS sed pour la mise à jour de la version package.json
- correction de la commande d'affichage du journal des modifications