# Revue adversariale — architecture Avent

Verdict : **à préciser avant implémentation**, notamment pour la reprise des notifications et la compatibilité des mutations. Plusieurs scénarios sont déjà indiqués comme ouverts ; ils ne doivent pas devenir des hypothèses implicites dans les stories.

## Élevé — horodatage de disponibilité à 9 h

Une équipe produit un quiz à partir des seuls fichiers de release actuels ; une autre crée un job de reprise qui vérifie que ces fichiers existent lorsqu'il s'exécute. Les deux respectent les règles locales de leur composant mais le job ne peut pas distinguer un quiz publié à 8 h 59 d'un quiz publié à 9 h 01 après une panne. AD-5 exige cette distinction sans attribuer la responsabilité de son historique à un composant ni définir le signal durable et sa sémantique en cas d'incertitude. Décider avant réalisation : propriétaire, moment de disponibilité effectif en production (y compris déploiement partiel/rollback), et comportement prudent en absence de preuve. Un timestamp de build seul ne prouve pas la disponibilité à 9 h.

## Élevé — sémantique de répétition de confirmation

L'API A répond à une seconde requête par un conflit ; le client B interprète toute erreur comme une réponse non enregistrée et laisse rejouer. Ces deux unités respectent « une réponse définitive » et la déduplication de stockage, mais ne réalisent pas FR-7 après réponse perdue en transit. Fixer le contrat de récupération : après confirmation incertaine ou conflit, relire la réponse déjà persistée et afficher son résultat ; ne jamais remplacer son choix ni attribuer des points deux fois. Préciser le traitement concurrent de deux choix distincts (la première réponse enregistrée fait foi) sans imposer nécessairement une forme HTTP.

## Élevé — résultat non vu multi-appareil

Un écran A marque le résultat vu au moment où il est émis par l'API, tandis qu'un écran B suppose que seul un accusé de présentation le marque vu. Si la connexion tombe après l'écriture mais avant affichage, A et B respectent chacun une interprétation de « persisté » mais perdent FR-7. Préciser que le résultat n'est pas marqué vu par la seule émission de la réponse HTTP, identifier la transition de présentation/accusé et rendre cette transition idempotente par membre/réponse ; la confirmation ne doit pas la déclencher implicitement.

## Moyen — version de contenu et concurrence de publication

Un composant enregistre l'identifiant de l'affirmation ; un autre reconstruit le texte depuis le quiz de la release courante. Après correction des affirmations, cette lecture n'est plus fidèle alors que les deux peuvent déclarer conserver « le choix et la bonne affirmation ». Un responsable doit préserver une version immuable ou une copie des textes nécessaires avec la réponse ; l'interdiction de changer la bonne réponse après la première réponse doit être vérifiée pour les publications et en concurrence avec l'enregistrement, et une publication incompatible bloquée ou explicitement gérée. Distinguer une correction éditoriale de l'identité de la réponse correcte.

## Moyen — frontières de test / effets externes

L'API de développement et sa base sont séparées de la production, mais le composant de notifications en développement utilise des abonnements/adresses réels ou le projet PostHog de production. Les composants peuvent respecter « données isolées » tout en diffusant des invitations ou contaminant les mesures. AD-2 demande de vérifier l'isolation sans définir son résultat obligatoire : aucun envoi réel non voulu et aucune ingestion dans les deux compteurs de production ; protéger explicitement l'exécution de remise à zéro par identité d'environnement fiable, pas une indication visuelle ou un paramètre client. La politique exacte des notifications de démonstration reste à choisir.

## Moyen — attribut de participation PostHog

Un composant émet un événement à la réception de toute réponse réussie, y compris une reprise qui retourne une réponse déjà enregistrée ; un autre compte ses événements comme le total des réponses. Les deux suivent la proposition de capturer après succès mais l'indicateur gonfle. Définir le signal en fonction de la création effective d'une réponse, avec une clé stable de déduplication si des tentatives de capture sont possibles ; expliciter que le compteur PostHog demeure best effort et que l'identité de la personne reste stable entre appareils si l'on prétend compter des participants distincts.

## Moyen — acteurs et contextes de troupe

Le classement prend les membres selon l'identifiant d'utilisateur, alors qu'un autre composant accepte une réponse liée à une fiche membre/participant ; un changement de liaison ou plusieurs fiches pour le même compte peuvent créer une divergence. Fixer un référentiel canonique d'identité pour réponse, état de présentation et comptage, et une correspondance explicite vers les membres classables, à vérifier contre le modèle HatCast avant de la figer. Les exceptions Patrice/Toinou doivent identifier les mêmes comptes dans le classement et leur score personnel, sans supposer des identifiants constants entre environnements.

## Moyen — ordre d'ouverture concurrent

Deux appareils lisent simultanément un état non fermé, tous deux ouvrent automatiquement le quiz, puis l'un ferme. AD-3 garantit la persistance mais ne tranche pas cette course ; FR-2 peut être interprété comme imposant une première ouverture unique. Clarifier la garantie attendue : au minimum une fermeture persistée empêche les ouvertures automatiques ultérieures et une réponse persistée les empêche également ; préciser si le verrouillage d'ouvertures déjà simultanées est nécessaire avant de proposer un claim transactionnel.
