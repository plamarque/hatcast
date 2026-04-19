# Création de spectacle avec rôles d'équipe

## Vue d'ensemble

La modale de création de spectacle a été améliorée pour permettre de définir une équipe complète avec différents rôles, au lieu de simplement spécifier un nombre total de personnes.

## Fonctionnalités

### Section "Équipe"

La nouvelle section "Équipe" remplace l'ancien champ "Nombre de personnes à compositionner" et propose :

- **Rôles principaux** (toujours visibles) :
  - 🎭 Comédiens
  - 🎧 DJ
  - 🎤 MC
  - 🤝 Bénévoles

- **Rôles supplémentaires** (révélés par "Plus de rôles...") :
  - 🙅 Arbitre
  - 💁 Assistants
  - 🔦 Lumière
  - 🧢 Coaches
  - 🎬 Régisseur

### Interface utilisateur

- Champs numériques pré-remplis avec des valeurs par défaut réalistes
- Affichage en grille 2x2 pour les rôles principaux
- Bouton "Plus de rôles..." pour révéler les rôles supplémentaires
- Calcul automatique du total de l'équipe
- Validation qu'il y a au moins un joueur

### Valeurs par défaut

```javascript
{
  comédiens: 6,
  DJ: 1,
  MC: 1,
  bénévoles: 5,
  arbitre: 1,
  assistants: 2,
  lumière: 0,
  coach: 0,
  régisseur: 1
}
```

## Utilisation

### Création d'un spectacle

1. Cliquer sur "Ajouter un spectacle"
2. Remplir le titre, la date et la description
3. Configurer l'équipe en ajustant les nombres pour chaque rôle
4. Cliquer sur "Plus de rôles..." si nécessaire
5. Vérifier le total de l'équipe affiché
6. Créer le spectacle

### Modification d'un spectacle

1. Cliquer sur le bouton d'édition (✏️) d'un spectacle existant
2. Modifier le titre, la date et la description si nécessaire
3. Ajuster la composition de l'équipe en modifiant les nombres pour chaque rôle
4. Utiliser "Plus de rôles..." pour accéder aux rôles supplémentaires
5. Vérifier le total de l'équipe mis à jour
6. Sauvegarder les modifications

## Validation

- Au moins un rôle doit être défini
- Il doit y avoir au moins un joueur
- Les nombres sont limités entre 0 et 20 par rôle

## Rôle "Régisseur" 🎬

Le **Régisseur** est un nouveau rôle ajouté au système pour coordonner l'ensemble du spectacle :

- **Emoji** : 🎬 (clap de cinéma)
- **Valeur par défaut** : 1
- **Position** : Dernier rôle de la liste (révélé par "Plus de rôles...")
- **Fonction** : Coordination générale, organisation logistique, gestion du timing
- **Particularité** : Toujours affiché même avec une valeur de 0

Ce rôle est particulièrement utile pour les spectacles complexes nécessitant une coordination centralisée.

## Stockage

Les rôles sont sauvegardés dans la structure de l'événement et peuvent être utilisés pour :
- La gestion des disponibilités par rôle
- La composition d'équipe
- Les notifications et annonces
- Les statistiques et rapports

### Structure des données

Les rôles sont stockés dans un format simple et cohérent :

```javascript
{
  title: "Mon spectacle",
  date: "2024-01-15",
  playerCount: 6, // Gardé pour compatibilité avec l'ancien système
  roles: {
    player: 6,        // 6 comédiens
    dj: 1,           // 1 DJ
    mc: 1,           // 1 MC
    volunteer: 5,     // 5 bénévoles
    referee: 1,      // 1 arbitre
    assistant_referee: 2, // 2 assistants
    lighting: 0,      // 0 éclairagiste (non affiché)
    coach: 0,         // 0 coach (non affiché)
    stage_manager: 1  // 1 régisseur
  }
}
```

### Cohérence des données

