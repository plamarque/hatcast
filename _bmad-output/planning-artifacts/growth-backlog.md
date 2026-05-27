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

### Notes G-003 (pour le challenge futur)

- **Constat à valider :** mesurer (DevTools Network, logs API) temps `summary` seul vs `summary+selectors` vs `includeChances=true` ; repro sur troupe seed Malice / spectacle chargé.
- **Pistes techniques :** découpler sync roster du GET summary ; cache ou ETag ; chargement progressif (liste participants puis chances à la demande) ; prefetch au survol/focus onglet Dispos avant clic.
- **Pistes UX :** skeleton grille, indicateur de chargement distinct pour toggle chances (`loadingChances` existe déjà), éviter écran vide prolongé.
- **Gouvernance :** si confirmé en prod, ouvrir entrée **ISSUES.md** (ex. PERF-002) ; story dédiée Epic 5/6 perf ou extension 6.11 — pas de correctif sans profiling.
- **Hors scope idée :** optimisations génériques agenda ou autres onglets (sauf si même endpoint).

---

## Résolu / promu (historique)

_(vide — les entrées promues en story ou rejetées seront déplacées ici avec date et lien.)_
