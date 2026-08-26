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
./scripts/v2/story-branch.sh integrate STORY_KEY # from clean v2 after approved review: merge, push, verify, cleanup
```

`merge` remains the local-only compatibility command: it neither pushes nor
changes the unit checkout. `integrate` is the explicit post-review command.
It merges locally, pushes `v2`, fetches and verifies that `origin/v2` contains
the integrated HEAD, then removes this clean local unit worktree and its local
`feat/{story-key}` branch. It never deletes `origin/feat/{story-key}`.

## Runtime readiness (Epic 21)

From a valid `feat/{story-key}` unit, inspect without mutation:

```bash
./scripts/v2/story-worktree-runtime.sh inspect
```

The output contains semantic states only: it never prints environment values,
link targets, local paths, or process details. `prepare` is the explicit local
operation. It may create an absent unit `.env` as a relative symlink to the
canonical local `v2/.env`, run root `npm ci` with its normal shared npm cache,
and provision Playwright Chromium in its normal shared browser cache. It never
copies ignored files or shares `node_modules`.

```bash
./scripts/v2/story-worktree-runtime.sh prepare
```

An existing or broken `.env` is an operator conflict and is never replaced.
Ports `8080` and `4200` must be free; readiness only reports the unavailable
port and never identifies or stops a process. A ready result is a handoff, not
an E2E run: execute isolated E2E separately with
`PLAYWRIGHT_REUSE_SERVERS=0`; never use `start-dev.sh` or a normal development
API as E2E evidence. Human smoke remains a separate, later action.

### Preuve E2E ciblée (Epic 21)

Après une inspection qui se termine par `READINESS=ready`, produire la preuve
Playwright depuis le worktree `feat/{story-key}` :

```bash
./scripts/v2/story-e2e-evidence.sh \
  --target 3-19 \
  --rationale 'Retrait roster saison' \
  --project chromium-3-19
```

Le script découvre les projets/specs déclarés, appelle uniquement
`scripts/run_e2e.sh` avec `PLAYWRIGHT_REUSE_SERVERS=0`, puis écrit une
attestation JSON sous
`_bmad-output/implementation-artifacts/e2e-evidence/`. Elle contient la
sélection, sa rationale, la commande normalisée, le résultat et la référence
relative `apps/web/playwright-report/index.html`. Elle ne contient ni valeurs
d'environnement, ni chemin local absolu, ni sortie de processus.

Si aucune couverture déclarée ne correspond, ne demander ni smoke humain ni
approbation d'intégration. Enregistrer exactement une disposition :
`--test-now <reference-relative>`, `--cited-equivalent <fichier-relatif>`, ou
`--waiver-policy <fichier-json-relatif>`. Une waiver policy est fournie par
l'opérateur ; elle doit nommer son autorité, ses champs obligatoires, et une
approbation de même autorité non expirée. Le script ne crée jamais cette
autorité et une attestation E2E ne prouve ni une recette humaine ni une
approbation d'intégration.

### Handoff de smoke humain (Epic 21)

Après `READINESS=ready` et une attestation E2E passée, ou sa disposition
acceptée, préparer un guide JSON non secret contenant exactement `route`,
`account_or_fixture_reference`, `actions` et `expected_observations`. Puis,
depuis le worktree `feat/{story-key}` :

```bash
./scripts/v2/story-human-smoke-handoff.sh start --guide docs/v2/smoke/story-guide.json
```

La sortie fournit `https://localhost:4200`, le guide complété, l'identité de
branche/baseline et la référence E2E. Elle démarre exclusivement
`start-dev.sh --no-tailscale` dans son propre groupe de processus. Ce smoke ne
remplace ni l'E2E isolé, ni une approbation humaine, ni l'autorisation
d'intégrer. À la fin de la recette, arrêter uniquement cette instance :

```bash
./scripts/v2/story-human-smoke-handoff.sh stop
```

`status` réaffiche le handoff seulement si son marqueur de propriété reste
vérifiable. Le contrôleur refuse tout état existant, stale ou non possédé ; il
ne recherche ni n'arrête de processus externes.

## BMad Loop preflight (Epic 21)

Before any Loop command, operate from the clean `v2` integration checkout. This
also applies to a dry-run: it is not an exception to the worktree contract.
The following shell is intentionally strict; a failed command stops the
preflight.