**Problème résolu** : Il y avait une incohérence dans la structure des rôles entre la création et la modification d'événements :
- ❌ **Avant** : `saveEvent` transformait `{ player: 6 }` en `{ player: { count: 6, selected: [] } }`
- ❌ **Avant** : `updateEvent` sauvegardait directement `{ player: 6 }` sans transformation
- ✅ **Après** : Les deux fonctions utilisent maintenant la même structure simple `{ player: 6 }`

Cette correction garantit que les modifications de rôles dans la modale de modification sont bien sauvegardées et persistent en base de données.

### Problème d'initialisation résolu

**Deuxième problème identifié** : Il y avait une incohérence dans l'initialisation des rôles lors de l'ouverture de la modale de modification :

- ❌ **Problème** : La fonction `startEditingFromDetails` (appelée depuis la modale de détail) n'initialisait pas `editingRoles.value`
- ❌ **Résultat** : Les valeurs par défaut étaient toujours utilisées au lieu des valeurs sauvegardées
- ✅ **Solution** : Ajout de l'initialisation des rôles dans `startEditingFromDetails` avec la même logique que `startEditing`

**Fonctions concernées** :
- `startEditing(event)` : Initialise correctement les rôles (utilisée depuis la grille)
- `startEditingFromDetails()` : **Corrigée** pour initialiser aussi les rôles (utilisée depuis la modale de détail)

**Résultat final** : Les modifications de rôles sont maintenant correctement sauvegardées ET affichées lors de la réouverture de la modale de modification.

### Problème de valeur zéro résolu

**Troisième problème identifié** : Il y avait un bug subtil dans l'initialisation des rôles qui empêchait la valeur `0` d'être correctement préservée :

- ❌ **Problème** : L'opérateur `||` remplaçait `0` par les valeurs par défaut car `0` est "falsy" en JavaScript
- ❌ **Exemple** : Si tu mettais "Bénévoles" à 0, la modale le remettait à 5 lors de la réouverture
- ✅ **Solution** : Remplacement de `||` par `??` (coalescence nulle) pour distinguer `0` de `undefined`/`null`

**Différence entre `||` et `??`** :
```javascript
// ❌ Avant (problématique)
0 || 5        // → 5 (0 est falsy, donc remplacé par 5)
undefined || 5 // → 5 (undefined est falsy, donc remplacé par 5)

// ✅ Après (correct)
0 ?? 5        // → 0 (0 est une valeur valide, pas remplacée)
undefined ?? 5 // → 5 (undefined est nullish, donc remplacé par 5)
```

**Fonctions corrigées** :
- `startEditing(event)` : Utilise maintenant `??` pour préserver les valeurs 0
- `startEditingFromDetails()` : Utilise maintenant `??` pour préserver les valeurs 0

**Résultat final** : Tu peux maintenant mettre 0 pour n'importe quel rôle et cette valeur sera correctement sauvegardée ET affichée lors de la réouverture de la modale de modification.

### Problème d'affichage des rôles dans la modale de disponibilité résolu

**Quatrième problème identifié** : La modale "Préciser ma disponibilité" affichait toujours "Aucun rôle n'est attendu pour ce spectacle" même quand des rôles étaient configurés :

- ❌ **Problème** : La prop `:event-roles="availabilityModalData.eventRoles"` était manquante dans le composant `AvailabilityModal`
- ❌ **Résultat** : `props.eventRoles` arrivait comme un objet vide `{}` dans `AvailabilityModal.vue`
- ❌ **Symptôme** : Tous les rôles avaient un count de 0, donc aucun n'était affiché
- ✅ **Solution** : Ajout de la prop manquante dans le template de `GridBoard.vue`

**Diagnostic technique** :
```javascript
// Dans GridBoard.vue - openAvailabilityModal()
eventRoles = { player: 6, dj: 1, mc: 1, ... }  // ✅ Correct

// Dans AvailabilityModal.vue - props.eventRoles
props.eventRoles = {}  // ❌ Vide à cause de la prop manquante !
```

