# HatCast — branche Git par user story (BMad)

Convention **obligatoire** pour le cycle story BMad sur la stack V2.

## Modèle

| Rôle | Branche Git |
|------|-------------|
| Intégration dev (deploy cloud dev) | `v2` (`HATCAST_V2_BRANCH_DEV`) |
| Implémentation d’une story | `feat/{story-key}` |
| Recette / release | `staging-v2`, tags semver (hors scope story) |

Exemple : story `17-43-event-detail-contexte-infos` → branche `feat/17-43-event-detail-contexte-infos`.

## Script mécanique

```bash
./scripts/v2/story-branch.sh start STORY_KEY    # après create-story step 1
./scripts/v2/story-branch.sh assert STORY_KEY # avant dev-story / commits code
./scripts/v2/story-branch.sh merge STORY_KEY    # après code review approuvé (local)
git push origin v2                              # manuel, après merge
```

## Gates par skill BMad

### `bmad-create-story` (CS)

1. **Après l’étape 1** (quand `story_key` est connu), **avant l’étape 2** :
   - Exécuter `./scripts/v2/story-branch.sh start {{story_key}}`
   - **HALT** si le script échoue (arbre sale, remote absent, etc.)
2. **À l’étape 5** (création du fichier story), inclure dans le **frontmatter YAML** :
   ```yaml
   feature_branch: feat/{{story_key}}
   baseline_commit: <BASELINE_COMMIT du script>
   ```
3. Ne **jamais** créer le fichier story ni modifier le code sur `v2` directement.

### `bmad-dev-story` (DS)

1. **Avant l’étape 4** (passage `in-progress`) :
   - Lire `feature_branch` dans le frontmatter de la story
   - Exécuter `./scripts/v2/story-branch.sh assert {{story_key}}`
   - Si `baseline_commit` absent et status `ready-for-dev`, capturer `git rev-parse HEAD` **sur la feature branch**
2. Tous les commits de la story restent sur `feat/{story-key}`.
3. Ne **pas** merger vers `v2` dans ce workflow.

### `bmad-code-review` (CR)

1. Vérifier `./scripts/v2/story-branch.sh assert {{story_key}}` ou signaler si review hors branche story.
2. Diff de review : `git diff {{baseline_commit}}..HEAD` (ou merge-base avec `v2` si baseline absent).
3. Si **approuvé** : recommander `./scripts/v2/story-branch.sh merge {{story_key}}` puis push manuel de `v2` — **ne pas push sans demande explicite**.

## Parallélisme

Plusieurs stories en parallèle = plusieurs branches `feat/*` depuis `v2`. Rebaser régulièrement :

```bash
git fetch origin
git checkout feat/MY-STORY
git rebase origin/v2
```

## Exceptions

- Stories **docs-only** ou **ops** sans code : même convention (isolation + review).
- Hotfix urgent sur `v2` : hors cycle BMad ; documenter dans le Change Log de la story si applicable.
