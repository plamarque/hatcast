# Migration — préférences membre au niveau compte (story 17.33)

## Schéma

Flyway `V40__user_member_preferences.sql` ajoute sur `users` :

- `member_display_name` — pseudo membre partagé entre troupes
- `preferred_role_keys` — rôles préférés (JSON, même format que `troupe_memberships.preferred_role_keys`)

## Consolidation des données existantes

Pour chaque utilisateur ayant au moins une adhésion `ACTIVE` :

1. **Pseudo** : `member_display_name` = `display_name` de l’adhésion avec le `updated_at` le plus récent.
2. **Rôles** : `preferred_role_keys` = valeur de la même adhésion (dernière modification).
3. **Harmonisation** : toutes les adhésions `ACTIVE` du user reçoivent ces valeurs (plus de divergence silencieuse inter-troupes).

Utilisateurs sans adhésion active : colonnes laissées à la valeur par défaut (`member_display_name` null, `preferred_role_keys` `[]`).

## API

- Source de vérité : `GET` / `PATCH` `/v1/me/preferences`
- Les endpoints troupe `…/preferred-roles` et `PATCH …/memberships/me` (pseudo) sont dépréciés ; ils délèguent au compte et propagent sur les adhésions actives pour rétrocompatibilité.
