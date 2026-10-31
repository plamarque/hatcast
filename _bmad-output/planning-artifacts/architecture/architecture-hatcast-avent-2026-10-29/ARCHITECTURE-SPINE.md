---
name: Calendrier de l’Avent La Malice
type: architecture-spine
purpose: build-substrate
altitude: feature
paradigm: Architecture en couches à domaine gouverné par l’API
scope: Calendrier de l’Avent 2026 intégré à HatCast
status: final
created: 2026-10-29
updated: 2026-10-30
visual_amendment: in-progress
binds: [FR-1, FR-2, FR-3, FR-4, FR-5, FR-6, FR-7, FR-8, FR-9, FR-10, FR-11, FR-12, FR-13]
sources:
  - ../../prds/prd-hatcast-2026-10-28/prd.md
  - ../../ux-designs/ux-hatcast-avent-2026-10-28/DESIGN.md
  - ../../ux-designs/ux-hatcast-avent-2026-10-28/EXPERIENCE.md
---

# Architecture Spine — Calendrier de l’Avent La Malice

> Le PRD, la spec et l’epic 25 sont réconciliés avec les décisions ci-dessous ; les critères et dépendances des stories révisées ont été validés avec Patrice le 29 octobre 2026.

## Paradigme

Angular présente les parcours ; l’API contrôle accès, temps, divulgation et mutations ; PostgreSQL conserve l’état partagé. Notifications et analytics ne font pas autorité sur les scores.

```mermaid
flowchart LR
  UI[Interface HatCast] --> API[API et domaine Avent]
  API --> DB[(Données du jeu)]
  Job[Planificateur Spring existant] --> API
  API --> Notify[Notifications HatCast]
  UI --> Analytics[PostHog]
```

## Invariants et règles

### AD-1 — Accès et confidentialité [ADOPTED]

- **Binds:** FR-1, FR-4, FR-6, FR-10, FR-11, FR-13 ; contenus, API et caches.
- **Prevents:** Accès hors troupe et divulgation des contenus futurs ou de la justesse avant révélation.
- **Rule:** L’API vérifie à chaque lecture et mutation l’appartenance active à la troupe configurée et les dates et modes autorisés ; l’administration plateforme ne dispense pas de cette appartenance. Les contenus futurs, réponses correctes et compléments révélateurs ne figurent ni dans les bundles, assets publics, caches partagés, notifications ou analytics, ni dans une réponse API anticipée. Pour un quiz jouable, l’API ne fournit que portrait et trois anecdotes ; en production, jusqu’à minuit Paris suivant son jour, aucune réponse, erreur, métadonnée ou donnée dérivée accessible ne révèle sa justesse ou ses points, y compris pour d’autres membres. Les réponses et scores en attente restent côté serveur en production. En test isolé, seule l’exception de classement d’AD-4 permet un indice par le score ; les réponses détaillées et résultats restent soumis à leur révélation simulée. Les portraits sensibles et leurs URL directes sont soumis aux mêmes contrôles. Les lectures sensibles sont privées et non mises en cache (`Cache-Control: no-store`) ; service worker, stockage client et intermédiaires ne doivent pas conserver ou servir des données Avent sensibles périmées ou destinées à un autre compte. La protection ne couvre pas le partage volontaire par une personne ayant découvert un contenu.

### AD-2 — Essais isolés et configuration [ADOPTED]

- **Binds:** FR-13 ; développement, simulation et opérations.
- **Prevents:** Accès au mode test en production ou contamination de la partie réelle.
- **Rule:** Le mode test existe exclusivement en développement isolé, jamais en production ; il est visible et accessible aux membres actifs de la troupe configurée figurant sur la liste dédiée des testeurs. Cette liste ne confère aucun rôle d’administration de troupe ou de plateforme. Chaque testeur peut effacer sa propre réponse et rejouer la case, même passée, sans modifier la date ni les réponses des autres. Le contenu de développement est libre pour les besoins de test ; protéger les données personnelles et les portraits privés utilisés. Isoler effectivement données, notifications et analytics de production et interdire côté serveur toute commande de simulation ou de reset en production. Chaque onglet opérateur conserve sa date simulée en mémoire et la transmet à chaque requête ; le serveur la valide après vérification de l’environnement et de l’identité puis prélève le temps sous le verrou. Cette date ne modifie jamais le temps des autres membres. La remise à zéro ciblée redémarre la partie, sans modifier le décalage de base. Le classement de test présente le score courant de toutes les réponses enregistrées dans la base isolée, même non révélées et indépendamment de la date simulée ; il peut ainsi donner un indice sur des points en attente. L’ancien barème et la simulation de 25 quiz ne sont plus applicables. Tester séparément les vraies limites temporelles de production sans autoriser une horloge simulée en production.

### AD-3 — Réponses et état partagés [ADOPTED]

