# Hub membre « À faire » — spec UX (V2)

**Statut :** proposition UX (2026-05-27)  
**Auteur :** Sally (UX) + alignement parcours [`ux-design-journey-league-agenda.md`](ux-design-journey-league-agenda.md)  
**Complète :** [`FRONTEND_UI.md`](../../docs/v2/technical/FRONTEND_UI.md) (Material 3, mobile-first)

---

## Problème

Les destinations quotidiennes d’un membre sont dispersées :

| Besoin | Route actuelle | Accès typique |
|--------|----------------|---------------|
| Spectacles à venir (toutes troupes) | `/agenda` | Post-login, menu compte |
| Workspace saison | `/saison/:slug` | `lastVisitedSeason`, fil d’Ariane |
| Vue perso saison | `/membre/:userSlug` | Menu compte (« clin d’œil ») |
| Troupes | `/troupes` | Lien secondaire sur agenda |

Les actions **urgentes** (dispo non renseignée, composition à confirmer) ne sont pas regroupées ; l’utilisateur doit parcourir l’agenda ou ouvrir chaque événement.

---

## Décision produit

Introduire un **hub « À faire »** (`/accueil`) comme **destination de navigation** (onglet nav, raccourcis), **pas** comme page d’accueil imposée après connexion.

**Post-login : conserver le pattern « remember last visit »** (déjà partiellement en place via `lastVisitedSeason` + deep links). L’utilisateur retrouve **là où il travaillait**, pas un écran générique.

| Principe | Implication |
|----------|-------------|
| **Remember last visit** | Après connexion : deep link en attente → sinon **dernière route membre** mémorisée → sinon fallback (`/agenda` ou saison si seule participation — à affiner à l’implémentation). |
| **À faire = opt-in** | Découvert via nav bar (badge si actions) ou lien depuis agenda ; jamais forcé au login. |
| **Agenda ≠ remplacé** | `/agenda` reste le calendrier ; `/accueil` regroupe actions + focus + raccourcis. |

> **Note parcours :** le journey doc cite `/agenda` comme hub chronologique — inchangé. `/accueil` complète sans devenir la racine post-login. Le redirect actuel `/accueil` → `/agenda` peut rester jusqu’à ce que l’écran À faire existe ; ensuite `/accueil` devient une vraie route (sans être le défaut login).

### Post-login (cible, alignée code actuel + extension)

Ordre de priorité (identique à [`PostLoginNavigationService`](../../apps/web/src/app/core/navigation/post-login-navigation.service.ts) aujourd’hui, à généraliser) :

| Priorité | Condition | Destination |
|----------|-----------|-------------|
| 1 | Deep link / URL en attente (`rememberPendingPostLoginRedirect`) | Cette URL |
| 2 | **Dernière visite membre** mémorisée (voir ci-dessous) | Route revalidée (saison, agenda, accueil, …) |
| 3 | Fallback | `/agenda` (ou saison unique si règle produit mono-ligue) |

**Extension recommandée (phase 2+) :** au-delà de `lastVisitedSeason` seul, mémoriser une **`lastMemberEntryPath`** (ex. `/agenda`, `/accueil`, `/membre/:slug`, `/saison/festibask`) mise à jour à chaque sortie d’un écran « shell » membre. Conserver `lastVisitedSeason` pour les chips **Ma saison** (workspace), pas pour la nav globale.

**Pourquoi ne pas forcer `/accueil` au login :** pour un membre qui vit dans une saison (orga ou mono-ligue), revenir sur la saison est le bon défaut ; pour un autre, l’agenda. Le hub À faire sert quand il y a **du travail en attente** (badge nav), pas comme tableau de bord obligatoire.

---

## Architecture d’information (cible)

```mermaid
flowchart TB
  subgraph nav [Navigation bar mobile]
    A[Accueil /accueil]
    B[Agenda /agenda]
    C[Stats /membre/:userSlug]
  end
  A --> AgendaList[Section actions]
  A --> Shortcuts[Raccourcis]
  B --> MonthList[Liste par mois]
  C --> Glance[Clin d'œil stats perso]
  B --> Event[/saison/.../event/...]
  AgendaList --> Event
  Shortcuts --> SeasonWS[Workspace /saison/:slug]
```

