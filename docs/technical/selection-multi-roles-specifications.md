# Spécifications - Composition Multi-Rôles

## Vue d'ensemble

Le système de composition automatique d'équipe doit être étendu pour gérer la composition par rôle au lieu de la composition globale de "joueurs". Chaque rôle a sa propre logique de tirage et de pénalités.

## 🎯 **Principes fondamentaux**

### **Indépendance des rôles**
- Être compositionné pour un rôle **NE RÉDUIT PAS** les chances d'être compositionné pour un autre rôle
- Les pénalités sont **spécifiques au rôle** : si déjà compositionné comme "DJ", ça réduit seulement les chances d'être re-compositionné comme "DJ"

### **Composition unique par personne**
- Une personne ne peut être compositionnée que pour **UN SEUL RÔLE** par spectacle
- Pas de cumul de rôles pour la même personne

### **Ordre des tirages**
- L'ordre des tirages suit `ROLE_PRIORITY_ORDER` pour garantir que les rôles critiques (Arbitre, DJ, MC) sont attribués en priorité
- L'ordre d'affichage suit `ROLE_DISPLAY_ORDER` pour le regroupement visuel dans l'interface

### **Système de priorité des rôles**
Les rôles sont tirés dans l'ordre de priorité suivant :
1. **Arbitre** (Priorité 1) - Critique pour les matchs
2. **DJ** (Priorité 2) - Critique pour le spectacle
3. **MC** (Priorité 3) - Critique pour le spectacle
4. **Improvisateurs** (Priorité 4) - Essentiels
5. **Assistants arbitres** (Priorité 5)
6. **Coach** (Priorité 6)
7. **Régisseur** (Priorité 7) - Coordination
8. **Éclairagiste** (Priorité 8)
9. **Bénévoles** (Priorité 9) - Rôle le moins critique

**Avantage** : Les rôles critiques sont attribués en premier, garantissant qu'un spectacle peut avoir lieu même si certains rôles secondaires ne peuvent pas être pourvus.

## 🏗️ **Structure des données**

### **Avant (ancien système)**
```javascript
selections: {
  eventId: ['Alice', 'Bob', 'Charlie', 'David', 'Eva', 'Fanny']
  // Implicitement : tous compositionnés comme "Comédiens"
}
```

### **Après (nouveau système multi-rôles)**
```javascript
selections: {
  eventId: {
    player: ['Alice', 'Bob', 'Charlie', 'David', 'Eva'],     // 5 comédiens
    mc: ['Fanny'],                                            // 1 MC
    dj: ['Georges'],                                          // 1 DJ
    volunteer: ['Hélène', 'Ismaël'],                          // 2 bénévoles
    referee: [],                                               // 0 arbitre (count = 0)
    assistant_referee: [],                                     // 0 assistant (count = 0)
    lighting: [],                                              // 0 éclairagiste (count = 0)
    coach: [],                                                 // 0 coach (count = 0)
    stage_manager: []                                          // 0 régisseur (count = 0)
  }
}
```

## 🎭 **Affichage de l'équipe compositionnée**

### **Nombre de slots**
- **Total des slots** = Somme de tous les rôles attendus (count > 0)
- **Exemple** : 5 comédiens + 1 MC + 1 DJ + 2 bénévoles = 9 slots

### **Affichage groupé par rôle**
```
[Alice 🎭] [Bob 🎭] [Charlie 🎭] [David 🎭] [Eva 🎭]
[Fanny 🎤]
[Georges 🎧]
[Hélène 🤝] [Ismaël 🤝]
```

### **Slots vides (non remplis)**
- **Libellé court** : "Comédien", "MC", "DJ", "Bénévole"...
- **Tooltip complet** : "Ajouter un comédien", "Ajouter un MC", "Ajouter un DJ"...
- **Style** : Pointillés (déjà existant)
- **Position** : Après les personnes compositionnées pour ce rôle

### **Rôles avec count = 0**
- **Aucun slot affiché** pour ces rôles
- **Exemple** : Si "Lumière" = 0, pas de slot "Lumière"

## 🔄 **Algorithme de composition automatique**

### **Phase 1 : Calcul des besoins**
```javascript
// Pour chaque événement
totalSlots = Object.values(roles).reduce((sum, count) => sum + count, 0)
// Exemple : 5 + 1 + 1 + 2 + 0 + 0 + 0 + 0 + 0 = 9 slots
```

### **Phase 2 : Tirage par rôle**
```javascript
// Pour chaque rôle dans ROLE_DISPLAY_ORDER
// Si count > 0 :
for (const role of ROLE_DISPLAY_ORDER) {
  const count = event.roles[role]
  if (count > 0) {
    // Tirage de 'count' personnes pour ce rôle
    const selected = drawPeopleForRole(role, count, event)
    selections[eventId][role] = selected
  }
}
```

