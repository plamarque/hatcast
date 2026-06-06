---
title: UX — Aide contextuelle statut composition (détail événement)
author: Sally (UX)
date: '2026-06-05'
amended: '2026-06-07'
status: approved
stakeholderSignOff: '2026-06-05 — Patrice (C1–C11 approved as specified)'
relatedGrowthBacklog: G-002
relatedArtifacts:
  - _bmad-output/planning-artifacts/growth-backlog.md#G-002
  - _bmad-output/planning-artifacts/ux-design-event-detail-chrome-alignment.md
  - _bmad-output/planning-artifacts/ux-design-hatcast-v2.md#composition-lifecycle-status
  - docs/v1/technical/composition-status-messages.md
  - docs/v2/technical/FRONTEND_UI.md
  - apps/web/src/app/shared/composition/composition-equipe-status-header.ts
  - apps/web/src/app/core/composition/composition-equipe-status.ts
amendsPartially:
  - ux-design-event-detail-chrome-alignment.md#E6
  - ux-design-hatcast-v2.md#composition-lifecycle-status
---

# UX Design — Aide contextuelle statut composition

**Purpose:** Co-localiser le **badge de statut** composition et son **texte explicatif orga** au-dessus des onglets du détail événement ; libérer de l’espace vertical dans l’onglet **Équipe** ; rendre l’aide **découvrable** sans afficher en permanence des paragraphes longs.

**Trigger:** Retour PO 2026-06-05 — après remontée du badge dans `.event-detail__status` (chrome alignment E6), les `managerGuideline` restent affichés dans l’onglet Équipe : déconnexion visuelle et gaspillage d’espace mobile.

**Principe:** Le badge = **état** (scan rapide). L’icône `(?)` = **guidage orga** (détail à la demande). Les hints **d’action toolbar** restent près des boutons dans l’onglet Équipe.

---

## User story

> En tant qu’**organisateur·ice ou administrateur·ice** sur un spectacle, je veux comprendre **ce que signifie le statut** et **quoi faire ensuite**, sans scroller au-dessus de la grille ni perdre de place utile — tout en voyant le statut **quel que soit l’onglet** ouvert (Infos, Dispos, Équipe).

> En tant que **membre**, je veux voir le **libellé de statut** sans être noyé·e sous des consignes réservées aux orgas.

---

## Design decisions

| ID | Decision |
|----|----------|
| **C1** | Le **badge** n’est **pas** cliquable ; il reste un indicateur de statut, pas une action. |
| **C2** | Ajouter un **`mat-icon-button`** avec `help_outline` **à droite du badge** (même ligne, groupe centré) lorsque `managerGuideline != null`. |
| **C3** | Au tap / clic sur `(?)`, afficher un **panneau reveal inline** sous la ligne badge (pas `MatTooltip` — textes trop longs). |
| **C4** | Le panneau est un **toggle** : second tap sur `(?)` ou tap hors zone (optionnel phase 2) le referme. État ouvert mémorisé **par session / par événement** tant que le statut ne change pas (optionnel — voir C10). |
| **C5** | **Source de copy :** `CompositionEquipeStatus.managerGuideline` (`resolveCompositionEquipeStatus`) — aligné sur [`composition-status-messages.md`](../../docs/v1/technical/composition-status-messages.md). |
| **C6** | **Supprimer** de l’onglet Équipe : paragraphe `managerGuideline` (`event-equipe-tab__slots-guideline`) et hint manuel redondant (`event-equipe-tab__manual-hint` quand le guideline « À composer » couvre déjà le même message). |
| **C7** | **Conserver** dans l’onglet Équipe : hints **toolbar** (`event-equipe-tab__action-hint`, `event-equipe-tab__actions-lead`) — ils décrivent les boutons sticky, pas le statut global. |
| **C8** | **Membres** (`canManageComposition === false`) : badge seul, **pas** d’icône `(?)`, pas de panneau. |
| **C9** | **Banner brouillon composition** — **amendé 2026-06-07** : **plus** dans le chrome global (`.event-detail__status`). Zone **violet `primary-container`** dans l’onglet **Équipe** uniquement (`event-equipe-tab__composition-body--draft`), englobant indicateurs mixité + grille + déclins ; chip *Brouillon* + copy : *« Cette composition est actuellement visible uniquement par les organisateur·ices et administrateur·ices. Vous pouvez la partager si nécessaire avant de la valider. »* — aligné visuellement sur `app-event-detail-draft-banner` (spectacle brouillon). |
| **C10** | **Phase 2 (hors MVP) :** micro-accroche une ligne sous le badge pour les états `warning` (`À compléter`, `À vérifier`) — *« Action requise »* — sans ouvrir le panneau. |
| **C11** | **Composant cible :** étendre `app-composition-equipe-status-header` (instance unique dans `event-detail.html` ; instance Équipe avec `showBadge="false"` ne duplique plus le guideline). |

