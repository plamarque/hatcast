# Proposition de story — Recetter les rappels Avent sur appareil réel

**Statut :** proposition à enregistrer au backlog après rapprochement avec `v2`. Numéro et clé de story à attribuer lors de l’enregistrement ; ce document ne modifie pas le tracker.

## Story

En tant qu’opérateur de recette, je veux déclencher et observer un rappel Avent destiné à mon compte et à mes appareils de test dans un environnement autorisé, afin de vérifier l’autorisation, la réception et le retour vers le quiz sans attendre 10 h ou une date du mois de décembre.

## Prérequis

- Story 25.7 intégrée, puis version contenant cette story effectivement déployée sur l’environnement choisi ; vérifier la révision déployée et non seulement le commit Git.
- Choix explicite de développement ou de staging, avec identification de la base propre à cet environnement, de l’opérateur et des comptes et appareils de test autorisés. Vérifier la configuration push et l’absence de données de production avant toute action.
- Un compte de test est membre actif de la troupe configurée ; disposer d’un quiz et de données de test appropriés. Aucun contenu réel ni réponse privée ne doit être ajouté au dépôt.
- Définir avec l’opérateur l’outillage et l’éventuel nettoyage limité à ses propres données de test. La présente proposition n’autorise ni déploiement, ni modification de configuration distante, ni notification.

## Critères d’acceptation

1. **Déclenchement ciblé.** Étant donné une action de test volontaire d’un opérateur explicitement autorisé, lorsqu’il choisit son compte de test et un appareil de test enregistré pour ce compte, alors une tentative immédiate peut être déclenchée pour ce seul destinataire et cet appareil. Aucun envoi ne résulte de l’ouverture d’une page, d’un aperçu ou d’un scheduler ; l’action n’autorise pas de ciblage libre d’autres comptes ou appareils.
2. **Garde-fous serveur.** Le serveur vérifie à chaque tentative l’identité de l’opérateur, l’environnement réellement exécuté et le propriétaire de l’appareil. L’action est refusée par défaut si l’environnement ou la cible est ambigu, non autorisé, ou correspond à la production. Ces contrôles restent efficaces même si l’interface ou la requête est modifiée. L’action de test ne doit pas activer le mode test Avent en staging ni affaiblir les contrôles de dates et de confidentialité du parcours membre.
3. **Heure et éligibilité.** La recette peut fournir au seul calcul de test une date et une heure de référence, sans changer l’horloge partagée, le scheduler ni la date de jeu des autres membres. Elle réutilise le calcul et le chemin de livraison de 25.7 autant que possible ; toute différence de mode test est explicite dans le résultat. Une notification de test n’est pas présentée comme la preuve d’un déclenchement automatique à 10 h.
4. **Isolation des données.** Une tentative de test n’utilise ni ne consomme la réservation quotidienne réelle d’un membre ; elle ne modifie ni les réponses, ni les préférences, ni les appareils des autres comptes. Les actions de recette ne réinitialisent pas les données partagées. Les résultats et éventuelles traces de test restent limités à l’environnement et au compte autorisés.
5. **Contenu et navigation.** La notification envoyée par la commande indique clairement qu’il s’agit d’un test ; elle ne contient ni anecdote, ni choix, ni réponse, ni résultat. Son ouverture mène au parcours Avent autorisé et conserve les règles de découverte et de révélation. Elle ne crée aucun spectacle fictif.
6. **Parcours réel.** Sur au moins un appareil effectivement disponible, consigner séparément : état initial de l’autorisation, demande après geste, autorisation ou refus, enregistrement de l’appareil, tentative serveur, réception effective et ouverture du lien. Vérifier également le cas d’une permission déjà accordée et la désactivation de la seule préférence Avent. Documenter les scénarios non exécutés ; essayer un iPhone ou iPad avec l’application ajoutée à l’écran d’accueil si un tel appareil est disponible.
7. **Cas non éligibles et doublons.** Vérifier avec des données isolées l’absence de quiz, une réponse déjà enregistrée, une préférence désactivée et une appartenance inactive. Vérifier la déduplication du traitement quotidien avec des tests automatisés utilisant des données de test ; les éventuelles répétitions explicites de la commande de test restent identifiées comme telles et ne modifient pas la déduplication réelle.
8. **Non-régression HatCast.** L’activation ou la désactivation Avent et l’outil de test ne modifient ni les catégories, ni les préférences, ni les abonnements HatCast existants. La dépendance acceptée reste documentée : désactiver les notifications HatCast peut aussi arrêter les rappels Avent sur l’appareil ; décocher Avent ne désabonne pas le navigateur.
9. **Preuve et limites.** Fournir un guide reproductible et un relevé daté avec environnement, révision, navigateur/appareil et résultat de chaque étape, sans jeton, endpoint push ni donnée personnelle sensible. Distinguer refus, tentative, acceptation par le fournisseur push, réception et ouverture. Signaler les étapes non réalisées et ne pas affirmer que le scheduler ou la livraison sont garantis en production.
10. **Appareil partagé.** Avec deux seuls comptes de test autorisés, vérifier le changement de compte avec puis sans activation du rappel par le second compte. Distinguer les nouvelles tentatives serveur des messages déjà confiés au fournisseur push, qui ne peuvent pas être rappelés.

