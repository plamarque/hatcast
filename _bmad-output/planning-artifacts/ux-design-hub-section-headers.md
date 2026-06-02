---
title: UX — Hub section headers (typography & rhythm)
author: Sally (UX)
date: '2026-05-31'
status: approved
relatedArtifacts:
  - _bmad-output/planning-artifacts/ux-hub-a-faire.md
  - _bmad-output/planning-artifacts/ux-design-mon-compte.md
  - _bmad-output/planning-artifacts/ux-voice-and-tone.md
  - docs/v2/technical/FRONTEND_UI.md
trigger: 'Mes Stats section titles feel smaller and tighter than Accueil (2026-05-31 review)'
---

# UX — Entêtes de section hub membre

**Objectif :** fixer un **rythme vertical** et une **hiérarchie typographique** communs pour les écrans « hub » membre, afin d’éviter les dérives lors du réemploi de composants (dialogue, admin, workspace).

**Complète :** [`FRONTEND_UI.md`](../../docs/v2/technical/FRONTEND_UI.md) (M3, mobile-first) · [`ux-hub-a-faire.md`](ux-hub-a-faire.md) (chrome nav) · [`ux-design-mon-compte.md`](ux-design-mon-compte.md) (squelette page membre).

---

## Problème

Sur **Mes Stats**, les titres « Ma saison en un clin d'œil » et « Rôles favoris » paraissent **plus petits** et **plus serrés** que sur **Accueil** (« Actions requises », « Prochain spectacle », « Accès rapides »).

**Cause racine :** `app-member-profile-panel` réutilise les styles du **dialogue profil** (`member-profile-dialog.scss`), conçus pour un espace compact modal — pas pour une page hub pleine largeur. La classe wrapper `member-profile__section` existe dans le HTML mais **n’a pas de règles CSS**.

---

## Périmètre — trois niveaux de titre

| Niveau | Rôle | Élément HTML | Exemples |
|--------|------|--------------|----------|
| **L1 — Page** | Titre d’écran dans le chrome hub | `h1` | Accueil · Mon agenda · Mes Stats · Mon compte |
| **L2 — Section** | Regroupement de contenu principal | `h2` | Actions requises · Prochain spectacle · Rôles favoris |
| **L3 — Sous-section** | Bloc secondaire, dialogue, filtre, onglet admin | `h3` ou label | Titre dialogue profil · dimension filtre · Externes (admin) |

**Règle :** sur une **page hub membre**, le contenu principal utilise **L2**. Ne pas descendre en L3 uniquement parce que le markup vient d’un composant partagé avec un dialogue.

---

## Tokens normatifs — hub membre (L1 + L2)

Référence canonique : **Accueil** (`member-home-todo`) et **Mon compte** (`account-placeholder`) — implémentations alignées au 2026-05-31.

### L1 — Titre de page (`h1`)

| Propriété | Valeur |
|-----------|--------|
| `font-size` | `1.75rem` |
| `font-weight` | `700` |
| `letter-spacing` | `-0.02em` |
| `margin` | `0` |
| Marge sous le bloc header (titre + sous-titre) | `1.25rem` |
| Conteneur page | `max-width: 56rem`, `padding: 1rem 1rem 2rem` |

**Écrans concernés :** `/accueil`, `/agenda`, `/membre/:userSlug`, `/compte`, listes troupes/saisons (même famille hub).

### L2 — Titre de section (`h2`)

| Propriété | Valeur |
|-----------|--------|
| `font-size` | **`1rem`** |
| `font-weight` | `600` |
| `letter-spacing` | `0.01em` |
| Marge titre → contenu | **`0.65rem`** (`margin: 0 0 0.65rem`) |
| Marge entre sections | **`1.5rem`** sur le wrapper `__section` (`margin-bottom`; `0` sur `:last-child`) |

### Respiration avant la première section

| Contexte | Règle |
|----------|--------|
| Contenu après le header page | Le header fournit déjà `margin-bottom: 1.25rem` — suffisant. |
| Contenu après un **bloc résumé** (ex. compteurs Mes Stats, bannière « Tout est à jour ») | **`margin-bottom: 1.25rem`** minimum sur le bloc résumé **ou** `margin-top: 1.25rem` sur la première `__section`. |
| Jamais | Titre L2 collé au contenu précédent sans intervalle visible. |

### Sous-titre de section (optionnel)

Texte d’aide sous le titre L2 (ex. Mon compte) :

| Propriété | Valeur |
|-----------|--------|
| `font-size` | `0.85rem` |
| `opacity` | `0.8` |
| Marge | `margin: -0.35rem 0 0.65rem` (resserre légèrement sous le titre, espace avant le contenu) |

---

## Écarts connus (à corriger)

| Surface | Fichier | Écart vs norme L2 |
|---------|---------|-------------------|
| **Mes Stats** (panneau profil) | `member-profile-dialog.scss` | `0.95rem`, marge `0.5rem`, pas de `__section`, pas d’espace après stats |
| **Mes troupes** (liste) | `troupes-list.scss` | `1.25rem` L2, section `2rem` — **niveau « liste catalogue »** (voir ci-dessous) |
| **Hub troupe** | `troupe-hub.scss` | `1.15rem` L2 — héritage pré-hub ; à rapprocher ou documenter exception |