### **Phase 3 : Logique de tirage par rôle**
```javascript
function drawPeopleForRole(role, count, event) {
  // 1. Filtrer les personnes disponibles pour ce rôle
  const available = players.filter(p => 
    p.availability[eventId]?.roles.includes(role)
  )
  
  // 2. Calculer les chances de base (disponibilité + protection)
  const chances = available.map(p => calculateBaseChances(p, event))
  
  // 3. Appliquer les pénalités si déjà compositionné pour ce rôle
  const finalChances = available.map(p => 
    applyRolePenalty(p, role, chances[p], event)
  )
  
  // 4. Tirage aléatoire pondéré
  return weightedRandomSelection(available, finalChances, count)
}
```

### **Phase 4 : Pénalités par rôle**
```javascript
function applyRolePenalty(player, role, baseChances, event) {
  // Si déjà compositionné pour ce rôle → chances réduites
  if (isAlreadySelectedForRole(player, role, event)) {
    return baseChances * PENALTY_MULTIPLIER // Ex: 0.5
  }
  return baseChances
}
```

## 🎨 **Interface utilisateur**

### **Affichage des slots**
- **Regroupement visuel** par rôle
- **Emojis des rôles** dans chaque slot rempli
- **Libellés courts** pour les slots vides
- **Tooltips informatifs** pour les slots vides

### **Exemple complet**
```
Équipe de 9 personnes :

Comédiens (5/5) :
[Alice 🎭] [Bob 🎭] [Charlie 🎭] [David 🎭] [Eva 🎭]

MC (1/1) :
[Fanny 🎤]

DJ (1/1) :
[Georges 🎧]

Bénévoles (2/2) :
[Hélène 🤝] [Ismaël 🤝]
```

## 🔧 **Modifications techniques nécessaires**

### **Fichiers à modifier**
1. **`src/components/GridBoard.vue`**
   - Structure des compositions
   - Logique de composition automatique
   - Affichage des slots

2. **`src/services/storage.js`**
   - Fonctions de sauvegarde des compositions
   - Structure des données

3. **`src/components/SelectionModal.vue`** (si existe)
   - Affichage de la composition par rôle

### **Fonctions à créer/modifier**
1. **`drawMultiRoles(event)`** - Composition automatique complète ✅
2. **`drawForRole(role, count, event)`** - Draw pour un rôle spécifique ✅
3. **`applyRolePenalty(player, role, chances, event)`** - Pénalités par rôle ✅
4. **`displayTeamSlots(selections, roles)`** - Affichage des slots groupés ✅

## 🧪 **Tests et validation**

### **Scénarios de test**
1. **Composition simple** : 1 rôle avec plusieurs personnes
2. **Composition multiple** : Plusieurs rôles avec différentes personnes
3. **Gestion des pénalités** : Vérifier que les pénalités sont spécifiques au rôle
4. **Affichage des slots** : Vérifier le regroupement et les libellés

### **Validation des règles**
- ✅ Une personne ne peut être compositionnée que pour un rôle
- ✅ Les pénalités n'affectent que le rôle concerné
- ✅ L'ordre d'affichage suit ROLE_DISPLAY_ORDER
- ✅ Les rôles avec count = 0 n'ont pas de slots

## 📋 **Checklist d'implémentation**

- [x] Modifier la structure des compositions (par rôle)
- [x] Implémenter la logique de tirage par rôle
- [x] Adapter l'affichage des slots (groupés par rôle)
- [x] Ajouter les emojis des rôles dans les slots
- [x] Gérer les slots vides avec libellés et tooltips
- [x] Tester la logique de pénalités par rôle
- [x] Valider l'affichage final
- [x] Mettre à jour la documentation utilisateur

## 🎯 **Statut d'implémentation**

### **✅ Implémenté et testé**
- Structure des données par rôle dans `storage.js`
- Logique de composition multi-rôles dans `GridBoard.vue`
- Interface utilisateur avec emojis et libellés dans `SelectionModal.vue`
- Sauvegarde et chargement des compositions par rôle
- Rétrocompatibilité avec l'ancien système
- Fonctions helper pour manipulation des données

### **🔄 En cours de validation**
- Tests en conditions réelles
- Validation des scénarios complexes
- Tests de performance

### **📋 Prochaines étapes recommandées**
- Tests utilisateur en conditions réelles
- Optimisations de performance si nécessaire
- Formation des utilisateurs sur le nouveau système
- Collecte de feedback et ajustements

## 🚀 **Ordre d'implémentation recommandé**

1. **Structure des données** - Modifier la structure des compositions
2. **Logique de base** - Implémenter le tirage par rôle
3. **Affichage** - Adapter l'interface des slots
4. **Pénalités** - Implémenter les pénalités spécifiques au rôle
5. **Tests** - Valider tous les scénarios
6. **Documentation** - Mettre à jour la documentation utilisateur
