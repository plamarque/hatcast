---
feature_branch: feat/19-26-reconstituer-les-photographies-de-chances-manquantes
baseline_commit: ba328825
---

# Story 19.26 : Reconstituer les photographies de chances manquantes

Status: done

## Story

En tant que membre, je veux retrouver des chances comparables pour les compositions déjà préparées, afin de bénéficier de cette information dès l'activation de la fonctionnalité.

## Clôture et suite de release

Le 21 novembre 2026, Patrice valide la recette de développement et demande la clôture de l’implémentation avant la nouvelle RC. Le 22 novembre, la préproduction est réinitialisée depuis la production, migrée puis rejouée pour la saison autorisée ; la RC 2.8.3-rc.3 est déployée et les contrôles E1 passent. Patrice valide ensuite la clôture de la story. La mise en production et toute écriture de replay en production restent une décision distincte.

Le replay staging a reconstitué 35 rôles entièrement et un partiellement ; deux rôles de Caprani restent sans capture collective, leurs deux personnes sélectionnées conservant chacune une chance individuelle enregistrée. Un second passage a préservé les 36 résultats enregistrés. Ces chiffres portent sur les rôles, pas sur les spectacles ni sur le nombre de personnes.

Pour le dernier reset, Patrice a demandé la procédure arrêt, reset depuis production et redémarrage sans nouvelle sauvegarde ; la restauration complète d’une sauvegarde staging n’a pas été vérifiée dans cette opération, malgré le critère historique AC2 ci-dessous.

## Acceptance Criteria

1. **Given** les données historiques de production, **when** leur faisabilité est examinée en lecture seule, **then** le rapport identifie par spectacle et rôle les sélections, validations, disponibilités, exclusions, formules et anciennes chances disponibles, ainsi que les lacunes et la chronologie démontrable. [Source: epic 19.26 AC1]
2. **Given** la préproduction actuelle, **when** elle est synchronisée depuis la production, **then** une sauvegarde identifiable et sa procédure de restauration ont été vérifiées au préalable ; la cible, les données remplacées, les versions de schéma et le redémarrage avec migrations sont contrôlés. L'utilisateur a autorisé le remplacement des données de préproduction, y compris les quiz de test. [Source: epic 19.26 AC2 ; décision utilisateur 21 novembre 2026]
3. **Given** les données de production copiées en préproduction, **when** le replay est exécuté, **then** il reconstitue les photographies manquantes selon l'ordre des décisions effectivement attestées et les données disponibles ; chaque résultat et chaque lacune sont rapportés avec leurs hypothèses. Une date de spectacle seule ne prouve pas l'ordre des décisions. [Source: epic 19.26 AC3]
4. **Given** des captures communes ou des chances individuelles enregistrées, **when** le replay produit des valeurs différentes, **then** il les préserve, rapporte les écarts et stocke séparément les photographies manquantes ; il ne présente pas une estimation comme une preuve observée. Les chances individuelles et les photographies communes restent distinctes. [Source: epic 19.26 AC3, AC6 ; story 19.25]
5. **Given** une exécution interrompue ou erronée, **when** l'opérateur reprend ou restaure, **then** la procédure est vérifiable et reproductible, n'écrase pas les valeurs existantes, préserve compositions et statuts, et n'envoie aucune notification. La préproduction peut être restaurée au point sauvegardé et l'opération recommencée ; aucune simulation préalable n'est imposée. [Source: epic 19.26 AC4 ; décision utilisateur]
6. **Given** la migration terminée en préproduction, **when** les contrôles automatiques et la recette humaine sont réalisés, **then** ils vérifient les rôles concernés, les cas incomplets, les écarts, les accès et l'affichage réel, notamment pour Match Cambo. Une écriture ou migration en production requiert une autorisation distincte. [Source: epic 19.26 AC4–5]

