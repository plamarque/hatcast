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

1. **Déclenchement ciblé.** Une simple icône dans la barre du mode test permet à l’opérateur autorisé de demander immédiatement un rappel pour son propre compte et son appareil de test enregistré. Aucun autre compte ni appareil ne reçoit cet envoi. Aucun envoi ne résulte de l’ouverture d’une page, d’un aperçu ou d’un scheduler ; l’action n’autorise pas de ciblage libre.
2. **Garde-fous serveur.** Le serveur vérifie à chaque tentative l’identité de l’opérateur, l’environnement réellement exécuté et le propriétaire de l’appareil. L’action est refusée par défaut si l’environnement ou la cible est ambigu, non autorisé, ou correspond à la production. Ces contrôles restent efficaces même si l’interface ou la requête est modifiée. L’action de test ne doit pas activer le mode test Avent en staging ni affaiblir les contrôles de dates et de confidentialité du parcours membre.
3. **Envoi immédiat.** L’action de test envoie directement, sans attendre 10 h ni vérifier l’existence du quiz, une réponse ou la préférence Avent. La date affichée dans la barre du mode test détermine le jour ciblé, même si la date réelle diffère. Elle conserve les contrôles d’autorisation, d’environnement et de propriété de l’appareil, ainsi que la nécessité d’un abonnement push valide. Elle réutilise le contenu et le chemin de livraison du rappel normal, sans modifier l’horloge partagée ni le scheduler. Elle ne prouve ni l’éligibilité normale ni le déclenchement automatique à 10 h.
4. **Isolation des données.** Une tentative de test n’utilise ni ne consomme la réservation quotidienne réelle d’un membre ; elle ne modifie ni les réponses, ni les préférences, ni les appareils des autres comptes. Les actions de recette ne réinitialisent pas les données partagées. Les résultats et éventuelles traces de test restent limités à l’environnement et au compte autorisés.
5. **Contenu et navigation.** La notification de test est précisément celle du rappel normal : même contenu générique, icône Avent, lien et chemin de livraison, sans mention de test ajoutée à la notification. Proposition de texte à affiner : « Un nouveau quiz est disponible dans ton calendrier de l’Avent. Viens découvrir ta surprise ! » L’interface et le relevé identifient l’action comme un test. La notification ne contient ni anecdote, ni choix, ni réponse, ni résultat. Son ouverture mène à l’écran du lutin du jour concerné, sous réserve des droits et des règles de découverte et de révélation ; si le quiz n’existe pas ou n’est plus accessible, elle ouvre le calendrier avec un message explicatif. Elle ne crée aucun spectacle fictif. L’affichage de l’icône dépend du système et sera constaté sur appareil réel ; les autres notifications HatCast conservent leurs icônes.
6. **Parcours réel.** Sur au moins un appareil effectivement disponible, consigner séparément : état initial de l’autorisation, demande après geste, autorisation ou refus, enregistrement de l’appareil, tentative serveur, réception effective et ouverture du lien. Vérifier également le cas d’une permission déjà accordée et la désactivation de la seule préférence Avent. Documenter les scénarios non exécutés ; essayer un iPhone ou iPad avec l’application ajoutée à l’écran d’accueil si un tel appareil est disponible.
7. **Cas non éligibles et doublons.** Vérifier avec des données isolées l’absence de quiz, une réponse déjà enregistrée, une préférence désactivée et une appartenance inactive. Vérifier la déduplication du traitement quotidien avec des tests automatisés utilisant des données de test ; les éventuelles répétitions explicites de la commande de test restent identifiées comme telles et ne modifient pas la déduplication réelle.
8. **Non-régression HatCast.** L’activation ou la désactivation Avent et l’outil de test ne modifient ni les catégories, ni les préférences, ni les abonnements HatCast existants. La dépendance acceptée reste documentée : désactiver les notifications HatCast peut aussi arrêter les rappels Avent sur l’appareil ; décocher Avent ne désabonne pas le navigateur.
9. **Preuve et limites.** Fournir un guide reproductible et un relevé daté avec environnement, révision, navigateur/appareil et résultat de chaque étape, sans jeton, endpoint push ni donnée personnelle sensible. Distinguer refus, tentative, acceptation par le fournisseur push, réception et ouverture. Signaler les étapes non réalisées et ne pas affirmer que le scheduler ou la livraison sont garantis en production.

## Tâches proposées

- [ ] Vérifier la version déployée, l’isolation et les capacités effectives de développement et de staging ; retenir un environnement et des comptes/appareils de test avec l’opérateur.
- [ ] Concevoir l’icône de déclenchement dans la barre du mode test et le contrôle serveur des identités, des environnements et de l’appareil ; interdire tout envoi à d’autres destinataires ou appareils.
- [ ] Réutiliser le contenu et la livraison du rappel pour une tentative immédiate isolée, sans vérification d’éligibilité métier ni modification de l’horloge partagée ou des réservations quotidiennes réelles.
- [ ] Ajouter les tests automatisés de refus en production et en environnement ambigu, d’identité non autorisée, de cible étrangère, d’absence d’envoi automatique, d’éligibilité, d’isolation des données et de non-régression HatCast.
- [ ] Exécuter la recette sur un appareil disponible, vérifier le comportement de permission et le lien, puis consigner les preuves et limites. Ne pas effectuer de test sur des comptes tiers.
- [ ] Documenter l’éventuel retrait de l’outillage et le nettoyage des seules données de test autorisées ; ne pas lancer de nettoyage partagé.

## Interface et contrats

**UI :** icône dans la barre du mode test. La story devra inclure les critères M3 adaptés et respecter les contrats Avent [DESIGN](../ux-designs/ux-hatcast-avent-2026-10-28/DESIGN.md), [EXPERIENCE](../ux-designs/ux-hatcast-avent-2026-10-28/EXPERIENCE.md), et [AD-7](../architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md), avec vérification visuelle, accessibilité pertinente et non-régression HatCast. Le test réel au lecteur d’écran du quiz n’est pas demandé.

## Hors périmètre

- Déployer ou promouvoir une version, activer le push pour d’autres membres, modifier la production ou les secrets, ou synchroniser des contenus réels.
- Garantir l’exécution du scheduler ou la livraison à 10 h ; [AD-5](../architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md) accepte les notifications manquées.
- Changer le calendrier, les règles de jeu, les révélations ou l’apparence déjà validée de la confirmation.

## Décisions à prendre avant mise en œuvre

Choisir l’environnement selon l’isolation et la version réellement déployée ; identifier l’opérateur et son appareil ; arrêter la conservation et le nettoyage ciblé des traces de test. Le mode test Avent existant est réservé au développement isolé : une recette staging ne doit pas le rendre disponible par simple changement de configuration ; la disponibilité de la barre constitue donc une contrainte pour le choix de l’environnement.
