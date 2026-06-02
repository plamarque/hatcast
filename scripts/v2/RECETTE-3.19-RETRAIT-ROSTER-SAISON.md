# Recette manuelle — Story 3.19 · Retrait roster saison (sans désactivation troupe)

Cahier de recette **manuelle** de la pyramide de retrait à trois niveaux
(**événement → saison → troupe**). À exécuter avant d'envisager l'automatisation E2E
(voir § *Suite : automatisation E2E*).

## Objet

Valider qu'un·e admin peut retirer un membre **du roster d'une seule saison** sans
désactiver son adhésion à la troupe, que la synchronisation ne le **ressuscite pas**,
et que les trois niveaux de retrait restent **étanches** (un niveau n'en déclenche pas
un autre, sauf la cascade descendante troupe → saisons).

## Références

- Story : `_bmad-output/implementation-artifacts/3-19-retrait-roster-saison-sans-desactivation-troupe.md`
- SCP : `_bmad-output/planning-artifacts/sprint-change-proposal-2026-05-31-participant-removal-three-levels.md`
- Plan de test : `_bmad-output/test-artifacts/test-design-epic-3.19.md` (IDs `3.19-*` cités ci-dessous)
- DOMAIN.md — *Three-level participant removal (V2)*

## Prérequis

1. Base locale migrée **jusqu'à V38 incluse** (`season_participant_removal_source`) :
   redémarrer l'API ou `./scripts/start-dev.sh`.
2. App lancée : API `http://127.0.0.1:8080`, front **`https://localhost:4200`**.
3. Connexion **super admin / admin troupe + orga saison** (`patrice.lamarque@gmail.com`
   ou un compte équivalent ayant `canManageMembers`).
   - **Super admin sans adhésion** : accès direct par URL (`/troupes/les-improbots`,
     `/saison/les-improbots-2026-2027/admin/participants`, etc.) — pas besoin de rejoindre
     la troupe ni de la voir dans « Mes troupes ». Prérequis : `HATCAST_SUPER_ADMIN_EMAILS`
     inclut votre email.
   - **Sinon** : rejoindre Les Improbots (`POST …/memberships/me` ou compte seed
     `patrice@seed.improbots.test`).
4. **Données** : une troupe avec **au moins deux saisons** (appelées ici **Saison A** et
   **Saison B**) partageant **un même membre** synchronisé sur les deux rosters.
   - Playground conseillé : troupe de dev **Les Improbots** (`db/seed`). Si une seule
     saison existe, en créer une seconde et y ajouter le même membre.
   - **Ne pas** utiliser **La Malice** (données de migration réelles).
5. Choisir un **membre cible** présent sur A **et** B (noté **M**), un **participant
   externe name-only** (noté **X**) sur la Saison A, et un **événement** futur sur la
   Saison A (noté **E**).

## Surfaces et libellés de référence

> Toute divergence de libellé = écart à consigner.

| Surface | Route (canonique) | Action | Dialogue / message exact |
|---|---|---|---|
| **Roster saison** (membre M) | `/saison/:slug/admin/participants` | « Retirer » (icône, `aria-label="Retirer ce membre de la saison"`) | Titre **« Retirer de cette saison ? »** · Corps *« Il disparaîtra du roster, des statistiques et des sélecteurs de cette saison. Son adhésion à la troupe est conservée. »* · Bouton **« Retirer »** · Snackbar **« Membre retiré de la saison. »** |
| **Roster saison** (externe X) | `/saison/:slug/admin/participants` | « Retirer » | Titre **« Retirer le participant »** · Corps *« Le participant sera retiré du roster de la saison. L'historique des disponibilités et compositions est conservé. »* · Bouton **« Retirer »** · Snackbar **« Participant retiré. »** |
| **Roster événement** | `/saison/:slug/event/:eventSlug/admin/participants` | Exclure / inclure pour cet événement | Filtre local événement uniquement |
| **Membres troupe** | `/troupe/:slug/admin/membres` | « Retirer » (`aria-label="Retirer ce membre de la troupe"`) | Titre **« Retirer ce membre de la troupe ? »** · Corps *« Cette action retire le membre de la troupe et lui enlève l'accès associé. Son compte HatCast n'est pas supprimé. »* · Bouton **« Retirer »** · Snackbar **« Membre retiré de la troupe. »** |
| **Ré-inclusion** | `/saison/:slug/admin/participants` → **Ajouter** | Ré-ajouter la personne **avec le même email** (ou même nom pour un externe) | Réactive la **même ligne** ; 400 *« Réactivez d'abord l'adhésion à la troupe. »* si l'adhésion troupe est INACTIVE. Endpoint API direct également dispo : `POST .../participants/{id}/reinclude` |

---

## Scénario 1 — Exclusion événement (niveau 1, référence non régressée)

Couvre : niveau 1 / non-régression · plan `3.19-INT-007`.

