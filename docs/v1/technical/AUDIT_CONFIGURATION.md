# 🔇 Configuration de l'Audit en Développement

## Vue d'ensemble

Par défaut, les logs d'audit sont **désactivés** en environnement de développement pour éviter de générer trop de données lors du développement.

## Variables d'Environnement

### `VITE_AUDIT_ENABLED`

- **Valeur par défaut** : `false` (non définie)
- **Valeurs possibles** : `true` ou `false`
- **Environnement** : Développement local uniquement

## Activation Temporaire

Pour activer l'audit pendant le développement :

1. **Créer/modifier le fichier `.env.local`** :
```bash
# Activer l'audit en développement
VITE_AUDIT_ENABLED=true
```

2. **Redémarrer le serveur de développement** :
```bash
npm run dev -- --host
```

## Désactivation

Pour désactiver l'audit :

1. **Supprimer ou commenter la variable** dans `.env.local` :
```bash
# VITE_AUDIT_ENABLED=true
```

2. **Ou la définir explicitement** :
```bash
VITE_AUDIT_ENABLED=false
```

3. **Redémarrer le serveur de développement**

## Logs de Debug

Quand l'audit est désactivé en développement, les actions critiques (erreurs) sont toujours loggées dans la console avec le préfixe `🔇 AUDIT DISABLED (dev mode)`.

## Environnements

- **Développement local** : Audit désactivé par défaut (configurable)
- **Staging** : Audit toujours activé
- **Production** : Audit toujours activé
- **Tests** : Audit toujours désactivé

## Cas d'Usage

### Développement Normal
- Audit désactivé pour éviter la pollution des logs
- Performance optimisée
- Console plus propre

### Debug d'Audit
- Activer temporairement avec `VITE_AUDIT_ENABLED=true`
- Tester la fonctionnalité d'audit
- Diagnostiquer les problèmes

### Tests
- Audit automatiquement désactivé
- Pas de pollution des données de test
- Isolation complète
