# Growth backlog — idées hors PRD

**Rôle BMad :** capturer des idées produit/UX **non normatives** (pas dans `prd.md` / `SPEC.md`) pour **challenge** ultérieur : PRFAQ, Correct Course, epic/story, ou abandon.  
**Ne pas confondre avec :** `deferred-work.md` (revue de code / réserve PO post-story), `ux-backlog-*.md` (retours UX ciblés sur un flux), `PLAN.md` (ordre de livraison).

**Référence :** [prd-validation-report.md](prd-validation-report.md) — « Capture informational brief gaps in UX spec or growth backlog ».

---

## Idées en attente de challenge

| ID | Capturé | Idée | Contexte / hypothèse | Liens | Statut |
|----|---------|------|----------------------|-------|--------|
| G-001 | 2026-05-27 | **Préférence utilisateur de thème** : `dark` \| `light` \| `system` (suit `prefers-color-scheme`) | V2 impose aujourd’hui une ambiance sombre via tokens Material ; certains utilisateurs ou contextes (luminosité forte, accessibilité) pourraient vouloir un mode clair ou automatique. Persistance probable **compte** (`localStorage` minimum, sync serveur optionnelle). UI plausible : **Compte** (`/compte`) ou menu avatar, distinct des préférences **par troupe** (pseudo, rôles). | [product-brief § Account & preferences](product-brief-hatcast-v2.md), [ux-design-hatcast-v2 — token/theme](ux-design-hatcast-v2.md), écran Compte [ux-design-journey Screen 10](ux-design-journey-league-agenda.md) | **Idée** — à challenger (pas story) |
| G-002 | 2026-05-27 | **Texte explicatif des statuts** derrière une **icône d’aide inline** (`help_outline` ou équivalent) — contenu via **popin** (dialog/tooltip Material) ou **reveal mini panel** (panneau compact sous le badge) | Les badges/chips de statut (composition, équipe, dispo, participation, cycle de vie spectacle) sont denses et souvent confondus (ex. brouillon vs validée vs « équipe en préparation » vs « équipe confirmée »). Aujourd’hui peu ou pas de copy pédagogique au point d’usage ; les règles sont surtout dans la spec UX (section composition lifecycle). Pattern réutilisable sur agenda, détail événement (Infos / Équipe / Dispos), listes admin. | [ux-design-hatcast-v2 — composition lifecycle & badges](ux-design-hatcast-v2.md#composition-lifecycle-status), [epics Epic 6](epics.md), stories 6-1 / 6-6 (cycle de vie) | **Idée** — à challenger (pas story) |
| G-003 | 2026-05-27 | **Temps de chargement long** à l’ouverture (ou au rechargement) de l’**onglet Disponibilités** du détail événement | Retour terrain : attente perceptible avant affichage de la grille Moi/Tous. À l’ouverture, `app-event-dispos-tab` charge en parallèle le **summary** dispos et les **sélecteurs** ; le toggle **cotes / chances** relance un summary complet (`includeChances`). Côté API, `GET …/availability/summary` peut déclencher `ensureMembershipParticipants` (écriture en lecture) — point déjà noté en revue 5.3. Piste proche de **6.11** (perf onglet Équipe) : profiling, réduction payload, prefetch, skeleton/états intermédiaires. | [`event-dispos-tab.ts`](../../apps/web/src/app/shared/availability/event-dispos-tab.ts), story [5-3](implementation-artifacts/5-3-vue-organisateur-disponibilites-par-role-et-vues-moi-tous.md), [deferred-work § 5-3](implementation-artifacts/deferred-work.md), [ISSUES PERF-001](../../ISSUES.md) (précédent sur Équipe) | **Idée** — à challenger (pas story) |
| G-004 | 2026-05-27 | **Événements brouillon** : créer / éditer un spectacle en **draft** (non visible dans l’agenda membre), puis **publier l’événement** une fois la saisie terminée (titre, date, rôles, etc.) | Distinct du brouillon **composition** (story 6.3 « Publier » compo — retiré du parcours produit 2026-05-27 : partage lien/WhatsApp + **Valider** pour visibilité troupe). Hypothèse : orgas préparent plusieurs spectacles hors ligne avant annonce saison ; réduit le bruit agenda et les notifications prématurées. | [epics Epic 4 / événements](epics.md), agenda saison, notifications (Epic 8) | **Idée** — à challenger (pas story) |
| G-005 | 2026-05-27 | **Intégrer [PostHog](https://posthog.com/)** pour analytics produit (évent. session replay, feature flags) | FR47 prévoit des événements workflow **anonymisés** (délai dispos, délai confirmations, follow-through liens notif) ; accès MVP **opérateurs produit** uniquement. Alternative : instrumentation maison (API/DB). PostHog pourrait accélérer dashboards et funnels, mais pose des questions hébergement EU/RGPD, coût, chevauchement avec observabilité ops, et alignement NFR-S2. | [Epic 11 — Story 11.1](epics.md), [PRD § Analytics baseline](prd.md), [PLAN § Epic 11 post-MVP](../../PLAN.md) | **Idée** — à challenger (pas story) |
| G-007 | 2026-05-28 | **Hub troupe — onglets Saisons / Membres** (remplacer le gear « Membres ») + plan d’édition saisons | Retour PO : sur `/troupes/:slug`, les admins voient les saisons mais les membres sont cachés derrière `app-scope-admin-menu` (1 entrée « Membres » → route séparée). Aligné avec la vision design-thinking 2026-05-25 (« troupe home : members admin, programme list, create/edit programmes »). Hypothèse : deux onglets M3 améliorent la discoverability admin sans ajouter une ligne chrome dédiée ; fermer aussi le gap **édition/archive saison** laissé par 17.5. **Décision PO : onglet Membres admin-only (Option A).** | [`troupe-hub.html`](../../apps/web/src/app/pages/troupe-hub/troupe-hub.html), [`ux-design-scope-admin-menu-epic17.md`](ux-design-scope-admin-menu-epic17.md) Screen 3, [design-thinking 2026-05-25](../design-thinking-2026-05-25.md), story [17.4](../implementation-artifacts/17-4-hub-troupes-slug.md), [17.5 § gap edit saison](../implementation-artifacts/17-5-redirects-fin-seasons-hub-troupe.md) | **Validé PO** — story cible **17.26** |
| G-006 | 2026-05-28 | **Catalogue de rôles par troupe** : chaque troupe définit quels rôles elle utilise sur ses spectacles (libellés, emojis, ordre d’affichage ; évent. création de rôles custom au-delà des 9 clés V1) | Aujourd’hui `RoleKeys.ALL` est **global** (parité V1 : player, mc, dj, volunteer, etc.) ; seuls les **templates par type d’événement** (cabaret, match, …) varient les effectifs par défaut. Hypothèse : certaines troupes n’emploient jamais certains rôles (ex. arbitre) ou nomment/automatisent autrement (ex. « animateur·rice » vs MC) ; masquer ou personnaliser réduirait le bruit à la création d’événement, dans les dispos et les préférences membre. | [`RoleKeys` API](../../services/api/src/main/kotlin/com/hatcast/api/event/EventRoleSlots.kt), [`event-types.ts`](../../apps/web/src/app/core/events/event-types.ts), [DOMAIN § stats JEU/DECORUM/BÉNÉVOLE](../../DOMAIN.md), story [3-4](implementation-artifacts/3-4-types-devenement-et-roles-requis-optionnels.md), [docs V1 création spectacle](../../docs/v1/user/creation-spectacle-roles.md) | **Idée** — à challenger (pas story) |
| G-008 | 2026-06-01 | **Filtres type/dates sur l’onglet Activité (événement)** — toolbar Moi/Tous + sélecteur participant suffisent en 9.1 ; les orgas disposent déjà des filtres complets sur la page **Journal d’audit** (saison/troupe) | Décision PO post-revue 9.1 : hors scope MEP ; éviter duplication UX avec la page admin. Réévaluer si retour terrain (orgas spectacle-only sans accès saison). | [ux-design-audit-journal-9-1.md § Screen C](ux-design-audit-journal-9-1.md), story [9-1](implementation-artifacts/9-1-consultation-de-la-piste-d-audit-pour-utilisateurs-autorises.md) | **Idée** — à challenger (pas story) |

### Notes G-001 (pour le challenge futur)

- **Périmètre possible :** Angular Material theming + design tokens existants ; pas de « skin » ad hoc par écran.
- **Questions ouvertes :** défaut produit (dark vs system) ; impact PWA / charte marque ; tests visuels ; epic dédiée (ex. compte / polish) vs story dans epic existante.
- **Prochaines étapes possibles (au choix PO) :** adversarial review, amendement UX spec, entrée PRD (FR) si validé, ou `bmad-correct-course` si priorisé en sprint.

### Notes G-002 (pour le challenge futur)

- **Périmètre possible :** composant partagé `status-help` (icône + trigger) ; contenu i18n FR centralisé (mapping statut → paragraphe court + lien « en savoir plus » optionnel).
- **Choix UX à trancher :** `MatTooltip` (limite longueur) vs `MatDialog` / bottom sheet mobile vs panneau **reveal** inline (moins intrusif, reste dans le flux).
- **Accessibilité :** bouton icône avec `aria-label` ; focus trap si dialog ; ne pas remplacer le libellé du badge (l’icône **complète**, ne porte pas seule le sens).
- **Questions ouvertes :** quels statuts en MVP (tous les badges ou priorité composition + participation) ; copy validée métier/PO ; cohérence avec explainability tirage (6.4) déjà partielle.
- **Prochaines étapes possibles :** atelier copy + wireframe sur un écran pilote (ex. onglet Équipe) ; pattern dans `ux-design-hatcast-v2` avant implémentation transverse.

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

_(vide — les entrées promues en story ou rejetées seront déplacées ici avec date et lien.)_
