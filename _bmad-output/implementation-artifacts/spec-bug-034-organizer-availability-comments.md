---
title: 'BUG-034 organizer availability comments'
type: 'bugfix'
created: '2026-10-17'
status: 'done'
route: 'bmad-build (manual fallback: runtime snapshot omits skill files)'
context:
  - ISSUES.md#BUG-034
  - _bmad-output/planning-artifacts/prd.md#FR18
  - docs/v2/technical/FRONTEND_UI.md
  - _bmad-output/planning-artifacts/ux-design-dispos-poll-as-built-2026-06-09.md
---

# BUG-034 — Consultation des commentaires de disponibilité par les orgas

## Intent

Un·e organisateur·ice doit pouvoir repérer puis lire le commentaire de disponibilité
d'un·e participant·e au moment où il ou elle consulte les Dispos ou choisit une personne
pour un créneau Équipe. Cette consultation est strictement en lecture seule et ne modifie
ni le statut, ni les rôles, ni la composition.

## Code-backed investigation

- `AvailabilityService.getSummary()` renvoie déjà `SummaryParticipantDto.comment` depuis
  `event_availability.comment`.
- `EventDisposTab` transmet ce participant au `AvailabilityPoll`, où le commentaire est
  rendu dans le même champ que l'édition. Le sélecteur d'organisateur ne signale pas les
  personnes ayant laissé un commentaire : il faut connaître puis sélectionner la bonne
  personne pour le découvrir.
- Équipe charge son picker avec `GET .../composition/candidates`. Le contrat
  `CompositionCandidateDto` ne contient aucun commentaire, alors que le service possède
  déjà l'index d'availabilities nécessaire pour le joindre sans requête supplémentaire.
- L'endpoint candidats impose déjà `requireManageComposition`; aucune présentation de
  commentaire ne doit être ajoutée aux pages publiques, au payload d'analytics, ou aux
  réponses de composition ordinaires.

## Acceptance criteria

1. Dans Dispos, pour un·e organisateur·ice, chaque option du sélecteur de participant
   dont le commentaire n'est pas vide porte un indicateur Material accessible indiquant
   qu'un commentaire est disponible. Le nom, l'avatar et le comportement de sélection
   existants restent inchangés.
2. Après sélection, le commentaire est consultable dans le bloc existant, sans écriture
   API provoquée par le changement de sujet ou par la consultation.
3. Dans Équipe, chaque candidat ayant un commentaire dans le picker de créneau affiche
   ce texte comme information secondaire lisible, sans l'intégrer à l'action de sélection.
   Un candidat sans commentaire ne laisse ni ligne vide ni espace décoratif.
4. `GET .../composition/candidates` expose ce champ uniquement dans son DTO organisateur;
   sa valeur est `null` quand le commentaire est absent ou blanc. Les permissions,
   l'éligibilité, le tri et les chances existants sont inchangés.
5. Les tests couvrent le contrat API candidat, le repérage Dispos et l'affichage Équipe;
   ils prouvent aussi qu'une consultation Dispos ne déclenche pas d'écriture.

## Acceptance Criteria — Material 3 (UI)

- **M3-1:** l'indicateur Dispos utilise `mat-icon` dans le `mat-select` existant; le
  picker conserve ses actions Material existantes.
- **M3-2:** les styles ajoutés utilisent les tokens `--mat-sys-*`, sans nouvelle palette
  ni couleur codée en dur.
- **M3-3:** le commentaire est du texte non interactif, ne réduit aucune cible tactile;
  l'icône décorative est masquée aux lecteurs d'écran et le libellé porte l'information.
- **M3-4:** UI N/A — pas de changement du chrome ou de la navigation.
- **M3-5:** vérifier mobile <= 480 px et desktop, sans faire régresser les deux lignes
  figées du sondage ni le footer du picker.

## Out of scope

- Édition de commentaire, règles de persistance, migrations et legacy.
- Pages publiques, analytics/PostHog, notification ou historique audit FR35.
- Refonte de la barre Dispos, du sondage ou du picker de composition.

## Validation et clôture

- 2026-10-17 — Revue locale : contrat organisateur limité au picker de composition ;
  aucun changement de permissions, d'éligibilité, de tri ou de payload public.
- 2026-10-17 — Vérifications : tests Angular ciblés (18 succès), build Angular,
  test d'intégration `CompositionSlotAssignmentIntegrationTest` et
  `git diff --check` réussis.
- 2026-10-17 — Recette humaine locale validée : un commentaire de disponibilité
  est signalé dans Dispos et lisible dans le picker Équipe. La donnée de recette
  est fictive et conservée uniquement dans la base H2 locale hors ligne.
