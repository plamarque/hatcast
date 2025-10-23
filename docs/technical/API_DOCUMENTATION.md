# Documentation API HatCast

## Base URL

- **Local** : `http://localhost:8080/api`
- **Staging** : `https://hatcast-api-staging-xxx.run.app/api`
- **Production** : `https://hatcast-api-xxx.run.app/api`

## Authentification

Toutes les requêtes (sauf `/health` et `/auth/verify-token`) nécessitent un token Firebase Auth dans l'en-tête :

```
Authorization: Bearer <firebase-token>
```

## Endpoints

### Health Check

#### GET /api/health
Vérification de l'état de l'API.

**Réponse :**
```json
{
  "status": "UP",
  "timestamp": "2024-01-15T10:30:00",
  "service": "hatcast-api",
  "version": "1.0.0"
}
```

### Authentification

#### POST /api/auth/verify-token
Vérification d'un token Firebase (utilisé par le frontend).

**Body :**
```json
{
  "token": "firebase-id-token"
}
```

**Réponse :**
```json
{
  "valid": true,
  "message": "Token verification handled by security filter"
}
```

#### GET /api/auth/current-user
Récupération de l'utilisateur connecté.

**Headers :** `Authorization: Bearer <token>`

**Réponse :**
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "displayName": "John Doe",
  "photoURL": "https://...",
  "phone": "+33123456789",
  "role": "USER",
  "preferences": {
    "emailNotifications": true,
    "pushNotifications": true,
    "language": "fr",
    "timezone": "Europe/Paris"
  },
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00",
  "active": true
}
```

#### PUT /api/auth/update-profile
Mise à jour du profil utilisateur.

**Headers :** `Authorization: Bearer <token>`

**Body :**
```json
{
  "displayName": "John Doe",
  "photoURL": "https://...",
  "phone": "+33123456789",
  "preferences": {
    "emailNotifications": false,
    "pushNotifications": true,
    "language": "en",
    "timezone": "America/New_York"
  }
}
```

### Saisons

#### GET /api/seasons
Liste des saisons.

**Headers :** `Authorization: Bearer <token>`

**Query Parameters :**
- `active` (boolean, optional) : Filtrer les saisons actives

**Réponse :**
```json
[
  {
    "id": "season-id",
    "name": "Saison 2024",
    "description": "Description de la saison",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00",
    "active": true
  }
]
```

#### GET /api/seasons/{id}
Détail d'une saison.

**Headers :** `Authorization: Bearer <token>`

**Réponse :** Objet Season (voir structure ci-dessus)

#### POST /api/seasons
Création d'une saison (ADMIN uniquement).

**Headers :** `Authorization: Bearer <token>`

**Body :**
```json
{
  "name": "Saison 2024",
  "description": "Description de la saison",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

#### PUT /api/seasons/{id}
Modification d'une saison (ADMIN uniquement).

**Headers :** `Authorization: Bearer <token>`

**Body :** Objet Season (champs à modifier)

#### DELETE /api/seasons/{id}
Suppression d'une saison (ADMIN uniquement).

**Headers :** `Authorization: Bearer <token>`

### Spectacles

#### GET /api/shows
Liste des spectacles.

**Headers :** `Authorization: Bearer <token>`

**Query Parameters :**
- `seasonId` (string, optional) : Filtrer par saison
- `status` (string, optional) : Filtrer par statut
- `active` (boolean, optional) : Filtrer les spectacles actifs

**Réponse :**
```json
[
  {
    "id": "show-id",
    "title": "Spectacle 1",
    "description": "Description du spectacle",
    "seasonId": "season-id",
    "showDate": "2024-02-15T20:00:00",
    "location": "Théâtre Municipal",
    "maxActors": 10,
    "minActors": 5,
    "status": "DRAFT",
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00",
    "active": true
  }
]
```

#### GET /api/shows/{id}
Détail d'un spectacle.

**Headers :** `Authorization: Bearer <token>`

**Réponse :** Objet Show (voir structure ci-dessus)

#### POST /api/shows
Création d'un spectacle.

**Headers :** `Authorization: Bearer <token>`

**Body :**
```json
{
  "title": "Spectacle 1",
  "description": "Description du spectacle",
  "seasonId": "season-id",
  "showDate": "2024-02-15T20:00:00",
  "location": "Théâtre Municipal",
  "maxActors": 10,
  "minActors": 5
}
```

#### PUT /api/shows/{id}
Modification d'un spectacle.

**Headers :** `Authorization: Bearer <token>`

**Body :** Objet Show (champs à modifier)

#### DELETE /api/shows/{id}
Suppression d'un spectacle.

**Headers :** `Authorization: Bearer <token>`

### Castings

#### GET /api/castings/{showId}
Récupération du casting d'un spectacle.

**Headers :** `Authorization: Bearer <token>`

**Réponse :**
```json
{
  "id": "casting-id",
  "showId": "show-id",
  "castingDate": "2024-02-10T20:00:00",
  "status": "OPEN",
  "availableUserIds": ["user1", "user2"],
  "assignedRoles": {
    "user1": "Protagoniste",
    "user2": "Antagoniste"
  },
  "backupRoles": {
    "user3": "Protagoniste"
  },
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00",
  "active": true
}
```

#### POST /api/castings/{showId}/draw
Tirage automatique du casting.

**Headers :** `Authorization: Bearer <token>`

**Réponse :** Objet Casting mis à jour

#### PUT /api/castings/{showId}/assign
Assignation manuelle des rôles.

**Headers :** `Authorization: Bearer <token>`

**Body :**
```json
{
  "assignedRoles": {
    "user1": "Protagoniste",
    "user2": "Antagoniste"
  },
  "backupRoles": {
    "user3": "Protagoniste"
  }
}
```

#### POST /api/castings/{showId}/validate
Validation finale du casting.

**Headers :** `Authorization: Bearer <token>`

**Réponse :** Objet Casting validé

### Disponibilités

#### GET /api/availabilities/user/{userId}
Disponibilités d'un utilisateur.

**Headers :** `Authorization: Bearer <token>`

**Réponse :**
```json
[
  {
    "id": "availability-id",
    "userId": "user-id",
    "showId": "show-id",
    "available": true,
    "notes": "Disponible sauf le matin",
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  }
]
```

#### PUT /api/availabilities
Mise à jour des disponibilités.

**Headers :** `Authorization: Bearer <token>`

**Body :**
```json
{
  "userId": "user-id",
  "showId": "show-id",
  "available": true,
  "notes": "Disponible sauf le matin"
}
```

#### GET /api/availabilities/show/{showId}
Synthèse des disponibilités pour un spectacle.

**Headers :** `Authorization: Bearer <token>`

**Réponse :**
```json
{
  "showId": "show-id",
  "totalResponses": 15,
  "availableCount": 12,
  "unavailableCount": 3,
  "availabilities": [
    {
      "userId": "user-id",
      "available": true,
      "notes": "Disponible"
    }
  ]
}
```

### Notifications

#### POST /api/notifications/send
Envoi d'une notification.

**Headers :** `Authorization: Bearer <token>`

**Body :**
```json
{
  "userId": "user-id",
  "title": "Nouveau spectacle",
  "message": "Un nouveau spectacle a été ajouté",
  "type": "NEW_SHOW",
  "data": {
    "showId": "show-id"
  }
}
```

#### GET /api/notifications/user/{userId}
Historique des notifications d'un utilisateur.

**Headers :** `Authorization: Bearer <token>`

**Réponse :**
```json
[
  {
    "id": "notification-id",
    "userId": "user-id",
    "title": "Nouveau spectacle",
    "message": "Un nouveau spectacle a été ajouté",
    "type": "NEW_SHOW",
    "status": "SENT",
    "data": {
      "showId": "show-id"
    },
    "createdAt": "2024-01-15T10:30:00",
    "sentAt": "2024-01-15T10:31:00",
    "active": true
  }
]
```

### Statistiques

#### GET /api/stats/season/{seasonId}
Statistiques d'une saison.

**Headers :** `Authorization: Bearer <token>`

**Réponse :**
```json
{
  "seasonId": "season-id",
  "totalShows": 12,
  "totalCastings": 8,
  "totalActors": 25,
  "averageAttendance": 85.5,
  "mostActiveActor": {
    "userId": "user-id",
    "displayName": "John Doe",
    "showsCount": 8
  }
}
```

#### GET /api/stats/user/{userId}
Statistiques d'un acteur.

**Headers :** `Authorization: Bearer <token>`

**Réponse :**
```json
{
  "userId": "user-id",
  "totalShows": 8,
  "totalCastings": 6,
  "attendanceRate": 75.0,
  "favoriteRole": "Protagoniste",
  "lastShow": "2024-01-10T20:00:00"
}
```

### Administration

#### POST /api/admin/users/{id}/role
Modification du rôle d'un utilisateur (ADMIN uniquement).

**Headers :** `Authorization: Bearer <token>`

**Body :**
```json
{
  "role": "ADMIN"
}
```

#### GET /api/admin/audit-logs
Logs d'audit (ADMIN uniquement).

**Headers :** `Authorization: Bearer <token>`

**Query Parameters :**
- `limit` (integer, optional) : Nombre de logs (défaut: 100)
- `offset` (integer, optional) : Décalage (défaut: 0)

#### POST /api/admin/data-export
Export des données (ADMIN uniquement).

**Headers :** `Authorization: Bearer <token>`

**Body :**
```json
{
  "format": "json",
  "includeUsers": true,
  "includeShows": true,
  "includeCastings": true
}
```

## Codes d'erreur

- `400 Bad Request` : Données invalides
- `401 Unauthorized` : Token manquant ou invalide
- `403 Forbidden` : Permissions insuffisantes
- `404 Not Found` : Ressource non trouvée
- `409 Conflict` : Conflit (ex: email déjà utilisé)
- `500 Internal Server Error` : Erreur serveur

## Rate Limiting

- **Limite** : 1000 requêtes/heure par utilisateur
- **Headers de réponse** :
  - `X-RateLimit-Limit` : Limite maximale
  - `X-RateLimit-Remaining` : Requêtes restantes
  - `X-RateLimit-Reset` : Timestamp de réinitialisation