| Destination | Rôle | Icône Material (suggestion) |
|-------------|------|------------------------------|
| **Accueil** | Actions en attente + prochain focus + raccourcis (hub `/accueil`) | `home` |
| **Agenda** | Liste complète des spectacles à venir | `calendar_month` |
| **Stats** | Clin d'œil perso (`/membre/{userSlug}` session) ; badge inbox sur **Accueil** uniquement | `insights` |

**Workspace saison** (`/saison/:slug`) : **hors** barre globale — accès via chip **Ma saison · {titre}** (Accueil, Agenda, headers saison) et menu compte. Distinction : Agenda = chronologie multi-troupes ; Stats = participation perso ; workspace = ligue.

**Desktop (≥ 840 px) :** navigation **rail** à gauche (mêmes 3 entrées). Pas de barre basse permanente sur grand écran.

**Ce qu’on n’utilise pas :** bottom app bar M2, docked toolbar globale pour changer d’espace app.

---

## Écran `/accueil` — structure

### Chrome (top app bar M3)

```
┌────────────────────────────────────────────────────────────┐
│  Accueil                                    [Avatar ▾]     │
└────────────────────────────────────────────────────────────┘
```

- Titre : **Accueil** (hub membre ; contenu orienté actions en attente).
- Menu compte : Compte, Clin d’œil, Installer PWA, Déconnexion (inchangé).
- **Pas** de filtre troupe/saison sur cet écran (réservé à l’agenda).

### Zone 1 — Actions requises (priorité haute)

Liste **compacte** (max 5 visibles + « Voir tout dans l’agenda » si plus). Une ligne = une action claire + CTA implicite au tap.

| Type d’action | Condition (MVP) | Libellé ligne | Tap → |
|---------------|-------------------|---------------|-------|
| **Dispo à renseigner** | `myAvailabilityStatus === 'unknown'` sur événement à venir dans les **30 prochains jours** | « Indiquer ta dispo — *{titre}* » + sous-ligne date · troupe | Event detail, onglet **Dispos** (ou modal dispo si plus rapide) |
| **Dispo à renseigner** (urgent) | même + événement dans **7 jours** | Badge visuel « Bientôt » (ton `--mat-sys-error` ou warning) | idem |
| **Composition à confirmer** | *Phase API* : slot assigné, `participationStatus === pending`, compo validée | « Confirmer ta participation — *{titre}* » + rôle | Event detail, onglet **Équipe**, query `?showConfirm=true` |
| **Composition à confirmer** (proxy) | *Hors scope membre* | — | — |

**Tri :** date `startsAt` croissante ; à égalité, confirmations avant dispos.

**Empty (section masquée si 0 item) :** ne pas afficher le bloc « Actions requises » — passer directement à la zone 2.

### Zone 2 — Prochain spectacle (focus)

Carte **unique** (le plus proche dans le temps, toutes troupes).

```
┌────────────────────────────────────────────────────────────┐
│  Prochain spectacle                                        │
│  ┌──────────────────────────────────────────────────────┐│
│  │ 30 mai · 20h30                                       ││
│  │ Match La BIM vs La Malice                            ││
│  │ La BIM · Saison 2025-26          [Dispo ?] [Ouvrir] ││
│  └──────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────┘
```

- Réutiliser le visuel **agenda-card** existant (cohérence).
- Si aucun événement à venir : empty dédié (voir ci-dessous).

### Zone 3 — Accès rapides (secondaire)

Rangée de **chips** ou **list items** (pas des onglets de nav).

| Libellé | Destination | Règle |
|---------|-------------|-------|
| **Mon agenda complet** | `/agenda` | Toujours |
| **Ma saison · {titre}** | `/saison/{lastVisitedSeason}` | Si slug mémorisé ; sinon chip « Choisir une saison » → `/troupes` |
| **Saison en un clin d’œil** | `/membre/{userSlug}` + query troupe/ligue si connus | Si session résolue |
| **Mes troupes** | `/troupes` | Toujours |

> Distinction volontaire : **workspace saison** (organiser / voir la ligue) ≠ **clin d’œil** (stats perso). La nav globale expose **Stats** (clin d’œil) ; le workspace reste via accès rapides / chips **Ma saison**.

### Empty states (écran entier)

