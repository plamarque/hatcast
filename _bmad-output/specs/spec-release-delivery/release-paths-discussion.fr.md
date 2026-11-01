---
type: architecture-discussion
status: criteria-adopted-policy-incomplete
updated: 2026-10-27
language: fr
source: release-paths-discussion.md
---

# Choisir le parcours de release

**Deux parcours, socle de contrôles et règles de fonctionnement validés par Patrice.** Leur traduction en scripts et workflows reste à concevoir ; aucune réduction de tests n’est encore activée.

## Le fonctionnement

Après clôture d’une story et intégration dans `v2`, on examine **tous les changements non livrés depuis la production actuelle**, y compris leurs interactions. On propose de livrer avec un parcours justifié, ou d’attendre.

- **Go** : lancer la release avec le mécanisme A optimisé et les vérifications du parcours choisi.
- **Attendre** : aucun travail de release n’est lancé. Les E2E locaux restent recommandés, à la demande.
- **Clôture suivante** : réévaluer tout le cumul. On livre tout ou rien, sans extraire un correctif.

Les vérifications propres à la story et la CI déjà liée à son intégration restent distinctes de cette décision.

**Un merge sur `v2` n’interrompt pas une release en cours.** Elle continue sur le candidat déjà choisi ; les changements mergés ensuite attendent la prochaine release. Le « tout ou rien » porte sur le delta cumulé de ce candidat. Un merge seul ne remplace pas staging et n’annule pas les tests différés : cette annulation concerne le déploiement autorisé d’un nouveau candidat sur staging.

**Si la mécanique de release échoue** (build, publication ou déploiement), vérifier ce qui a réellement abouti et quelle version est servie, puis reprendre le même candidat au dernier point sûr. Réutiliser les vérifications encore valides, sans embarquer les nouveaux merges sur `v2`. Si une correction du code est nécessaire, réévaluer le candidat et les vérifications affectées.

## Pourquoi deux parcours ?

L’étude trouve des corrections réellement bornées : noms indisponibles, graphique mobile, annulation d’un dialogue, actualisation d’une équipe déverrouillée. Elle trouve aussi des changements manifestement plus larges : sessions, notifications, composition, dépendances, récupération PWA.

Le troisième parcours « standard » est moins convaincant : les statistiques multi-troupes, son meilleur exemple, touchent aussi la visibilité des données et les contrats entre client et serveur. **Deux parcours retenus : ciblé ou complet ; l’incertitude conduit au complet.** L’étude ne démontre pas qu’une réduction de tests serait sans risque.

## Quand choisir le ciblé ?

**Toutes les conditions doivent être démontrées pour le delta cumulé.** Le nombre de lignes, l’urgence ou l’étiquette « bug » ne suffisent pas.

| Critère | Ce qu’il faut pouvoir expliquer |
| --- | --- |
| **Impact borné** | Écrans, actions et utilisateurs concernés ; interactions entre les changements accumulés. |
| **Règles et contrats inchangés** | Pas de changement des droits, sessions, visibilité entre troupes, règles métier, contrats d’API ou règles de stockage et de modification des données. Corriger l’annulation d’un dialogue peut rester éligible sans changer les règles serveur. |
| **Dépendances comprises** | Composants partagés, écrans qui les utilisent et parcours voisins connus. Un composant partagé n’est pas exclu si tous ses usages concernés sont identifiés et couverts. |
| **Aucun effet transversal ou externe** | Pas de changement global de navigation, thème, PWA/cache, dépendances, build, CI ou infrastructure ; pas de changement des destinataires ou de l’envoi de notifications. |
| **Vérification crédible** | Tests de régression et des voisins identifiés ; données de test sûres sur staging ; résultat conservé après rechargement lorsque pertinent. Les vérifications déjà faites et celles restant à lancer sont distinguées. |
| **Détection et repli préparés** | Savoir reconnaître un problème, contrôler la production sans modifier ses données et revenir à une version connue. |

Une condition fausse ou inconnue impose le **complet**. Un test en échec ou une donnée de test manquante peut toujours bloquer la release : changer de parcours ne résout pas le problème.

Un échec attribué à un test instable, une fixture ou l’environnement **ne bloque pas systématiquement toute la release**. Il reste bloquant s’il empêche de vérifier un comportement concerné par les changements cumulés ou leurs voisins affectés : c’est le chemin critique. Hors de ce périmètre, on peut poursuivre en explicitant la cause, la couverture manquante et le risque restant. L’échec reste visible ; il n’est pas transformé en réussite. Un défaut produit ou un échec inexpliqué ne devient pas un problème de test par défaut.

