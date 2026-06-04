# E1 — Tour écrans staging (gate V2.0.0 cutover)

**Gate PLAN :** **E1** — checklist parcours membre + orga **signée PO** sur staging.  
**Prérequis :** **E2** migration OK (`validate-replay --min=3`), recette migration UI Malice OK (ton retour).  
**Environnement :** Cloud Run staging (`HATCAST_MIGRATE_API_BASE_STAGING` / URL habituelle `hatcast-v2-staging-*.run.app`).  
**Données :** troupe **La Malice**, saison **Malice 2025-2026** (migrée V1 — pas les seeds Improbots).

**Références :** [sprint-change-proposal V2.0.0](../planning-artifacts/sprint-change-proposal-2026-06-02-v2.0.0-cutover-scope.md), [migration recette Malice](migration-recette-malicie-cycle-1-findings.md), [auth 1.2b](../planning-artifacts/ux-design-auth-inscription-1-2b.md), [MVP pilot local](scripts/v2/MVP-PILOT-RECETTE.md) (scénarios orga, adaptés staging Malice).

---

## Session


| Champ                        | Valeur                            |
| ---------------------------- | --------------------------------- |
| Date                         |                                   |
| URL staging                  |                                   |
| Navigateur / device          |                                   |
| Compte **membre** test       |                                   |
| Compte **orga / admin** test |                                   |
| Saison V2 (slug URL)         | ex. `/saison/la-malice-…`         |
| V1 référence (optionnel)     | `https://selections.la-malice.fr` |


---

## Légende

- `[ ]` à faire · `[x]` OK · `[!]` écart accepté (noter en bas) · `[—]` N/A
- **Bloquant cutover** = empêche signature E1 sans décision PO explicite

---

## 0. Sanity (2 min)

- SPA charge (pas 403 Cloud Run)
- `GET /actuator/health` OK (optionnel)
- Après login : **La Malice** + **Malice 2025-2026** visibles (pas troupe vide / saison brouillon seule)
- Aucune troupe parasite évidente type **migrate-from-v1 preflight** dans l’annuaire (si présente : noter, nettoyage SQL — voir [preprod-reset-and-migrate.md](../../docs/v2/migration/preprod-reset-and-migrate.md))

---

## 1. Auth & compte (cutover 1.2 / 1.2b / 1.3)

Ref. [ux-design-auth-inscription-1-2b.md § Recette](../planning-artifacts/ux-design-auth-inscription-1-2b.md)


| #   | Écran / route                             | Vérification                                                                 | Statut |
| --- | ----------------------------------------- | ---------------------------------------------------------------------------- | ------ |
| 1.1 | `/connexion`                              | Email connu → **Se connecter** → espace membre                               | `[x]`  |
| 1.2 | `/connexion`                              | Lien **Créer un compte** → `/inscription` (pas inscription sur le même form) | `[x]`  |
| 1.3 | `/inscription`                            | Nouveau compte test → confirmation MDP → **Créer mon compte**                | `[x]`  |
| 1.4 | `/inscription`                            | MDP différents → message, pas de compte créé                                 | `[x]`  |
| 1.5 | `/connexion` ou `/inscription`            | **Continuer avec Google** → session OK                                       | `[x]`  |
| 1.6 | Mot de passe oublié (depuis `/connexion`) | Email reçu → reset → reconnexion (**1.3**)                                   | `[x]`  |


---

## 2. Mon compte (17.34–36, 1.6, 1.7)

Route typique : menu compte → **Mon compte** / `/membre/...` (profil unifié 4 onglets).


| #   | Zone               | Vérification                                                                             | Statut                                                                                                                                                                                                        |
| --- | ------------------ | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1 | Navigation onglets | Identité · Sécurité · Notifications · Préférences ( + zone sensible si applicable)       | `[x]`                                                                                                                                                                                                         |
| 2.2 | **Mon profil**     | Pseudo / email affichés, édition cohérente                                               | `[x]`                                                                                                                                                                                                         |
| 2.3 | **Sécurité**       | Changement email / MDP connecté (**1.6**) — flux sans erreur générique                   | `[x]`                                                                                                                                                                                                         |
| 2.4 | **Notifications**  | Raccourcis prefs push / email alignés hub compte                                         | `[!]` accepté — voir **BUG-008** (refresh toggles après activation push) |
| 2.5 | **Zone sensible**  | Suppression compte (**1.7**) — au minimum parcours jusqu’à confirmation (compte jetable) | `[x]`                                                                                                                                                                                                         |


---

## 3. Découverte & navigation membre


| #   | Écran                  | Vérification                                                                                                                                              | Statut |
| --- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 3.1 | `/agenda`              | Liste spectacles à venir Malice, dates lisibles                                                                                                           | `[x]`  |
| 3.2 | `/agenda`              | Filtres / navigation mois OK (mobile + desktop si testé)                                                                                                  | `[x]`  |
| 3.3 | `/troupes` ou annuaire | Cartes troupes publiques (**4.1**) — La Malice visible                                                                                                    | `[x]`  |
| 3.4 | Workspace saison       | Chip / lien **Ma saison** → `/saison/{troupe}/{saison}`                                                                                                   | `[x]`  |
| 3.5 | Fil d’Ariane           | Troupe › Saison cohérent sur workspace et détail spectacle                                                                                                | `[x]`  |
| 3.6 | `/membre/{moi}`        | Stats / clin d’œil — chargement sans erreur                                                                                                               | `[x]`  |
| 3.7 | Stats membre           | Spot-check **désistements / sélections** vs V1 si tu compares (cf. BUG-002 corrigé — [findings migration](migration-recette-malicie-cycle-1-findings.md)) | `[x]`  |


