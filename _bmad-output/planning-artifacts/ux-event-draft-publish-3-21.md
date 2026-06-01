# UX — Brouillon spectacle & publication (Story 3.21)

**Statut :** aligné implémentation V2 au **2026-06-01** (revue PO + correctifs session).  
**Story :** [`3-21-brouillon-evenement-et-publication-ouverture-dispos.md`](../implementation-artifacts/3-21-brouillon-evenement-et-publication-ouverture-dispos.md)  
**API :** [`services/api/openapi/events.yaml`](../../services/api/openapi/events.yaml)  
**Code UI :** [`event-detail-draft-banner`](../../apps/web/src/app/pages/event-detail/event-detail-draft-banner.ts), [`event-form-dialog`](../../apps/web/src/app/pages/season-home/event-form-dialog.ts), [`_hatcast-agenda-event-card.scss`](../../apps/web/src/styles/_hatcast-agenda-event-card.scss)

> **Ne pas confondre** avec le **brouillon composition** (onglet Équipe, `event_compositions.published_at`, story **6.3**). Ici : **brouillon spectacle** = `events.availability_opened_at IS NULL`.

---

## Modèle produit

| État | Champ | Agenda membre | Agenda orga | Dispos membres | Dispos orgas |
|------|--------|---------------|-------------|----------------|--------------|
| **Brouillon** | `availabilityOpenedAt` null | Absent des listes | Carte style `agenda-card--draft` (violet) + badge *Brouillon* | Écriture refusée | Grille OK |
| **Publié** | `availabilityOpenedAt` renseigné | Visible | Carte normale + badges cycle de vie | Écriture OK | Grille OK |

**Publication** = `POST …/actions/open-availability` (libellé UI : **« Publier le spectacle »**).  
**Remise en brouillon** = `POST …/actions/close-availability` (temporaire, orgas uniquement).

---

## Fiche spectacle (`/saison/:slug/evenement/:eventSlug`)

### Bandeau brouillon (au-dessus des onglets)

Composant : `app-event-detail-draft-banner` — **entre** le header et `mat-tab-group`.

| Rôle | Contenu |
|------|---------|
| **Organisateur** (peut gérer la composition) | Chip *Brouillon* + texte d’aide + CTA **`mat-flat-button` « Publier le spectacle »** → `ConfirmDialog` → API open → snack *Spectacle publié.* → ouverture optionnelle **`ShareAnnounceDialog`** (intent `event`, story 6.10 — annonce manuelle, pas notification auto 8.3). |
| **Membre** (lien direct / ancien favori) | Même bandeau **sans** CTA : *« Ce spectacle est en brouillon… tu ne peux pas modifier tes disponibilités. »* La fiche reste **accessible** (plus de 404 sur `GET` détail). |

### Onglet Dispos

- **Membre** sur brouillon : message statique (pas de chargement grille) — *« La collecte des disponibilités est momentanément fermée. »*
- **Organisateur** : comportement habituel (préparation / consultation).

### Modale « Modifier le spectacle »

(`EventFormDialog`, menu ⋮ → Modifier — droit `canManageEvents` ; publication via `canManagePublication` = `canManageComposition`)

| Interrupteur | Condition | Effet à l’enregistrement |
|--------------|-----------|---------------------------|
| **Publier le spectacle** | Événement encore brouillon + orga publication | `updateEvent` puis `openAvailability` ; fiche mise à jour **sans refresh manuel** (retour `EventResponse` au parent). |
| **Remettre en brouillon** | Événement déjà publié + orga publication | `ConfirmDialog` → `updateEvent` puis `closeAvailability` ; snack *Spectacle remis en brouillon.* ; bandeau réapparaît **sans refresh**. |

---

## Agendas

### Agenda de saison

- Filtre API : brouillons exclus pour les **membres** ; visibles pour **orgas** avec `teamStatusBadge.key === 'draft'` et classe `agenda-card--draft`.
- Détection client : `isEventDraft(event)` avec `availabilityOpenedAt` **présent** sur `EventResponse`.

### Mon agenda (`/agenda`)

- Même filtre serveur ; cartes brouillon **uniquement** pour orgas visibles.
- **Important :** `UserAgendaItem` **n’expose pas** `availabilityOpenedAt`. Le style brouillon sur carte utilise **`teamStatusBadge.key === 'draft'`** uniquement (ne pas traiter `undefined` comme brouillon — bug corrigé dans `event-draft.ts`).

Style partagé : [`_hatcast-agenda-event-card.scss`](../../apps/web/src/styles/_hatcast-agenda-event-card.scss) — `&--draft` (fond primary-container léger, barre gauche primary).

---

## API & visibilité (résumé pour revue)

| Endpoint / liste | Membre ordinaire | Organisateur |
|------------------|------------------|--------------|
| `GET …/events` (saison, upcoming) | Pas de lignes brouillon | Lignes brouillon OK |
| `GET /v1/me/agenda` | Pas de lignes brouillon | Lignes brouillon OK |
| `GET …/events/by-slug/{slug}` | **200** + bandeau (pas 404) | 200 |
| `GET …/availability/summary` | **403** brouillon | OK |
| `PUT …/availability/me` | **403** brouillon | OK si publié |
| `POST …/open-availability` | 403 | OK |
| `POST …/close-availability` | 403 | OK |

Audit : `EVENT_AVAILABILITY_OPENED`, `EVENT_AVAILABILITY_CLOSED`.

---

## Seeds & données dev

- **V45** : colonne + backfill au moment migration (souvent **avant** seeds dispos).
- **V48** : backfill après seeds (`event_availability` existants → `availability_opened_at = created_at`).
- **V47** : deux spectacles QA Malice restent brouillon (`c0000025`, `c0000026`).

---

## Checklist revue UX / code review

- [ ] Bandeau présent dans `event-detail.html` (pas seulement dans onglet Infos).
- [ ] CTA *Publier le spectacle* (pas *Ouvrir les disponibilités* seul dans le bandeau).
- [ ] Remise en brouillon : bandeau + snack sans F5.
- [ ] Mon agenda : cartes publiées **sans** violet global.
- [ ] Membre avec lien : bandeau sans CTA publish.
- [ ] Distinction visuelle / copy vs badge composition *En préparation*.

---

## Références

- [ux-design-hatcast-v2.md](./ux-design-hatcast-v2.md) — agendas, détail événement
- [sprint-change-proposal-2026-06-01-notifications-epic8-scope.md](./sprint-change-proposal-2026-06-01-notifications-epic8-scope.md) — lien 3.21 ↔ 8.3
