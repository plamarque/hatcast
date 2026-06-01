# HatCast — project context (agents)

Fichier **court** pour les skills BMad (`bmad-dev-story`, `bmad-create-story`, `bmad-code-review`) et les agents Cursor. Complète [AGENTS.md](AGENTS.md) ; ne remplace pas SPEC, DOMAIN, ARCH ni le PRD.

**Regénération :** `/bmad-generate-project-context` peut rescanner le dépôt et mettre à jour ce fichier ; conserver les sections « Règles stables » ci-dessous si vous fusionnez.

---

## Produit & stack

| Zone | Technologie |
|------|-------------|
| Front V2 (cible) | Angular **21.2** + Angular Material **21.2**, PWA, `apps/web/` |
| API V2 | Kotlin, Spring Boot, REST + OpenAPI, `services/api/` |
| Données V2 | PostgreSQL (Neon), Flyway |
| Legacy (prod actuelle) | Vue + Firebase, `legacy/` — ne pas mélanger avec la V2 sans demande explicite |

**Identité UI :** Material **3** via `mat.theme()` dans `apps/web/src/styles.scss` ; tokens `var(--mat-sys-*)`. **UX-DR11** : pas Tailwind comme surface principale de layout/couleur/typo.

---

## Où lire quoi

| Besoin | Fichier |
|--------|---------|
| Comportement métier | [SPEC.md](SPEC.md), [DOMAIN.md](DOMAIN.md) |
| Architecture runtime | [ARCH.md](ARCH.md) |
| Ordre de livraison | [PLAN.md](PLAN.md) |
| UI Material 3 + checklist | [docs/v2/technical/FRONTEND_UI.md](docs/v2/technical/FRONTEND_UI.md) |
| Parcours / écrans V2 | `_bmad-output/planning-artifacts/ux-design-hatcast-v2.md`, `ux-hub-a-faire.md` |
| Epics & stories | `_bmad-output/planning-artifacts/epics.md`, `_bmad-output/implementation-artifacts/*.md` |
| Template nouvelle story | [_bmad-output/implementation-artifacts/story-template.md](_bmad-output/implementation-artifacts/story-template.md) |
| Bugs connus | [ISSUES.md](ISSUES.md) |

---

## Règles stables (ne pas ignorer)

1. **Scope** — Pas de feature inventée ; lier au PRD, epic ou demande utilisateur.
2. **Séparation spec / plan** — Pas de numéros de slice dans SPEC/DOMAIN.
3. **Front V2** — Avant tout changement visible : lire **FRONTEND_UI.md** + règle Cursor `material-m3-hatcast` sur `apps/web/**`.
4. **Stories UI** — Inclure la section **« Acceptance Criteria — Material 3 (UI) »** (voir `story-template.md`) ou marquer **N/A** si API/backend seul.
5. **Commits** — [Conventional Commits](docs/shared/technical/COMMIT_MESSAGE_GUIDELINES.md), sujet en anglais.
6. **Tests** — Ne pas désactiver les tests pour faire passer un build ; corriger le test ou le code.

---

## Commandes utiles

```bash
# Dev complet V2 (API + front HTTPS)
./scripts/start-dev.sh
# Email story 8.3 : HATCAST_NOTIFICATION_EMAIL_ENABLED=true dans .env
# → Mailpit Docker (UI http://127.0.0.1:8025), arrêt auto à la fin du script

# Tests front
npm run test -w @hatcast/web -- --watch=false
npm run build -w @hatcast/web

# Tests API (depuis la racine du monorepo, selon ARCH)
./gradlew test
```

---

## Patterns code à réutiliser (UI)

- Raccourcis membre : `apps/web/src/app/shared/member-cross-nav/`
- Navigation / dernière saison : `apps/web/src/app/core/navigation/`
- Dialogs admin : `MatDialog`, composants standalone existants sous `pages/` et `shared/`

---

## BMad (chemins)

- Config projet : `_bmad/config.toml` (régénéré par `npx bmad install`) ; overrides d’équipe : `_bmad/custom/config.toml`
- Préférences perso : `_bmad/config.user.toml` (gitignoré) ou `_bmad/custom/config.user.toml`
- Artefacts : `implementation_artifacts` → `_bmad-output/implementation-artifacts/` ; `planning_artifacts` → `_bmad-output/planning-artifacts/`
- Langue docs BMad générés : souvent **anglais** dans `document_output_language` ; stories HatCast en **français** pour l’UI produit.
