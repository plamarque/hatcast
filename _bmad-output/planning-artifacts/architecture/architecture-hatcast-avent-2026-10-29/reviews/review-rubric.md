# Revue good-spine — Calendrier de l’Avent

Verdict : **à compléter avant contrat de construction final**. Les frontières générales sont pertinentes et plusieurs risques restent explicitement ouverts, mais trois interfaces entre unités peuvent encore diverger.

## Élevé

1. **Notification : disponibilité à 9 h et reprise non décidées.** AD-5 exige la preuve d’une disponibilité à 9 h même après panne, mais remet le mécanisme à plus tard. Comme les contenus arrivent par release, deux équipes peuvent choisir des dates de compilation, de déploiement ou de première lecture différentes ; certaines produisent des notifications interdites pour une publication tardive. Décider une source durable de disponibilité effective et le comportement prudent si la preuve manque ; limiter explicitement la reprise à une fenêtre cohérente avec le PRD (pas de notification pour un jour clos, sauf décision produit contraire).
2. **Mesure : aucune identité logique d’événement ni stratégie de déduplication.** Le diagramme impose des captures navigateur, tandis que l’objectif est le nombre des réponses enregistrées ; une réponse acceptée mais interrompue peut ne produire aucun événement, un réessai peut en produire plusieurs, et plusieurs appareils peuvent altérer le compteur. AD-6 avertit que la base fait autorité mais n’énonce pas la sémantique unique d’émission ni comment compter les personnes distinctes sans PII. Établir la clé logique, la source du déclenchement et les limites de fiabilité des deux métriques ; réserver la décision si elle implique un choix non encore accepté.
3. **Mode test et données de production : mécanisme d’interdiction non spécifié.** AD-2 porte le bon objectif, mais reporte toutes les autorisations test et garde-fous reset, alors que ces éléments structurent les interfaces et la sécurité. Fixer au minimum l’exclusion test/reset par configuration serveur vérifiée indépendamment des entrées clientes, l’échec fermé et l’obligation de vérifier la cible de reset ; laisser l’implémentation aux stories.

## Moyen

4. **État multi-appareil : marquage résultat vu.** AD-3 renvoie au PRD mais n’identifie pas l’opération ni l’autorité déclenchant le passage de « non vu » à « vu ». Le client et l’API peuvent adopter des transitions incompatibles, notamment si l’affichage est interrompu ou deux appareils sont actifs. Définir une transition explicite après affichage effectif et un réessai sûr ; laisser l’instant précis de l’accusé à clarifier si nécessaire.
5. **Préservation du résultat : snapshot de contenu et modification de la bonne réponse.** Le résultat doit survivre aux modifications et la bonne réponse ne doit jamais changer après une première réponse. La convention dit cette dernière règle, mais ne fixe pas sa vérification à la publication ni l’immutabilité ou version du contenu liant réponse et affichage. Préciser la responsabilité de garantir ce blocage tout en permettant l’ajout de contenus.
6. **Protection de la surprise : surfaces et caches.** AD-1 annonce correctement la restriction mais ne mentionne pas explicitement bundles, ressources statiques et caches ou service worker. Un portrait futur dans un bundle public contournerait la règle ; préciser la portée et les garanties de cache sur les réponses protégées.
7. **Notification : confirmation concurrente.** Le texte exige de vérifier les réponses sans préciser à quel stade. Une réponse pendant le traitement peut laisser partir une invitation : définir le dernier point utile de vérification et reconnaître la limite d’une livraison déjà transmise, plutôt que promettre une garantie impossible.
8. **Inventaire opérationnel.** Le document nomme les environnements et les éléments existants, sans vérifier le runtime réel ni choisir de source de déclenchement. Cela est indiqué comme ouvert ; ne pas annoncer le contrat comme prêt à construire tant qu’AD-5 est non résolu.

## Checklist

- Divergences inter-équipes : **partiel**, points 1–5.
- Règles contrôlables et prévention : **partiel**, points 3, 6–7.
- Technologies : l’architecture reprend Angular/API/PostgreSQL/PostHog du dépôt ; versions non promises et aucune nouvelle technologie figée. Vérifier séparément l’hébergement et l’ordonnancement réels.
- Brownfield : **globalement cohérent** ; l’exclusion de l’exception administrateur est une règle métier propre au calendrier, non une modification silencieuse du contrôle d’accès général.
- Couverture PRD/UX : **globalement couverte par les références**, mais vérifier les états d’interruption et le devenir des données historiques.
- Spine parent : aucun parent cité ; vérifier absence d’un contrat parent applicable avant finalisation.
- Enveloppe opérationnelle : **ouverte explicitement**, mais assez structurante pour devoir être résolue avant le passage à la construction.
