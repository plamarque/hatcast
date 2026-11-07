# Recette d’un rappel Avent sur appareil réel

Ce guide prépare une vérification ; il n’autorise aucun envoi ni déploiement. Choisir un environnement de développement isolé déjà accessible et un compte opérateur autorisé, membre actif. Vérifier la révision effectivement servie, le service et la base de développement, ainsi que la configuration Web Push. Ne pas utiliser staging ou production. Ne pas enregistrer de données privées, clés, endpoints ni réponses dans le relevé.

1. Sur son propre appareil, ouvrir l’application dans un contexte compatible avec les notifications. Sur iPhone ou iPad, utiliser l’application ajoutée à l’écran d’accueil si disponible. Relever appareil, système, navigateur, révision, environnement et état initial de permission.
2. Ouvrir l’Avent, activer volontairement le mode test et choisir une date simulée entre le 1er et le 24 décembre. Vérifier que la case de rappel simulée ne déclenche rien.
3. Avec l’autorisation explicite pour une notification réelle, appuyer sur « Envoyer un rappel test sur cet appareil ». Accepter ou refuser la permission et relever ce résultat ; si refusée, vérifier l’explication et l’absence de succès. Après autorisation, relever séparément l’enregistrement et le message d’acceptation ou d’échec.
4. Observer si la notification arrive effectivement, son texte et son icône. L’ouvrir et relever la destination, la découverte et l’éventuelle révélation prioritaire. Si le quiz est absent ou inaccessible, vérifier le calendrier et son explication.
5. Répéter si autorisé avec une permission déjà accordée, puis avec la préférence Avent désactivée. Documenter les scénarios non exécutés. Ne pas réinitialiser la partie partagée et ne pas nettoyer d’autres comptes.

## Relevé réel

**7 novembre 2026 — recette validée en l’état par Patrice.** Sur Android, avec l’application de développement installée, l’envoi ciblé a été accepté, la notification réellement reçue et son ouverture a conduit au quiz du 9 décembre simulé. Son texte et son icône étaient visibles. Après une réponse au quiz du 9, le passage au 10 a bien affiché le résultat du 9.

La combinaison « ouverture de notification avec résultat précédent encore non vu » n’a pas été vérifiée sur appareil : avancer la date pour envoyer la notification du jour suivant affiche et marque déjà le résultat précédent comme vu. Patrice accepte cette limite sans évolution du mode test. Le déclenchement planifié de 10 h, les variantes de permission et de préférence ainsi que l’éventuel repli vers un quiz inaccessible n’ont pas été validés lors de ce relevé. La version exacte servie au moment des gestes et l’état initial de permission n’ont pas été relevés. Voir BUG-101 pour la vérification en lecture seule du premier essai.