## Tâches proposées

- [ ] Vérifier la version déployée, l’isolation et les capacités effectives de développement et de staging ; retenir un environnement et des comptes/appareils de test avec l’opérateur.
- [ ] Concevoir le mécanisme de déclenchement ciblé et sa durée de vie, en documentant le contrôle serveur des identités, des environnements et des appareils. Privilégier une commande ponctuelle réservée à l’opérateur ; tout bouton éventuel reste soumis aux mêmes contrôles.
- [ ] Adapter ou extraire le calcul de 25.7 pour permettre un instant de test local à la requête et une tentative isolée, sans modifier l’horloge partagée ni les réservations quotidiennes réelles.
- [ ] Ajouter les tests automatisés de refus en production et en environnement ambigu, d’identité non autorisée, de cible étrangère, d’absence d’envoi automatique, d’éligibilité, d’isolation des données et de non-régression HatCast.
- [ ] Exécuter la recette sur un appareil disponible, vérifier le comportement de permission et le lien, puis consigner les preuves et limites. Ne pas effectuer de test sur des comptes tiers.
- [ ] Documenter l’éventuel retrait de l’outillage et le nettoyage des seules données de test autorisées ; ne pas lancer de nettoyage partagé.

## Interface et contrats

**UI : à déterminer.** Si une commande réservée à l’opérateur suffit et qu’aucune interface Angular n’est modifiée, la section Material 3 est sans objet. Si un bouton est retenu, la story devra inclure les critères M3 adaptés et respecter les contrats Avent [DESIGN](../ux-designs/ux-hatcast-avent-2026-10-28/DESIGN.md), [EXPERIENCE](../ux-designs/ux-hatcast-avent-2026-10-28/EXPERIENCE.md), et [AD-7](../architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md), avec vérification visuelle, accessibilité pertinente et non-régression HatCast. Le test réel au lecteur d’écran du quiz n’est pas demandé.

## Hors périmètre

- Déployer ou promouvoir une version, activer le push pour d’autres membres, modifier la production ou les secrets, ou synchroniser des contenus réels.
- Garantir l’exécution du scheduler ou la livraison à 10 h ; [AD-5](../architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md) accepte les notifications manquées.
- Changer le calendrier, les règles de jeu, les révélations ou l’apparence déjà validée de la confirmation.

## Décisions à prendre avant mise en œuvre

Choisir développement ou staging selon l’isolation et la version réellement déployée ; identifier l’opérateur et ses appareils ; déterminer si une commande serveur suffit ou si un contrôle temporaire est nécessaire ; arrêter la conservation et le nettoyage ciblé des traces de test. Le mode test Avent existant est réservé au développement isolé : une recette staging ne doit pas le rendre disponible par simple changement de configuration.
