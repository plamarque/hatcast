# Hiérarchie des Z-Index - HatCast

## Vue d'ensemble

Ce document décrit la hiérarchie des z-index utilisés dans l'application HatCast pour gérer l'affichage des modales, dropdowns et autres éléments superposés.

## Diagramme de la hiérarchie

```
┌─────────────────────────────────────────────────────────────┐
│                    NIVEAU 9990+ (Critique)                  │
├─────────────────────────────────────────────────────────────┤
│ z-[9999] ToastNotifications, EnvironmentBadge               │
│ z-[9998] EventActionDropdowns                              │
│ z-[9997] AccountLoginModal, AccountCreationModal           │
│ z-[9996] ForgotPasswordModal, PlayerEditModal              │
│ z-[9995] PasswordVerificationModal                         │
├─────────────────────────────────────────────────────────────┤
│                    NIVEAU 1400+ (Spécialisé)                │
├─────────────────────────────────────────────────────────────┤
│ z-[1420] ForgotPasswordModal (enfant)                      │
│ z-[1410] AvailabilityForgotPasswordModal                   │
│ z-[1400] ChangelogModal, PWAInstallModal, etc.            │
├─────────────────────────────────────────────────────────────┤
│                    NIVEAU 1300+ (Sécurité)                  │
├─────────────────────────────────────────────────────────────┤
│ z-[1380] HowItWorksModal                                   │
│ z-[1370] PlayersModal, AnnouncePromptModal, AvailabilityModal │
│ z-[1360] NotificationSuccessModal, EventDetailsModal       │
│ z-[1350] NotificationPromptModal, AvailabilityPasswordModal│
│ z-[1340] AnnounceModal, PlayerPasswordModal                │
│ z-[1330] PasswordResetModal                                │
│ z-[1320] PlayerClaimModal, ConfirmPlayerDeleteModal        │
│ z-[1310] AccountClaimModal, ConfirmDeleteModal             │
│ z-[1300] AccountLoginModal, NewPlayerFormModal             │
│ z-[1290] AccountCreationModal                              │
├─────────────────────────────────────────────────────────────┤
│                    NIVEAU 1200+ (Secondaire)                │
├─────────────────────────────────────────────────────────────┤
│ z-[1280] AppHelpModal (supprimé)                           │
│ z-[1260] DevelopmentModal                                  │
│ z-[1250] AccountDropdown                                   │
│ z-[1220] PasswordVerificationModal                         │
│ z-[1200] FiltersDropdown                                   │
├─────────────────────────────────────────────────────────────┤
│                    NIVEAU 1000+ (Principal)                 │
├─────────────────────────────────────────────────────────────┤
│ z-[1070] PreferencesModal                                  │
│ z-[1060] AvailabilityModal                                 │
│ z-[1050] PlayerModal                                       │
│ z-[1040] AccountMenu                                       │
│ z-[1030] EventAnnounceModal                                │
│ z-[1020] SelectionModal                                    │
│ z-[1010] EventModal                                        │
├─────────────────────────────────────────────────────────────┤
│                    NIVEAU 1000+ (Onboarding)                │
├─────────────────────────────────────────────────────────────┤
│ z-[1110] PlayerOnboardingModal (désactivé)                 │
│ z-[1100] CreatorOnboardingModal                            │
└─────────────────────────────────────────────────────────────┘
```

## Principes généraux

- **Z-index statiques** : Chaque composant a un z-index fixe défini dans son template
- **Hiérarchie logique** : Les z-index suivent une logique métier (onboarding > grid > modales > dropdowns > toasts)
- **Gaps de sécurité** : Des écarts de 10-50 points entre les niveaux pour permettre l'ajout futur d'éléments intermédiaires

## Hiérarchie complète

### 🎯 Niveau 1000+ : Éléments au-dessus de la grille

| Z-Index | Composant | Description | Fichier |
|---------|-----------|-------------|---------|
| `z-[1100]` | CreatorOnboardingModal | Onboarding créateur | `src/components/CreatorOnboardingModal.vue` |
| `z-[1110]` | PlayerOnboardingModal | Onboarding joueur (désactivé) | `src/components/PlayerOnboardingModal.vue` |

### 🎪 Niveau 1000-1100 : Modales principales