**Fichier corrigé** :
- `src/components/GridBoard.vue` : Ajout de `:event-roles="availabilityModalData.eventRoles"` dans le template

**Résultat final** : La modale de disponibilité affiche maintenant correctement tous les rôles attendus pour le spectacle (ceux dont le nombre > 0).

## 📚 **Documentation complète**

- **[Création de spectacle avec rôles](./creation-spectacle-roles.md)** - Ce document
- **[Composition d'équipe multi-rôles](./selection-multi-roles.md)** - Nouveau système de composition par rôle
- **[Spécifications techniques](../technical/selection-multi-roles-specifications.md)** - Détails techniques pour les développeurs

## 🚀 **Implémentation progressive terminée**

### **Étape 1 : Structure des données ✅**
- ✅ Modification de `saveSelection()` pour supporter la structure par rôle
- ✅ Modification de `loadSelections()` avec migration automatique
- ✅ Ajout de fonctions helper pour manipuler la nouvelle structure
- ✅ Rétrocompatibilité maintenue

### **Étape 2 : Logique de composition ✅**
- ✅ Remplacement de `tirer()` par `drawMultiRoles()`
- ✅ Création de `drawForRole()` pour un rôle spécifique
- ✅ Logique de pénalités par rôle implémentée
- ✅ Gestion des compositions existantes et complétion

### **Étape 3 : Interface utilisateur ✅**
- ✅ Affichage par rôle dans l’onglet Équipe du détail événement (SelectionModal.vue utilisé en inline)
- ✅ Affichage des slots avec emojis et libellés de rôle
- ✅ Gestion des slots vides avec tooltips informatifs
- ✅ Sauvegarde automatique de la structure par rôle

### **Étape 4 : Tests et validation ✅**
- ✅ Build vérifié et fonctionnel
- ✅ Tests de logique créés et validés
- ✅ Documentation mise à jour

## Affichage des rôles et notes

### Représentation visuelle

Dans la liste des personnes de la modale de détail spectacle, les informations sont maintenant affichées de manière visuelle et compacte :

#### Rôles désirés
- **Emojis des rôles** : Chaque rôle désiré par la personne est représenté par son emoji correspondant
- **Affichage compact** : En mode mobile, les emojis sont plus petits pour optimiser l'espace
- **Limitation intelligente** : Maximum 3 rôles affichés avec "..." si plus de rôles
- **Tooltips informatifs** : Survol pour voir le nom complet du rôle

#### Notes et commentaires
- **Icône 📝** : Indique la présence d'un commentaire ou d'une note
- **Cliquable** : Clic pour ouvrir la modale de disponibilité et voir le contenu
- **Couleur dynamique** : Hover en jaune pour indiquer l'interactivité

### Exemples d'affichage

```
🎭 🎧 📝  (Comédien + DJ + Commentaire)
🎤 🤝     (MC + Bénévole)
🎭 ...     (Comédien + autres rôles cachés)
```

### Responsive design

- **Desktop** : Emojis plus grands (`text-lg md:text-base`) pour une meilleure lisibilité
- **Mobile** : Emojis plus petits (`text-sm`) pour optimiser l'espace
- **Compact** : Mode réduit pour les listes denses

### Rôles par défaut

Lors de l'ouverture de la modale de disponibilité pour une nouvelle personne, les rôles sont automatiquement cochés selon la logique suivante :

1. **Priorité aux rôles par défaut** : Si "Comédien" et/ou "Bénévole" sont attendus pour le spectacle, ils sont cochés en priorité
2. **Fallback intelligent** : Si aucun des rôles par défaut n'est attendu, le premier rôle attendu est coché automatiquement
3. **Adaptation contextuelle** : Les rôles cochés par défaut s'adaptent automatiquement aux besoins réels du spectacle

Cette approche incite les personnes à se porter bénévole pour tous les rôles, pas seulement pour les rôles considérés comme "prestigieux", favorisant ainsi une participation équilibrée dans l'équipe.

### Filtrage des rôles affichés

La modale de disponibilité n'affiche que les rôles qui sont réellement attendus pour le spectacle :

- **Rôles visibles** : Seuls les rôles avec un nombre attendu > 0 sont affichés
- **Rôles masqués** : Les rôles avec un nombre attendu = 0 (comme "Lumière" ou "Coach" si non utilisés) ne sont pas affichés
- **Interface claire** : L'utilisateur ne voit que les choix pertinents pour le spectacle en cours
- **Message informatif** : Si aucun rôle n'est attendu, un message explicatif est affiché

**Exemple** : Si un spectacle n'a besoin que de 6 comédiens et 1 DJ, seuls ces deux rôles apparaîtront dans la modale de disponibilité.

### Hiérarchie des z-index

La modale de disponibilité a été positionnée avec un z-index de `z-[600]` pour s'assurer qu'elle s'affiche correctement au-dessus de la modale de détail spectacle (`z-[500]`) et des autres éléments de l'interface.

**Ordre des z-index établis :**
- `z-[100]` / `z-[101]` : Grid header (base layer)
- `z-[500]` : Modales principales (création, modification, détails)
- `z-[550]` : Modale "Ne rate rien !" (notifications)
- `z-[600]` : **Modale de disponibilité**, Modale de confirmation de suppression, Coachmarks d'onboarding
- `z-[700]` : Modale de composition d'équipe
- `z-[800]` : Modale PIN (sécurité)
- `z-[900]` : Modale "Demander confirmation"
- `z-[1000]` : Dropdowns des actions (détail spectacle)
- `z-[9999]` : Dropdown "Composés" (with `!important` inline style)
- `z-[99999]` : Menu agenda (exceptionnellement élevé)

## Compatibilité et migration

### Compatibilité avec l'ancien système

Cette fonctionnalité maintient la compatibilité avec l'ancien système en conservant le champ `playerCount` pour les joueurs, tout en ajoutant le nouveau champ `roles` pour une gestion plus granulaire.

### Migration automatique

- **Événements existants** : Lors de la modification, les anciens événements sans rôles sont automatiquement migrés vers le nouveau système
- **Fallback intelligent** : Si un événement n'a pas de rôles définis, le système utilise `playerCount` comme nombre de comédiens et des valeurs par défaut pour les autres rôles
- **Rétrocompatibilité** : Les anciens événements continuent de fonctionner normalement même sans modification

### Structure des données

```javascript
// Ancien format (compatible)
{
  title: "Mon spectacle",
  playerCount: 6,
  // ... autres champs
}

// Nouveau format (avec rôles)
{
  title: "Mon spectacle",
  playerCount: 6, // Gardé pour compatibilité
  roles: {
    comédiens: 6,
    DJ: 1,
    MC: 1,
    bénévoles: 5,
    arbitre: 1,
    assistants: 2,
    lumière: 0,
    coach: 0
  }
  // ... autres champs
}
```

## Terminologie

### Labels au pluriel (création de spectacle)
- **🎭 Comédiens** : Pour définir le nombre de comédiens dans l'équipe
- **🤝 Bénévoles** : Pour définir le nombre de bénévoles dans l'équipe

### Labels au singulier (disponibilités individuelles)
- **🎭 Comédien** : Pour indiquer sa disponibilité personnelle en tant que comédien
- **🤝 Bénévole** : Pour indiquer sa disponibilité personnelle en tant que bénévole

Cette distinction permet d'avoir une interface claire et contextuellement appropriée selon l'usage :
- **Pluriel** pour la configuration d'équipe (création de spectacle)
- **Singulier** pour les choix individuels (saisie de disponibilité)
