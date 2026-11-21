---
feature_branch: feat/19-26-reconstituer-les-photographies-de-chances-manquantes
baseline_commit:
---

# Story 19.26 : Reconstituer les photographies de chances manquantes

Status: backlog

## Story

En tant que membre, je veux retrouver des chances comparables pour les compositions déjà préparées, afin de bénéficier de cette information dès l'activation de la fonctionnalité.

## Acceptance Criteria

1. **Given** les données historiques de production, **when** leur faisabilité est examinée en lecture seule, **then** le rapport identifie par spectacle et rôle les sélections, validations, disponibilités, exclusions, formules et anciennes chances disponibles, ainsi que les lacunes et la chronologie démontrable. [Source: epic 19.26 AC1]
2. **Given** la préproduction actuelle, **when** elle est synchronisée depuis la production, **then** une sauvegarde identifiable et sa procédure de restauration ont été vérifiées au préalable ; la cible, les données remplacées, les versions de schéma et le redémarrage avec migrations sont contrôlés. L'utilisateur a autorisé le remplacement des données de préproduction, y compris les quiz de test. [Source: epic 19.26 AC2 ; décision utilisateur 21 novembre 2026]
3. **Given** les données de production copiées en préproduction, **when** le replay est exécuté, **then** il reconstitue les photographies manquantes selon l'ordre des décisions effectivement attestées et les données disponibles ; chaque résultat et chaque lacune sont rapportés avec leurs hypothèses. Une date de spectacle seule ne prouve pas l'ordre des décisions. [Source: epic 19.26 AC3]
4. **Given** des captures communes ou des chances individuelles enregistrées, **when** le replay produit des valeurs différentes, **then** il les préserve, rapporte les écarts et stocke séparément les photographies manquantes ; il ne présente pas une estimation comme une preuve observée. Les chances individuelles et les photographies communes restent distinctes. [Source: epic 19.26 AC3, AC6 ; story 19.25]
5. **Given** une exécution interrompue ou erronée, **when** l'opérateur reprend ou restaure, **then** la procédure est vérifiable et reproductible, n'écrase pas les valeurs existantes, préserve compositions et statuts, et n'envoie aucune notification. La préproduction peut être restaurée au point sauvegardé et l'opération recommencée ; aucune simulation préalable n'est imposée. [Source: epic 19.26 AC4 ; décision utilisateur]
6. **Given** la migration terminée en préproduction, **when** les contrôles automatiques et la recette humaine sont réalisés, **then** ils vérifient les rôles concernés, les cas incomplets, les écarts, les accès et l'affichage réel, notamment pour Match Cambo. Une écriture ou migration en production requiert une autorisation distincte. [Source: epic 19.26 AC4–5]

**Couverture produit :** epic 19.26 ; FR19, FR20, FR24 ; suite de 19.25. La décision de reconstituer les valeurs historiques complète le contrat antérieur qui les laissait indisponibles ; actualiser les documents normatifs concernés lors de la réalisation, sans présenter une estimation comme historique certaine.

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** si aucun changement sous `apps/web/` : utiliser l'affichage existant. Si l'identification honnête d'une valeur reconstituée nécessite une modification UI, définir d'abord le comportement et adapter les critères M3, l'accessibilité et la recette selon `docs/v2/technical/FRONTEND_UI.md`.

## Tasks / Subtasks

- [ ] (AC1) Examiner la couverture et la qualité des journaux, les snapshots, les formules et les dépendances chronologiques ; documenter les résultats et hypothèses.
- [ ] (AC2) Identifier les branches et applications, sauvegarder et vérifier la capacité de retour arrière ; synchroniser staging depuis production, contrôler Flyway et redémarrer sans notification.
- [ ] (AC3–5) Concevoir et réaliser le replay et son rapport ; préserver captures et affectations existantes, prévoir idempotence, reprise et restauration.
- [ ] (AC4) Comparer valeurs historiques et reconstituées sans les confondre ; signaler les données non reconstituables.
- [ ] (AC6) Exécuter les tests ciblés API/scripts, vérifier les données et les droits et organiser la recette humaine en préproduction.
- [ ] (AC6) Mettre à jour les documents normatifs concernés ; préparer séparément toute proposition pour la production.

## Dev Notes

### Faits vérifiés le 21 novembre 2026

- Branche Neon `staging` issue de `production`, dernière synchronisation le 16 novembre ; états susceptibles d'évoluer, à revérifier avant opération.
- Production Flyway V86 ; staging V88. V87 crée les tables de quiz bonus Avent, V88 les tables de photographies communes. Vérifier la révision Cloud Run réellement servie avant arrêt/redémarrage et application des migrations.
- Production, Malice 2026–2027 : Match Cambo possède 42 lignes de snapshots anciens, cinq événements de tirage et 124 événements de disponibilité. Les snapshots de ses rôles datent de plusieurs tirages ; leur équivalence avec une photographie commune reste à établir. Caprani possède aussi des chances individuelles ; ne pas écraser ces données.
- Les journaux de disponibilité contiennent les valeurs avant/après ; les tirages contiennent des affectations avant/après. La couverture complète, les exclusions et la formule à chaque décision restent à prouver. Les anciens snapshots examinés ne portent pas d'identifiant de formule.
- Le calcul opérationnel considère les compositions validées d'autres spectacles ; rejouer par date de spectacle ne reproduit pas forcément l'ordre des décisions. Utiliser les chronologies d'audit et signaler les ambiguïtés.

### Références et garde-fous

- `services/api/src/main/kotlin/com/hatcast/api/composition/RoleChanceBaselineCaptureService.kt`, `CompositionDrawService.kt`, `CompositionSlotAssignmentService.kt`, `CompositionExplainabilityService.kt` et `services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt`.
- `services/api/src/main/resources/db/migration/V87__advent_bonus_quizzes.sql` et `V88__role_chance_baselines.sql`.
- 19.25 est terminée ; préserver son contrôle des droits et la séparation entre photographie commune et chance individuelle.
- La valeur et la date estimées ne doivent pas être présentées comme une capture réellement observée. Définir la provenance et sa restitution avant toute écriture si le modèle existant ne les distingue pas.
- L'exécution directe sur staging après sauvegarde est souhaitée ; afficher un rapport des écarts, avec possibilité de restauration et nouveau passage. La synchronisation de staging n'autorise aucune écriture en production.

## Dev Agent Record

### Agent Model Used

À renseigner lors de la réalisation.

### Completion Notes List

- Aucune sauvegarde, synchronisation ou migration exécutée lors de la préparation.

### File List

- À renseigner lors de la réalisation.

### Change Log

- 2026-11-21 : intention et décisions de préproduction enregistrées ; story en backlog.