| Z-Index | Composant | Description | Fichier |
|---------|-----------|-------------|---------|
| `z-[1010]` | EventModal | Création/édition d'événement | `src/components/EventModal.vue` |
| `z-[1020]` | SelectionModal | Composition des joueurs | `src/components/SelectionModal.vue` |
| `z-[1030]` | EventAnnounceModal | Annonce d'événement | `src/components/EventAnnounceModal.vue` |
| `z-[1040]` | AccountMenu | Menu compte utilisateur | `src/components/AccountMenu.vue` |
| `z-[1050]` | PlayerModal | Détails du joueur | `src/components/PlayerModal.vue` |
| `z-[1370]` | AvailabilityModal | Gestion des disponibilités | `src/components/AvailabilityModal.vue` |
| `z-[1070]` | PreferencesModal | Préférences utilisateur | `src/components/PreferencesModal.vue` |

### 🔧 Niveau 1200+ : Modales secondaires et dropdowns

| Z-Index | Composant | Description | Fichier |
|---------|-----------|-------------|---------|
| `z-[1200]` | FiltersDropdown | Dropdown des filtres (inline) | `src/components/GridBoard.vue` |
| `z-[1220]` | PasswordVerificationModal | Vérification mot de passe | `src/components/PasswordVerificationModal.vue` |
| `z-[1230]` | PinModal | Saisie du PIN | `src/components/PinModal.vue` |
| `z-[1250]` | AccountDropdown | Menu utilisateur (header) | `src/components/AccountDropdown.vue` |
| `z-[1260]` | DevelopmentModal | Outils de développement | `src/components/DevelopmentModal.vue` |
| `z-[1280]` | AppHelpModal | Aide (supprimé) | `src/components/AppHelpModal.vue` |

### 🔐 Niveau 1300+ : Modales de sécurité et confirmation

| Z-Index | Composant | Description | Fichier |
|---------|-----------|-------------|---------|
| `z-[9997]` | AccountCreationModal | Création de compte | `src/components/AccountCreationModal.vue` |
| `z-[9997]` | AccountLoginModal | Connexion | `src/components/AccountLoginModal.vue` |
| `z-[1310]` | AccountClaimModal | Réclamation de compte | `src/components/AccountClaimModal.vue` |
| `z-[1320]` | PlayerClaimModal | Réclamation de joueur | `src/components/PlayerClaimModal.vue` |
| `z-[1330]` | PasswordResetModal | Reset mot de passe | `src/components/PasswordResetModal.vue` |
| `z-[1340]` | AnnounceModal | Annonces | `src/components/AnnounceModal.vue` |
| `z-[1350]` | NotificationPromptModal | Prompt notifications | `src/components/NotificationPromptModal.vue` |
| `z-[1360]` | NotificationSuccessModal | Succès notifications | `src/components/NotificationSuccessModal.vue` |
| `z-[1370]` | PlayersModal | Liste des joueurs | `src/components/PlayersModal.vue` |
| `z-[1380]` | HowItWorksModal | Comment ça marche | `src/components/HowItWorksModal.vue` |

### 🎨 Niveau 1400+ : Modales spécialisées

| Z-Index | Composant | Description | Fichier |
|---------|-----------|-------------|---------|
| `z-[1400]` | ChangelogModal | Nouveautés (inline) | `src/views/HelpPage.vue` |
| `z-[1400]` | DesistementModal | Désistement | `src/components/DesistementModal.vue` |
| `z-[1400]` | PinModal | Vérification PIN | `src/components/PinModal.vue` |
| `z-[1400]` | PWAInstallModal | Installation PWA | `src/components/PWAInstallModal.vue` |
| `z-[1400]` | ReminderTestModal | Test rappels | `src/components/ReminderTestModal.vue` |
| `z-[1410]` | AvailabilityForgotPasswordModal | Mot de passe oublié (disponibilité) | `src/components/GridBoard.vue` |
| `z-[1420]` | ForgotPasswordModal | Mot de passe oublié (enfant) | `src/components/PasswordVerificationModal.vue` |

### 🎯 Niveau 9990+ : Éléments critiques

