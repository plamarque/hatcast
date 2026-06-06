---
story: 3-8d-participant-add-typeahead-carnet
date: 2026-06-06
author: Murat (TEA)
status: ready-for-manual-run
inputDocuments:
  - _bmad-output/implementation-artifacts/3-8d-participant-add-typeahead-carnet.md
  - _bmad-output/implementation-artifacts/3-23-invitation-scope-cascade-add.md
  - docs/adr/0021-troupe-externes-carnet-invitations.md
seed: Les Improbots (R__seed_improbots_dev_demo.sql + V30)
---

# Cahier de recette manuelle — Story 3.8d

**Typeahead ajout participant — pool carnet (ADR-0021 P3)**

Objectif : valider en conditions réelles le typeahead sur le **seed dev Les Improbots** : carnet (`MEMBER` + `TROUPE_ADMIN` + `EXTERNE`) et, **dialog spectacle uniquement**, participants saison ACTIVE non déjà visibles au roster événement.

Ce document sert de **script pas-à-pas** pour la recette manuelle ; Murat en dérivera l’automatisation Playwright/E2E.

---

## 0. Prérequis environnement

| Élément | Valeur |
|---------|--------|
| Stack | `./scripts/start-dev.sh` (API `http://127.0.0.1:8080`, front `https://localhost:4200`) |
| Migrations | **V59+** (carnet EXTERNE), **V60+** (`invitation_scope`), **V30** (Apérock 2026) |
| Branche / build | Story **3.8d** déployée localement (front + API à jour) |
| Navigateur | Chrome ou Firefox récent ; fenêtre ≥ 1280 px (mobile en fin de parcours) |

### Comptes opérateur (admin troupe Les Improbots)

| Compte | Usage |
|--------|--------|
| `patrice.lamarque@gmail.com` | Connexion Google — **TROUPE_ADMIN** (`R__bootstrap_improbots_dev_operator_memberships.sql`) |
| `impropick@gmail.com` | Idem |
| `patrice@seed.improbots.test` | Compte seed Patrice (**TROUPE_ADMIN** dans le carnet Improbots) |

### Contexte seed (références stables)

| Ressource | Slug / valeur |
|-----------|----------------|
| Troupe | `les-improbots` (`a0000001-0000-4000-8000-000000000001`) |
| Saison principale | `les-improbots-2026-2027` — **32 participants ACTIVE** (tous les membres carnet) |
| Saison roster vide | `aperock-2026` — **0 participant** (`V30`, `participant_count: 0`) |
| Spectacle référence 3.23 | **Match vs Bruxelles** — `match-vs-bruxelles` (slot `dj: 0`) |
| Spectacle alternatif (DJ requis) | **Cabaret de rentrée** — `cabaret-de-rentree` (slot `dj: 1`) |

### URLs directes

| Surface | URL |
|---------|-----|
| Participants **saison** (principale) | `https://localhost:4200/saison/les-improbots/les-improbots-2026-2027/admin/participants` |
| Participants **saison** (Apérock) | `https://localhost:4200/saison/les-improbots/aperock-2026/admin/participants` |
| Participants **spectacle** | `https://localhost:4200/saison/les-improbots/les-improbots-2026-2027/event/match-vs-bruxelles/admin/participants` |
| Carnet **Membres / Externes** | `https://localhost:4200/troupes/les-improbots/admin/membres` |

---

## 1. Inventaire seed (ne pas supposer — vérifié dans le SQL)

Source : `services/api/src/main/resources/db/seed-postgresql/R__seed_improbots_dev_demo.sql` (+ `V30__seed_context_switcher_dev.sql`).

