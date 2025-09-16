# Composition d'équipe multi-rôles

## Vue d'ensemble

Le système de composition automatique d'équipe a été étendu pour gérer la composition par rôle au lieu de la composition globale de "joueurs". Chaque rôle a sa propre logique de tirage et de pénalités.

## 🎯 **Comment ça fonctionne maintenant**

### **Avant (ancien système)**
- Composition automatique de X "joueurs" (implicitement tous comédiens)
- Affichage simple : [Alice] [Bob] [Charlie] [David] [Eva] [Fanny]

### **Après (nouveau système multi-rôles)**
- Composition automatique par rôle : X comédiens, Y DJ, Z MC, etc.
- Affichage détaillé avec emojis des rôles : [Alice 🎭] [Bob 🎧] [Charlie 🎤]

## 🎭 **Affichage de l'équipe compositionnée**

### **Slots remplis**
Chaque slot affiche :
- **Nom de la personne** compositionnée
- **Emoji du rôle** pour lequel elle a été compositionnée

**Exemples d'emojis :**
- 🎭 Comédien
- 🎧 DJ
- 🎤 MC
- 🤝 Bénévole
- 🙅 Arbitre
- 💁 Assistant
- 🔦 Lumière
- 🧢 Coach
- 🎬 Régisseur

### **Slots vides (non remplis)**
Les slots non remplis affichent :
- **Libellé court** du rôle : "Comédien", "MC", "DJ"...
- **Tooltip complet** au survol : "Ajouter un comédien", "Ajouter un MC"...
- **Style en pointillés** pour indiquer qu'ils sont disponibles

### **Regroupement par rôle**
L'équipe est affichée groupée par rôle dans l'ordre logique :
```
[Alice 🎭] [Bob 🎭] [Charlie 🎭] [David 🎭] [Eva 🎭]
[Fanny 🎤]
[Georges 🎧]
[Hélène 🤝] [Ismaël 🤝]
```

## 🔄 **Logique de composition automatique**

### **Principe d'indépendance des rôles**
- Être compositionné pour un rôle **NE RÉDUIT PAS** tes chances d'être compositionné pour un autre rôle
- **Exemple** : Si tu es compositionné comme "Bénévole", ça n'affecte PAS tes chances d'être compositionné comme "Comédien"

### **Pénalités spécifiques au rôle**
- Les pénalités ne s'appliquent que si tu es **déjà compositionné pour le même rôle**
- **Exemple** : Si tu as déjà été compositionné comme "DJ" récemment, tes chances d'être re-compositionné comme "DJ" sont réduites, mais pas tes chances pour les autres rôles

### **Ordre de priorité des rôles**
Les rôles sont tirés dans un ordre de priorité pour garantir que les rôles critiques sont pourvus en premier :

1. **Arbitre** (priorité 1) - Critique pour les matchs
2. **DJ** (priorité 2) - Critique pour le spectacle
3. **MC** (priorité 3) - Critique pour le spectacle
4. **Joueurs** (priorité 4) - Rôle principal
5. **Assistants arbitres** (priorité 5) - Pour les matchs
6. **Coach** (priorité 6)
7. **Régisseur** (priorité 7) - Coordination
8. **Éclairagiste** (priorité 8) - Rôle technique
9. **Bénévoles** (priorité 9) - Rôle de soutien

**Avantage** : Même si certains rôles secondaires ne peuvent pas être pourvus, le spectacle peut toujours avoir lieu grâce aux rôles prioritaires.

### **Composition unique par personne**
- Une personne ne peut être compositionnée que pour **UN SEUL RÔLE** par spectacle
- Pas de cumul de rôles pour la même personne

## 📊 **Exemple concret**

### **Configuration du spectacle**
- 5 Comédiens
- 1 MC
- 1 DJ
- 2 Bénévoles
- **Total** : 9 personnes

### **Résultat de la composition automatique**
```
Comédiens (5/5) :
[Alice 🎭] [Bob 🎭] [Charlie 🎭] [David 🎭] [Eva 🎭]

MC (1/1) :
[Fanny 🎤]

DJ (1/1) :
[Georges 🎧]

Bénévoles (2/2) :
[Hélène 🤝] [Ismaël 🤝]
```

### **Slots vides (si composition incomplète)**
Si la composition n'est pas complète, les slots vides s'affichent :
```
[Alice 🎭] [Bob 🎭] [Charlie 🎭]
[--- Comédien ---] [--- Comédien ---]  // 2 slots vides pour comédiens
[Fanny 🎤]
[--- DJ ---]  // 1 slot vide pour DJ
[Hélène 🤝]
[--- Bénévole ---]  // 1 slot vide pour bénévole
```

