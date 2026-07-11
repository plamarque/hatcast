---
feature_branch: feat/4-4-guides-video-page-connexion
baseline_commit:
---

# Story 4.4 : Guides vidéo sur la page connexion (public)

Status: ready-for-dev

## Story

En tant que **visiteur non connecté** (membre, organisateur ou administrateur potentiel),  
je veux **découvrir HatCast 2 via des guides vidéo depuis la page `/connexion`**,  
afin de **me familiariser avec l’outil avant la bascule M4**, sans entrer dans l’application.

## Acceptance Criteria

1. **Given** un visiteur non authentifié sur **`/connexion`**, **when** la page s’affiche, **then** une section **« Découvrir HatCast »** (ou libellé équivalent) propose **trois liens** ou boutons : guide **membre**, guide **organisateur**, guide **administrateur**.
2. **Given** les trois URLs YouTube configurées (PO), **when** l’utilisateur clique un guide, **then** le lien s’ouvre vers YouTube (**nouvel onglet**, `rel="noopener noreferrer"`) — pas d’iframe embarquée, pas de player in-app.
3. **Given** une URL YouTube absente ou placeholder en config, **when** la page se charge, **then** le CTA correspondant est **masqué** (pas de lien mort).
4. **Given** viewport mobile (≤ 480px), **when** la section guides est visible, **then** les trois CTAs restent lisibles et tactiles (≥ 48dp) ; la carte connexion reste le focus principal (guides **sous** le bloc auth, pas au-dessus du formulaire).
5. **Given** build prod, **when** les URLs sont injectées, **then** elles proviennent de **`environment`** (ou fichier config build-time) — pas de hardcode en template ; PO peut remplacer la vidéo sur YouTube sans redeploy si l’URL reste la même.
6. **Given** utilisateur déjà connecté, **when** il visite `/connexion`, **then** comportement auth existant inchangé (redirection post-login) ; guides visibles seulement tant que non connecté **ou** selon comportement actuel de la page (documenter en Dev Notes si redirect immédiat).

**Couverture produit :** M4 comms pre-cutover ; page publique unique V2 (`/connexion`) ; hors scope Epic 4.2 (pages saison publiques).

**Hors scope :**

- Guides **in-app** (Mon compte, hub membre) — report post-M4 si besoin.
- Hébergement vidéo autre que YouTube.
- i18n EN.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — CTAs : `mat-stroked-button` ou `mat-button` avec `mat-icon` (ex. `play_circle`) ; section dans `mat-card` existante ou bloc secondaire sous la carte auth.

**M3-2. Tokens & thème** — `var(--mat-sys-*)` uniquement ; liens YouTube = boutons Material, pas `<a>` stylé à la main hors Material.

**M3-3. Mobile & tactile** — Section empilée verticalement ; `aria-label` français si libellé tronqué (« Voir le guide vidéo membre »).

**M3-4. Navigation membre** — N/A (page auth publique, hors member shell).

**M3-5. Revue** — Checklist FRONTEND_UI.md en fin de story.

---

## Tasks / Subtasks

- [ ] **Périmètre :** `apps/web/` — `login.html` / `login.ts` / `login.scss` ; `environment*.ts` ou `video-guides.config.ts`
- [ ] Ajouter config : `videoGuideMemberUrl`, `videoGuideOrganizerUrl`, `videoGuideAdminUrl` (strings, optional empty)
- [ ] Section UI sous le bloc connexion : titre + 3 CTAs
- [ ] Tests unitaires : CTAs masqués si URL vide ; liens corrects si remplis
- [ ] E2E smoke (optionnel) : présence section si au moins une URL en env test
- [ ] PO : renseigner URLs réelles après upload YouTube (3 personas Malice)

## Dev Notes

### Product and UX rules

- Vidéos **orientées La Malice**, contenu basique — suffisant pour M4 ; remplacement contenu YouTube sans changement URL.
- Même section peut être réutilisée sur `/inscription` si PO le demande (follow-up, pas cette story).

### Config PO (exemple)

```typescript
// environment.prod.ts (build from .env)
videoGuides: {
  member: 'https://www.youtube.com/watch?v=XXXX',
  organizer: 'https://www.youtube.com/watch?v=YYYY',
  admin: 'https://www.youtube.com/watch?v=ZZZZ',
}
```

Variables `.env` suggérées : `HATCAST_VIDEO_GUIDE_MEMBER_URL`, `HATCAST_VIDEO_GUIDE_ORGANIZER_URL`, `HATCAST_VIDEO_GUIDE_ADMIN_URL`.

### Explicit non-goals

- PostHog events (optionnel follow-up).
- Playlist YouTube embed.
- Traduction.

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| M4 gate | open | Livrable **avant** release v2.4.2 prod |
| 4-2 pages publiques | backlog | Indépendant |

### References

- [PLAN.md](../../PLAN.md) § **Ordre M4 — session 2026-07-11**
- [login.html](../../apps/web/src/app/pages/login/login.html)
- [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md)
