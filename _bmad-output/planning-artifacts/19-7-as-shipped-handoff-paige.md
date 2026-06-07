---
title: Handoff Paige — doc sync story 19.7 as-shipped
from: Sally (UX amendement)
to: Paige (tech writer)
date: '2026-06-07'
status: completed
completed: '2026-06-07'
sourceOfTruth:
  - _bmad-output/planning-artifacts/ux-design-factor-breakdown-19-7.md#amendement-as-shipped-recette-po--2026-06-07
  - apps/web/ (runtime)
---

# Handoff documentation — 19.7 explainability (as-shipped)

**Objectif :** aligner la doc **normative / produit** sur ce qui est **en production candidate**, sans réouvrir les débats UX (décisions PO dans la spec UX amendée).

**Ne pas faire :** réécrire les wireframes d’origine ni rouvrir W3/W4/W17 tels que draftés.

---

## Fichiers à synchroniser (priorité)

| Fichier | Action attendue |
|---------|-----------------|
| [`docs/v2/product/draw-chances-explained.md`](../../docs/v2/product/draw-chances-explained.md) | Confirmer stub court + renvoi vers **carrousel in-app** (pas article long). § « Détail par personne » : tap segment pool ou % → fiche « D’où vient ce % ? » ; ligne classement texte ; lien « Comprendre le tirage en général ». |
| [`apps/web/public/help/draw-chances-explained.md`](../../apps/web/public/help/draw-chances-explained.md) | Miroir du stub produit (déjà réduit en recette — vérifier cohérence). |
| [`docs/v2/technical/draw-weight-engine-v1-spec.md`](../../docs/v2/technical/draw-weight-engine-v1-spec.md) | § Explainability API : documenter `poolRank`, `aheadCount`, `tiedAtChanceCount`, `candidateCount` si présents côté API ; tolérance waterfall ; droits 6.3/6.4. |
| [`docs/v2/technical/FRONTEND_UI.md`](../../docs/v2/technical/FRONTEND_UI.md) | Si checklist M3 : noter **waivers recette** connus (segments pool &lt; 48 dp, triggers imbriqués Dispos) — pointer story 19.7 Review Findings, pas de nouvelle norme sans PO. |
| [`_bmad-output/implementation-artifacts/19-7-breakdown-explicabilite-par-facteur.md`](../implementation-artifacts/19-7-breakdown-explicabilite-par-facteur.md) | Marquer AC UX supersédés par amendement ; statut `as-shipped` ; résoudre items [Review][Decision] W3/W4/W17 selon tableau ci-dessous. |

**Hors scope Paige (sauf demande PO) :** epics.md, SPEC.md — pas de changement fonctionnel.

---

## Copy produit figée (ne pas paraphraser)

| Emplacement | Texte |
|-------------|-------|
| Titre waterfall | D’où vient ce % ? |
| Ligne référence | Chance de base pour les {n} candidats |
| Ligne finale | Ta chance aujourd’hui / Sa chance aujourd’hui |
| Lien doc depuis fiche | Comprendre le tirage en général |
| Titre aide (dialog) | Comprendre les pourcentages de tirage (vérifier `draw-chances-help-slides.ts`) |
| Rang pool (ex.) | 3e sur 8 candidats · 2 devant toi ; En tête du pool… ; Ex aequo en tête… |

---

## Résolution review → doc

| Finding story | Résolution PO (as-shipped) |
|---------------|----------------------------|
| W3/W4 barre + liste pairs | **Spec UX amendée W3′–W4′** — rang texte uniquement |
| W17 expansion panel | **W17′** — toggle pillule rôle |
| W6 carrousel | **W6′** — carrousel uniquement dans `DrawChancesHelpDialog` |
| W7 tap % Dispos | **W7′** — entrée pool segment ; Dispos = vue pool par rôle |
| Hint W19 sous waterfall | **W19′** — en-tête seulement |
| Label « Tirage pur » | **W18′** — copy UI « Chance de base… » |

Les patches techniques (403 tests, snapshot, snack erreur, etc.) restent dans la story — **ne pas** les présenter comme bugs UX dans la doc produit.

---

## Vérification rapide (smoke doc)

1. Ouvrir un événement avec explainability → Équipe → toggle rôle → pool coloré → tap segment → fiche.
2. Dispos → Tous → accordion rôle → même pool.
3. Fiche → « Comprendre le tirage en général » → carrousel 5 slides → Fermer.
4. Comparer wording doc avec écrans ci-dessus.

---

## Contact

Questions UX / wording : spec [`ux-design-factor-breakdown-19-7.md`](./ux-design-factor-breakdown-19-7.md) § Amendement as-shipped.  
Questions implémentation : story 19.7 + fichiers listés dans son File List.

---

## Complété (Paige — 2026-06-07)

- [x] `docs/v2/product/draw-chances-explained.md` — § Où voir l’aide, § Détail par personne
- [x] `apps/web/public/help/draw-chances-explained.md` — miroir + paragraphe détail
- [x] `docs/v2/technical/draw-weight-engine-v1-spec.md` — `poolRank`, `aheadCount`, `tiedAtChanceCount`, surfaces UI, fallback client
- [x] `docs/v2/technical/FRONTEND_UI.md` — tableau waivers story 19.7
- [x] Story 19.7 — changelog sync doc