```bash
set -euo pipefail

test "$(git branch --show-current)" = "v2"
git diff --quiet
git diff --cached --quiet

bmad-loop init --project . --cli codex
python3 - <<'PY'
from pathlib import Path
import re

path = Path(".bmad-loop/policy.toml")
text = path.read_text()
adapter, separator, remainder = text.partition("[adapter]\n")
if not separator:
    raise SystemExit("missing [adapter] policy section")
body, next_section, tail = remainder.partition("\n[")
body, substitutions = re.subn(r'(?m)^name\s*=\s*"[^"]*"', 'name = "codex"', body, count=1)
if substitutions != 1:
    raise SystemExit("missing adapter name in policy")
path.write_text(adapter + separator + body + next_section + tail)
PY

test -f .bmad-loop/policy.toml
git check-ignore -q .bmad-loop/policy.toml
if git ls-files --error-unmatch .bmad-loop/policy.toml >/dev/null 2>&1; then
  echo "policy.toml must not be tracked" >&2
  exit 1
fi
git diff --quiet
git diff --cached --quiet

validation_json="$(bmad-loop validate --project . --json)"
jq -e '
  .ok == true
  and any(.findings[]; .check == "policy" and .severity == "ok"
    and .detail.adapters.dev == "codex"
    and .detail.adapters.review == "codex"
    and .detail.adapters.triage == "codex")
  and any(.findings[]; .check == "hooks.registered" and .severity == "ok"
    and .detail.profile == "codex")
  and any(.findings[]; .check == "skills.base" and .severity == "ok")
' <<<"$validation_json" >/dev/null
```

`init` creates or updates the ignored local policy. It may default to Claude,
so the command above forces `[adapter] name = "codex"` before validation. Never
place a secret in this policy. Do not put the queue into execution if any check
fails.

When `21-1-loop-readiness-contract` is the only Epic 21 story in
`ready-for-dev` (later stories remain `backlog`), run this deterministic
selection check:

```bash
set -euo pipefail

worktrees_before="$(git worktree list --porcelain)"
tmux_sessions_before="$(tmux list-sessions -F '#{session_name}' 2>/dev/null || true)"
dry_run_output="$(bmad-loop run --project . --dry-run --epic 21 --max-stories 1)"
selected_story_keys="$(printf '%s\n' "$dry_run_output" | sed -nE 's/^[[:space:]]+([0-9]+-[^[:space:]]+) \(epic [0-9]+, status [^)]+\)$/\1/p')"

test "$(printf '%s\n' "$selected_story_keys" | sed '/^$/d' | wc -l | tr -d ' ')" -eq 1
test "$selected_story_keys" = "21-1-loop-readiness-contract"
test "$(git worktree list --porcelain)" = "$worktrees_before"
test "$(tmux list-sessions -F '#{session_name}' 2>/dev/null || true)" = "$tmux_sessions_before"
```

The comparison of Git worktrees and tmux sessions before and after the command
is the explicit no-new-worktree and no-session proof. Never replace `--dry-run`
with a real run in this preflight. The command does not bypass `story-branch.sh`
and is neither human review nor integration approval: the `assert`, `merge`, and
`integrate` guards remain mandatory.

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
3. Si un humain confirme la review **approuvée** : recommander `./scripts/v2/story-branch.sh integrate {{story_key}}` depuis le checkout `v2` propre et à jour. Cette invocation explicite pousse `v2`, vérifie le remote, puis supprime sans confirmation supplémentaire l’unité locale et sa branche locale. Ne jamais supprimer la branche distante de story automatiquement. Le script ne peut pas prouver cette approbation.

## Parallélisme

Plusieurs stories en parallèle = plusieurs worktrees adjacents `feat/*` depuis `v2`. Rebaser uniquement depuis le worktree unité concerné :

```bash
git fetch origin
git rebase origin/v2
```

## Exceptions

- Stories **docs-only** ou **ops** sans code : même convention (isolation + review).
- Hotfix urgent sur `v2` : hors cycle BMad ; documenter dans le Change Log de la story si applicable.
- Un échec de bootstrap laisse le worktree unité inspectable. Le bootstrap installe les workflows BMad standards épinglés uniquement dans l’unité; tout téléchargement requiert `HATCAST_BMAD_ALLOW_NETWORK=1`. Aucun secret n’est copié. `integrate` ne nettoie qu’après publication et vérification distantes réussies; en cas d’échec, l’unité et la branche locale restent disponibles.
