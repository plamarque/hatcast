# Revue rubric — architecture Avent révisée

Verdict : **à compléter avant finalisation**. Les invariants centraux, la confidentialité, le calcul différé, le 25 et le relais sont présents ; le brouillon reste explicitement bloqué sur la simulation. Les choix utilisent la pile et les mécanismes du dépôt, sans nouvelle technologie ; les dimensions opérations et isolation sont mentionnées.

## Élevé

1. **Sélection de la révélation prioritaire ambiguë.** AD-3 sélectionne d'abord la dernière réponse enregistrée puis teste si elle est révélable. L'UX parle de la « dernière réponse révélable et non vue » : si une réponse du jour existe tandis qu'une réponse plus ancienne révélable reste non vue (concurrence d'appareils, accès direct ou interruption), ce filtre empêche sa présentation. Clarifier la priorité exacte avec les sources et expliciter l'ordre des filtres ; prévoir le cas dans les tests. Le PRD utilise « résultat révélable de sa dernière réponse », formulation potentiellement différente : signaler la divergence plutôt qu'inventer.
2. **Publication à 10 h non décidée.** La convention exige de prouver la disponibilité à 10 h pour un traitement retardé, mais reporte le mécanisme à l'implémentation. Deux stories peuvent traiter différemment une release après 10 h : sans fait durable de disponibilité ou autre mécanisme déterministe, la règle FR-3 n'est pas vérifiable. Fixer le contrat de preuve et sa source autoritaire, tout en préservant le choix de ne pas ajouter de mécanisme de reprise.
3. **Confirmation et minuit : instant de référence insuffisamment défini.** « Reçue » à la limite peut être interprété comme réception HTTP, début ou commit de transaction ; deux implémentations divergent pour une requête reçue avant minuit mais validée après. Le PRD parle à la fois de confirmation enregistrée faisant foi et de confirmation reçue à partir de minuit refusée. Définir l'événement linéarisant et le cas limite en signalant toute ambiguïté produit.

## Moyen

4. **Mise à jour du vu et interruption.** L'accusé après affichage est une approximation raisonnable, mais la perte de cet accusé après affichage peut produire un second affichage ultérieur ; le texte ne mentionne explicitement que concurrence et interruption avant affichage. Décrire la limite réseau et la réconciliation/idempotence pour que le relais UX ne promette pas une garantie impossible.
5. **Simulation future et ordre des séries.** Les réponses hors ordre créées par l'ouverture libre anticipée rendent le bonus dépendant de l'ordre de traitement ou de la date du quiz. L'arbitrage sur le temps devra aussi fixer comment les données d'essai et leur score restent cohérents en cas d'accès futur et de retour arrière. Aucun score fictif ne doit être inventé sans décision.
6. **Isolation notifications.** « Isoler » ne précise pas si des notifications de test peuvent atteindre des personnes réelles ni comment les neutraliser ; exiger un contrôle vérifiable avant démonstration et tracer le choix opérationnel de façon explicite.

## Vérifications positives

- Accès contrôlé par API, confidentialité des contenus et dérivés, no-store et vérification des caches.
- Projection des scores uniquement sur les résultats révélés, barème révisé et rangs bas.
- Fermeture et état vu côté serveur, unicité des réponses, frontières Paris, contenu tardif et conservation.
- Notification à 10 h, mécanisme Spring existant et absence de garantie de livraison ; test, analytics et production séparés.
- AD conservés et relais vers spec/stories, qui ne sont pas modifiées.