---

## Emplacement dans le chrome

```
┌──────────────────────────────────────────────────────────────────────┐
│ [logo] Troupe › Saison › Titre spectacle…              [ ⚙ ] [avatar] │
├──────────────────────────────────────────────────────────────────────┤
│ (optionnel) Banner brouillon événement — app-event-detail-draft-banner │
├──────────────────────────────────────────────────────────────────────┤
│                    [ À composer ]  (?)     ← .event-detail__status    │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ panneau reveal (orga, si ouvert)                                │  │
│  └────────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────┤
│              [ Infos | Dispos | Équipe ]                              │
├──────────────────────────────────────────────────────────────────────┤
│ contenu onglet actif — sans paragraphe managerGuideline               │
└──────────────────────────────────────────────────────────────────────┘
```

**Mobile et desktop :** même pattern ; largeur max héritée de `.event-detail` (40rem). Le panneau reveal prend **100 %** de la largeur de la zone status, texte `0.85rem`, `line-height: 1.45`, couleur `var(--mat-sys-on-surface-variant)`.

---

## Anatomie du composant

| Élément | Rôle | Material / tokens |
|---------|------|-------------------|
| `.composition-equipe-status__badge` | Libellé court (6 états) | Chip pill existant ; tons `neutral` / `success` / `warning` / `info` |
| `.composition-equipe-status__help` | Bouton `(?)` | `mat-icon-button`, icône `help_outline`, cible **≥ 48×48 dp** |
| `.composition-equipe-status__help-panel` | Contenu reveal | `role="region"`, `aria-labelledby` → id du bouton ; fond `surface-container-low`, `border-radius: 0.5rem`, padding `0.75rem 1rem` |
| `.composition-equipe-status__help-panel--success` | Variante Équipe complète | Même traitement que l’ancien hint success (fond vert léger) — optionnel si le panneau reprend le style banner |

### Accessibilité

- Bouton aide : `aria-label="Comprendre le statut : {label}"` (ex. *Comprendre le statut : À composer*).
- Bouton aide : `aria-expanded="true|false"`, `aria-controls="composition-status-help-panel"`.
- Panneau : visible au clavier (focus sur le bouton → Entrée/Espace toggle).
- **Pas** de `MatTooltip` pour le contenu principal.

### Test hooks

| Hook | Élément |
|------|---------|
| `data-testid="composition-status-badge"` | Badge (existant legacy) |
| `data-testid="composition-status-help-trigger"` | Bouton `(?)` |
| `data-testid="composition-status-help-panel"` | Panneau reveal |
| `data-testid="composition-status-hint"` | Texte du guideline **dans le panneau** (migration depuis paragraphe Équipe) |

---

## Wireframes textuels — vue organisateur·ice

Légende : `[Badge]` = chip ; `(?)` = bouton aide ; `▼` = panneau ouvert.

### État 1 — À composer (`type: none`, tone: neutral)

**Condition :** aucun participant assigné.

**Replié (défaut)**

```
                    ┌──────────────┐
                    │ À composer   │  (?)
                    └──────────────┘
              [ Infos | Dispos | Équipe ]
```

**Déplié (tap sur (?))**

```
                    ┌──────────────┐
                    │ À composer   │  (?)
                    └──────────────┘
┌──────────────────────────────────────────────────────────────────┐
│ 🫵 À composer : Cliquez dans les emplacements pour sélectionner   │
│ un participant ou ✨ Tirez au sort pour faire une sélection       │
│ automatique.                                                      │
└──────────────────────────────────────────────────────────────────┘
              [ Infos | Dispos | Équipe ]

── Onglet Équipe (sous le fold) ──
  [ grille slots vides en pointillés ]
  [ toolbar sticky : primary « Tirer au sort » ]
  (plus de paragraphe manual-hint ni slots-guideline)
```

---

### État 2 — En préparation (`type: draft`, tone: info)

**Condition :** au moins un slot rempli, composition **non** validée.

**Replié**

```
                  ┌─────────────────┐
                  │ En préparation  │  (?)
                  └─────────────────┘
```

**Déplié — guideline standard**