| Donnée | État seed |
|--------|-----------|
| Membres carnet | **32** lignes `ACTIVE` (`MEMBER` × 29 + `TROUPE_ADMIN` × 3 : **Max**, **Patrice**, **Pierrick**) |
| Roster `les-improbots-2026-2027` | **32** `season_participants` ACTIVE — **Angie → Will** (seq 01–32), **dont Viviane et Will** |
| Entrées `EXTERNE` carnet | **Aucune** |
| `event_participants` | **Aucune** ligne seed |
| `event_participant_exclusions` | **Aucune** |
| Roster spectacle par défaut | Tous les participants saison ACTIVE **hérités** sur chaque spectacle (sauf exclusion admin) |

### Personas seed utiles à la recette

| Persona | Email seed | Roster principale | Roster Apérock 2026 | Intérêt |
|---------|------------|-------------------|----------------------|---------|
| **Angie** | `angie@seed.improbots.test` | ACTIVE | Sync auto* | Exclusion typeahead **saison principale** ; ré-ajout membre (C alt.) |
| **Max** | `max@seed.improbots.test` | ACTIVE | Sync auto* | Membre + admin |
| **Bruno** | `bruno@seed.improbots.test` | ACTIVE | Absente | Variante membre Apérock |
| **Laetita** | `laetita@seed.improbots.test` | ACTIVE | Absente | **Membre seed** — ne pas confondre avec l’externe **Laetitia MC** (créé en SETUP) |
| **Sophie** | `sophie@seed.improbots.test` | ACTIVE | Absente | Exclusion positive (saison principale) |
| **Viviane** / **Will** | `viviane@…` / `will@…` | ACTIVE | Absente | Déjà au roster principal — **ne pas** les utiliser pour « membre hors roster » sur la saison principale |

> **Piège fréquent (LIMIT-004) :** sur `les-improbots-2026-2027`, **tous** les membres carnet sont déjà au roster → le typeahead saison ne propose **que** des personnes **absentes** du roster (externes carnet, ou membre après retrait).
>
> **Apérock 2026 :** le seed indique `participant_count: 0`, mais le **premier chargement** admin déclenche `ensureMembershipParticipants` → **32 membres** ACTIVE. Ne pas compter sur un roster vide persistant. Pour le scénario **C**, préférer **option A** (ci-dessous).

---

## 1b. Résultats recette manuelle (2026-06-06 — Patrice)

| Scénario | Résultat | Commentaire |
|----------|----------|-------------|
| A | OK | |
| B | OK | |
| C | OK (re-test) | Option A Angie ; BUG-010 fixé |
| D | OK | Retirer Ruben du roster principal en préambule si scénarios A/B exécutés avant |
| E | OK | |
| F | OK | |
| G | OK | |
| H (Laetitia) | — | Non exécuté ou OK si chemin externe |
| H alt. Angie | OK (re-test) | BUG-011 fixé (include roster API) |
| I | OK | |
| J | OK | |

**Verdict après correctifs :** re-test **2026-06-06** — **C option A** (nom Angie, pas `m:…`) et **H alt. Angie** (section Membres) **OK**.

---

## 2. Phase SETUP (externes — absentes du seed)

Le seed Improbots **ne contient pas** d’`EXTERNE`. Les scénarios A, B, F, H, I nécessitent **deux contacts carnet** créés une fois (UI ou résidu recette **3.23**).

Si une session 3.23 récente a déjà créé ces personas, **sauter** SETUP et vérifier le carnet.

### SETUP-1 — Externe name-only « Ruben DJ »

1. **Membres** → filtre **Externes** → **Ajouter un externe** : nom **`Ruben DJ`**, sans email, sans compte.
2. **Vérifier** : ligne carnet ; **absent** des rosters saison principale, Apérock et Match vs Bruxelles.

### SETUP-2 — Externe email « Laetitia MC »

1. **Ajouter un externe** : **`Laetitia MC`**, email **`laetitia.mc@example.com`**.
2. **Vérifier** : carnet OK ; **absente** du roster `les-improbots-2026-2027` (retirer du roster si reliquat 3.23, **sans** désactiver le carnet).

### SETUP-3 — Ruben spectacle-only (optionnel, scénario I)