Un test ignoré ou non exécuté qui vérifie les changements cumulés ou leurs voisins affectés doit être vérifié avant livraison. Hors de ce périmètre, il peut rester non bloquant avec une justification et la couverture manquante indiquées dans la proposition de release. Il ne compte jamais comme réussi.

**Échec puis réussite après relance, sans cause identifiée :** pour un test lié aux changements, présenter à Patrice les deux résultats, l’analyse et le risque restant, puis lui demander s’il accepte de poursuivre. Ni validation ni abandon automatique. L’acceptation ne masque pas l’échec initial.

### Comment identifier les voisins ?

Partir du code modifié, retrouver ses usages et suivre les effets sur les comportements ou données en aval. Vérifier les rôles concernés, mobile/desktop, annulation, erreur et concurrence lorsque pertinents. Pour chaque voisin, expliquer **le lien avec le changement → le risque → le scénario qui le vérifie**. Une recherche de code aide à retrouver les usages ; elle ne remplace pas l’analyse métier. Si les effets restent inconnus ou trop larges, choisir le complet.

## Ce qui change entre les parcours

Pour chaque contrôle requis, la proposition distingue **ce que les tests automatisés démontrent réellement** et **ce qui reste à vérifier humainement sur staging**. Une CI verte ne remplace pas automatiquement la recette et ne prouve pas une persistance non vérifiée. Les deux parcours peuvent être mis en œuvre sans attendre l’automatisation de tous les scénarios ; les vérifications requises restent à obtenir selon les règles adoptées.

**Socle bloquant commun sur staging :** bonne version déployée, santé API, chargement PWA et C1 (connexion → accueil → ouverture d’un événement). Pour le ciblé, C2 (disponibilités), C3 (composition organisateur), C4 (état/confirmation membre) et C5 (notification → destination) sont requis s’ils sont affectés par les changements cumulés ou leurs voisins. Pour le complet, C1–C5 sont systématiques. Dans les deux parcours, vérifier les scénarios propres aux changements et leurs voisins, avec persistance du résultat lorsque pertinente. Le socle technique et C1 ne suffisent pas à prouver le bon fonctionnement du changement. Les règles adoptées sur les échecs et les données de test restent applicables.

La proposition de release indique le parcours, les vérifications bloquantes, celles différées et les éventuelles lacunes acceptées. Le « go release » de Patrice lance la préparation et les vérifications de ce périmètre. Toute nouvelle lacune de vérification non annoncée lui est soumise avant de poursuivre. Après les résultats et sa recette sur staging, un « go prod » distinct autorise la mise en production. Les vérifications encore valides sont réutilisées ; ce second accord ne déclenche pas à lui seul une nouvelle campagne complète.

| Vérification | Ciblé | Complet |
| --- | --- | --- |
| **Tests bloquants en CI** | Changement, composants concernés, usages et voisins ; sélection justifiée | T1 complète ; suite API complète lorsque requise |
| **Staging réel** | Bonne version, santé API, chargement PWA ; scénarios concernés et voisins | Même socle technique + contrat E1 complet |
| **Recette humaine** | C1 systématique ; C2–C5 selon les impacts ; changements et voisins, résultats persistés | C1–C5 systématiques + changements livrés et contrôles spécifiques au risque |
| **Tests différés éventuels** | Scénarios prévus sur staging, dès la fin des contrôles bloquants, pendant l’attente du go prod puis pendant/après la MEP | Les vérifications complètes requises restent avant MEP |
| **Production après livraison** | Constat de la version servie et de son accessibilité, sans parcours métier ni écriture de données | Même constat |

**Commun aux deux** : candidat précisément identifié, code/version/notes validés, build et tests requis réussis avant déploiement, un cycle staging, gates d’autorisation, build prod distinct, contrôles prod en lecture seule et repli préparé. Le local reste à la demande ; il ne remplace pas une preuve CI requise.

**La production n’est pas un environnement de tests.** Les vérifications bloquantes sont faites avant MEP, en CI puis sur staging. Les scénarios différés peuvent démarrer automatiquement dès la fin des vérifications bloquantes, pendant l’attente du « go prod », puis continuer pendant et après la MEP sans en retarder le lancement. Ils s’exécutent sur **staging, sur le candidat choisi**, jamais sur la production. Un échec découvert avant la MEP est présenté pour décision selon les règles de criticité adoptées. Leur liste et le risque accepté sont annoncés avant le go. Cela ne déplace pas automatiquement la suite T1/H2 vers le cloud : les scénarios doivent être compatibles avec staging et disposer de données de test sûres.

