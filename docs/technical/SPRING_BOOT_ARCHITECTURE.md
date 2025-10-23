# Architecture Spring Boot - HatCast API

## Vue d'ensemble

L'API HatCast est construite avec Spring Boot 3.x et suit une architecture en couches (layered architecture) pour une séparation claire des responsabilités.

## Structure du projet

```
backend/
├── src/main/java/com/hatcast/
│   ├── HatCastApplication.java              # Point d'entrée Spring Boot
│   ├── domain/                              # Couche Domaine
│   │   ├── model/                          # Entités métier
│   │   │   ├── User.java
│   │   │   ├── Season.java
│   │   │   ├── Show.java
│   │   │   ├── Casting.java
│   │   │   ├── Availability.java
│   │   │   └── Notification.java
│   │   └── repository/                     # Interfaces Repository
│   │       ├── UserRepository.java
│   │       ├── SeasonRepository.java
│   │       ├── ShowRepository.java
│   │       ├── CastingRepository.java
│   │       ├── AvailabilityRepository.java
│   │       └── NotificationRepository.java
│   ├── application/                        # Couche Application
│   │   └── service/                        # Services métier
│   │       ├── UserService.java
│   │       ├── SeasonService.java
│   │       ├── ShowService.java
│   │       ├── CastingService.java
│   │       ├── AvailabilityService.java
│   │       └── NotificationService.java
│   ├── infrastructure/                     # Couche Infrastructure
│   │   ├── firebase/                       # Configuration Firebase
│   │   │   └── FirebaseConfig.java
│   │   ├── firestore/                      # Implémentations Firestore
│   │   │   ├── FirestoreUserRepository.java
│   │   │   ├── FirestoreSeasonRepository.java
│   │   │   └── ...
│   │   └── security/                       # Sécurité
│   │       ├── SecurityConfig.java
│   │       ├── FirebaseAuthenticationProvider.java
│   │       ├── FirebaseAuthenticationToken.java
│   │       └── FirebaseAuthenticationFilter.java
│   └── presentation/                       # Couche Présentation
│       └── controller/                     # Controllers REST
│           ├── HealthController.java
│           ├── AuthController.java
│           ├── SeasonController.java
│           ├── ShowController.java
│           ├── CastingController.java
│           ├── AvailabilityController.java
│           ├── NotificationController.java
│           └── AdminController.java
└── src/main/resources/
    └── application.yml                     # Configuration
```

## Architecture en couches

### 1. Couche Domaine (Domain Layer)
- **Responsabilité** : Logique métier pure, indépendante de l'infrastructure
- **Contient** : Entités, Value Objects, Interfaces Repository
- **Principe** : Aucune dépendance vers les couches externes

### 2. Couche Application (Application Layer)
- **Responsabilité** : Orchestration des cas d'usage métier
- **Contient** : Services applicatifs, DTOs, Mappers
- **Principe** : Utilise les interfaces du domaine, implémente la logique métier

### 3. Couche Infrastructure (Infrastructure Layer)
- **Responsabilité** : Détails techniques (base de données, sécurité, external services)
- **Contient** : Implémentations Firestore, Configuration Firebase, Sécurité
- **Principe** : Implémente les interfaces définies dans le domaine

### 4. Couche Présentation (Presentation Layer)
- **Responsabilité** : Interface avec les clients (REST API, MCP)
- **Contient** : Controllers, DTOs de présentation, Validation
- **Principe** : Délègue la logique métier aux services applicatifs

## Flux de données

```
Client Request
     ↓
Controller (Presentation)
     ↓
Service (Application)
     ↓
Repository Interface (Domain)
     ↓
Firestore Implementation (Infrastructure)
     ↓
Firestore Database
```

## Sécurité

### Authentification Firebase
- Validation des tokens Firebase Auth
- Extraction des informations utilisateur
- Gestion des rôles (ADMIN, USER, GUEST)

### Autorisation
- Spring Security avec annotations
- Filtres personnalisés pour Firebase
- CORS configuré pour le frontend

## Configuration

### Environnements
- **local** : Développement local
- **staging** : Tests et validation
- **production** : Environnement de production

### Variables d'environnement
- `FIREBASE_PROJECT_ID` : ID du projet Firebase
- `FIREBASE_DATABASE_ID` : ID de la base Firestore
- `FIREBASE_SERVICE_ACCOUNT_KEY` : Clé de service Firebase
- `SENDGRID_API_KEY` : Clé API SendGrid
- `SENDGRID_FROM_EMAIL` : Email expéditeur
- `SENDGRID_FROM_NAME` : Nom expéditeur

## Déploiement

### Cloud Run
- Container Docker avec OpenJDK 17
- Configuration automatique via Cloud Build
- Scaling automatique (1-10 instances)
- Région : europe-west1

### CI/CD
- GitHub Actions pour les tests et déploiements
- Tests automatiques sur chaque PR
- Déploiement staging puis production
- Rollback automatique en cas d'échec

## Monitoring

### Health Checks
- Endpoint `/api/health` pour la surveillance
- Métriques Spring Actuator
- Logs structurés avec timestamps

### Logging
- Niveaux configurables par environnement
- Logs de sécurité et d'authentification
- Traçabilité des opérations métier