- **Binds:** FR-2, FR-4 à FR-7, FR-10, FR-11.
- **Prevents:** Double réponse, calcul incohérent à contenu inchangé, perte ou divulgation du résultat entre appareils ; le risque lié à une modification exceptionnelle du contenu est accepté.
- **Rule:** Le serveur applique les jours civils Europe/Paris : les quiz 1 à 24 acceptent une confirmation de 00 h inclus à 00 h le lendemain exclu ; toute confirmation attendant encore le verrou à la limite est fermée, même si elle a été reçue avant minuit. La révélation attend la fin d’une transaction déjà en cours. La base garantit une réponse définitive par membre et quiz sous concurrence et réessai ; une transaction sérialise pour un membre les mutations nécessaires au calcul. L’API permet de résoudre une confirmation incertaine sans deuxième réponse et ne retourne qu’un accusé avant révélation. Conserver choix et informations nécessaires à restituer le résultat. Patrice ne modifie pas les contributions pendant le jeu ; le risque d’incohérence en cas de modification exceptionnelle est accepté, sans verrouillage, contrôle de version ou snapshot imposé pour ce seul risque. Calculer 10 ou 0 points de réponse, 1 de participation et 2 par groupe non chevauchant de trois bonnes réponses successives ; une mauvaise rompt la série, un jour manqué ne la rompt pas. En production, ces données sont conservées mais non exposées avant révélation ; les totaux et rangs n’intègrent que les réponses dont le lendemain a commencé à Paris, indépendamment de la consultation par le membre. En test isolé, le classement utilise toutes les réponses enregistrées conformément à AD-4, sans modifier les règles d’affichage détaillé du résultat.

La fermeture de l’ouverture automatique est persistée par membre et jour, y compris si le contenu apparaît plus tard ; une visite sans contenu ne la consomme pas. La réponse enregistrée empêche l’ouverture automatique sur tous les appareils. Pour le retour, présenter en priorité le résultat non vu de la réponse révélable la plus récente, même si une réponse plus récente attend encore sa révélation ; les résultats plus anciens restent consultables dans leurs cases. Ne marquer vu qu’après affichage effectif de l’écran via un accusé explicite du client, idempotent et persisté côté serveur ; une réponse HTTP perdue avant affichage ne suffit pas. Une interruption ou deux appareils concurrents peuvent afficher le même résultat avant que l’accusé soit reçu : ne pas prétendre garantir un affichage unique distribué ; après enregistrement du vu, les accès suivants en tiennent compte. La consultation d’une case révélée ne rejoue pas la célébration.

### AD-4 — Classement et conservation [ADOPTED]

- **Binds:** FR-5, FR-8 à FR-10 ; conservation après l’animation.
- **Prevents:** Indices via score ou rang, classements incohérents et perte des résultats.
- **Rule:** En production, calculer chaque score personnel et chaque classement exclusivement à partir des points révélables au même instant de référence serveur ; ne publier aucun sous-total, évolution ou indicateur permettant de déduire la justesse ou les points en attente. En test isolé, calculer le classement courant à partir de toutes les réponses enregistrées dans la base de test, quelle que soit la date simulée ; ce classement peut donner un indice sur les points en attente. Ne pas reconstruire son état à une date simulée antérieure. Inclure tous les membres classables même sans réponse ; attribuer aux ex æquo le rang le plus bas du groupe (1, 3, 3, 4 ; tous à égalité = rang N). Exclure les comptes de Patrice et Toinou du classement tout en conservant leur score personnel. Le 25 décembre à 00 h Paris, les résultats du 24 deviennent révélables et le classement devient final ; aucun quiz du 25 et aucune réponse après le 24. Conserver réponses et résultats après le 15 janvier ; l’accès membre cesse le 16 janvier à 00 h Paris. Aucun mécanisme spécifique aux changements d’adhésion après clôture n’est prévu.

### AD-5 — Invitation quotidienne [ADOPTED]

- **Binds:** FR-3 ; notifications.
- **Prevents:** Invitation sans quiz disponible à 10 h ou adressée aux membres ayant déjà répondu.
- **Rule:** Réutiliser le planificateur Spring et les mécanismes habituels de rappels HatCast, sans infrastructure, reprise ni garantie supplémentaires propres à l’Avent. Viser 10 h Europe/Paris du 1er au 24 décembre ; à son exécution effective, vérifier la disponibilité du quiz du jour, l’absence de réponse et les préférences habituelles. Un quiz publié après 10 h peut être invité si le traitement démarre après sa publication ; une notification manquée est acceptée. Aucun horodatage dédié ni reprise spécifique. Le lien ouvre le parcours avec priorité à la révélation ; aucun spectacle fictif. Le circuit actuel associe notifications et déduplication à un spectacle : l’adapter à une identité de quiz et de destinataire, sans créer de spectacle factice. Les limites de disponibilité et de déclenchement des rappels existants restent applicables ; le mécanisme choisi ne garantit pas un envoi à heure exacte.

### AD-6 — Mesure de participation [ADOPTED]

