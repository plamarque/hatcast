---
feature_branch: feat/19-25-masquer-les-chances-apres-selection
baseline_commit: c580faf1295b144695db94661d9e164a4500080b
---

# Story 19.25 : Chances enregistrées après publication de la composition

Status: done

## Story

En tant que membre, je veux distinguer les chances simulées des chances enregistrées au moment d’une sélection publiée, afin de ne pas confondre estimation et résultat connu.

## Acceptance Criteria

1. Avant que la composition soit visible, Dispos conserve les chances estimées existantes ; une publication confidentielle reste indistinguable.
2. À la première sélection de chaque rôle, HatCast conserve une photographie homogène des chances de tous les candidats, prise avant l’opération et datée. Après publication et visibilité, Dispos affiche uniquement la dernière capture de pool disponible pour le rôle ; les personnes hors de ce pool restent sans valeur capturée.
3. Les sélections manuelles et les tirages utilisent la même règle ; la capture du rôle reste inchangée après publication, retrait ou remplacement manuel. Tout nouveau tirage effectif capture son pool réel, même pour une composition antérieure ou un rôle partiellement rempli ; les personnes conservées hors pool restent sans valeur capturée et la capture incomplète est signalée. Un tirage sans sélection conserve la référence existante. Les données historiques sans photographie fiable sont indisponibles sans estimation de remplacement.
4. La chance effective d’une personne sélectionnée reste distincte dans sa fiche ; aucun classement ne mélange cette valeur avec les pourcentages de la photographie. Les estimations actuelles restent disponibles aux organisateurs pour pourvoir une place vacante.
5. Les rôles, droits et règles de confidentialité restent inchangés ; les candidats, la date de la photographie et les valeurs absentes sont traités explicitement.
6. Dans Dispos, sondage et Tous, les badges candidats font au moins 48 dp de haut sur mobile et affichent au plus trois personnes par rangée. Les affectations visibles utilisent les couleurs sémantiques de participation ; les autres gardent la couleur de chance. Le tri suit les pourcentages affichés et les cases de vote restent inchangées.

**Couverture produit :** epic 19.25 ; UX-DR11 ; précision produit du 19 novembre 2026.

## Acceptance Criteria — Material 3 (UI)

- Réutiliser composants Material et tokens existants ; ne pas introduire de couleur en dur.
- Mobile et desktop : lignes lisibles et utilisables ; contrôle de fiche accessible au clavier et correctement libellé pour une attribution publiée.
- Parcourir la checklist M3 de FRONTEND_UI.md et signaler les écarts.

## Tasks / Subtasks

- [x] Cartographier et adapter Équipe et Dispos par rôle, en respectant publication et visibilité des attributions.
- [x] Afficher date et pourcentage enregistrés, avec une fiche de sélection sans détail de calcul pour les attributions publiées ; conserver les candidats, simulations, calculs et permissions.
- [x] Couvrir attribution manuelle et tirée, absence de valeur, retrait, autres rôles, publication et visibilité, et accessibilité des commandes.
- [x] Exécuter les tests pertinents, vérifier les vues sur mobile et desktop et parcourir la checklist M3.

## Dev Notes

- Les sélections manuelles enregistrent déjà leur pourcentage lorsqu’il est calculable ; les données anciennes ou non calculables peuvent ne pas en contenir.
- Publication et validation sont deux états distincts : le bouton Équipe « Publier » valide directement la composition ; pour les chances, une composition validée ou portant `publishedAt` est considérée publiée. Le déverrouillage efface la validation ; `publishedAt`, lorsqu’il existe, reste pris en compte. Respecter `CompositionVisibilityRules` pour toute donnée d’attribution et ne pas inférer le mode de sélection.
- Lire `docs/v2/technical/FRONTEND_UI.md` et conserver les parcours de simulation avant publication et pendant le tirage.

## Dev Agent Record

### Agent Model Used

Codex (GPT-6), avec validation humaine de Patrice.

### Completion Notes List

- Patrice a validé la fonctionnalité en recette humaine ; les captures de rôle, les chances effectives et la visibilité restent distinctes.
- Migration de la story renumérotée V88 pour suivre la migration Avent V87 intégrée sur v2 ; migrations vérifiées ensemble sur H2 isolé.
- Vérifications : 104 tests API ciblés, 173 tests Angular ciblés, 10 parcours Playwright généraux Dispos/Équipe et test du contrôleur de suivi réussis. Les parcours Playwright ne constituent pas une couverture E2E spécifique de la capture ; les scénarios de capture et de visibilité sont couverts par les tests API et composants.
- Checklist M3 : structure et contrôles existants réutilisés, libellés et cibles tactiles vérifiés sur mobile ; aucune dérogation nouvelle identifiée.

### File List

- API composition et disponibilité, contrats OpenAPI et migration V88 ; composants Angular Dispos, Équipe et fiche de chances avec leurs tests ; SPEC, DOMAIN, ARCH, epic et contexte UX.

### Change Log

- 2026-11-19 : création de la story ; périmètre explicité pour les onglets Équipe et Dispos.

- 2026-11-20 : recette humaine validée ; vérifications de clôture et renumérotation de la migration après intégration Avent.
