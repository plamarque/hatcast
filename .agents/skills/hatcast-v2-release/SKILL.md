---
name: hatcast-v2-release
description: >-
  Assiste les releases staging V2 HatCast (release_version.sh) avec rédaction
  Argil des notes « Nouveautés », preview dry-run sans toucher le repo, et gates
  de validation avant apply. Use when the user mentions release staging V2,
  release_version, changelog nouveautés, semver RC tag, or dry-run release.
disable-model-invocation: true
---

# HatCast V2 — Release staging assistée

Workflow **preview-first** : rédiger et valider les notes utilisateur **dans le chat** avant toute écriture disque ou release réelle.

Références :
- [argil-editorial.md](argil-editorial.md) — règles éditoriales
- [examples.md](examples.md) — cutovers validés v2.1.0 / v2.2.0
- Script mécanique : [`scripts/release_version.sh`](../../../scripts/release_version.sh)
- Contexte read-only : [`scripts/v2/release-context.sh`](../../../scripts/v2/release-context.sh)

## Modes

| Mode | Déclencheurs | Effet sur le repo |
|------|--------------|-------------------|
| **preview** (défaut) | « dry run », « preview », « simule », première invocation | **Aucune écriture** |
| **apply** | « OK pour release », « go », « lance la release » (après Gate B) | Cutover + release réelle |

Tant que l'utilisateur n'a pas demandé explicitement **apply**, rester en preview.

## Phases

### 1. Intake

- Clarifier le bump : `--patch` | `--minor` | `--major` | RC seule (sans bump)
- Confirmer le mode preview vs apply
- Rappeler le prérequis humain : smoke E2E staging vert après `./scripts/deploy_staging.sh`

### 2. Preflight

- Exécuter : `./scripts/v2/release-context.sh [--patch|--minor|--major] [--json]`
- En mode **apply** uniquement : `git status --porcelain` doit être vide — sinon HALT
- En preview : un arbre dirty est acceptable (pas de commit)

### 3. Contexte

À partir de la sortie de `release-context.sh` et du JSON :

- Lire les commits `feat` / `fix` / autres de la plage
- Croiser avec les stories `_bmad-output/implementation-artifacts/*.md` (IDs dans les sujets de commit, ex. `(19.7)`)
- Lire les diffs des features majeures si les sujets de commit sont trop techniques

### 4. Rédaction (chat only)

Produire un **draft** des puces « Nouveautés » :

- Français, tutoiement, max **5** puces (~120 caractères chacune)
- Emojis : ✨ nouveauté, 🐛 correction ressentie, 🔧 amélioration visible
- Appliquer [argil-editorial.md](argil-editorial.md) et calquer le ton sur [examples.md](examples.md)
- Format cible cutover : voir section « Cutover JSON » ci-dessous

**Interdit en preview** : `git add`, `git commit`, `git push`, écriture de fichiers.

### 5. Gate A — validation notes

Présenter le draft clairement. Boucler jusqu'à approbation explicite :

- Accepté : « OK pour les notes », « valide les notes », équivalent
- Retouches : reformuler, ajouter, fusionner, supprimer des puces → retour phase 4

**HALT** : ne pas passer à la phase 6 sans Gate A.

### 6. Preview technique (optionnel, recommandé)

Sur demande ou avant Gate B :

1. Écrire temporairement le cutover **seulement si** l'utilisateur a validé Gate A **et** demande le preview script — **préférer** montrer le JSON cutover proposé sans l'écrire d'abord
2. Pour le CHANGELOG.md technique sans écrire le cutover : relire la liste commits de `release-context.sh` et formater comme le ferait `CHANGELOG.md`
3. Si l'utilisateur demande le dry-run bash complet : `./scripts/release_version.sh [flags] --dry-run` **uniquement après** avoir écrit le cutover sur disque (sinon le script échoue — cutover obligatoire). Alternative sans écriture : décrire le CHANGELOG technique depuis `release-context.sh`

Afficher deux blocs :
- **Notes utilisateur** (draft Gate A)
- **CHANGELOG technique** (commits classés feat/fix/other)

**HALT** jusqu'à « OK pour release » (Gate B) ou abandon.

### 7. Apply

Uniquement après Gate A **et** Gate B :

1. Écrire `scripts/v2/changelog-entries/v{VERSION}-cutover.json` (voir template)
2. Committer le cutover sur la branche de travail (message `docs(release): Add vX.Y.Z user changelog cutover` ou inclus dans le commit release)
3. Lancer `./scripts/release_version.sh [flags]` **sans** `--dry-run`
4. **Ne jamais** `git push` sans demande explicite de l'utilisateur

Après apply : résumer tag RC, fichiers modifiés, lien CI si pertinent.

## Cas RC-only (ex. v2.3.0-rc.2)

Si `release-context.sh` indique `cutover_exists: true` pour la version produit :

- Sauter phases 4–5 sauf si l'utilisateur veut mettre à jour les notes
- Phase 6 suffit pour preview mécanique ; phase 7 pour incrément RC

## Cutover JSON

Fichier : `scripts/v2/changelog-entries/v{VERSION}-cutover.json`

```json
{
  "version": "X.Y.Z",
  "date": "__BUILD_DATE__",
  "source": "curated-release",
  "notes": "Courte description PO/dev — skill hatcast-v2-release",
  "changes": [
    "✨ …",
    "🐛 …"
  ]
}
```

Le script release remplace `__BUILD_DATE__` à l'exécution. Les champs `source` et `notes` sont retirés du JSON publié.

## Fin de session preview

Toujours confirmer : **« Repo inchangé »** et exécuter `git status --short` si utile.

La sandbox `.dry-run-sandbox-v2/` peut exister après un dry-run bash ; rappeler `rm -rf .dry-run-sandbox-v2` si présente.

## Anti-patterns

- Écrire le cutover avant Gate A
- Lancer `release_version.sh` sans `--dry-run` en mode preview
- Push sans demande explicite
- Copier les sujets de commit bruts dans les puces utilisateur
- Inventer une fonctionnalité absente des commits / stories