## 🎲 **Comment sont calculées tes chances**

### **Chances de base**
1. **Disponibilité** : Tu as indiqué être disponible pour ce rôle
2. **Protection** : Tu es dans la liste des joueurs protégés
3. **Historique** : Tes performances et participations passées

### **Pénalités appliquées**
- **Pénalité par rôle** : Si tu as déjà été compositionné pour ce rôle récemment
- **Pas de pénalité croisée** : Être compositionné pour un autre rôle n'affecte pas tes chances

### **Exemple de calcul**
```
Alice - Comédien :
- Chances de base : 100%
- Pénalité (si déjà compositionnée comme comédienne) : 50%
- Chances finales : 50%

Alice - DJ :
- Chances de base : 100%
- Pas de pénalité (jamais compositionnée comme DJ)
- Chances finales : 100%
```

## 🔧 **Utilisation pratique**

### **Voir l'équipe compositionnée**
1. Clique sur le bouton **"Composition Équipe"** d'un spectacle
2. L'équipe s'affiche avec les emojis des rôles
3. Les slots vides montrent les rôles manquants

### **Comprendre la composition**
- **Emojis** : Indiquent le rôle de chaque personne
- **Slots vides** : Montrent quels rôles sont encore à pourvoir
- **Regroupement** : Facilite la lecture par type de rôle

### **Gestion des modifications**
- Tu peux toujours modifier manuellement la composition
- Les règles de pénalités s'appliquent lors de la prochaine composition automatique

## ❓ **Questions fréquentes**

### **Q : Pourquoi suis-je compositionné pour ce rôle et pas pour celui que je préfère ?**
**R :** La composition automatique prend en compte tes disponibilités, tes chances de base et les pénalités. Si tu préfères un autre rôle, assure-toi d'être disponible pour ce rôle.

### **Q : Être compositionné comme bénévole réduit-il mes chances d'être comédien ?**
**R :** **NON !** Les rôles sont indépendants. Être compositionné comme bénévole n'affecte PAS tes chances d'être compositionné comme comédien.

### **Q : Comment augmenter mes chances pour un rôle spécifique ?**
**R :** Indique ta disponibilité pour ce rôle, participe régulièrement, et évite d'être compositionné pour ce même rôle trop souvent.

### **Q : Pourquoi certains rôles n'ont pas de slots ?**
**R :** Seuls les rôles avec un nombre de personnes attendues > 0 ont des slots. Si "Lumière" = 0, il n'y aura pas de slot pour ce rôle.

## 🎉 **Avantages du nouveau système**

- **Plus équitable** : Chaque rôle a sa propre logique de composition
- **Plus transparent** : Tu vois exactement pour quel rôle tu es compositionné
- **Plus flexible** : Les pénalités sont spécifiques au rôle, pas globales
- **Meilleure visibilité** : L'affichage groupé facilite la compréhension de l'équipe

## 🚀 **Statut d'implémentation**

### **✅ Système implémenté et opérationnel**
Le nouveau système de composition multi-rôles a été entièrement implémenté et est maintenant disponible dans l'application Hatcast.

### **🎯 Fonctionnalités disponibles**
- **Composition automatique par rôle** : Chaque rôle est tiré indépendamment
- **Affichage groupé des slots** : Les équipes sont organisées par rôle avec emojis
- **Gestion des pénalités par rôle** : Les chances sont réduites uniquement pour le rôle concerné
- **Interface intuitive** : Slots vides avec libellés informatifs et tooltips
- **Rétrocompatibilité** : Les anciennes compositions continuent de fonctionner

### **🔧 Comment l'utiliser**
1. **Créer un spectacle** avec des rôles et effectifs définis
2. **Lancer la composition automatique** via le bouton "Composition Auto" (appelle `drawMultiRoles`)
3. **Visualiser l'équipe** organisée par rôle dans la modale de composition
4. **Ajuster manuellement** si nécessaire en cliquant sur les slots
5. **Confirmer la composition** une fois satisfait de l'équipe

### **📱 Interface utilisateur**
- **Slots remplis** : Nom du joueur + emoji du rôle (ex: "Alice 🎭")
- **Slots vides** : Libellé court du rôle (ex: "Comédien") avec tooltip complet
- **Regroupement visuel** : Les slots sont organisés par rôle dans l'ordre logique
- **Statuts de confirmation** : Indicateurs visuels pour chaque joueur compositionné