| Z-Index | Composant | Description | Fichier |
|---------|-----------|-------------|---------|
| `z-[9995]` | PasswordVerificationModal | Vérification mot de passe (critique) | `src/components/PasswordVerificationModal.vue` |
| `z-[9995]` | ConfirmReselectModal | Confirmation Composition Auto (critique) | `src/components/GridBoard.vue` |
| `z-[9996]` | ForgotPasswordModal | Mot de passe oublié (critique) | `src/components/PasswordVerificationModal.vue` |
| `z-[9996]` | PlayerEditModal | Édition joueur (inline) | `src/components/PlayerModal.vue` |
| `z-[9997]` | PlayerActionDropdowns | Actions joueur (supprimés) | `src/components/PlayerModal.vue` |
| `z-[9998]` | EventActionDropdowns | Actions événement | `src/components/GridBoard.vue` |
| `z-[9999]` | ToastNotifications | Notifications toast | `src/components/GridBoard.vue` |
| `z-[9999]` | EnvironmentBadge | Badge environnement | `src/components/EnvironmentBadge.vue` |

## Modales inline dans GridBoard.vue

Les modales suivantes sont définies inline dans `GridBoard.vue` :

| Z-Index | Modale | Description |
|---------|--------|-------------|
| `z-[1300]` | NewPlayerFormModal | Formulaire nouveau joueur |
| `z-[1310]` | ConfirmDeleteModal | Confirmation suppression |
| `z-[1320]` | ConfirmPlayerDeleteModal | Confirmation suppression joueur |
| `z-[9995]` | ConfirmReselectModal | Confirmation re-composition |
| `z-[1340]` | PlayerPasswordModal | Mot de passe joueur |
| `z-[1350]` | AvailabilityPasswordModal | Mot de passe disponibilité |
| `z-[1360]` | EventDetailsModal | Détails événement |
| `z-[1370]` | AnnouncePromptModal | Prompt annonce |

## Règles de gestion

### ✅ Bonnes pratiques

1. **Respecter la hiérarchie** : Ne pas utiliser un z-index plus élevé sans justification
2. **Gaps de sécurité** : Laisser des écarts de 10-50 points entre les niveaux
3. **Documentation** : Mettre à jour ce fichier lors de l'ajout de nouveaux composants
4. **Tests** : Vérifier l'affichage sur différentes tailles d'écran

### ❌ À éviter

1. **Z-index arbitraires** : Ne pas utiliser des valeurs comme `z-[9999]` sans justification
2. **Conflits** : Éviter les z-index identiques entre composants qui peuvent se superposer
3. **Oubli de documentation** : Toujours documenter les nouveaux z-index

## Cas d'usage spéciaux

### Modales imbriquées
- **Parent** : `z-[1220]` (PasswordVerificationModal)
- **Enfant** : `z-[9996]` (ForgotPasswordModal)
- **Justification** : L'enfant doit apparaître au-dessus du parent

### Dropdowns dans modales
- **Modale** : `z-[1050]` (PlayerModal)
- **Dropdown** : `z-[9997]` (PlayerActionDropdowns - supprimés)
- **Justification** : Le dropdown doit apparaître au-dessus de sa modale parent

### Toasts de notification
- **Z-index** : `z-[9999]`
- **Justification** : Doivent toujours être visibles, même au-dessus des modales

## Maintenance

### Ajout d'un nouveau composant

1. **Identifier le niveau** : Déterminer dans quelle catégorie le composant s'inscrit
2. **Choisir le z-index** : Prendre le prochain z-index disponible dans la catégorie
3. **Tester** : Vérifier l'affichage avec les composants existants
4. **Documenter** : Ajouter l'entrée dans ce fichier

### Modification d'un z-index existant

1. **Analyser l'impact** : Vérifier tous les composants qui pourraient être affectés
2. **Tester** : Effectuer des tests complets sur toutes les pages
3. **Documenter** : Mettre à jour ce fichier
4. **Commit** : Inclure la documentation dans le commit

## Historique des changements

- **2024-01-XX** : Création de la hiérarchie statique après abandon du ModalManager dynamique
- **2024-01-XX** : Correction des imports Firebase Auth dans playerProtection.js
- **2024-01-XX** : Suppression des dropdowns 3-dots problématiques du PlayerModal

---

*Ce document doit être maintenu à jour lors de toute modification des z-index dans l'application.*
