# Story UX — Dialog close patterns (Phase 2b)

Status: done

## Story

En tant que **utilisateur**,  
je veux **un rendu visuel cohérent des boutons de modale**,  
afin de **ne plus voir Fermer en stroked, tonal ou texte selon l’écran**.

## Acceptance Criteria

1. **Given** un footer `mat-dialog-actions` ou sheet équivalent, **when** le dismiss est affiché, **then** cible ≥ 3 rem et style `mat-button` text primary via `_hatcast-dialog-actions.scss`.
2. **Given** les dialogs compte e-mail / mot de passe, **when** l’e-mail courant est affiché, **then** `mat-form-field` outline readonly (aligné sur le champ de saisie).
3. **Given** `share-announce-dialog`, **when** Copier / WhatsApp sont visibles, **then** `mat-button` + icône (plus `mat-stroked-button`).
4. **Given** la spec UX-DR23, **when** Phase 2b est livrée, **then** § Phase 2b documente les choix et overrides retirés.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1** — `mat-button` dismiss ; `mat-flat-button` primaire ; contenu `.hatcast-dialog-content-actions`.

**M3-2** — Tokens `--mat-sys-primary` via `mat.button-overrides` dans le partial global.

**M3-3** — Cibles 3 rem footer ; mobile wrap.

**M3-4** — N/A.

**M3-5** — Spec + story à jour.

---

## Tasks / Subtasks

- [x] `_hatcast-dialog-actions.scss` + import `styles.scss`
- [x] Account security champs readonly outline
- [x] Share-announce actions mat-button
- [x] Nettoyage overrides locaux
- [x] Spec + story