1. Saison A → ouvrir l'événement **E** → **admin participants** de l'événement.
2. **Exclure** le membre **M** de **E**.
3. Vérifier : **M** n'apparaît plus dans le roster **de cet événement E**.
4. Revenir au **roster saison** et aux **statistiques de saison**.

**Succès :** M est masqué **uniquement sur E** ; il reste présent sur le roster saison,
dans les sélecteurs et **toujours compté dans les statistiques de saison**.

---

## Scénario 2 — Retrait saison d'un membre (cœur de la story)

Couvre : AC1 · risques **R-002** · plan `3.19-INT-001`, `3.19-CMP-001/002`.

1. Saison A → `/saison/:slug/admin/participants` → section **Membres**.
2. Sur la ligne de **M**, cliquer **Retirer** (icône, `aria-label="Retirer ce membre de la saison"`).
3. Vérifier le **dialogue** : titre **« Retirer de cette saison ? »** + corps mentionnant
   *« Son adhésion à la troupe est conservée. »*.
4. Confirmer (**Retirer**).

**Succès :**
- Snackbar **« Membre retiré de la saison. »**.
- **M disparaît** du roster Saison A, des **sélecteurs** et des **statistiques** de la Saison A.
- Sur `/troupe/:slug/admin/membres`, l'adhésion de **M reste ACTIVE** (aucune désactivation troupe).

---

## Scénario 3 — Garde de synchronisation (la recharge ne ressuscite pas)

Couvre : AC3 · risque **R-001** (DATA, résurrection fantôme) · plan `3.19-INT-003`, `3.19-UNIT-001`.

1. Après le Scénario 2, **recharger** la page Participants de la Saison A (déclenche la sync membres).
2. Naviguer ailleurs puis revenir (deuxième passage de sync).

**Succès :** **M ne réapparaît pas** dans le roster Saison A après recharge(s), bien que
son adhésion troupe soit toujours ACTIVE.

---

## Scénario 4 — Portée saison-locale (autre saison intacte)

Couvre : AC1/AC2 · risque **R-002** · plan `3.19-INT-002`.

1. Ouvrir le roster de la **Saison B** (`/saison/:slugB/admin/participants`).

**Succès :** **M est toujours présent** sur le roster, les sélecteurs et les statistiques
de la **Saison B**. Le retrait n'a touché que la Saison A.

---

## Scénario 5 — Ré-inclusion via « Ajouter » + conservation de l'exclusion événement

Couvre : AC5/AC6 · risques **R-001/R-005** · plan `3.19-INT-006/007`, `3.19-INT-018/019/020`.

> Pas de bouton « Réintégrer » dédié : la ré-inclusion se fait avec le bouton **Ajouter**.
> Tant que c'est **le même email** (membre ou joueur avec compte), le système reconnaît la
> personne et **réactive la même ligne** (même `season_participant_id`) plutôt que d'en
> créer une seconde. Pour un externe **sans compte**, c'est le **même nom** qui sert de clé.