**Un échec différé déclenche un diagnostic, pas un rollback automatique.** On distingue défaut produit, test/assertion devenu inadapté, problème de données ou d’environnement, et résultat encore indéterminé. On présente à Patrice les éléments, l’impact probable et une recommandation ; il décide du correctif, de l’ajustement justifié du test, d’une investigation ou d’un retour arrière. Un test n’est pas affaibli pour masquer un défaut et un échec inexpliqué n’est pas déclaré réussi.

### Staging : la nouvelle release est prioritaire

**Les tests différés n’occupent pas le staging jusqu’à leur terme.** Si un nouveau candidat autorisé doit y être déployé, ses tests différés en cours ou en attente pour l’ancienne version sont annulés, sans attendre la fin de la suite.

- Arrêter les anciens tests et leurs opérations de données de test avant de basculer la cible, pour qu’ils ne continuent pas sur la nouvelle version. Les gardes techniques ne servent qu’à cette transition, pas à réserver staging jusqu’à la fin de la régression.
- Enregistrer « annulé : remplacé par la release suivante », la version concernée et les vérifications effectivement terminées. Une suite interrompue reste incomplète, jamais verte par défaut.
- Conserver les échecs déjà observés et leurs éléments de diagnostic ; l’annulation ne les efface pas et n’entraîne pas de rollback automatique.
- Évaluer le nouveau candidat sur son propre delta cumulé et exécuter ses contrôles requis. Il n’hérite pas d’une validation complète de l’ancien candidat.
- Vérifier la version attendue au lancement et à l’enregistrement des résultats. Si un remplacement échappe à l’annulation, les résultats mélangés sont non attribuables, pas une preuve.

Le développement continue normalement. Aucun second environnement ni attente de fin des tests différés n’est nécessaire pour livrer un correctif urgent. L’annulation, le nettoyage limité aux données possédées par l’exécution et la protection contre les résultats tardifs restent à concevoir.

## Quelques exemples

| Ensemble en attente | Proposition |
| --- | --- |
| Correction des noms indisponibles seule, usages et tests connus | Ciblé possible |
| Réparation locale du graphique mobile, vérifications responsive et navigation prévues | Ciblé possible |
| Correction locale + changement des sessions | Complet pour l’ensemble |
| Plusieurs corrections dont les interactions restent inconnues | Complet |
| Statistiques multi-troupes avec évolution des droits de visibilité et des contrats de données | Complet |

## Ce qui reste ouvert

**Deux releases demandent staging avant la MEP de la première :** demander à Patrice laquelle poursuivre avant de remplacer le candidat en cours. Aucune priorité ni aucun abandon automatique. Cette règle ne change ni l’annulation des seuls tests différés après livraison, ni l’absence d’interruption sur un simple merge dans `v2`.

**À préciser dans l’architecture :**

- Retrouver les résultats Actions du bon candidat, vérifier leur validité et tracer la recette humaine, sans ramener les rapports dans le repo.
- Associer chaque contrôle aux assertions automatisées et scénarios humains réels, avec des données de test sûres.
- Traduire les règles de criticité et de signalement dans les statuts des tests ; si un test lié aux changements échoue puis réussit après relance sans cause identifiée, présenter les deux résultats, l’analyse et le risque restant à Patrice, puis lui demander s’il accepte de poursuivre. Ni validation ni abandon automatique ; son acceptation ne transforme pas le résultat en réussite sans réserve.
- Déclencher les tests différés après les contrôles bloquants, les annuler proprement au remplacement de staging et conserver des résultats attribuables.
- Figer le candidat malgré les merges, appliquer les deux accords et reprendre sans danger après un incident de publication ou de déploiement.

Le démarrage anticipé des tests différés, leurs règles d’annulation, les deux accords, la stabilité du candidat et le principe de reprise sont déjà adoptés : il reste à concevoir leurs mécanismes.

**Le ciblé reste inactif tant que ses mécanismes ne sont pas implémentés et vérifiés. La procédure actuelle continue de s’appliquer.**

Références : [document détaillé en anglais](release-paths-discussion.md) · [étude des changements de maintenance](../../planning-artifacts/research/technical-post-opening-v2-release-paths-2026-10-23/research.md).
