# Documentation API MCP - HatCast

## Vue d'ensemble

L'API MCP (Model Context Protocol) de HatCast permet aux agents IA d'interagir avec les données de l'application de gestion de castings théâtraux.

## Base URL

- **Local** : `http://localhost:8080/mcp`
- **Staging** : `https://hatcast-api-staging-xxx.run.app/mcp`
- **Production** : `https://hatcast-api-xxx.run.app/mcp`

## Authentification

L'API MCP est ouverte et ne nécessite pas d'authentification pour les requêtes de lecture. Les agents IA peuvent accéder aux données publiques sans token.

## Endpoints

### GET /mcp/seasons
Récupération de toutes les saisons actives.

**Réponse :**
```json
{
  "success": true,
  "data": [
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
  ],
  "count": 1,
  "description": "Liste des saisons théâtrales actives"
}
```

### GET /mcp/shows
Récupération des spectacles avec filtres optionnels.

**Query Parameters :**
- `seasonId` (string, optional) : Filtrer par saison
- `status` (string, optional) : Filtrer par statut

**Exemple :**
```
GET /mcp/shows?seasonId=season-123&status=DRAFT
```

**Réponse :**
```json
{
  "success": true,
  "data": [
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
  ],
  "count": 1,
  "filters": {
    "seasonId": "season-123",
    "status": "DRAFT"
  },
  "description": "Liste des spectacles avec filtres appliqués"
}
```

### GET /mcp/stats
Récupération des statistiques agrégées.

**Réponse :**
```json
{
  "success": true,
  "data": {
    "totalSeasons": 3,
    "totalShows": 12,
    "activeSeasons": 2,
    "activeShows": 8,
    "showsByStatus": {
      "DRAFT": 3,
      "PUBLISHED": 5,
      "CASTING_OPEN": 2,
      "CASTING_CLOSED": 1,
      "CASTED": 1
    }
  },
  "description": "Statistiques agrégées de HatCast"
}
```

### POST /mcp/query
Requêtes en langage naturel.

**Body :**
```json
{
  "query": "Combien y a-t-il de spectacles cette saison ?"
}
```

**Réponse :**
```json
{
  "success": true,
  "query": "Combien y a-t-il de spectacles cette saison ?",
  "result": {
    "type": "shows",
    "data": [
      {
        "id": "show-1",
        "title": "Spectacle 1",
        "seasonId": "season-123",
        "status": "PUBLISHED"
      }
    ],
    "count": 1
  },
  "description": "Résultat de la requête en langage naturel"
}
```

## Types de requêtes supportées

### Requêtes sur les saisons
- "Liste des saisons"
- "Quelles sont les saisons actives ?"
- "Combien y a-t-il de saisons ?"

### Requêtes sur les spectacles
- "Liste des spectacles"
- "Quels sont les spectacles de cette saison ?"
- "Combien y a-t-il de spectacles ?"
- "Quels sont les spectacles en cours de casting ?"

### Requêtes sur les statistiques
- "Statistiques de l'application"
- "Résumé des données"
- "Combien d'éléments au total ?"

## Codes d'erreur

- `400 Bad Request` : Requête invalide (ex: query manquante)
- `500 Internal Server Error` : Erreur serveur

## Format des erreurs

```json
{
  "success": false,
  "error": "Description de l'erreur"
}
```

## Rate Limiting

- **Limite** : 100 requêtes/minute par IP
- **Headers de réponse** :
  - `X-RateLimit-Limit` : Limite maximale
  - `X-RateLimit-Remaining` : Requêtes restantes
  - `X-RateLimit-Reset` : Timestamp de réinitialisation

## Exemples d'utilisation

### Avec curl
```bash
# Récupérer les saisons
curl -X GET "https://hatcast-api-xxx.run.app/mcp/seasons"

# Récupérer les spectacles
curl -X GET "https://hatcast-api-xxx.run.app/mcp/shows?status=PUBLISHED"

# Requête en langage naturel
curl -X POST "https://hatcast-api-xxx.run.app/mcp/query" \
  -H "Content-Type: application/json" \
  -d '{"query": "Combien y a-t-il de spectacles cette saison ?"}'
```

### Avec JavaScript
```javascript
// Récupérer les statistiques
const response = await fetch('https://hatcast-api-xxx.run.app/mcp/stats');
const data = await response.json();
console.log(data.data.totalShows);

// Requête en langage naturel
const queryResponse = await fetch('https://hatcast-api-xxx.run.app/mcp/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: 'Liste des spectacles de la saison 2024'
  })
});
const queryData = await queryResponse.json();
console.log(queryData.result.data);
```

## Intégration avec les agents IA

### Claude (Anthropic)
```python
import requests

def query_hatcast(query):
    response = requests.post(
        'https://hatcast-api-xxx.run.app/mcp/query',
        json={'query': query}
    )
    return response.json()

# Exemple d'utilisation
result = query_hatcast("Combien y a-t-il de spectacles actifs ?")
print(f"Nombre de spectacles : {result['result']['count']}")
```

### ChatGPT (OpenAI)
```javascript
// Fonction pour interroger HatCast
async function queryHatCast(query) {
  const response = await fetch('https://hatcast-api-xxx.run.app/mcp/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });
  
  return await response.json();
}

// Exemple d'utilisation
const result = await queryHatCast("Quels sont les spectacles en cours de casting ?");
console.log(result.result.data);
```

## Évolutions futures

- Support de requêtes plus complexes
- Filtres avancés sur les données
- Export des données en différents formats
- Intégration avec d'autres protocoles IA
- Cache intelligent pour les requêtes fréquentes