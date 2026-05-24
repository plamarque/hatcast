# Story 13.6 : Ligues déplacements (création et conventions)

Status: backlog

## Story

En tant qu'**administrateur de troupe**,  
je veux créer et gérer une **ligue déplacements** distincte des ligues spectacle,  
afin d'y planifier les spectacles à l'extérieur sans le type `deplacement` sur la ligue principale (FR56, UX-DR20).

## Acceptance Criteria

1. **Given** création de ligue, **when** l'admin sélectionne le modèle **Ligue déplacements**, **then** la ligue est créée avec roster (FR50), événements, dispos et composition comme toute ligue.
2. **Given** une ligue spectacle, **when** création d'événement, **then** le type **`deplacement`** n'est pas proposé pour les nouveaux événements.
3. **Given** données legacy `deplacement`, **when** affichées, **then** lecture et stats DEPLAC. restent valides jusqu'à migration.
4. **Given** tirage dans une ligue déplacements, **when** exécuté, **then** pas de branche `isDeplacement(templateType)` (FR57).
5. **Couverture :** FR56–FR57 ; UX-DR20.

## Dependencies

- Stories **13.3–13.4** (création ligue)
- Epic 6 draw (retrait exceptions post-adoption)

## References

- [ADR 0012](../../docs/adr/0012-league-views-travel-leagues-member-stats.md)
