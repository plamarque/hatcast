# Exigences — Suppression de saison

**Implémenté** par story **3-7-suppression-de-saisons-admins-troupe-ou-plateforme** (`review`) — voir [`3-7-suppression-de-saisons-admins-troupe-ou-plateforme.md`](./3-7-suppression-de-saisons-admins-troupe-ou-plateforme.md).

**Backlog :** story **3-7-suppression-de-saisons-admins-troupe-ou-plateforme** (`review`) dans [`sprint-status.yaml`](./sprint-status.yaml) ; récit utilisateur dans [`epics.md`](../planning-artifacts/epics.md) (Story 3.7).

## Objectif

Permettre la **suppression définitive** d’une saison lorsque les acteurs autorisés le décident, avec garde-fous et confirmation explicite — en complément de l’**archivage** déjà prévu (FR11, story 3.1).

## Périmètre actuel (contexte)

- L’UI liste / crée / modifie / archive / active les saisons ; **pas de suppression**.
- L’API Spring n’expose **pas** de `DELETE` sur une saison.
- Les permissions troupe sont encore **provisoires** (toute personne authentifiée peut gérer la troupe seed) ; l’epic membres / rôles remplacera cette règle.

## Acteurs autorisés (cible produit)

| Rôle | Description | Notes d’alignement |
|------|-------------|-------------------|
| **Administrateur de troupe** | Utilisateur disposant du droit de gérer la troupe concernée (CRUD saisons de cette troupe). | Équivalent métier **Season / troupe admin** côté legacy ; à modéliser via adhésion + rôles (FR6–FR8, epic cible). |
| **Administrateur de la plateforme** | Opérateur global (support, opérations) pouvant agir sur n’importe quelle troupe / saison selon la politique produit. | Aligné sur le concept **Super Admin** documenté (liste d’emails / secrets côté infra, cf. [ADR-0005](../../docs/adr/0005-permission-model-super-admin-season.md), [ADMIN_SETUP.md](../../docs/v1/technical/ADMIN_SETUP.md)) ; à porter sur la stack API V2 de façon explicite (claim JWT, config, etc.). |

**Règle d’autorisation :** une suppression est permise si **au moins une** des conditions suivantes est vraie :

1. l’utilisateur est **administrateur de la troupe** à laquelle appartient la saison, **ou**
2. l’utilisateur est **administrateur de la plateforme**.

Les autres identités (**403**).

## Exigences fonctionnelles

1. **Action « Supprimer »** accessible depuis l’interface de gestion des saisons (ex. entrée du menu contextuel de carte saison), **uniquement** pour les utilisateurs satisfaisant la règle d’autorisation ci-dessus.
2. **Confirmation obligatoire** avant toute suppression : dialogue modal avec résumé identifiable (titre, dates, slug ou identifiant), formulation du caractère **irréversible**, actions Annuler / Confirmer.
3. **Endpoint API** : suppression côté serveur (ex. `DELETE /v1/seasons/{seasonId}` ou action dédiée), avec les mêmes contrôles d’autorisation que l’UI ; réponses d’erreur explicites (403, 404, 409 si conflit métier).
4. **Synchronisation liste** : après succès, la saison disparaît de la liste sans rechargement manuel forcé (comportement aligné sur le reste du module saisons).

## Exigences métier à trancher avant implémentation

Les points suivants sont **volontairement ouverts** ; ils doivent figurer dans la story d’implémentation une fois décidés :

- **Prérequis de suppression** : suppression uniquement si la saison n’a **aucun** événement / donnée dépendante ? Ou cascade contrôlée ? Ou suppression réservée aux saisons « vides » (compteurs à `0`) ?
- **Saison active ou archivée** : peut-on supprimer une saison **active** ? Faut-il d’abord désactiver / archiver ?
- **Audit** : journaliser l’acteur, la cible (id saison, troupe), horodatage (alignement futur FR35).
- **Données liées** : politique exacte pour indisponibilités, joueurs, compositions, etc. quand ces entités existeront sur Postgres.

## Exigences non fonctionnelles

- **Sécurité (NFR-S2)** : aucune fuite de donnée par simple énumération d’IDs ; réponses uniformes si besoin.
- **Idempotence** : un second `DELETE` sur la même ressource peut renvoyer **404** ou **204** selon convention API choisie — à documenter dans OpenAPI.

## Artéfacts à mettre à jour lors de l’implémentation

- PRD / inventaire FR (évolution de FR11 ou FR dédiée).
- `epics.md` / story dédiée avec critères d’acceptation fermés.
- `services/api/openapi/seasons.yaml` et tests d’intégration.
- UX : maquette ou section liste saisons dans `ux-design-hatcast-v2.md` si besoin.

## Références

- Story livrée : [3-1-gestion-des-saisons-creation-edition-archivage-et-liste-saisons.md](./3-1-gestion-des-saisons-creation-edition-archivage-et-liste-saisons.md)
- Domaine : [DOMAIN.md](../../DOMAIN.md) (invariant saison active par troupe, cycle de vie).
- Permissions provisoires API : `TroupeAccessService` dans `services/api/`.