1. Admin **Match vs Bruxelles** → ajouter **Ruben DJ** (typeahead ou free-text), checkbox *Ajouter aussi à la saison* **décochée**.
2. **Retirer** Ruben du roster **spectacle** (carnet conservé).

**Checkpoint SETUP :** carnet Externes = **Ruben DJ** + **Laetitia MC** minimum.

---

## 3. Grille de traçabilité AC → scénarios

| AC story | Scénario(s) |
|----------|-------------|
| AC1 Pool carnet (+ saison en dialog spectacle) | A, B, C, H |
| AC2 Sélection → prefill + scope 3.23 | A, B, C, F, H |
| AC3 Name-only libre | G |
| AC4 EXTERNE sans userId | A |
| AC5 Exclusions roster | D, E |
| AC6 Shell dialog / non-régression | Tous (+ J mobile) |

---

## 4. Scénarios détaillés

Pour chaque scénario : **Actions** → **Attendu UI** → **Attendu données** → **KO si**.

---

### A — EXTERNE name-only dans le typeahead saison (AC1, AC4)

**Surface :** participants **saison principale**.

**Prérequis :** SETUP-1.

1. Admin participants **`les-improbots-2026-2027`** → **Ajouter**.
2. **Nom affiché** : taper **`Rub`** (≥ 1 caractère selon filtre client).
3. Observer la liste **sans** sélectionner.

**Attendu UI :**
- Suggestion **`Ruben DJ`** + avatar + suffixe muted **`Externe`**.
- Hint bas : **`Suggestions : membres et externes du carnet.`** (pas de mention « participants de la saison » sur ce dialog).
- Panel autocomplete non rogné.

4. Sélectionner **Ruben DJ** → hint scope **`Externe saison — disponibilités sur toute la saison`**.
5. **Ajouter**.

**Attendu données :** ligne roster saison kind **Externe**, scope **SEASON** ; carnet inchangé (pas de doublon).

**KO si :** Ruben absent pour name-only ; pas de label Externe ; hint saison sur le hint général ; 409.

---

### B — EXTERNE email — ajout saison via typeahead (AC1, AC2)

**Prérequis :** SETUP-2 ; Laetitia **absente** du roster principal.

1. Admin participants **saison principale** → **Ajouter** → **`Laet`** → **Laetitia MC**.
2. Email prérempli `laetitia.mc@example.com` ; hint **Externe saison**.
3. **Ajouter**.

**Attendu données :** roster saison Externe `invitationScope: SEASON` ; carnet réutilisé (pas de 2ᵉ ligne homonyme).

**KO si :** email non prérempli ; second carnet créé.

---

### C — Membre troupe via typeahead (AC1, AC2)

**Option A — recommandée (saison principale, seed stable)**

1. Admin participants **`les-improbots-2026-2027`** → **retirer Angie** du roster (une seule ligne).
2. **Ajouter** → taper **`Ang`** → sélectionner **Angie** (nom lisible, **pas** `m:…` dans le champ).
3. **Attendu UI :** pas de suffixe Externe ; pas de hint « Externe saison ».
4. **Ajouter** → Angie kind **Membre**, pas d’entrée carnet EXTERNE.

**Option B — Apérock (déconseillée en recette manuelle)**

Nécessite d’avoir **retiré Max** (ou tout le roster) **après** le premier chargement admin qui auto-sync les 32 membres (LIMIT-004). Préférer l’option A.

**Variante :** Bruno après retrait préalable du roster Apérock.

**KO si :** hint externe ; clé technique `m:uuid` visible dans le champ nom ; création EXTERNE carnet.

---

### D — Exclusion : déjà ACTIVE au roster saison (AC5)

**Surface :** participants **saison principale** (32 membres déjà présents).

**Prérequis :** Angie ACTIVE (seed).

1. **Ajouter** → taper **`Ang`** ou **`Angie`**.

**Attendu UI :** **aucune** suggestion Angie.

**Contrôle positif :** **`Rub`** → Ruben DJ **doit** apparaître (SETUP-1).

**KO si :** Angie proposée.

