---
feature_branch: feat/25-23-ouvrir-un-quiz-avent-par-son-url
baseline_commit:
---

# Story 25.23 : Ouvrir un quiz Avent par son URL

Status: backlog

## Story

En tant qu’organisateur, je veux ouvrir une case Avent par un lien contenant son jour, afin de vérifier facilement un lutin ou son quiz après modification.

## Acceptance Criteria

1. **Lien direct.** `/avent?jour=N`, pour un entier de 1 à 24, mène à la case correspondante dès que le parcours et les droits de la personne le permettent. L’URL peut être copiée et rouverte, y compris après rechargement. Le contenu affiché est celui de l’environnement consulté. [Source : epic 25.23 ; demande utilisateur]
2. **Aperçu et test.** `/avent?preview=1&jour=N` conserve l’aperçu privé uniquement pour les comptes autorisés ; les testeurs du développement isolé conservent leurs droits existants sur les cases futures. Le paramètre ne donne aucun droit supplémentaire et ne modifie ni horloge ni mode test. [Source : stories 25.15, 25.18, 25.19]
3. **Parcours et confidentialité.** L’authentification, la première découverte et une révélation non vue prioritaire précèdent la destination. Après connexion ou cette étape, reprendre le jour demandé si toujours autorisé. Appliquer les mêmes règles que l’ouverture de la case depuis le calendrier : état personnel, résultat, accès aux jours futurs et contrôle serveur. Ne divulguer ni contenu ni résultat non autorisé, y compris avant l’ouverture ordinaire de l’Avent. [Source : EXPERIENCE ; stories 25.5 et 25.15]
4. **Repli sûr.** Paramètre absent, invalide, répété ou hors de 1–24 : conserver le parcours Avent normal, sans erreur bloquante. Si la case est verrouillée, sans contenu ou inaccessible, utiliser le parcours autorisé existant et une explication seulement lorsqu’elle ne révèle pas l’Avent à une personne non autorisée. Le jour 25 reste accessible par son parcours existant. [Source : epic 25.23]
5. **Vérification.** Couvrir connexion et retour, découverte initiale, révélation prioritaire, quiz disponible, joué, passé, futur, absent, paramètres invalides, aperçu autorisé et refusé, changement de compte et rechargement. Utiliser des données fictives ; vérifier le parcours navigateur jusqu’à la destination et les restrictions côté serveur. [Source : epic 25.23]

## Acceptance Criteria — Material 3 (UI)

**M3-1.** Réutiliser les écrans et contrôles existants ; si une indication est nécessaire, conserver sa lisibilité, sa sémantique, le focus et le clavier sur mobile et à texte agrandi. Respecter les cibles Advent d’au moins 44 × 44 px et le mouvement réduit.

**M3-2.** Appliquer la checklist [FRONTEND_UI](../../docs/v2/technical/FRONTEND_UI.md), les contrats Avent [DESIGN](../planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/DESIGN.md), [EXPERIENCE](../planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/EXPERIENCE.md), [AD-7](../planning-artifacts/architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md) et la [stratégie visuelle](../test-artifacts/test-design-advent-visual-isolation.md). Vérifier les écrans touchés et l’absence d’effet sur HatCast ; noter les éventuels écarts.

## Tasks / Subtasks

- [ ] Examiner les parcours d’entrée, de connexion et de calendrier ; conserver les contrôles d’autorisation serveur (AC 1–4).
- [ ] Ajouter la sélection par jour et la reprise après étapes prioritaires, sans modifier les droits ou données (AC 1–4).
- [ ] Ajouter des tests pertinents Angular et navigateur ; exécuter les suites concernées et vérifier responsive, accessibilité et isolation visuelle (AC 5, M3-1–2). Exécuter les tests API concernés si le serveur change.
- [ ] Mettre à jour les contrats fonctionnels ou d’architecture concernés lors de l’implémentation et documenter un exemple de lien (AC 1–4).

## Dev Notes

- Points de départ : [routes](../../apps/web/src/app/app.routes.ts), [parcours Avent](../../apps/web/src/app/pages/advent-test/advent-test.ts), navigation après connexion et API Advent existantes.
- La publication du catalogue et sa synchronisation vers la base de l’environnement sont distinctes : cette story ne les automatise pas.
- Hors périmètre : changement des permissions, reset des réponses, synchronisation du catalogue, déploiement et nouvelle interface de partage.
- Dépendances : stories 25.5, 25.15, 25.18 et 25.19 ; conserver les liens de notifications existants et vérifier leur compatibilité.

## Dev Agent Record

### Agent Model Used

À renseigner lors de l’implémentation.

### Completion Notes List

- À renseigner.

### File List

- À renseigner.

### Change Log

- 2026-11-05 : création de la story.