---

## 4. Membre — disponibilités & confirmations

Sur **2–3 spectacles** Malice (1 avec dispos ouvertes, 1 avec compo en cours si dispo).


| #   | Action            | Vérification                                                         | Statut |
| --- | ----------------- | -------------------------------------------------------------------- | ------ |
| 4.1 | Onglet **Dispos** | Changer sujet (moi / autre membre si orga) — états Dispo / Pas dispo | `[x]`  |
| 4.2 | Dispos            | Rôles cochés, enregistrement OK                                      | `[x]`  |
| 4.3 | Onglet **Équipe** | Lecture line-up / état composition                                   | `[x]`  |
| 4.4 | Confirmation      | Si slot « en attente » : confirmer (membre ou proxy orga)            | `[x]`  |


---

## 5. Orga — composition & annonces (6.15)

Compte **admin troupe** — reprendre la logique [MVP-PILOT-RECETTE](scripts/v2/MVP-PILOT-RECETTE.md) sur spectacles Malice réels.


| #   | Scénario                | Vérification                                                                 | Statut |
| --- | ----------------------- | ---------------------------------------------------------------------------- | ------ |
| 5.1 | Spectacle sans compo    | Dispos membres → **Tirage** ou **Assignation** → slots remplis               | `[x]`  |
| 5.2 |                         | **Valider** composition → état cohérent (à compléter / à vérifier / validée) | `[x]`  |
| 5.3 |                         | Confirmer les participants (proxy si besoin) → **équipe complète**           | `[x]`  |
| 5.4 | Menu admin spectacle    | Engrenage dans le header (hors seul onglet Infos si spec E1 event detail)    | `[x]`  |
| 5.5 | **Partager / Annoncer** | Modale M3, copy lisible, WhatsApp / canaux (**6.15**)                        | `[x]`  |
| 5.6 | Notify manuel           | Rappel dispos / annonce — pas de spam évident (garde anti-spam **6.10b**)    | `[x]`  |


---

## 6. Données migration (spot-check)


| #   | Vérification                 | Attendu Malice (ordre de grandeur)                 | Statut |
| --- | ---------------------------- | -------------------------------------------------- | ------ |
| 6.1 | Nombre spectacles saison     | **55** (non tous brouillon)                        | `[-]`  |
| 6.2 | Catégorie **Déplacements**   | **7** événements `deplacements` (**MIG-4**)        | `[-]`  |
| 6.3 | Un spectacle « déplacement » | Filtre / badge catégorie OK                        | `[-]`  |
| 6.4 | Comparaison V1 (optionnel)   | 1 spectacle + dispos + 1 compo : parité acceptable | `[-]`  |


---

## 7. PWA & release client (10.x)


| #   | Vérification                                                             | Statut      |
| --- | ------------------------------------------------------------------------ | ----------- |
| 7.1 | Manifest / icône **HatCast 2** (install si mobile)                       | `[x]`       |
| 7.2 | `version.txt` / version footer cohérente avec release staging            | `[x]`       |
| 7.3 | Dialog **changelog** / nouveautés (si déclenché)                         | `[x]`       |
| 7.4 | Bannière **Mettre à jour** (10.2) — si testable sur ancienne révision SW | `[x]` |
| 7.5 | Aide install PWA (10.5) — optionnel                                      | `[-]`       |


---

## 8. Mobile (≤ 480px) — échantillon


| #   | Écran            | Vérification                                     | Statut |
| --- | ---------------- | ------------------------------------------------ | ------ |
| 8.1 | `/agenda`        | Pas de chevauchement chrome, CTA tactiles ≥ 48dp | `[x]`  |
| 8.2 | Détail spectacle | Onglets Dispos / Équipe / Infos utilisables      | `[x]`  |
| 8.3 | Modale annonce   | Plein écran / scroll OK                          | `[x]`  |


---

## Écarts & décisions


| ID  | Écran | Sévérité | Décision (accepter / corriger / post-M4) |
| --- | ----- | -------- | ---------------------------------------- |
| BUG-008 | Mon compte → Notifications | Low | **Accepter** pour cutover — [ISSUES.md](../../ISSUES.md) |


---

## Signature gate E1


| Rôle | Nom     | Date       | Signature                                                               |
| ---- | ------- | ---------- | ----------------------------------------------------------------------- |
| PO   | Patrice | 04/06/2026 | `[X]` E1 **signé** — staging prêt pour tag prod / M4 (OPS-8 prod `hatcast.app` fait) |


**Note :** E1 ne remplace pas recette **prod** sur `hatcast.app` ni tests **1.2 / 1.3** répétés en prod après OPS-8.