---

### E — Exclusion post-ajout (AC5)

**Prérequis :** scénario **C option A** exécuté (Angie de nouveau ACTIVE).

1. Admin **saison principale** → **Ajouter** → **`Ang`**.

**Attendu :** **plus** de suggestion Angie.

**KO si :** Angie encore proposée.

---

### F — Spectacle : EXTERNE scope EVENT (AC2, 3.23)

**Prérequis :** SETUP-1 ; Ruben **absent** du roster **Match vs Bruxelles** (OK s’il n’est que sur roster saison après A — ne pas le retirer du spectacle s’il n’y est pas).

1. Admin **`match-vs-bruxelles`** → **Ajouter** → **`Rub`** → **Ruben DJ**.

**Attendu UI :**
- Hint **`Externe spectacle — ce spectacle seulement`**.
- Checkbox **`Ajouter aussi à la saison`** visible, **décochée** par défaut.
- Hint liste : **`Suggestions : membres, externes du carnet et participants de la saison.`**

2. **Ajouter** (checkbox off).

**Attendu données :** Ruben roster **événement** uniquement ; pas de nouvelle ligne saison.

**KO si :** checkbox cochée par défaut ; hint « Externe saison » ; ligne saison créée sans opt-in.

---

### G — Name-only sans suggestion (AC3, FR45)

1. Admin participants **saison principale** → **Ajouter**.
2. Saisir **`Invité seed-test 3.8d`** sans choisir de suggestion ; email vide → **Ajouter**.

**Attendu :** création OK (cascade 3.23 → nouvelle entrée carnet EXTERNE). Comportement attendu, pas un bug 3.8d.

**KO si :** submit bloqué sans sélection.

---

### H — Spectacle : participant saison exclu retrouvé via typeahead (AC1)

**Prérequis Laetitia (externe) :** scénario **B** + retirer Laetitia MC du **spectacle** uniquement.

1. Admin **`match-vs-bruxelles`** → **Ajouter** → **`Laet`** → Laetitia MC → **Ajouter** (checkbox off).

**Attendu :** Laetitia de nouveau sur le roster spectacle section **Externes** (invité saison).

**Alternative Angie (membre troupe) — après fix BUG-011 :**

1. Retirer **Angie** du roster **Match vs Bruxelles** (exclusion, pas retrait saison).
2. **Ajouter** → **`Ang`** → Angie → **Ajouter**.

**Attendu :** Angie réapparaît section **Membres** (ré-inclusion exclusion), **pas** Externes.

**KO si :** suggestion absente ; Angie en Externes après ré-ajout.

---

### I — Ré-inclusion via typeahead après retrait spectacle (AC2, lien 3.23 D)

**Prérequis :** SETUP-3 ou après **F** : **Ruben DJ** au carnet, retiré du roster spectacle.

1. Admin **`match-vs-bruxelles`** → **Ajouter** → **`Cambo`** ou **`Rub`** → **Ruben DJ** → **Ajouter**.

**Attendu :** réactivation sans 409 ; suggestion sans ressaisie du nom complet.

**KO si :** suggestion absente ; 409 doublon.

---

### J — Mobile & shell dialog (AC6, M3-3)

1. Viewport **375×812**.
2. Répéter **A** (minimal) ou **C** sur Apérock : panel lisible, option touchable, submit OK.

**KO si :** panel rogné ou double scroll.

---

## 5. Vérifications transverses (fin de session)

| # | Point | OK / KO / N/A |
|---|--------|---------------|
| 1 | Hint **saison** : « membres et externes du carnet » | |
| 2 | Hint **spectacle** : « … et participants de la saison » | |
| 3 | Options EXTERNE : suffixe **Externe** muted | |
| 4 | Avatar `app-user-avatar` sur chaque suggestion | |
| 5 | Régression edit participant sans typeahead | |
| 6 | Dispos / agenda scope invité (**3.25**) | N/A |

---

## 6. Ordre d’exécution recommandé