---

## Exceptions documentées (hors norme hub L2)

Ces surfaces **ne sont pas** des pages hub membre quotidiennes ; elles peuvent garder des titres plus grands ou un rythme différent **tant que l’écart est volontaire** :

| Surface | Titre section | Justification |
|---------|---------------|---------------|
| **Listes catalogue** (`/troupes`, `/saisons`) | L2 ≈ `1.25rem`, sections `2rem` | Peu de sections, contenu carte ; hiérarchie plus « magazine » |
| **Workspace saison** (`/saison/:slug`) | Header sticky `1.15rem` (L1 contextuel) | Chrome workspace, pas page hub ; voir journey league |
| **Admin participants** | L2 `1rem`, grille `gap: 1.5rem` | Aligné hub L2 pour le titre ; layout admin |
| **Dialogues / overlays** (`mat-dialog`, bottom sheet filtre) | L2 dialogue ≈ `1.1rem` | Densité modal ; **ne pas importer** ces tokens sur une page pleine |
| **Menus** (`mat-menu`, context switcher) | Label `0.75rem` uppercase | Ce ne sont pas des sections de page |

---

## Règles d’implémentation (anti-dérive)

### R1 — Composant partagé page + dialogue

Si un composant (`app-member-profile-panel`, futur widget stats, etc.) sert **à la fois** en page et en dialogue :

1. **Typo L2 hub** = tokens ci-dessus sur la page.
2. Le dialogue peut ajouter un wrapper (`mat-dialog-content`) avec son propre `gap` — **sans réduire** la taille L2 en dessous de `1rem` sur la page.
3. Préférer à terme un **partial SCSS partagé** (ex. `hub-section.scss`) importé par les pages hub, plutôt que de dupliquer les valeurs dans chaque feature.

### R2 — Nommage BEM

| Élément | Classe attendue |
|---------|-----------------|
| Wrapper section | `{feature}__section` |
| Titre L2 | `{feature}__section-title` |
| Hint optionnel | `{feature}__section-hint` |

### R3 — HTML & a11y

- Une seule **`h1`** par page hub.
- Sections principales : **`h2`** + `aria-labelledby` sur `<section>`.
- **`h3`** réservé au dialogue (sous le `h2` du nom) ou sous-sections explicites.

### R4 — Revue story UI

Toute story touchant un écran hub membre vérifie :

- [ ] L1 = `1.75rem` / L2 = `1rem` / `font-weight` 700 / 600
- [ ] Espacement section = `1.5rem` ; titre → contenu = `0.65rem`
- [ ] Pas de réutilisation aveugle de SCSS dialogue/overlay sur une page pleine
- [ ] Checklist M3 [`FRONTEND_UI.md`](../../docs/v2/technical/FRONTEND_UI.md) § checklist

---

## Références code (état 2026-05-31)

| Statut | Page | Fichiers |
|--------|------|----------|
| ✅ Canon | Accueil | `member-home-todo.scss` |
| ✅ Canon | Mon compte | `account-placeholder.scss` |
| ✅ Canon | Admin participants (L2 titre) | `admin-participants.scss` |
| ✅ Aligné | Mes Stats | `member-profile-dialog.scss` (via panel + `hub-section.scss`) |
| ⚠️ Exception | Mes troupes | `troupes-list.scss` |
| ⚠️ Exception | Hub troupe | `troupe-hub.scss` |

### Snippet normatif L2 (copier / factoriser)

```scss
// hub-section.scss (cible factorisation)
@mixin hub-section {
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
}

@mixin hub-section-title {
  margin: 0 0 0.65rem;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}
```

---

## Prochaines étapes suggérées

| # | Action | Priorité |
|---|--------|----------|
| 1 | Aligner `member-profile-panel` sur tokens L2 + espacement sections | ~~Haute~~ **done** (2026-05-31) |
| 2 | Passer les `h3` section du panel en `h2` sur la page (input `headingLevel` ou template conditionnel) | ~~Moyenne~~ **done** (`sectionHeadingLevel`) |
| 3 | Extraire `hub-section.scss` dans `shared/` et migrer Accueil + Mon compte + Mes Stats | En cours — mixin créé ; migration Accueil + Mon compte reste |
| 4 | Décider si `/troupes` reste en exception « catalogue » ou converge vers L2 `1rem` | Basse (produit) |

---

## Critères d’acceptation — alignement Mes Stats

- [ ] Titres « Ma saison en un clin d'œil » et « Rôles favoris » = **même taille visuelle** qu’« Actions requises » sur Accueil
- [ ] Intervalle visible entre compteurs colorés et première section
- [ ] Intervalle entre sections ≈ Accueil (scroll rapide Accueil ↔ Stats : rythme perçu identique)
- [ ] Dialogue profil membre : pas de régression (mobile ≤ 480 px)
- [ ] Un seul `h1` « Mes Stats » ; sections en `h2`
