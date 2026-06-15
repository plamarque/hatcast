# Comprendre les pourcentages de tirage

**Public :** organisateurs et membres.  
**UI in-app :** carrousel 5 slides dans `DrawChancesHelpDialog` (images `apps/web/public/img/slide-*.jpg`, copy `draw-chances-help-slides.ts`).  
**Fallback statique :** [`apps/web/public/help/draw-chances-explained.md`](../../apps/web/public/help/draw-chances-explained.md).

Spec technique : [draw-weight-engine-v1-spec.md](../technical/draw-weight-engine-v1-spec.md).

---

## Résumé (aligné carrousel)

| Étape | Message |
| ----- | ------- |
| 1 | Métaphore du **sac** : un papier par personne disponible |
| 2 | **Plusieurs places** → plusieurs tirages ; ex. 5/8 ≈ 63 %, pas 12 % |
| 3 | **Historique saison** → taille des papiers (équité) |
| 4 | **Gros papier** = plus de chances → % affiché |
| 5 | **Chaque rôle** du spectacle a son propre tirage |

## Où voir l’aide dans l’app

- **Carrousel** « Comprendre les pourcentages de tirage » (`DrawChancesHelpDialog`) — 5 slides illustrées ; accessible depuis la fiche de détail d’une cote (**Comprendre le tirage en général**) ou les entrées doc prévues par l’écran.
- **Pas d’article long** dans l’app : le markdown public (`apps/web/public/help/draw-chances-explained.md`) est un **résumé** de secours.

## Détail par personne (story 19.7)

Quand l’**explicabilité** est active (FR24 — **Dispos** dès spectacle publié ; **Équipe** après publication ou validation composition), tu peux ouvrir une **fiche** pour un candidat :

| Entrée | Où |
|--------|-----|
| Tap sur un **segment** du pool coloré | Onglet **Dispos** (sondage) ou **Équipe** (aperçu pool par rôle) |
| Tap sur le **%** | Picker manuel, grille Équipe, animation de tirage |

La fiche affiche :

1. **% final** et identité (rôle, prénom).
2. **Une ligne de classement** dans le pool (ex. « 3e sur 8 candidats · 2 devant toi », « En tête du pool… », ex aequo).
3. **« D’où vient ce % ? »** — waterfall : « Chance de base pour les *n* candidats », puis les écarts en points (+ / −), puis « Ta chance aujourd’hui » / « Sa chance aujourd’hui ».
4. Lien **« Comprendre le tirage en général »** → carrousel ci-dessus.

Le pool visuel (largeurs proportionnelles, couleurs par palier de chance) reste sur les **écrans d’aperçu** ; la fiche ne répète pas la barre graphique.

Spec UX as-shipped : [`ux-design-factor-breakdown-19-7.md`](../../_bmad-output/planning-artifacts/ux-design-factor-breakdown-19-7.md) § Amendement as-shipped.

## Hors périmètre actuel

Participations passées = seul facteur actif en production (`DrawWeightPipelines.DEFAULT`). **Formules et politiques de tirage personnalisables** (Wave D — catalogue admin, politique troupe/saison, choix de formule au tirage) sont **documentées** ([draw-formulas-policies-spec.md](../technical/draw-formulas-policies-spec.md)) mais **pas encore disponibles dans l’UI** jusqu’aux stories **19.19+** (admin) et **19.21** (choix orga). Parité genre, comparateur deux colonnes, liste « devant toi » avec navigation pair : à venir.