| Cas | Titre | Corps | CTA primaire | CTA secondaire |
|-----|-------|-------|--------------|----------------|
| Pas de participation | Rien en attente pour l’instant | Tu n’es inscrit·e à aucune ligue. | Découvrir les troupes → `/troupes#decouvrir` | — |
| Participation mais 0 action et 0 événement | Tout est à jour | Aucun spectacle à venir. On te préviendra quand ce sera le cas. | Mes troupes | Mon agenda (vide) |
| 0 action, ≥1 événement | Tout est à jour | Prochain spectacle ci-dessous. | — | Mon agenda complet |
| Erreur chargement | Impossible de charger | Réessayer | — | — |

**Ton :** tutoiement, aligné agenda actuel.

---

## Phases d’implémentation

### Phase 1 — Discoverability (1 story, pas de nouvelle route)

**Objectif :** réduire la friction sans nav bar.

| Écran | Ajout app bar |
|-------|----------------|
| `/saison/*`, event detail | Bouton texte **Mon agenda** → `/agenda` |
| `/agenda` | Chip **Ma saison · {titre}** → `lastVisitedSeason` ; menu garde clin d’œil |
| `/membre/*` (self) | Liens agenda + saison |

**Critères d’acceptation :** 1 tap depuis saison → agenda ; 1 tap depuis agenda → dernière saison (ou picker si absente).

### Phase 2 — Hub `/accueil` (MVP données existantes)

**Objectif :** écran À faire sans endpoint dédié.

- Nouveau composant `HomeTodo` (remplace la carte « Bienvenue » actuelle sur `/accueil`).
- **GET `/me/agenda`** (déjà) : dériver actions dispo `unknown` + carte prochain spectacle.
- **Post-login : inchangé** — pas de bascule vers `/accueil` par défaut ; optionnellement étendre `remember last visit` (voir décision produit).
- À la **première visite** d’un compte sans historique : fallback `/agenda` (comportement actuel si pas de saison mémorisée).

### Phase 3 — API `/me/inbox` (confirmations + enrichissement)

**Objectif :** alimenter les confirmations sans N appels événement.

Payload suggéré :

```yaml
InboxSummary:
  actions:
    - type: availability_unknown | composition_confirm_pending
      eventId, eventSlug, leagueSlug, title, startsAt
      troupeName, leagueTitle
      roleLabel?   # si composition
      deepLink: string  # ex. /saison/x/event/y?showConfirm=true
  nextEvent: UserAgendaItem | null
  shortcuts:
    lastSeasonSlug: string | null
    seasonGlanceQuery: { troupeId?, leagueId? }
```

**Règles métier (FR25, FR28) :** n’inclure `composition_confirm_pending` que si compo **validée**, slot **assigné** au viewer, statut **pending**.

### Phase 4 — Navigation bar M3

- Shell `MemberChrome` : `mat-toolbar` + nav bar basse (mobile) / rail (desktop).
- Badge sur **Accueil** = `actions.length` (max affiché « 9+ »).
- Masquer la nav bar sur `/connexion` et flux mot de passe uniquement ; **visible** partout dans l’app membre signée, y compris `*/admin/*`, workspace saison, détail événement, troupes, compte (shell membre global).

---

## Comportements détaillés

### Badges et compteurs

- Nav **Accueil** : badge rouge/error si ≥1 action ; pas de badge si 0.
- Nav **Agenda** : pas de badge (liste passive).
- Nav **Stats** : pas de badge.
- **Mon compte** : menu **avatar** (top app bar), pas de 4ᵉ onglet nav (pattern M3).
- Nav **Saison** : pas de badge ; libellé tronqué « Saison » + tooltip nom complet au long press / hover.

### Accessibilité

- Chaque ligne d’action : `aria-label` complet (« Indiquer ta disponibilité pour Match X, 30 mai »).
- Focus order : actions → prochain spectacle → raccourcis → nav bar.
- Contraste badges via tokens `--mat-sys-*`.

### Organisateur vs membre

- Le hub est **membre-first**. Les tâches org (valider compo, compléter slots) restent dans le **workspace saison / event**, pas dans À faire.
- Exception future : section « En tant qu’organisateur » si `canManageComposition` sur événements imminents — **post-MVP**, pour ne pas mélanger les modèles mentaux.

---

## Wireframe mobile (vue d’ensemble)