1. Saison A → `/saison/:slug/admin/participants` → **Ajouter**.
2. Saisir **M** avec **le même email** qu'à l'origine (le nom saisi est ignoré pour un membre :
   il revient avec son **nom synchronisé** depuis l'adhésion).
3. Recharger le roster Saison A.

**Succès :**
- **M réapparaît** sur le roster / sélecteurs / statistiques de la Saison A, **sur la même
  ligne** (pas de doublon) → ses **dispos/compositions historiques réapparaissent**.
- Pour un membre : il revient dans la section **Membres** avec son **nom courant** (synchronisé).
- L'**exclusion événement** posée au Scénario 1 **s'applique toujours** : M reste masqué sur **E**.
- Si l'adhésion troupe de M est **INACTIVE**, l'ajout est **refusé** avec **400**
  *« Réactivez d'abord l'adhésion à la troupe. »* (réactiver d'abord côté Membres troupe).

*(Variante : un participant **externe** retiré, ré-ajouté avec **le même nom**, revient sur la
même ligne. L'API directe `POST .../participants/{id}/reinclude` reste également disponible.)*

---

## Scénario 6 — Retrait troupe → cascade toutes saisons + réactivation

Couvre : AC4 · risque **R-002/R-008** · plan `3.19-INT-004/010`.

1. `/troupe/:slug/admin/membres` → ligne de **M** → **Retirer**.
2. Dialogue **« Retirer ce membre de la troupe ? »** → confirmer. Snackbar **« Membre retiré de la troupe. »**.
3. Vérifier rosters **Saison A et Saison B** + accès app de M.
4. **Réactiver** M : ré-ajouter le membre (par email) dans Membres troupe.
5. Recharger les rosters A et B.

**Succès :**
- Étape 2-3 : M passe **REMOVED** sur **toutes** les saisons de la troupe ; son accès troupe est révoqué ; son **compte HatCast n'est pas supprimé**.
- Étape 4-5 : la réactivation **restaure** M sur les rosters des saisons (mêmes lignes / mêmes identités), sans recréer de doublon.
- Garde-fou : si M est le **dernier admin actif**, le retrait troupe est **refusé** (tooltip *« La troupe doit conserver au moins un administrateur actif. »*).

---

## Scénario 7 — Organisateur·ice de saison rétrogradé·e au retrait

Couvre : risque **R-007** · plan `3.19-CMP-003`.

1. Donner à **M** le rôle d'**organisateur·ice** de la Saison A.
2. Retirer **M** du roster Saison A (cf. Scénario 2).

**Succès :** M est **retiré de la liste des organisateur·ice·s** de la saison (rétrogradation)
et la liste se rafraîchit.

---

## Scénario 8 — Participant externe (name-only) — retrait soft

Couvre : AC1 · plan `3.19-INT-008`.

1. Saison A → section **Externes** → ligne de **X** → **Retirer**.
2. Dialogue **« Retirer le participant »** → confirmer. Snackbar **« Participant retiré. »**.

**Succès :** X disparaît du roster Saison A ; aucune notion d'adhésion troupe impliquée ;
retrait **soft** (réversible, pas de suppression dure).

---

## Scénario 9 — Conservation de l'historique (aucune suppression dure)

Couvre : invariant DATA non-négociable · SCP §2.1.

1. Avant retrait, noter que **M** a des **disponibilités** et/ou figure dans une **composition** sur la Saison A.
2. Retirer M (Scénario 2), puis le ré-inclure (Scénario 5).

**Succès :** après retrait **et** après ré-inclusion, les **disponibilités** et **compositions
historiques** de M restent intactes (aucune ligne supprimée).

---

## Contrôles manuels résiduels

| ID | Contrôle | Attendu |
|---|---|---|
| **M1** — `3.19-MIG-001` / R-003 | Smoke migration **V38** en pré-prod | La migration s'applique proprement ; **aucune** ligne membre `REMOVED` préexistante avec `removal_source = NULL` qui ressusciterait. Auditer avant déploiement, backfill si besoin. |
| **M2** — `3.19-A11Y-001` / R-010 | Cible tactile du bouton **Retirer** (Participants) | Pattern préexistant **40dp** < 48dp recommandé M3-3 → **waiver documenté** (non bloquant, non introduit par cette story). |

---

## Grille de résultats

> **Recette exécutée le 2026-05-31 — VERDICT : PASS.** Tous les scénarios passés ;
> aucun écart consigné.

| # | Scénario | Risque | Résultat (PASS/FAIL) | Notes / écart |
|---|---|---|---|---|
| 1 | Exclusion événement | — | PASS | |
| 2 | Retrait saison membre | R-002 | PASS | |
| 3 | Garde de sync | **R-001** | PASS | |
| 4 | Portée saison-locale | R-002 | PASS | |
| 5 | Ré-inclusion via Ajouter | R-001/R-005 | PASS | réactivation même ligne, dispos/compos OK |
| 6 | Cascade troupe + réactivation | R-002/R-008 | PASS | |
| 7 | Rétrogradation organisateur·ice | R-007 | PASS | |
| 8 | Externe name-only | — | PASS | |
| 9 | Conservation historique | DATA | PASS | |
| M1 | Smoke migration V38 | R-003 | PASS | |
| M2 | Cible tactile 40dp | R-010 | PASS (waiver) | pattern préexistant, < 48dp accepté |

**Verdict de recette :** PASS exige Scénarios **2, 3, 4, 6** au vert (risques hauts
R-001/R-002 + cascade) et aucune suppression dure observée (Scénario 9). → **Satisfait.**

Tout écart → ouvrir une entrée dans `ISSUES.md` (et consigner un `*-findings.md` daté).

---

## Suite : automatisation E2E

Une fois ce cahier **passé et stable** :

1. **Pré-requis bloquant — LIMIT-001** (`ISSUES.md`) : l'E2E actuel dépend d'un état de
   base *live* et il n'existe encore **aucun** test `*.e2e.ts`. Mettre en place des
   **fixtures déterministes** (troupe + 2 saisons + membre partagé) **avant** d'écrire l'E2E.
2. **Candidats E2E prioritaires** (forte valeur transverse, mappés sur les scénarios) :
   - S2 + S3 + S4 (retrait saison-local + garde de sync + autre saison intacte) → couvre R-001/R-002 de bout en bout.
   - S6 (cascade troupe + réactivation) → couvre R-002/R-008.
   - S1 + S5 (étanchéité événement vs saison + ré-inclusion via **Ajouter**, conservation de l'exclusion événement) → parcours UI complet désormais possible.
3. **Ne pas dupliquer** : S7–S9 et les bords idempotents restent
   suffisamment couverts par l'intégration API / composant (`3.19-INT-*`, `3.19-CMP-*`)
   et ne justifient pas d'E2E.
4. Côté BMad : `*atdd` / `*automate` pour générer la couche E2E une fois l'infra fixtures prête.