- **Binds:** Réussite ; PostHog.
- **Prevents:** Mélange des essais et du jeu réel, exposition de contenus et confusion entre personnes et réponses.
- **Rule:** Mesurer deux totaux globaux : personnes distinctes ayant au moins une réponse réelle enregistrée et réponses réelles enregistrées. Exclure les essais et ne transmettre ni anecdotes, affirmations, choix, justesse ou points en attente. La base fait autorité si la télémétrie est manquée ; aucune ventilation par jour n’est requise.

### AD-7 — Identité visuelle Avent isolée [ADOPTED]

- **Binds:** Interface Avent, styles, tokens, composants, polices et ressources graphiques.
- **Prevents:** Modification ou contamination du design system et des autres écrans HatCast.
- **Rule:** Définir une racine de thème et un espace de noms explicites propres à l'Avent ; y limiter les variables, familles typographiques, styles, animations et adaptations de composants Material. Les ressources partagées de police peuvent être chargées sans application globale. Ne pas modifier les styles de base, les tokens HatCast ni les sélecteurs globaux pour installer le thème. Les composants Avent sont identifiables et réutilisables dans ce périmètre ; les surfaces rendues hors de la racine, notamment les overlays éventuels, doivent conserver cette frontière. Vérifier les interactions avec les règles globales existantes et prouver l'absence de fuite par tests visuels et styles calculés sur une page HatCast. Les règles de confidentialité et de temps AD-1–AD-6 restent intactes.

## Conventions et vérifications

- Toute décision temporelle utilise une référence serveur cohérente, jamais l’horloge du navigateur. Les quiz validés sont préparés directement en base par requêtes, sans back-office ; seuls les quiz sont transférés du développement vers la production, jamais les réponses de test. Les portraits restent dans un bucket privé. Les bases de développement et de production sont distinctes ; cette séparation isole leurs réponses sans imposer des tables distinctes pour ce motif. La procédure de transfert et l’identification sûre des cibles restent à définir et vérifier.
- Un quiz publié pendant son jour devient jouable jusqu’à minuit ; publié après son jour, il est consultable après révélation sans réponse ni points. La notification vérifie la disponibilité à l’exécution effective, selon AD-5.
- Les cases passées non jouées ne deviennent consultables qu’après leur date de révélation. Les écrans du 25 et après respectent la priorité de révélation et l’UX révisée.
- Angular Material et les documents UX gouvernent l’interface. Les configurations, données et effets de développement et de production sont isolés.
- Vérifier API directes, navigateur, service worker et caches sur deux comptes et appareils ; tester concurrence, réessai, 23:59:59/00:00 Paris, 24/25 décembre et 15/16 janvier, y compris contenu publié tardivement et séries interrompues ou non par un jour manqué.

## Questions ouvertes et relais

- **PRD :** reformuler FR-3 simplement : tentative d’invitation à 10 h, sous réserve du quiz disponible à l’exécution et des conditions habituelles ; envoi éventuellement tardif ou manqué sans gravité. Un quiz publié après 10 h peut être invité si le job est retardé. Réconcilier aussi FR-7 avec le résultat révélable non vu le plus récent.
- **Implémentation :** définir la procédure de reset ciblé, les garde-fous d’isolation ; vérifier les conditions de concurrence, de livraison des notifications et de préparation et transfert des seuls quiz entre bases. Définir l’accès ultérieur aux données conservées si nécessaire.
- **Spec :** réconcilier FR-1–FR-13 et AD-1–AD-6 : 24 quiz, confidentialité et projection révélée, frontières Paris, unicité, deux composantes de bonus, dernier résultat non vu, consultation des cases manquées, rangs, 25, notification et simulation retenue ; préserver rétention et mesure compatibles.
- **Epic 25 :** les critères et dépendances des stories 25.1, 25.2, 25.2a, 25.3–25.7 et 25.9 ont été révisés et validés avec Patrice le 29 octobre 2026. Couvrir les tests de fuite et caches, minuit, concurrence, reprise multi-appareils, série et frontières réelles.

**Reveal serialization contract:** Result and ranking reads acquire the same singleton clock row lock as confirmation, sample authoritative time after acquiring it, and read committed answers before releasing it. This serializes a reveal with in-flight confirmations so its scoring snapshot cannot subsequently change. A stalled transaction can delay the read beyond midnight; immediate wall-clock availability is therefore not guaranteed. Verify rollback and concurrent reads on PostgreSQL.

### Livraison du parcours membre direct

Le parcours direct utilise une seule API, une seule partie et les mêmes réponses pour tous les membres dans chaque environnement. Un verrou commun sérialise confirmation, révélations, classement et reset ; l’instant effectif est prélevé après acquisition. Deux comptes vérifiés seulement obtiennent les contrôles de développement isolé et le classement incluant les réponses en attente. Les membres ordinaires reçoivent uniquement les scores révélables. La production conserve l’heure réelle. Les anciennes tables de test sont conservées sans fusion automatique. La route directe ne constitue ni une entrée automatique ni la réalisation du calendrier ou des notifications.