**Décision Patrice — périmètre et replay :** limiter l’opération à la saison La Malice 2026–2027, inclure les spectacles déjà sélectionnés même lorsque leur composition est en brouillon, et rejouer les décisions dans l’ordre attesté des activités plutôt que dans l’ordre des spectacles. Calculer les estimations à partir de l’état reconstitué à chaque décision, en explicitant les hypothèses raisonnables et les lacunes ; les chiffres exploratoires du rapport de comparaison ne sont pas validés comme données à écrire. Les captures et chances individuelles restent distinctes et préservées.

**Décision Patrice — essai en développement :** réinitialiser la branche Neon `development` depuis `production`, redéployer le code en développement via `v2`, laisser Flyway mettre le schéma à niveau puis exécuter le replay et contrôler le résultat. En cas d’échec, corriger puis réinitialiser de nouveau depuis la production. Désactiver les notifications réelles avant la copie ; préserver les données de production. Cet essai ne remplace pas la recette ultérieure en préproduction.

**Couverture produit :** epic 19.26 ; FR19, FR20, FR24 ; suite de 19.25. La décision de reconstituer les valeurs historiques complète le contrat antérieur qui les laissait indisponibles ; actualiser les documents normatifs concernés lors de la réalisation, sans présenter une estimation comme historique certaine.

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** si aucun changement sous `apps/web/` : utiliser l'affichage existant. Si l'identification honnête d'une valeur reconstituée nécessite une modification UI, définir d'abord le comportement et adapter les critères M3, l'accessibilité et la recette selon `docs/v2/technical/FRONTEND_UI.md`.

## Tasks / Subtasks

- [x] (AC1) Examiner l’historique, les snapshots, les formules et les dépendances chronologiques ; documenter les hypothèses et lacunes.
- [x] (AC3–5, périmètre développement) Réaliser le replay chronologique, préserver les captures et affectations existantes, vérifier sa reprise et son idempotence sur development.
- [x] (AC4) Distinguer les estimations reconstituées, les valeurs observées et les origines de sélection ; signaler les données non reconstituables.
- [x] Vérifier les changements de tirage et d’affichage en développement, puis recueillir la validation de Patrice.
- [x] Mettre à jour les contrats, les tests et les protections de ciblage pour préparer staging.

### Opérations de préproduction et suite de release

- [x] (AC2) Neutraliser les notifications et synchroniser staging depuis production selon la procédure explicitement autorisée par Patrice.
- [x] (AC3–5) Exécuter le replay sur staging et vérifier la reprise sans réécriture des résultats déjà enregistrés ; les limites de couverture sont indiquées ci-dessus.
- [x] (AC6) Exécuter les contrôles de préproduction et recueillir la validation de Patrice pour la clôture de la story.
- [ ] Décider séparément de la mise en production après intégration des autres fonctionnalités prévues dans la patch release.

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

Codex.

### Completion Notes List

- Les données de production ont été copiées en development après désactivation des notifications ; Flyway et le replay y ont été exécutés. Les tables des compositions, disponibilités et chances individuelles préexistantes ont été préservées lors de l’essai.
- Les estimations sont identifiées comme reconstituées ; les origines observées et inférées sont distinguées. La règle complète des volontaires au tirage et le replay ont été corrigés puis validés par les tests ciblés ; Patrice a validé le comportement en développement.
- La suite API locale a exécuté 1 414 tests sans échec (19 ignorés) ; les tests ciblés du replay et des protections de cible passent. La RC 2.8.3-rc.3 et son contrôle E1 sont verts en préproduction ; sa recette est validée pour clôturer la story.

### File List

- Replay et tests : `scripts/v2/role-chance-chronological*`, `scripts/v2/role-chance-selection-origin*`.
- API, migrations et interface V2 : composition, disponibilités, migrations V89–V90 et composants de disponibilité.
- Contrats et préparation de release : `SPEC.md`, `DOMAIN.md`, `ARCH.md`, `ISSUES.md`, procédure staging et protections de notifications.

### Change Log

- 2026-11-21 : intention et décisions de préproduction enregistrées ; story en backlog.
- 2026-11-21 : implémentation validée en développement et clôturée à la demande de Patrice ; migration et recette staging reportées aux opérations de release.
- 2026-11-22 : replay et contrôles staging effectués, recette validée par Patrice ; production reportée à une release ultérieure enrichie.
