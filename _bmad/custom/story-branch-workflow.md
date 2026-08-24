# HatCast — isolated Git worktree per manual BMad unit

Convention **obligatoire** pour le cycle story BMad sur la stack V2.

## Modèle

| Rôle | Branch and worktree |
|------|-------------|
| Intégration dev (deploy cloud dev) | clean `v2` (`HATCAST_V2_BRANCH_DEV`) checkout |
| Implémentation d’une story | `feat/{story-key}` in deterministic adjacent unit worktree |
| Recette / release | `staging-v2`, tags semver (hors scope story) |

Exemple : story `17-43-event-detail-contexte-infos` → branche `feat/17-43-event-detail-contexte-infos`.

## Script mécanique

```bash
./scripts/v2/story-branch.sh start STORY_KEY  # from clean v2: create/reopen and bootstrap unit
./scripts/v2/story-branch.sh assert STORY_KEY # from unit: before manual story/code edits
./scripts/v2/story-branch.sh merge STORY_KEY  # from clean v2 after approved review (local)
git push origin v2                              # manuel, après merge
```

## Gates par skill BMad

### `bmad-create-story` (CS)

1. **Après l’étape 1** (quand `story_key` est connu), **avant l’étape 2** :
   - Depuis le checkout d’intégration propre `v2`, exécuter `./scripts/v2/story-branch.sh start {{story_key}}`.
   - **HALT** si le script échoue (arbre sale, clé non sûre, conflit de chemin, remote absent ou bootstrap incomplet). Si le runtime BMad n’est pas en cache, demander confirmation puis relancer avec `HATCAST_BMAD_ALLOW_NETWORK=1`.
   - Continuer uniquement dans le worktree indiqué par `WORKTREE_PATH`; ne jamais changer le checkout d’intégration.
2. **À l’étape 5** (création du fichier story), inclure dans le **frontmatter YAML** :
   ```yaml
   feature_branch: feat/{{story_key}}
   baseline_commit: <BASELINE_COMMIT du script>
   ```
3. Ne **jamais** créer le fichier story ni modifier le code sur `v2` directement. Ne pas enregistrer `WORKTREE_PATH` dans le frontmatter : le dériver localement.

### `bmad-dev-story` (DS)

1. **Avant l’étape 4** (passage `in-progress`), depuis le worktree unité :
   - Lire `feature_branch` dans le frontmatter de la story
   - Exécuter `./scripts/v2/story-branch.sh assert {{story_key}}`
   - Si `baseline_commit` absent et status `ready-for-dev`, capturer la valeur `BASELINE_COMMIT` du script, jamais un chemin local.
2. Tous les commits de la story restent sur `feat/{story-key}`.
3. Ne **pas** merger vers `v2` dans ce workflow, ne pas pousser, et ne pas supprimer le worktree unité.

### `bmad-code-review` (CR)

1. Vérifier `./scripts/v2/story-branch.sh assert {{story_key}}` dans le worktree unité, ou signaler si review hors unité.
2. Diff de review : `git diff {{baseline_commit}}..HEAD` (ou merge-base avec `v2` si baseline absent).
3. Si un humain confirme la review **approuvée** : recommander `./scripts/v2/story-branch.sh merge {{story_key}}` depuis le checkout `v2` propre et à jour, puis push manuel de `v2` — **ne pas push sans demande explicite**. Le script de merge ne peut pas prouver cette approbation.

## Parallélisme

Plusieurs stories en parallèle = plusieurs worktrees adjacents `feat/*` depuis `v2`. Rebaser uniquement depuis le worktree unité concerné :

```bash
git fetch origin
git rebase origin/v2
```

## Exceptions

- Stories **docs-only** ou **ops** sans code : même convention (isolation + review).
- Hotfix urgent sur `v2` : hors cycle BMad ; documenter dans le Change Log de la story si applicable.
- Un échec de bootstrap laisse le worktree unité inspectable. Le bootstrap installe les workflows BMad standards épinglés uniquement dans l’unité; tout téléchargement requiert `HATCAST_BMAD_ALLOW_NETWORK=1`. Aucune suppression, fusion ou copie de secrets n’est automatique.
