# HatCast V1.0 - Architecture Migrée

## 🎯 Vue d'ensemble

HatCast V1.0 est une refonte complète de l'application de gestion de castings théâtraux, implémentant une architecture robuste et sécurisée avec découplage client/serveur.

## 🏗️ Architecture

### Backend (Spring Boot 3.x)
- **Framework** : Spring Boot 3.x avec Java 17
- **Architecture** : Layered (Controller → Service → Repository)
- **Sécurité** : Spring Security + Firebase Auth
- **Base de données** : Firestore via Firebase Admin SDK
- **Déploiement** : Google Cloud Run (europe-west1)
- **Email** : SendGrid (remplacement de firestore-send-email)

### Frontend (Vue.js 3)
- **Framework** : Vue.js 3 + Composition API
- **State Management** : Pinia
- **Styling** : Tailwind CSS
- **Data Access** : 
  - Firestore SDK (accès direct pour offline/real-time)
  - Axios (API REST pour opérations complexes)
- **Déploiement** : Firebase Hosting
- **Build** : Vite

### Infrastructure
- **Base de données** : Firestore (conservation totale)
- **Authentification** : Firebase Auth
- **Storage** : Firebase Storage
- **Emails** : SendGrid
- **Push Notifications** : Firebase Cloud Messaging
- **Scheduled Jobs** : Cloud Scheduler → Cloud Run endpoints
- **CI/CD** : GitHub Actions

## 🚀 Déploiement

### Prérequis
- Java 17+
- Node.js 18+
- Google Cloud SDK
- Firebase CLI

### Déploiement complet
```bash
# Cloner la branche v1
git checkout v1

# Déploiement automatique
chmod +x scripts/deploy-v1.sh
./scripts/deploy-v1.sh
```

### Déploiement manuel

#### Backend
```bash
cd backend
./mvnw clean package
gcloud builds submit --config cloudbuild.yaml .
gcloud run deploy hatcast-api --image=gcr.io/PROJECT_ID/hatcast-api:latest
```

#### Frontend
```bash
cd frontend-v1
npm install
npm run build
firebase deploy --only hosting
```

## 📁 Structure du projet

```
hatcast-v1/
├── backend/                    # API Spring Boot
│   ├── src/main/java/com/hatcast/
│   │   ├── domain/            # Modèles et interfaces
│   │   ├── application/       # Services métier
│   │   ├── infrastructure/    # Implémentations techniques
│   │   └── presentation/      # Controllers REST
│   ├── src/test/              # Tests unitaires
│   └── cloudbuild.yaml        # Configuration Cloud Build
├── frontend-v1/               # Application Vue.js
│   ├── src/
│   │   ├── stores/           # Stores Pinia
│   │   ├── services/         # Services API et Firestore
│   │   ├── views/            # Vues de l'application
│   │   └── components/       # Composants réutilisables
│   └── vite.config.js        # Configuration Vite
├── scripts/                   # Scripts de déploiement
│   ├── deploy-v1.sh          # Déploiement complet
│   ├── migrate-data.sh       # Migration des données
│   └── cloud-scheduler-setup.sh
└── docs/                     # Documentation
    └── technical/            # Documentation technique
```

## 🔧 Configuration

### Variables d'environnement

#### Backend
```bash
FIREBASE_PROJECT_ID=hatcast-prod
FIREBASE_DATABASE_ID=(default)
FIREBASE_SERVICE_ACCOUNT_KEY=...
SENDGRID_API_KEY=...
SENDGRID_FROM_EMAIL=noreply@hatcast.com
SENDGRID_FROM_NAME=HatCast
```

#### Frontend
```bash
VITE_API_BASE_URL=https://hatcast-api-xxx.run.app/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=hatcast-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=hatcast-prod
```

## 🧪 Tests

### Backend
```bash
cd backend
./mvnw test
```

### Frontend
```bash
cd frontend-v1
npm run test:unit
npm run test:e2e
```

## 📊 API

### REST API
- **Base URL** : `https://hatcast-api-xxx.run.app/api`
- **Documentation** : [API_DOCUMENTATION.md](docs/technical/API_DOCUMENTATION.md)

### MCP API (Agents IA)
- **Base URL** : `https://hatcast-api-xxx.run.app/mcp`
- **Documentation** : [MCP_API_DOCUMENTATION.md](docs/technical/MCP_API_DOCUMENTATION.md)

## 🔐 Sécurité

### Authentification
- Firebase Auth pour l'authentification
- Tokens JWT pour l'autorisation API
- Rôles : ADMIN, USER, GUEST

### Firestore Security Rules
- Écriture limitée aux champs autorisés
- Logique métier centralisée dans l'API
- Validation côté serveur

## 📈 Monitoring

### Health Checks
- Backend : `/api/health`
- Métriques Spring Actuator
- Logs structurés

### Alertes
- Cloud Run métriques
- Firestore quotas
- SendGrid délivrabilité

## 🔄 Migration

### Migration des données
```bash
chmod +x scripts/migrate-data.sh
./scripts/migrate-data.sh
```

### Rollback
```bash
# Rollback API
gcloud run services update-traffic hatcast-api --to-revisions=PREVIOUS_REVISION=100

# Rollback Frontend
firebase hosting:rollback
```

## 📚 Documentation

- [Architecture Spring Boot](docs/technical/SPRING_BOOT_ARCHITECTURE.md)
- [Documentation API](docs/technical/API_DOCUMENTATION.md)
- [API MCP](docs/technical/MCP_API_DOCUMENTATION.md)
- [Guide de déploiement](docs/technical/DEPLOYMENT_GUIDE.md)

## 🆘 Support

### Problèmes courants
1. **Erreur d'authentification** : Vérifier les tokens Firebase
2. **Erreur de base de données** : Vérifier les permissions Firestore
3. **Erreur d'email** : Vérifier la configuration SendGrid

### Logs
- Backend : Cloud Run logs
- Frontend : Browser console
- Base de données : Firestore logs

## 🎉 Fonctionnalités V1.0

### ✅ Implémentées
- [x] Architecture en couches Spring Boot
- [x] API REST complète
- [x] Authentification Firebase
- [x] Frontend Vue.js 3 + Pinia
- [x] Services Firestore temps réel
- [x] Migration SendGrid
- [x] API MCP pour agents IA
- [x] Scheduled Jobs Cloud Scheduler
- [x] Tests unitaires et E2E
- [x] CI/CD GitHub Actions
- [x] Documentation complète

### 🔄 En cours
- [ ] Migration des vues frontend
- [ ] Tests de charge
- [ ] Optimisations performance

### 📋 À venir
- [ ] Cache Redis
- [ ] Monitoring avancé
- [ ] Analytics détaillées

## 📞 Contact

- **Développeur** : Assistant IA
- **Projet** : HatCast V1.0
- **Branche** : v1
- **Version** : 1.0.0