```
                  ┌─────────────────┐
                  │ En préparation  │  (?)
                  └─────────────────┘
┌──────────────────────────────────────────────────────────────────┐
│ 🧠 En préparation : ⚠️ Seuls les administrateurs peuvent voir la  │
│ compo actuelle. Partagez-la aux responsables si vous le désirez   │
│ et, lorsque vous serez prêt, cliquez sur ✅ Valider pour la       │
│ rendre visible à tout le monde.                                   │
└──────────────────────────────────────────────────────────────────┘
```

**Déplié — variante `suppressValidateCtaInGuideline`**

*(Quand le CTA Valider est déjà visible dans la toolbar Équipe — éviter duplication.)*

```
┌──────────────────────────────────────────────────────────────────┐
│ 🧠 En préparation : ⚠️ Seuls les administrateurs peuvent voir la  │
│ compo actuelle. Partagez-la aux responsables si vous le désirez.  │
└──────────────────────────────────────────────────────────────────┘

── Onglet Équipe ──
  « Prêt ? Validez pour rendre la composition visible à tout le monde. »
  [ primary Valider | secondaires… ]
```

**Avec banner brouillon compo (si applicable)**

```
┌──────────────────────────────────────────────────────────────────┐
│ Composition en brouillon : visible uniquement par les             │
│ organisateur·ices et administrateur·ices. Partagez-la…           │
└──────────────────────────────────────────────────────────────────┘
                  ┌─────────────────┐
                  │ En préparation  │  (?)
                  └─────────────────┘
```

---

### État 3 — Confirmations en cours (`type: pending_confirmation`, tone: info)

**Condition :** validée, slots pleins, pas de déclinés dans slots, pas tous confirmés.

**Replié**

```
              ┌──────────────────────────┐
              │ Confirmations en cours   │  (?)
              └──────────────────────────┘
```

**Déplié**

```
┌──────────────────────────────────────────────────────────────────┐
│ ⏳ Confirmations : 📢 Annoncez la compo, puis récoltez les         │
│ confirmations des participants. ⚠️ La compo actuelle est visible  │
│ de tous. 🔒 Déverrouillez pour la masquer.                        │
└──────────────────────────────────────────────────────────────────┘

── Onglet Équipe ──
  [ toolbar : primary « Annoncer la compo » | Déverrouiller ]
```

---

### État 4 — Équipe complète (`type: complete`, tone: success)

**Condition :** validée, tous slots remplis et confirmés.

**Replié**

```
                  ┌─────────────────┐
                  │ Équipe complète │  (?)
                  └─────────────────┘
```

**Déplié** *(style success — fond vert léger, bordure)*

```
                  ┌─────────────────┐
                  │ Équipe complète │  (?)
                  └─────────────────┘
┌──────────────────────────────────────────────────────────────────┐
│ 🎉 Équipe complète : 📢 Annoncez la compo définitive ou 🔓        │
│ Déverrouillez pour faire des changements.                         │
└──────────────────────────────────────────────────────────────────┘
```

---

### État 5 — À compléter (`type: slots_to_complete`, tone: warning)

**Condition :** validée, au moins un slot vide.

**Replié** *(phase 2 : micro-ligne « Action requise » possible ici)*

```
                    ┌──────────────┐
                    │ À compléter  │  (?)
                    └──────────────┘
```

**Déplié**

```
┌──────────────────────────────────────────────────────────────────┐
│ ⚠️ À compléter : La composition a été validée mais certains        │
│ emplacements sont vides. Finalisez la compo en cliquant dans un   │
│ emplacement vide ou sur le bouton 🔧 Compléter pour un choix        │
│ aléatoire.                                                        │
└──────────────────────────────────────────────────────────────────┘

── Onglet Équipe ──
  [ hint toolbar Compléter si visible ]
  [ primary « Compléter » | Annoncer | Déverrouiller ]
```

---

### État 6 — À vérifier (`type: has_declined`, tone: warning)

**Condition :** validée, au moins un slot avec participant `declined`, pas de slot vide (priorité « À compléter » si vide).

**Replié**

```
                    ┌─────────────┐
                    │ À vérifier  │  (?)
                    └─────────────┘
```

**Déplié**

```
┌──────────────────────────────────────────────────────────────────┐
│ ⚠️ À vérifier : La composition de l'équipe contient des personnes │
│ désistées, vérifiez que tout le monde est toujours disponible.    │
└──────────────────────────────────────────────────────────────────┘

── Onglet Équipe ──
  [ section repliable « N personne(s) a/ont décliné » si applicable ]
  [ toolbar : primary « Annoncer la compo » | Déverrouiller ]
```

---

## Wireframes — vue membre

**Tous les états :** badge visible, **pas** de `(?)`, **pas** de panneau.

