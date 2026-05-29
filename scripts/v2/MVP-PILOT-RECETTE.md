# Recette MVP pilote — un seul admin (Patrice)

Données générées par `npm run generate:improbots-mvp-pilot-seed` → migration `V22__seed_mvp_pilot_recette.sql`.

## Prérequis

1. Base locale migrée (Flyway jusqu’à **V22** inclus) : redémarrer l’API ou `./scripts/start-dev.sh`.
2. Connexion en **Patrice** — admin troupe + orga saison :
   - Email seed : `patrice@seed.improbots.test`
   - Troupe : **Les Improbots** · Ligue : **Les Improbots 2026-2027** (`/saison/les-improbots-2026-2027`)
3. Stories **5.5** (proxy dispos) et **6.8** (proxy confirmation) livrées côté app.

## Cast MVP (6 personnes)

| Nom affiché | Rôle typique dans les scénarios |
|-------------|----------------------------------|
| **Angie** | Comédien·ne |
| **Max** | Comédien·ne |
| **Sophie** | Comédien·ne |
| **Camille** | MC |
| **Bruno** | DJ |
| **Patrice** | Toi (orga) — pas obligatoire dans la line-up |

Chaque spectacle MVP a **5 créneaux** : 3× Comédien·ne, 1× MC, 1× DJ. Les dispos seed sont déjà **Dispo** pour les 6 noms ci-dessus.

## Spectacles (chercher `[MVP]` dans `/agenda`)

| # | Titre exact | État seed | Ce que vous testez |
|---|-------------|-----------|-------------------|
| 00 | `[MVP] 00 · Bandeau navigation` | dispos OK, pas de compo | Bandeau Ligue · Troupe |
| 01 | `[MVP] 01 · Tirage pondéré` | dispos OK, pas de compo | Tirage 6.4 |
| 02 | `[MVP] 02 · Assignation manuelle` | dispos OK, pas de compo | Assignation 6.5 |
| 03 | `[MVP] 03 · Validations en attente` | compo validée, 5× en attente | Proxy confirmer 6.7/6.8 |
| 04 | `[MVP] 04 · Déclin et compléter` | trou : Sophie déclinée, slot vide | Compléter 6.9 |
| 05 | `[MVP] 05 · Équipe complète` | tout confirmé | Référence `complete` |

---

## Raccourci dispos (5.5) — une fois par session

Sur **`[MVP] 02 · Assignation manuelle`** (dispos déjà seedées ; optionnel si 5.5 pas encore validé) :

1. Onglet **Dispos** → sélecteur sujet : **Angie** → vérifier **Dispo** + rôles.
2. Répéter pour **Max**, **Sophie**, **Camille**, **Bruno** (2 clics par personne si tout est déjà vert : OK).

---

## Scénario 00 — Navigation (déjà validé chez vous)

1. `/agenda` → ouvrir **`[MVP] 00 · Bandeau navigation`**.
2. Vérifier bandeau **Les Improbots · Les Improbots 2026-2027** + **Voir la ligue** + **Voir la troupe**.
3. **Succès** : liens OK (routes à ajuster plus tard = hors gate).

---

## Scénario 01 — Tirage pondéré → valider → confirmer → complete

Spectacle : **`[MVP] 01 · Tirage pondéré`**

1. **Équipe** → **Composer** (ou équivalent) → **Tirage** / tirage pondéré (remplit les 5 slots).
2. **Valider** la composition.
3. Pour chaque nom assigné (Angie, Max, Sophie, Camille, Bruno) : clic slot → **Confirmer** (proxy orga si besoin).
4. **Infos** / badge Équipe : état **complete** (ou équipe confirmée).

---

## Scénario 02 — Assignation manuelle

Spectacle : **`[MVP] 02 · Assignation manuelle`**

| Slot UI | Assigner |
|---------|----------|
| Comédien·ne (1er) | **Angie** |
| Comédien·ne (2e) | **Max** |
| Comédien·ne (3e) | **Sophie** |
| **MC** | **Camille** |
| **DJ** | **Bruno** |

Puis **Valider** → confirmer les 5 (proxy) → **complete**.

---

## Scénario 03 — Validations en attente (minimal clics)

Spectacle : **`[MVP] 03 · Validations en attente`**

État initial : Angie, Max, Sophie, Camille, Bruno déjà en line-up, statut **en attente**.

1. Onglet **Équipe** — pas de recomposer.
2. Clic sur **Angie** → **Confirmer** (pour Angie).
3. Idem **Max**, **Sophie**, **Camille**, **Bruno**.
4. **Succès** : **complete**.

---

## Scénario 04 — Déclin + compléter (6.9)

Spectacle : **`[MVP] 04 · Déclin et compléter`**

État initial :

- Comédien·ne : **Angie** (confirmée), **Max** (en attente), **3e slot vide** (Sophie dans « ayant décliné »).
- **MC** Camille confirmée, **DJ** Bruno confirmé.

1. **Compléter** sur le slot vide Comédien·ne (3e) → choisir **Patrice** ou un autre dispo (ex. laisser **Max** seulement en attente).
2. Assigner **Patrice** (ou autre) sur le 3e Comédien·ne.
3. **Confirmer** pour le nouvel assigné + **Max** si encore en attente.
4. **Succès** : plus de trou, **complete**.

*(Option : **Remettre en composition** sur Sophie dans la liste des déclins — variante 6.9.)*

---

## Scénario 05 — Référence complete

Spectacle : **`[MVP] 05 · Équipe complète`**

1. Ouvrir **Équipe** / **Infos**.
2. **Succès** : badge **complete** / équipe confirmée, 5 noms confirmés.

---

## Fermer la gate MVP pilote

Cocher dans `PLAN.md` la DoD MVP après scénarios **01–04** (05 = contrôle visuel).

Regénérer le seed :

```bash
npm run generate:improbots-mvp-pilot-seed
```
