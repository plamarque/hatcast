# Growth backlog — idées hors PRD

**Rôle BMad :** capturer des idées produit/UX **non normatives** (pas dans `prd.md` / `SPEC.md`) pour **challenge** ultérieur : PRFAQ, Correct Course, epic/story, ou abandon.  
**Ne pas confondre avec :** `deferred-work.md` (actif P0–P2 post-DOC-1), `deferred-work-archive.md` (revues code historiques), `ux-backlog-*.md` (retours UX ciblés sur un flux), `PLAN.md` (ordre de livraison).

**Référence :** [prd-validation-report.md](prd-validation-report.md) — « Capture informational brief gaps in UX spec or growth backlog ».

---

## Idées en attente de challenge

| ID | Capturé | Idée | Contexte / hypothèse | Liens | Statut |
|----|---------|------|----------------------|-------|--------|
| G-001 | 2026-05-27 | **Préférence utilisateur de thème** : `dark` \| `light` \| `system` (suit `prefers-color-scheme`) | V2 impose aujourd’hui une ambiance sombre via tokens Material ; certains utilisateurs ou contextes (luminosité forte, accessibilité) pourraient vouloir un mode clair ou automatique. Persistance probable **compte** (`localStorage` minimum, sync serveur optionnelle). UI plausible : **Compte** (`/compte`) ou menu avatar, distinct des préférences **par troupe** (pseudo, rôles). | [product-brief § Account & preferences](product-brief-hatcast-v2.md), [ux-design-hatcast-v2 — token/theme](ux-design-hatcast-v2.md), écran Compte [ux-design-journey Screen 10](ux-design-journey-league-agenda.md) | **Idée** — à challenger (pas story) |
| G-002 | 2026-05-27 | **Texte explicatif des statuts** derrière une **icône d’aide inline** (`help_outline` ou équivalent) — contenu via **popin** (dialog/tooltip Material) ou **reveal mini panel** (panneau compact sous le badge) | Les badges/chips de statut (composition, équipe, dispo, participation, cycle de vie spectacle) sont denses et souvent confondus (ex. brouillon vs validée vs « équipe en préparation » vs « équipe confirmée »). Aujourd’hui peu ou pas de copy pédagogique au point d’usage ; les règles sont surtout dans la spec UX (section composition lifecycle). Pattern réutilisable sur agenda, détail événement (Infos / Équipe / Dispos), listes admin. | [ux-design-composition-status-help.md](ux-design-composition-status-help.md), [ux-design-hatcast-v2 — composition lifecycle & badges](ux-design-hatcast-v2.md#composition-lifecycle-status), [epics Epic 6](epics.md), stories 6-1 / 6-6 (cycle de vie) | **Spec pilote** — implémentation à planifier |
| G-003 | 2026-05-27 | **Temps de chargement long** à l’ouverture (ou au rechargement) de l’**onglet Disponibilités** du détail événement | Retour terrain : attente perceptible avant affichage de la grille Moi/Tous. À l’ouverture, `app-event-dispos-tab` charge en parallèle le **summary** dispos et les **sélecteurs** ; le toggle **cotes / chances** relance un summary complet (`includeChances`). **MAJ 2026-06-04 :** écriture API sur GET summary corrigée (**story 5-7**, DW-079 fermé) — idée reste valide pour perf front (payload, prefetch, skeleton). | [`event-dispos-tab.ts`](../../apps/web/src/app/shared/availability/event-dispos-tab.ts), story [5-7](implementation-artifacts/5-7-summary-dispos-lecture-sans-ecriture.md), [deferred-work-archive § 5-3](implementation-artifacts/deferred-work-archive.md), [ISSUES PERF-001](../../ISSUES.md) | **Idée** — à challenger (pas story) |
| G-004 | 2026-05-27 | **Événements brouillon** : créer / éditer un spectacle en **draft** (non visible dans l’agenda membre), puis **publier l’événement** une fois la saisie terminée (titre, date, rôles, etc.) | Distinct du brouillon **composition** (story 6.3). **Livré en grande partie** via story **3.21** (2026-06-01) + [ux-event-draft-publish-3-21.md](ux-event-draft-publish-3-21.md) — inclut remise en brouillon temporaire (`close-availability`). | [epics § 3.21](epics.md), story [3-21](../implementation-artifacts/3-21-brouillon-evenement-et-publication-ouverture-dispos.md) | **Partiellement couvert** — fermer idée ou garder pour extensions |
| G-005 | 2026-05-27 | **Intégrer [PostHog](https://posthog.com/)** pour analytics produit (évent. session replay, feature flags) | FR47 prévoit des événements workflow **anonymisés** (délai dispos, délai confirmations, follow-through liens notif) ; accès MVP **opérateurs produit** uniquement. Alternative : instrumentation maison (API/DB). PostHog pourrait accélérer dashboards et funnels, mais pose des questions hébergement EU/RGPD, coût, chevauchement avec observabilité ops, et alignement NFR-S2. **MAJ 2026-06-03 :** planifié en V2.0.0 comme **OPS-9** (P1, après **M4** / domaine **`hatcast.app`**) ; proxy Cloudflare `e.hatcast.app` nuage gris. | [Epic 11 — Story 11.1](epics.md), [PRD § Analytics baseline](prd.md), [PLAN § Wave V2.0.0](../../PLAN.md), [ops-9](../implementation-artifacts/ops-9-posthog-hatcast-app.md), SCP amend. 2026-06-03 | **Planifié V2.0.0** — **OPS-9** (P1) |
| G-007 | 2026-05-28 | **Hub troupe — onglets Saisons / Membres** (remplacer le gear « Membres ») + plan d’édition saisons | Retour PO : sur `/troupes/:slug`, les admins voient les saisons mais les membres sont cachés derrière `app-scope-admin-menu` (1 entrée « Membres » → route séparée). Aligné avec la vision design-thinking 2026-05-25 (« troupe home : members admin, programme list, create/edit programmes »). Hypothèse : deux onglets M3 améliorent la discoverability admin sans ajouter une ligne chrome dédiée ; fermer aussi le gap **édition/archive saison** laissé par 17.5. **Décision PO : onglet Membres admin-only (Option A).** | [`troupe-hub.html`](../../apps/web/src/app/pages/troupe-hub/troupe-hub.html), [`ux-design-scope-admin-menu-epic17.md`](ux-design-scope-admin-menu-epic17.md) Screen 3, [design-thinking 2026-05-25](../design-thinking-2026-05-25.md), story [17.4](../implementation-artifacts/17-4-hub-troupes-slug.md), [17.5 § gap edit saison](../implementation-artifacts/17-5-redirects-fin-seasons-hub-troupe.md) | **Validé PO** — story cible **17.26** |
| G-006 | 2026-05-28 | **Catalogue de rôles par troupe** : chaque troupe définit quels rôles elle utilise sur ses spectacles (libellés, emojis, ordre d’affichage ; évent. création de rôles custom au-delà des 9 clés V1) | Aujourd’hui `RoleKeys.ALL` est **global** (parité V1 : player, mc, dj, volunteer, etc.) ; seuls les **templates par type d’événement** (cabaret, match, …) varient les effectifs par défaut. Hypothèse : certaines troupes n’emploient jamais certains rôles (ex. arbitre) ou nomment/automatisent autrement (ex. « animateur·rice » vs MC) ; masquer ou personnaliser réduirait le bruit à la création d’événement, dans les dispos et les préférences membre. | [`RoleKeys` API](../../services/api/src/main/kotlin/com/hatcast/api/event/EventRoleSlots.kt), [`event-types.ts`](../../apps/web/src/app/core/events/event-types.ts), [DOMAIN § stats JEU/DECORUM/BÉNÉVOLE](../../DOMAIN.md), story [3-4](implementation-artifacts/3-4-types-devenement-et-roles-requis-optionnels.md), [docs V1 création spectacle](../../docs/v1/user/creation-spectacle-roles.md) | **Idée** — à challenger (pas story) |
| G-008 | 2026-06-01 | **Filtres type/dates sur l’onglet Activité (événement)** — toolbar Moi/Tous + sélecteur participant suffisent en 9.1 ; les orgas disposent déjà des filtres complets sur la page **Journal d’audit** (saison/troupe) | Décision PO post-revue 9.1 : hors scope MEP ; éviter duplication UX avec la page admin. Réévaluer si retour terrain (orgas spectacle-only sans accès saison). | [ux-design-audit-journal-9-1.md § Screen C](ux-design-audit-journal-9-1.md), story [9-1](implementation-artifacts/9-1-consultation-de-la-piste-d-audit-pour-utilisateurs-autorises.md) | **Idée** — à challenger (pas story) |
| G-009 | 2026-06-05 | **Prestige des spectacles (étoiles 1–5)** — saisie optionnelle orga, affichage fiche + agenda, stats saison, puis malus tirage (2ᵉ critère d’équité après nb de sélections) | PO 2026-06-05 : étoiles sur **tous** les spectacles (pas liées à `category`) ; **optionnel** — sans prestige, l’événement ne compte pas. Comptage à la **validation composition** (comme `pastSelectionCount`). **JEU** (`player`) → crédit **100 %** des étoiles ; **DECORUM** (MC, DJ, …) → **50 %** ; **BÉNÉVOLE** → **0**. Total prestige accumulé sur la saison = coefficient de **malus** au tirage (formule à calibrer à l’implémentation **19.13**). Epic dédié proposé **20** (capture/affichage/stats) ; intégration tirage via **19.13** après **19.6**. | [epics § 19.13](epics.md), [SCP Epic 19](sprint-change-proposal-2026-06-04-epic19-draw-weight-engine.md), [DOMAIN § JEU/DECORUM/BÉNÉVOLE](../../DOMAIN.md) | **Promu** → [Epic 20 SCP](sprint-change-proposal-2026-06-05-epic20-prestige-spectacles.md) |
| G-011 | 2026-06-05 | **Genre membre optionnel & parité équipes** — profil (Homme / Femme / Non précisé), libellés de rôles adaptés (Comédienne vs Comédien), avatars de repli distincts, calcul parité sur rôle `player`, hint orga à la composition, stats saison optionnelles, facteur tirage **19.11** plus tard | Retour PO : parité V1 absente en V2 (`UserEntity` sans genre ; `event-roles.ts` bloqué sur notation inclusive). V1 : `storage.js` `getRoleLabel`, `PlayerModal` édition genre, `playerAvatars.js`. Intérêt : libellés → avatars → info parité (interne puis exposée) → hint composition → pondération tirage optionnelle. Champ **optionnel** au niveau **compte** ; défaut **non précisé**. | [epics § 2.12–2.12c, 6.21, 16.3](epics.md), [SCP genre/parité](sprint-change-proposal-2026-06-05-member-gender-parity.md), [19.11](epics.md), `legacy/src/services/storage.js` | **Promu** → [SCP G-011](sprint-change-proposal-2026-06-05-member-gender-parity.md) |
| G-010 | 2026-06-05 | **Avertissement rejeu spectacle précédent** — hint inline non bloquant sur un créneau composition si la personne avait **le même rôle** au **spectacle validé chronologiquement précédent** dans le **même compartiment** (catégorie) ; titre + date du spectacle précédent ; brouillon ou validé ; tirage ou manuel | PO 2026-06-05 : prédécesseur = ordre date saison ; compartiment = `SpectacleCategory.slug` (ex. deux déplacements d’affilée → warning ; déplacement puis apéro → non) ; historique = compositions **validées** uniquement ; UI discrète jaune sur la ligne créneau, pas de modale ; tous les rôles. Distinct de **19.9** (malus/exclusion tirage). | [epics § 6.20](epics.md), [ux-design-composition-consecutive-show-warning.md](ux-design-composition-consecutive-show-warning.md), `event-equipe-tab`, `CompositionSelectionHistoryService` | **Promu** → [SCP 6.20](sprint-change-proposal-2026-06-05-composition-consecutive-show-warning.md) |
| G-012 | 2026-06-06 | **Notification « équipe confirmée »** — quand **tous** les assignés ont confirmé (lifecycle `confirmed` / équipe complète), notifier **orgas + sélectionnés** que l’équipe est au complet et que la représentation est ferme pour eux | Retour PO post-fix notifs composition : la validation + confirmations individuelles existent ; il manque l’**annonce collective** du passage à « équipe confirmée ». Distinct de `CONFIRMATION_REQUEST` (demande) et `TEAM_VALIDATED_FYI` (FYI roster non assigné à la validation). **Hors scope immédiat :** notifier quand l’équipe redevient **incomplète** (désistement, remplacement orga après confirmations) — scénario à spécifier séparément. | [CompositionLifecycleService](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionLifecycleService.kt), story [8-5](../implementation-artifacts/8-5-extensions-notifications-membre.md), spec [composition-notify-on-validate-only](../implementation-artifacts/spec-composition-notify-on-validate-only.md) | **Idée** — exploration / clarification / validation ultérieure |

### Notes G-012 (composition notifications — 2026-06-06)

- **Déclencheur :** lifecycle composition passe à **équipe confirmée** (tous les slots assignés requis sont `CONFIRMED`, pas de gap).
- **Destinataires :** organisateurs de l’événement **+** tous les assignés confirmés.
- **Distinct de :** `CONFIRMATION_REQUEST` (demande individuelle). ~~`TEAM_VALIDATED_FYI` auto au validate~~ retiré (recette 2026-06-06) — FYI roster réservé à G-012 / annonce orga.
- **Hors scope couplé (future idée) :** notifier orgas + assignés quand l’équipe redevient **incomplète** (désistement, changement orga post-confirmations) — règles anti-spam et copy à définir.
- **Prochaines étapes :** challenge PO → `bmad-spec` ou story Epic 8 si validé.

### Notes G-011 (décisions PO 2026-06-05)

- **Périmètre compte :** `users.gender` = `male` | `female` | `non_specified` ; défaut `non_specified`.
- **UI profil :** Mon compte → Mon profil (**17.36**) ; copy **Homme / Femme / Non précisé**.
- **Libellés :** tables V1 `ROLE_LABELS_BY_GENDER` ; si non précisé → notation inclusive actuelle (`Comédien·ne`).
- **Parité :** comptage sur rôle **`player`** uniquement ; `non_specified` exclu du ratio F/M.
- **Hint composition (6.21) :** informatif, non bloquant ; pattern proche **6.20**.
- **Tirage :** **19.11** après **2.12** + **19.6** — pas dans Waves A–C.
- **Découpage :** Wave A **2.12** → B **2.12b/c** → C **6.21** + **16.3** → D **19.11**.
- **Prochaines étapes :** ~~`bmad-spec`~~ **Fait** 2026-06-05 → [`spec-member-gender-parity`](../specs/spec-member-gender-parity/SPEC.md) ; ~~`bmad-ux`~~ **Fait** → [ux-design-member-gender-parity.md](ux-design-member-gender-parity.md) ; puis **`bmad-create-story` for 2.12**.

### Notes G-010 (décisions PO 2026-06-05)

- **Prédécesseur :** dernier spectacle **strictement antérieur** dans la saison (date `startsAt`, puis tie-break existant).
- **Compartiment :** même slug catégorie que l’événement courant — pas de warning cross-compartiment.
- **Source :** slots sur compositions **validées** ; visible dès le **brouillon** composition (orgas).
- **UI :** ligne compacte sous le créneau, ton warning M3 ; copy FR avec titre + date.
- **Prochaine étape :** **`bmad-create-story` for 6.20** quand priorisé.

### Notes G-009 (décisions PO 2026-06-05)

- **Périmètre événement :** champ optionnel `prestigeStars` (entier 1–5 ou null) sur tout spectacle, toutes catégories ; pas de prestige imposé par type/catégorie.
- **Sans étoiles :** l’événement n’apporte **aucun** point de prestige aux participants (même si composition validée).
- **Moment du comptage :** participation **validée** (composition validée) — aligné sur le modèle `pastSelectionCount` / slots `validated_at IS NOT NULL`.
- **Crédit par rôle validé** (sur un événement **avec** prestige `P` étoiles) :
  - **JEU** (`player`) → `+P` points prestige
  - **DECORUM** (MC, DJ, arbitre, assist., coach — cf. DOMAIN) → `+P × 0,5`
  - **BÉNÉVOLE** → `+0` (exclu)
- **Stats saison :** somme des crédits par participant sur la saison (affichage score ; pas une note artistique).
- **Tirage (Wave 3) :** le **total prestige accumulé** dans le passé (même saison, mêmes règles de compartiment que l’historique tirage si **19.8** actif) est un **2ᵉ critère de malus**, indépendant du nb de sélections (`pastSelectionCount`). Formule exacte (linéaire, paliers, plafond) → **recherche/calibration** au moment de **19.13** (pas bloquant Waves 1–2 Epic 20).
- **Découpage backlog proposé :**
  - **Epic 20 Wave 1** — 20.1 spec, 20.2 API, 20.3–20.5 UI formulaire / fiche / agenda
  - **Epic 20 Wave 2** — 20.6 API stats, 20.7 UI stats
  - **Epic 19.13** (amend) — `PrestigeHistoryFactor` ; **Depends :** 19.5, 19.6, 20.6
- **Séquencement :** Epic 19 **19.2→19.6** (pipeline tirage) en parallèle possible avec Epic 20 Waves 1–2 ; **19.13** strictement **après 19.6** et **20.6**.
- **Prochaine étape :** ~~`bmad-correct-course`~~ **Fait** 2026-06-05 → [SCP Epic 20](sprint-change-proposal-2026-06-05-epic20-prestige-spectacles.md).

### Notes G-001 (pour le challenge futur)

- **Périmètre possible :** Angular Material theming + design tokens existants ; pas de « skin » ad hoc par écran.
- **Questions ouvertes :** défaut produit (dark vs system) ; impact PWA / charte marque ; tests visuels ; epic dédiée (ex. compte / polish) vs story dans epic existante.
- **Prochaines étapes possibles (au choix PO) :** adversarial review, amendement UX spec, entrée PRD (FR) si validé, ou `bmad-correct-course` si priorisé en sprint.

### Notes G-002 (pour le challenge futur)

- **Spec pilote (2026-06-05) :** [ux-design-composition-status-help.md](ux-design-composition-status-help.md) — wireframes textuels des **six états** composition, panneau **reveal inline** sous le badge, trigger `help_outline`, pilote sur `event-detail__status` uniquement.
- **Périmètre possible (transverse) :** composant partagé `status-help` (icône + trigger) ; contenu i18n FR centralisé (mapping statut → paragraphe court + lien « en savoir plus » optionnel).
- **Tranché (pilote) :** panneau **reveal** inline — pas `MatTooltip` pour le hint complet ; badge non cliquable.
- **Accessibilité :** bouton icône avec `aria-label` + `aria-expanded` ; ne pas remplacer le libellé du badge (l’icône **complète**, ne porte pas seule le sens).
- **Questions ouvertes (transverse) :** généralisation agenda / dispos / participation ; copy validée métier/PO sur d’autres surfaces ; cohérence avec explainability tirage (6.4) déjà partielle.
- **Prochaines étapes :** validation PO de la spec pilote → story implémentation ; puis extraction pattern réutilisable dans `ux-design-hatcast-v2`.

### Notes G-004 (pour le challenge futur)

- **Périmètre possible :** statut `draft` / `published` sur `events` (ou équivalent), filtre agenda, permissions création/édition, transition explicite « Publier l’événement » (≠ valider la composition).
- **Questions ouvertes :** les membres voient-ils un événement draft s’ils ont le lien direct ? brouillon par saison vs par troupe ; impact dispos (demander avant publication ?) ; migration des événements existants (tous publiés par défaut).
- **Hors scope idée :** remplacer **Valider** compo ou le partage WhatsApp brouillon (déjà couverts par le flux Équipe actuel).

### Notes G-006 (pour le challenge futur)

- **Problème utilisateur à prouver :** quelle douleur mesurable aujourd’hui — liste trop longue à la création, confusion de libellés, stats inadaptées, ou besoin de rôles **hors** les 9 clés (musicien·ne, vidéaste, …) ?
- **Périmètre minimal plausible (MVP idée) :** **masquer** des rôles globaux existants par troupe + libellé/emoji custom **sans** nouvelles clés ; vs **catalogue extensible** (nouvelles clés par troupe → impact dispos, tirage, stats inter-troupes, exports CSV, `preferred_role_keys`, migrations).
- **Distinction produit :** customisation **troupe** (catalogue) vs **événement** (slots requis déjà par spectacle) vs **type d’événement** (templates actuels) — ne pas dupliquer trois réglages contradictoires.
- **Effets transverses :** catégories stats DOMAIN (JEU / DECORUM / BÉNÉVOLE) mappées sur clés fixes ; ligues multi-troupes ; historique V1 importé ; API/OpenAPI `RoleKeys.ALL` ; tirage et chances par rôle.
- **Alternatives plus petites :** presets par troupe sur le sous-ensemble des 9 clés ; défaut « type custom » vide ; meilleure copy/i18n des libellés globaux (pas de config).
- **Questions ouvertes :** qui configure (admin troupe seul) ; rôles masqués sur événements **déjà** créés ; compatibilité membre multi-troupes (préférences rôles par troupe déjà partiellement là) ; limites nombre de rôles custom ; RGPD / pas de PII dans les libellés custom.
- **Prochaines étapes possibles :** 3–5 interviews orgas (« quels rôles vous ne touchez jamais ? ») ; PRFAQ ou `bmad-create-prd` amendement si validé ; sinon abandon si le pain = templates type d’événement suffisants.

### Notes G-007 (proposition UX 2026-05-28 — John + Sally)

- **Pourquoi maintenant :** le gear à une seule entrée (« Membres ») est un anti-pattern discoverability ; la vision troupe-first (ADR 0013, design-thinking) décrit déjà un hub « cockpit » admin.
- **Wireframe cible :** hero inchangé (logo, nom, **Préférences dans cette troupe**) ; sous le hero, `mat-tab-group` **Saisons** | **Membres** (`TROUPE_ADMIN` seulement pour l’onglet Membres) ; footer « Explorer d’autres troupes » inchangé.
- **Onglet Saisons :** grille actuelle + **Nouvelle saison** ; menu ⋮ par carte admin : **Archiver** / **Désarchiver** (parité `/seasons` retirée en 17.5). **Édition saison** : **PO Option A 2026-05-31** → gear workspace **`/saison/:slug`** (**story 17.31**), pas ⋮ carte hub pour **Modifier**.
- **Onglet Membres :** embed `app-membres-tab` (existant) ; supprimer le gear troupe ; redirect `/troupes/:slug/admin/membres` → `/troupes/:slug?onglet=membres`.
- **Hors scope MVP 17.26 :** édition nom/logo troupe (future entrée gear « Paramètres troupe » ou 3ᵉ onglet) ; annuaire public ; roster membres **lecture seule** pour non-admins.
- **Questions ouvertes :** ~~les membres non-admin doivent-ils voir un annuaire troupe en lecture seule ?~~ **Décision PO 2026-05-28 : Option A** — onglet Membres **admin-only** (`TROUPE_ADMIN`) ; pas d’annuaire lecture seule en 17.26. deep link breadcrumb « Troupe › Membres » disparaît au profit du tab actif ?
- **Prochaines étapes :** valider proposition PO → `bmad-create-story` **17.26** → amendement `ux-design-journey-league-agenda.md` Screen 4 + retrait Screen 3 gear Membres dans `ux-design-scope-admin-menu-epic17.md`.

### Notes G-003 (pour le challenge futur)

- **Constat à valider :** mesurer (DevTools Network, logs API) temps `summary` seul vs `summary+selectors` vs `includeChances=true` ; repro sur troupe seed Malice / spectacle chargé.
- **Pistes techniques :** découpler sync roster du GET summary ; cache ou ETag ; chargement progressif (liste participants puis chances à la demande) ; prefetch au survol/focus onglet Dispos avant clic.
- **Pistes UX :** skeleton grille, indicateur de chargement distinct pour toggle chances (`loadingChances` existe déjà), éviter écran vide prolongé.
- **Gouvernance :** si confirmé en prod, ouvrir entrée **ISSUES.md** (ex. PERF-002) ; story dédiée Epic 5/6 perf ou extension 6.11 — pas de correctif sans profiling.
- **Hors scope idée :** optimisations génériques agenda ou autres onglets (sauf si même endpoint).

---

## Résolu / promu (historique)

| ID | Date | Destination | Lien |
|----|------|-------------|------|
| **G-009** | 2026-06-05 | **Epic 20** (20.1–20.7) + amend **19.13** | [SCP Epic 20](sprint-change-proposal-2026-06-05-epic20-prestige-spectacles.md) |
