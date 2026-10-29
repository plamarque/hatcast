# Revue de faisabilité — révision Avent

Verdict : faisable sur la pile existante ; deux raccords restent à expliciter avant de considérer AD-5 comme réalisable, et les frontières des caches et de publication doivent être vérifiées par les stories. La pile nommée est constatée dans le dépôt, sans adoption d'une nouvelle technologie ni hypothèse de version courante.

## Élevé — circuit de notification actuellement lié aux spectacles

`NotificationDispatchContext.kt` rend `eventId` et `seasonId` obligatoires ; `NotificationDispatcher.kt` charge systématiquement un `EventEntity` puis s'appuie sur les constructeurs de contenu de spectacle. Le registre `NotificationIntent.kt` ne contient pas d'intention Avent. Les marques périodiques exigent un `event_id` référençant `events` (`V51__notification_reminder_marks.sql`). Un job à 10 h ne peut donc pas simplement appeler le dispatcher et la déduplication existants pour un quiz sans spectacle fictif. Le contrat devrait signaler explicitement que l'adaptation doit rendre le circuit applicable à une notification hors spectacle, y compris destinataires, préférences, journal, payload et déduplication par membre/jour, tout en réutilisant les composants appropriés. Il ne s'agit pas de supposer que ces adaptations existent déjà.

## Élevé — disponibilité à 10 h et publication par release

`AvailabilityPendingReminderJob.kt` observe `Instant.now()` lors de l'exécution et ne conserve pas l'instant historique de publication du contenu Avent. La spine exige d'établir la disponibilité à 10 h même si le traitement est retardé, mais renvoie entièrement le mécanisme à l'implémentation et interdit une preuve dédiée dans la décision antérieure de la memlog. Une release peut devenir disponible après 10 h avant le passage tardif du job. L'état courant seul ne distingue pas les deux situations. Il faut rendre explicite le besoin d'une source durable et fiable de disponibilité effective, ou arbitrer la limite : sans cela les stories peuvent construire des solutions incompatibles et envoyer à tort. Ce besoin ne prouve ni ne crée une garantie de reprise.

## Moyen — sécurité des fichiers et service worker

`ngsw-config.json` précharge JS/CSS et peut mettre en cache des assets selon leur URL ; `custom-sw.js` délègue au service worker Angular après ses gestionnaires push. Aucun `dataGroups` n'y figure actuellement, mais cela ne prouve pas la sécurité d'éventuelles nouvelles routes ou d'un proxy/CDN. Le portrait d'un quiz futur doit aussi être protégé si son URL donne accès directement à un fichier d'asset public ou à un objet publié. Les tests doivent exercer les URLs de fichiers directes, les caches lors du changement de compte et les réponses HTTP `no-store` ; les noms/URLs/manifestes révélateurs ne doivent pas trahir les portraits avant autorisation.

## Moyen — envoi après vérification du destinataire

Le job existant prépare ses destinataires en transaction puis appelle le dispatcher après commit (`AvailabilityPendingReminderJob.kt`). Une réponse peut être enregistrée entre sélection et envoi. La règle « absence de réponse » doit préciser le point de contrôle réalisable et les conséquences de la concurrence, plutôt que sous-entendre une atomicité entre base et notification externe. Les marques existantes sont enregistrées indépendamment avant envoi, et les erreurs de dispatch sont journalisées : la reprise ou l'exactement-une-fois ne sont pas garantis.

## Constat de pile

`services/api/build.gradle.kts` utilise Kotlin 2.0.21, Spring Boot 3.4.1, JPA, Flyway et le pilote PostgreSQL. `NotificationSchedulingConfiguration.kt` active Spring scheduling ; les jobs existants spécifient explicitement `Europe/Paris`. `apps/web/ngsw-config.json` et `apps/web/src/custom-sw.js` confirment la PWA Angular. Ces constats décrivent le code présent, non une vérification de versions les plus récentes ni de la configuration d'exécution en production.