```
┌─────────────────────────┐
│ À faire            [👤] │
├─────────────────────────┤
│ ACTIONS REQUISES        │
│ ○ Confirmer — Match…    │
│ ○ Dispo — Atelier…      │
├─────────────────────────┤
│ PROCHAIN SPECTACLE      │
│ [ carte agenda ]        │
├─────────────────────────┤
│ ACCÈS RAPIDES           │
│ [ Agenda ] [ Saison ]   │
│ [ Clin d'œil ] [ Troupes]│
├─────────────────────────┤
│ Accueil │ Agenda │ Stats │  ← Phase 4 (compte : avatar)
└─────────────────────────┘
```

---

## Stories planifiées (Epic 17)

| ID | Titre | Phase | Priorité |
|----|-------|-------|----------|
| **17.18** | Raccourcis croisés agenda ↔ saison (app bar) | 1 | P1 — **premier slice** |
| **17.19** | Hub `/accueil` À faire (MVP `GET /me/agenda`) | 2 | P1 |
| **17.20** | `lastMemberEntryPath` (remember last visit élargi) | 2 | P2 — optionnel |
| **17.21** | API `GET /me/inbox` + confirmations pending | 3 | P1 (après ou MVP+17.19) |
| **17.22** | Shell navigation bar M3 (3 onglets) | 4 | P2 |
| **17.23** | Sélecteur contexte troupe · saison (fil + menu) | — | P2 |

Détail AC : [`epics.md`](./epics.md) § Stories 17.18–17.23 ; ordre PLAN : [`PLAN.md`](../../PLAN.md) § Epic 17.

**Fichiers story :** **17.18** → [`17-18-raccourcis-croises-agenda-saison.md`](../implementation-artifacts/17-18-raccourcis-croises-agenda-saison.md) (`done`) ; **17.19** → [`17-19-hub-accueil-a-faire-mvp.md`](../implementation-artifacts/17-19-hub-accueil-a-faire-mvp.md) (`done`) ; **17.20** → [`17-20-remember-last-member-entry-path.md`](../implementation-artifacts/17-20-remember-last-member-entry-path.md) (`done`) ; **17.21** → [`17-21-api-me-inbox-hub-membre.md`](../implementation-artifacts/17-21-api-me-inbox-hub-membre.md) (`done`) ; **17.22** → [`17-22-navigation-bar-m3-membre.md`](../implementation-artifacts/17-22-navigation-bar-m3-membre.md) (`done`) ; **17.23** → [`17-23-selecteur-contexte-troupe-saison.md`](../implementation-artifacts/17-23-selecteur-contexte-troupe-saison.md) (`ready-for-dev`).

---

## Hors scope (explicit)

- Notifications push comme substitut du hub.
- Bottom app bar / docked toolbar globale.
- Fusion clin d’œil et workspace saison en une seule entrée.
- Tâches admin (tirage, validation) dans le hub membre MVP.

---

## Décisions actées / en suspens

| Sujet | Décision |
|-------|----------|
| **Post-login** | **Remember last visit** — pas `/accueil` par défaut (2026-05-27). |
| **Route hub** | **Route dédiée `/accueil`** — écran À faire autonome, pas une section en tête de `/agenda` (2026-05-27). |
| **Priorité dev** | Stories **17.18 → 17.19 → 17.21 → 17.22** ; **17.20** optionnel (planifié dans `epics.md` / `PLAN.md`). |

**Conséquences techniques (route dédiée) :**

- Remplacer le placeholder [`HomeSignedIn`](../../apps/web/src/app/pages/home-signed-in/) par le hub À faire sur `{ path: 'accueil', … }` (déjà routé ; aujourd’hui redirect ou carte bienvenue selon config).
- Retirer ou ne pas dupliquer le bloc « actions » sur `/agenda` — l’agenda reste **liste chronologique + filtres** uniquement.
- Redirect racine `/` : inchangé (`AuthRedirect` → post-login) ; **`/accueil` n’est plus un simple alias vers `/agenda`** une fois le hub livré (cf. journey : mettre à jour la note « `/accueil` → `/agenda` »).
- Nav bar phase 4 : **Accueil** → `/accueil` ; **Agenda** → `/agenda` ; **Stats** → `/membre/{userSlug}` (clin d’œil) ; workspace saison via chips.

**Priorité dev par défaut (reste) :** inbox API avant nav bar ; `lastMemberEntryPath` optionnel avec la nav bar.
