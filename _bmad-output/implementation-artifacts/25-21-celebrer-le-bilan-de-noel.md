---
feature_branch: feat/avent-victoire-noel
baseline_commit: 2d0c73dddac93d6ebfe9421e25f8caf3f9e54637
---

# Story 25.21 : Célébrer le bilan de Noël

Status: in-progress

## Story

En tant que membre, je veux découvrir mon bilan de Noël et ma place afin de célébrer le parcours et la victoire.

## Acceptance Criteria

1. **Given** le classement final autorisé, **when** le bilan est affiché après la révélation prioritaire, **then** distinguer victoire seule et ex æquo, place individuelle et ex æquo, compte exclu et score nul, sans modifier les règles du classement.
2. **Given** le mode test isolé autorisé, **when** un aperçu de Noël est sélectionné, **then** afficher le même bilan avec des données fictives éphémères et une indication dans le chrome de test.
3. **Given** le parcours de Noël, **when** un membre navigue, **then** conserver les accès au classement, au calendrier et à HatCast, ainsi que la confidentialité et la priorité de révélation.

**Couverture produit :** [DESIGN](../planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/DESIGN.md), [EXPERIENCE](../planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/EXPERIENCE.md), [AD-7](../planning-artifacts/architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md), [stratégie de tests](../test-artifacts/test-design-advent-visual-isolation.md).

## Acceptance Criteria — Material 3 (UI)

- Utiliser les boutons et menus Material et les tokens isolés Avent, sans modifier le thème HatCast.
- Vérifier les écrans mobiles et desktop, le clavier, le zoom, le mouvement réduit, les cibles tactiles et l’isolation visuelle ; documenter les limites de vérification.

## Tasks / Subtasks

- [x] Implémenter les variantes du bilan et les aperçus isolés sur le même écran.
- [x] Actualiser les contrats UX et fonctionnels.
- [ ] Vérifier la réconciliation avec le classement fictif et les scènes de résultat intégrés sur v2.
- [ ] Exécuter les tests et vérifier le checkout intégré.

## Dev Agent Record

### Completion Notes List

- Maquettes et variantes validées par Patrice ; recette locale enregistrée en vidéo sur la stack offline, puis contrôle humain sur téléphone.
- Vérifications précédentes : build réussi, 29 tests Noël ciblés, Playwright sur le serveur local avec cinq aperçus. La suite Avent avant réconciliation avait un échec préexistant, corrigé entre-temps sur v2 ; à revérifier.

### File List

- SPEC.md ; contrats UX Avent ; composant, styles et tests `apps/web/src/app/pages/advent-test/` ; spécification de réalisation.