```
                    ┌──────────────────────────┐
                    │ Confirmations en cours   │
                    └──────────────────────────┘
              [ Infos | Dispos | Équipe ]
```

Le membre infère l’état via le libellé ; les consignes orga (`managerGuideline`) ne s’affichent pas (`managerGuideline: null` côté resolver).

---

## Wireframes — transitions

### Changement de statut pendant panneau ouvert

```
Avant : [ En préparation ] (?)  ▼ panneau ouvert
Action orga : clic Valider
Après : [ Confirmations en cours ] (?)  ▼ panneau fermé (reset)
        nouveau contenu guideline si réouverture
```

**Règle :** à chaque changement de `status.type` ou `status.label`, **fermer** le panneau et mettre à jour le contenu.

### Navigation entre onglets

Le bloc `.event-detail__status` est **hors** des onglets → badge, `(?)` et panneau **persistent** (même état ouvert/fermé) quand l’utilisateur passe Infos ↔ Dispos ↔ Équipe.

---

## Séparation statut vs hints toolbar (onglet Équipe)

| Message | Emplacement | Exemple |
|---------|-------------|---------|
| Statut + guideline orga | `.event-detail__status` | « À composer : Cliquez… » |
| Lead action Valider | Toolbar Équipe | « Prêt ? Validez pour rendre… » |
| Hint Tirer au sort | Toolbar Équipe | « Proposition automatique selon les dispos… » |
| Hint Compléter | Toolbar Équipe | « Tirage pondéré sur les créneaux vides… » |

Ne **pas** dupliquer dans le panneau ce qui est déjà dans le lead toolbar quand `suppressValidateCtaInGuideline` s’applique (draft).

---

## Acceptance criteria — Material 3 (UI)

| ID | Critère |
|----|---------|
| **M3-1** | `mat-icon-button` + `help_outline` ; tokens `--mat-sys-*` ; pas de couleur hex ad hoc sur le panneau. |
| **M3-2** | Cible tactile `(?)` ≥ **48dp** ; panneau lisible à **≤ 480px** sans scroll horizontal. |
| **M3-3** | Libellés et copy **français** ; `aria-label` / `aria-expanded` sur le trigger. |
| **M3-4** | Badge centré avec `(?)` en sibling (flex row, `justify-content: center`, gap `0.5rem`). |
| **M3-5** | Pas de régression : membre ne voit pas le trigger ; E2E `composition-status-hint` cible le panneau. |

---

## Acceptance hints (QA / design review)

- [ ] Les **six états** orga affichent `(?)` avec le copy exact de `composition-status-messages.md`.
- [ ] **Aucun** paragraphe `managerGuideline` dans le corps de l’onglet Équipe.
- [ ] Hint manuel « Cliquez sur un rôle… » **absent** à l’état À composer.
- [ ] Hints toolbar **inchangés** près des boutons sticky.
- [ ] Panneau **toggle** au clic `(?)` ; fermeture au changement de statut.
- [ ] Membre : badge seul sur les 6 libellés possibles.
- [ ] Banner brouillon compo au-dessus de la ligne badge quand applicable.

---

## Hors scope MVP

- Pattern généralisé aux badges agenda / dispos / participation (G-002 transverse) — **pilote composition uniquement**.
- Bottom sheet mobile à la place du reveal inline.
- Mémorisation « ne plus ouvrir automatiquement » (localStorage).
- Lien « En savoir plus » vers doc ou modal pédagogique lifecycle.
- Micro-accroche « Action requise » (C10, phase 2).

---

## Implémentation (hints dev)

1. **`composition-equipe-status-header.html`** — ajouter trigger + panneau ; input `showHelpTrigger` (default `true` quand `managerGuideline` présent).
2. **`event-detail.html`** — instance unique avec badge + aide.
3. **`event-equipe-tab.html`** — retirer blocs guideline + manual-hint ; garder `showBadge="false"` et banner draft si local.
4. **Tests** — migrer assertions `composition-status-hint` vers panneau ; cliquer trigger en E2E setup.
5. **Doc runtime** — mettre à jour § Display dans `composition-status-messages.md` (hint = panneau reveal, pas paragraphe sous slots).

---

## Références

- [G-002 — Texte explicatif des statuts](growth-backlog.md#G-002)
- [Chrome détail événement — E6 centrage badge](ux-design-event-detail-chrome-alignment.md)
- [Cycle de vie composition — toolbar vs hint](ux-design-hatcast-v2.md#composition-lifecycle-status)
- [Messages canoniques](../../docs/v1/technical/composition-status-messages.md)
