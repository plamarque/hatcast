---
title: 'Rail compte sticky desktop'
type: 'bugfix'
created: '2026-05-31'
status: 'done'
route: 'one-shot'
---

## Intent

**Problem:** Sur desktop (≥ 840 px), le bouton « Compte » en bas du rail disparaît dès que le contenu principal défile : la colonne rail s’étirait sur toute la hauteur de la page et le footer compte suivait le bas du document, pas celui du viewport.

**Approach:** Borner la colonne rail à la hauteur du viewport (`height` / `max-height: 100dvh`) et la rendre `position: sticky; top: 0` avec `align-self: flex-start`, pour que `margin-top: auto` sur le footer pousse le compte au bas de l’écran visible.

## Suggested Review Order

1. [member-nav.scss](../../apps/web/src/app/shared/member-nav/member-nav.scss) — colonne desktop sticky + hauteur viewport
2. [member-nav.html](../../apps/web/src/app/shared/member-nav/member-nav.html) — structure rail + footer compte
3. [member-shell.scss](../../apps/web/src/app/layout/member-shell/member-shell.scss) — contexte flex row desktop
