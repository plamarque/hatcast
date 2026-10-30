# Préparer les quiz privés de l’Avent

Les quiz validés sont préparés par requêtes dans `advent_quizzes` ; aucun contenu réel, clé, portrait ou export ne doit entrer dans Git, les logs, l’analytics ou des assets publics. Les portraits de l’aperçu cloud sont lus dans le bucket privé `impro-selector-avent-preview-private` par l’API autorisée ; en local, placer les fichiers dans `.local/hatcast-avent-test/`. Une référence est un nom de fichier PNG simple (`lettres`, chiffres, `_`, `-`, puis `.png`), sans chemin ni URL ; une référence absente ou un fichier introuvable utilise le lutin générique. Le bucket privé de portraits prévu pour la production est `gs://impro-selector-avent-content-private/portraits/` ; son identité, son caractère privé et les permissions effectives du service cible doivent être vérifiés avant toute opération. Le parcours de production reste à réaliser. L’accès au contenu reste contrôlé par l’API. La base de développement peut contenir des données fictives ou réelles consenties.

## Transition des anciennes réponses de test

La migration détecte les réponses, réservations, générations et autres états de jeu de test existants sans les effacer. Si l’un de ces états existe au moment de la migration, l’aperçu bloque les lectures et opérations de jeu : elles ne doivent jamais être associées au nouveau contenu. Un opérateur autorisé doit exécuter explicitement le [reset ciblé](../../../DEVELOPMENT.md#restart-the-isolated-advent-test-session) sur l’environnement de développement isolé après avoir vérifié la cible et accepté la suppression de ces états de test. Il efface les réponses et l’état de jeu uniquement, préserve les quiz et renouvelle la session ; les anciens clients doivent recharger. Si la cible ou l’autorisation sont incertaines, ne pas réinitialiser. Sans état de jeu préexistant, aucune transition n’est nécessaire.

## Préparation

Identifier explicitement le projet, la branche, l’hôte et la base de destination à partir de la console du fournisseur et de la connexion effective ; comparer avec l’environnement attendu et vérifier les droits avant toute écriture. Les noms documentés ne prouvent ni l’identité ni les permissions. Désactiver l’historique SQL, l’écho et la journalisation des paramètres et utiliser un canal privé autorisé. Ne pas partager de captures ou résultats contenant les contenus. Vérifier séparément le caractère privé et l’accès du service aux portraits.

Après validation des trois affirmations ordonnées et de l’indice de l’affirmation fausse (0, 1 ou 2), insérer par paramètres dans `advent_quizzes` les colonnes `quiz_day`, `display_name`, `portrait_ref`, `statement_0`, `statement_1`, `statement_2`, `false_choice` et `explanation` (facultative). Les jours vont de 1 à 24. La migration crée une table vide ; une case manquante ne peut être jouée. Vérifier les valeurs et leur ordre dans un environnement privé sans les afficher dans les journaux. Ne pas modifier un quiz pendant le jeu : une modification exceptionnelle peut rendre un résultat incohérent, risque accepté.

## Promotion sélective — procédure à préparer, pas à exécuter ici

1. Identifier et vérifier indépendamment les connexions source et destination (projet, branche, hôte, base, rôle et permissions) ; confirmer qu’elles sont distinctes et que la destination est bien celle visée. Une identité ou permission incertaine interrompt l’opération. S’assurer que la migration est présente aux deux extrémités.
2. Définir les jours validés explicitement. Dans une session privée, lire seulement les huit colonnes de `advent_quizzes` pour ces jours ; ne sélectionner ni tables `advent_test_*`, ni réponses, sessions ou horloges. Transférer par canal chiffré et fichier temporaire privé si nécessaire, sans écho ni journal des valeurs ; détruire ensuite ce fichier de manière appropriée.
La sélection source peut utiliser une requête paramétrée telle que celle-ci, répétée pour chaque jour explicitement choisi ; ses résultats sont sensibles :

```sql
SELECT quiz_day, display_name, portrait_ref, statement_0, statement_1,
       statement_2, false_choice, explanation
FROM advent_quizzes WHERE quiz_day = ?;
```

3. Vérifier les références de portraits et les permissions de lecture du service cible, sans exposer d’URL publique ; copier les portraits correspondants dans le stockage privé cible si nécessaire, selon une procédure autorisée séparément.
4. Cette procédure ne remplace jamais un jour existant : tout conflit annule tout le lot. Le choix de remplacer un contenu relève d’une procédure distincte et autorisée ; ne pas supprimer une ligne existante pour contourner le contrôle. Conserver en lieu privé le lot sélectionné et vérifier l’absence de conflit, sans afficher son contenu dans les logs.
5. Sur la destination vérifiée, exécuter une transaction avec un client permettant les paramètres et le contrôle du nombre de lignes. Pour chaque quiz, fournir les huit paramètres issus de la sélection et exécuter :

```sql
INSERT INTO advent_quizzes (quiz_day, display_name, portrait_ref, statement_0,
  statement_1, statement_2, false_choice, explanation)
VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (quiz_day) DO NOTHING;
```

Si une insertion affecte zéro ligne, si le nombre ou le contenu des lignes sélectionnées ne correspond pas exactement au lot, ou en cas d’erreur, exécuter `ROLLBACK` pour tout le lot. Sinon seulement, exécuter `COMMIT`. La contrainte unique protège aussi contre un conflit concurrent après la vérification préalable. Les tables `advent_test_*` ne sont jamais lues ni écrites par cette transaction.
6. Après validation, conserver en privé l’identité de la destination et le lot effectivement inséré pour une éventuelle reprise. En cas d’erreur découverte après `COMMIT`, identifier de nouveau la cible ; dans une transaction, verrouiller chaque jour inséré avec `SELECT ... FOR UPDATE`, comparer confidentiellement tous ses champs au lot conservé, puis supprimer seulement les lignes encore identiques. Si une ligne diffère ou manque, annuler toute la transaction et examiner le conflit ; ne pas écraser les changements intervenus. Valider seulement après avoir vérifié le nombre de lignes supprimées. Ne jamais toucher aux réponses ni aux autres jours. Cette reprise restaure l’absence initiale des jours insérés ; elle ne remplace aucune ligne préexistante.

Aucune promotion ni écriture en production n’est effectuée par cette procédure descriptive. Le parcours membre de production reste à réaliser.
