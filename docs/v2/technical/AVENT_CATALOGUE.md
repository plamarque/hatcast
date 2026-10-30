# Catalogue privé des quiz de l’Avent 2026

Cette procédure s’applique lorsqu’une contribution est transmise pour l’Avent de La Malice. Le catalogue réel et ses portraits sont des données privées : ne pas les copier dans Git, les assets publics, des logs ou une issue. Ce document ne contient que le format et des exemples fictifs.

## Situation actuelle

- Bucket privé : `gs://impro-selector-avent-content-private` (projet `impro-selector`). Accès public interdit ; les autorisations du projet restent applicables.
- Catalogue : `gs://impro-selector-avent-content-private/catalogue/avent-2026.json`.
- Portraits associés : objets sous `gs://impro-selector-avent-content-private/portraits/`.
- Le 1er décembre contient la contribution validée de Patrice et référence `portraits/patrice-net.png`. Les jours 2 à 24 contiennent des exemples fictifs à remplacer au fil des contributions. Reprendre systématiquement le fichier distant : cet état initial peut avoir changé.
- **L’application ne charge pas encore ce catalogue.** Sa présence dans le bucket ne publie aucun quiz et ne prouve pas que le compte d’exécution de l’API peut y accéder. Ne pas annoncer une mise en ligne ou un rechargement effectif avant leur implémentation et leur vérification. Le parcours de test existant conserve ses propres données fictives isolées.

## Format JSON version 1

Le document est encodé en UTF-8. À la racine : `schema_version` vaut `1`, `year` vaut `2026`, `index_base` vaut `0` et `quizzes` est la liste des 24 cases. Chaque case contient :

| Champ | Signification |
| --- | --- |
| `day` | Numéro unique du jour, de 1 à 24. |
| `kind` | `contribution` pour un contenu validé, `fictional-placeholder` pour une case provisoire. |
| `name` | Nom de la personne ou `Lutin de Noël` pour une case générique. |
| `portrait` | Objet `{"type":"bucket-object","object":"portraits/…"}` pour un portrait privé ; objet `{"type":"application-resource","path":"advent/lutin-generique-net.png"}` pour le lutin générique. Le chemin d’objet est relatif au bucket, jamais une URL publique. |
| `statements` | Tableau ordonné de trois affirmations. |
| `false_statement_index` | Index de l’affirmation fausse : `0`, `1` ou `2`, selon l’ordre du tableau. |
| `reveal` | Texte complémentaire de révélation, ou `null` si aucun complément n’existe. |

Exemple fictif d’une case, sans contribution réelle :

```json
{
  "day": 2,
  "kind": "fictional-placeholder",
  "name": "Lutin de Noël",
  "portrait": { "type": "application-resource", "path": "advent/lutin-generique-net.png" },
  "statements": ["A inventé une chanson.", "A salué un arbre.", "A rencontré un dragon."],
  "false_statement_index": 2,
  "reveal": null
}
```

Ce format décrit le fichier déposé, pas un contrat de lecture déjà implémenté. Les textes, l’index de réponse et les portraits futurs doivent rester côté serveur jusqu’à leur date autorisée ; la révélation attend le lendemain à minuit, heure de Paris. Les cases fictives sont des éléments provisoires, pas des contributions authentiques.

## Ajouter une contribution

1. Rédiger les trois affirmations et le complément de révélation à partir de la contribution reçue. Faire valider les formulations par Patrice avant de modifier le catalogue. Vérifier l’accord de la personne présentée pour le contenu et son portrait ; ne pas inventer de détail factuel.
2. Lire le catalogue **actuel** depuis le bucket dans un répertoire temporaire privé hors du dépôt. Avant téléchargement, relever la `generation` de l’objet avec `gcloud storage objects describe` et télécharger cette génération précise (`gs://…/avent-2026.json#GENERATION`). Ne pas afficher le JSON dans le terminal ou les journaux. Ne jamais utiliser une ancienne copie locale comme base de mise à jour.
3. Choisir la case `fictional-placeholder` de plus petit `day`, sauf indication contraire de Patrice. Ne jamais écraser une case `contribution`. Si aucune case fictive ne reste, s’arrêter et demander la date ou la conduite à tenir. Si le jeu a commencé ou si l’état des réponses est incertain, vérifier préalablement l’absence de réponse sur cette case : la fausse anecdote ne doit pas changer après une première réponse. En l’absence de preuve, ne pas modifier la case et demander comment procéder.
4. Remplacer uniquement cette entrée : conserver son `day`, passer `kind` à `contribution`, renseigner le nom, les trois textes validés, l’index zéro de la fausse affirmation et le complément validé. Conserver les 23 autres cases à l’identique.
5. Associer le portrait privé existant de cette personne si son identité est vérifiée et son utilisation autorisée. S’il n’existe pas encore de lutin utilisable, conserver le lutin générique et le signaler ; ne pas attribuer le portrait d’une autre personne. Pour un nouveau portrait validé, le déposer dans `portraits/` avec un nom stable et une condition de création sans écrasement, puis renseigner le chemin relatif dans `portrait`.
6. Vérifier localement, sans publier de données personnelles dans la sortie : JSON valide, version et année inchangées, 24 jours uniques 1–24, trois textes non vides par case, index entre 0 et 2, type et chemin de portrait cohérents, bon rattachement du portrait, et changement limité à la case choisie. Vérifier que l’index correspond bien à la fausse affirmation validée.
7. Envoyer le JSON au même emplacement avec `gcloud storage cp --if-generation-match=GENERATION` en utilisant la génération relevée à l’étape 2. Si la condition échoue, ne pas forcer : un autre changement a eu lieu. Relire la nouvelle génération et reprendre la modification sur celle-ci, puis revérifier. Ne pas écraser d’autres contributions.
8. Relire l’objet envoyé et vérifier qu’il correspond exactement au fichier préparé et que le portrait référencé existe. Protéger les copies temporaires et les supprimer quand elles ne sont plus utiles. Annoncer la date, le portrait choisi et le résultat de la vérification, sans divulguer les autres quiz. Ne pas prétendre que l’application a pris en compte le changement tant que son chargement n’est pas implémenté et vérifié.

L’application cible pourra charger le catalogue au démarrage ; dans ce cas, une mise à jour du bucket seule ne rechargera pas nécessairement les instances déjà démarrées. Le mécanisme effectif de publication et de rechargement reste à réaliser et à vérifier.