```text
SETUP-1 → SETUP-2
  → D        (exclusion Angie — retirer Ruben du roster si A/B faits avant)
  → C        (option A : retirer Angie → ré-ajouter via typeahead)
  → A → B → E → F → H → G → [SETUP-3] → I → J
```

Durée estimée : **25–40 min**.

---

## 7. Modèle de compte-rendu

```markdown
## Recette 3.8d — YYYY-MM-DD — [exécuteur]

| Scénario | Résultat | Commentaire |
|----------|----------|-------------|
| SETUP | OK/KO | |
| A–J | | |

**Verdict global :** PASS / FAIL / PASS avec réserves
```

---

## 8. Automatisation E2E (Murat — implémenté)

| ID auto | Scénario | Spec |
|---------|----------|------|
| 3.8d-E2E-01 | A — Ruben name-only saison | `recette-3.8d.spec.ts` |
| 3.8d-E2E-02 | C — Angie ré-ajout typeahead | idem |
| 3.8d-E2E-03 | D — Angie exclue typeahead | idem |
| 3.8d-E2E-04 | F — Ruben scope spectacle | idem |
| 3.8d-E2E-05 | H — Angie ré-inclusion Membres | idem |

**Fixture :** `POST /v1/e2e/fixtures/story-3-8d/reset` (profil `e2e`).

**Lancer :** `cd apps/web && npm run test:e2e -- --project=chromium-3-8d`

**Vitest (ne pas dupliquer en E2E) :** `participant-member-suggestions.spec.ts`, dialog specs.

---

## 10. Rappel Murat — staging vs T1 (e2e local / CI)

> **Les specs `recette-3.8d.spec.ts` ne sont pas exécutables telles quelles sur staging.**

| Environnement | Données | Mécanisme | Projets Playwright |
|---------------|---------|-----------|-------------------|
| **T1** — CI `e2e-smoke.yml`, local `npm run test:e2e` | Seed **Les Improbots** (H2, profil API `e2e`) | `POST /v1/e2e/fixtures/story-3-8d/reset` + auth mock `e2e-admin` | `chromium-3-8d`, `chromium-3-19` |
| **T2** — gate staging `e1-preprod-gate.yml` | **La Malice** migrée + troupe **Démo** prod — **pas** Les Improbots | Découverte API (`staging-event-discovery.ts`), auth email/mot de passe, vars d’env — **pas** de fixture reset | `e1-mobile-member`, `e1-desktop-orga` uniquement |

**État actuel (2026-06-06) :** même schéma que **recette 3.19** — les recettes admin roster/typeahead tournent en **T1** uniquement. Elles ne font **pas** partie du gate staging E1.

**Si extension staging souhaitée plus tard**, adapter sur le modèle E1 :

1. **Ne pas** compter sur Angie / Ruben / `match-vs-bruxelles` / `les-improbots-2026-2027` (fiction seed dev).
2. **Découvrir** troupe · saison · spectacle via API (`HATCAST_E2E_TROUPE_SLUG`, `HATCAST_E2E_SEASON_SLUG`, slug événement pin ou heuristique).
3. **Préparer** les données via UI orga (externes carnet, retrait roster) ou script Neon dédié — **sans** endpoint `/v1/e2e/fixtures/*` (profil `e2e` absent en staging).
4. **Isoler** les tests mutants (ajout/retrait participants) sur un compte orga dédié ou une saison bac à sable **Démo** si politique produit le permet.
5. Documenter les vars d’env et le plan de nettoyage (roster laissé sale = flaky run suivant).

Réfs : `apps/web/e2e/helpers/e1-staging.ts`, `staging-event-discovery.ts`, `docs/v2/technical/DEPLOYMENT_WORKFLOW.md` § T1/T2.

---

## 9. Hors scope

- Scope dispos / agenda invité (**3.25**)
- Typeahead sur **edit** participant
- Recherche globale utilisateurs HatCast
- Homonymes carnet (ADR — accepté MVP)
