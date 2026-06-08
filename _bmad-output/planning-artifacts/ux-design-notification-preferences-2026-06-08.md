---
title: UX — Préférences de notification (membre + orga)
author: Design Thinking (bmad-cis-design-thinking) + Patrice
date: '2026-06-08'
status: superseded-phase1-wireframe
as_shipped: ux-notification-prefs-phase1-as-shipped-2026-06-08.md
orga_brief: ux-notification-prefs-orga-section-brief.md
relatedStories:
  - '8.2'
  - '8.4'
  - '8.7'
  - '8.8'
  - G-012
inputDocuments:
  - docs/v2/technical/NOTIFICATIONS_CATALOG.md
  - _bmad-output/brainstorming/brainstorming-session-2026-06-07-notifications-post-catalog.md
  - _bmad-output/brainstorming/brainstorming-session-2026-06-01-notifications-epic8.md
  - _bmad-output/planning-artifacts/ux-design-mon-compte.md
decisions_respected:
  - D1 opt-out retrait/archivage
  - D2 proxy = pref confirmation
  - D3 TEAM_COMPLETE_MEMBER + pref TEAM_CONFIRMED
  - D4 N1 date/lieu/format seulement
  - D5 pas TEAM_REGRESSED_INCOMPLETE
  - D6 masquer toggles sans dispatch
party_mode_amendements:
  - '2026-06-08 — Priorité livraison : prefs membre avant prefs orga (8.4 après membre + 8.8)'
  - '2026-06-08 — Bloc orga : silence UI total jusqu’au ship 8.4 (pas de teaser)'
  - '2026-06-08 — Matrice défauts ajoutée (Sally / John FR31)'
  - '2026-06-08 — Rétro as-shipped phase 1 membre : voir ux-notification-prefs-phase1-as-shipped-2026-06-08.md (copy Me prévenir, Cet appareil, cartes, hints supprimés)'
  - '2026-06-08 — Refresh visuel prefs membre : titres hors carte, cartes groupe iOS-style, layout horizontal mobile — voir as-shipped § Refresh visuel 2026-06-08'
  - '2026-06-08 — Brief prefs orga (section, pas onglet) : ux-notification-prefs-orga-section-brief.md — pré-story 8.4'
---

# UX Design — Préférences de notification

**Objectif :** un membre ou un orga répond en **< 30 s** à « Si je coupe X, qu’est-ce que je ne recevrai plus ? » — sans lire le catalogue technique.

**Périmètre :** IA `/compte/notifications` (membre), proposition surface prefs orga (wireframe texte), mapping catégorie → intents en langage utilisateur, règles normatives anti-pref fantôme (A1).

> **Phase 1 membre — UI livrée (2026-06-08) :** la spec **normative as-shipped** est [`ux-notification-prefs-phase1-as-shipped-2026-06-08.md`](./ux-notification-prefs-phase1-as-shipped-2026-06-08.md). Le wireframe § ci-dessous et les règles R3/R4 « Push » / « Si désactivé » sont **historiques** pour la phase 1.
>
> **Amendement visuel 2026-06-08 :** présentation cartes groupe (titres section hors carte, lignes horizontales mobile, deux switchers conservés) — **normatif** dans le doc as-shipped § Refresh visuel ; le wireframe DT § ci-dessous reste **obsolète** pour le layout.

### Priorisation livraison (décision PO 2026-06-08)

| Phase | Scope | Stories | UI `/compte/notifications` |
|-------|--------|---------|----------------------------|
| **1 — Membre** | Copy, masquage D6, intros, « Si désactivé », grille Push/E-mail | 8.2 follow-up | **Seule section catégories** shipée en premier |
| **2 — Membre (suite)** | Nouvelles catégories dispatch actif | 8.8, G-012 | Ajout lignes au fil du dispatch (`EVENT_*`, `TEAM_CONFIRMED`) |
| **3 — Orga** | Section alertes organisateur | **8.4** (après phase 1–2) | Bloc **ajouté uniquement** quand au moins un intent orga est actif — **aucun teaser** avant |

Le wireframe et les tests guérilla **phase 1** ne couvrent que le membre (S1, S2, S4, S5). S3 (Marc / déclin) = **phase 3**, après ship 8.4.

---

## Design challenge

**Comment concevoir une expérience de configuration des notifications où chaque toggle correspond à un effet concret, compréhensible immédiatement — pour Léa (membre, anti-spam) et Marc (orga, alertes immédiates) — sans toggles fantômes ni jargon technique ?**

### Point of view (POV)

> **Léa**, membre assignée qui veut peu de bruit, **a besoin de** comprendre en un coup d’œil ce qu’elle reçoit et sur quels canaux **parce que** couper la mauvaise pref pourrait lui faire rater un spectacle ou, à l’inverse, la laisser croire qu’elle s’est désabonnée alors que rien ne change (pref fantôme).

> **Marc**, orga de saison, **a besoin de** activer des alertes ops ciblées (ex. déclin immédiat) **sans** les confondre avec ses prefs membre **parce que** le modèle mental orga (opt-in, coordination) diffère du modèle membre (opt-out, participation).

---

## EMPATHIZE — Configuration (pas « recevoir une notif » en général)

### Léa — 5 insights

- **Peur du raté :** elle a calé son samedi ; couper « Participation » sans savoir que ça inclut aussi le retrait de compo ou un changement de date (N1) la stresserait.
- **Peur du spam :** elle a déjà désactivé des prefs ; les libellés API (« M'envoyer une notification lorsqu'un spectacle… ») ne lui disent pas *quels* messages concrets disparaissent.
- **Moment de vérité — 1ʳᵉ visite :** arrive depuis l’invite post-install (10.6) ; veut activer push puis comprendre la grille sans lire 7 lignes identiques en structure.
- **Moment de vérité — après un push :** « Pourquoi j’ai reçu ça ? » → cherche la ligne correspondante ; si absente (pref fantôme passée) ou trop vague, perte de confiance.
- **Réaction BS N1/N2 :** changement date/lieu = **indispensable** ; archivage = **oui**, surtout pour stopper les rappels J-1 fantômes après annulation.

### Marc — 5 insights

- **Peur du retard :** le déclin (N3) doit arriver **tout de suite**, pas dans le rappel hebdo 8.4 — la pref orga doit être explicite (« Déclin d’un·e participant·e »).
- **Peur du bruit ops :** cadences hebdo/journalières 8.4 utiles mais **distinctes** des signaux immédiats ; ne pas tout fusionner en un toggle fourre-tout.
- **Moment de vérité — 1ʳᵉ visite orga :** cherche où activer l’alerte déclin ; ne s’attend pas à la trouver sous « Rappels automatiques » membre.
- **Double casquette :** Marc est aussi membre sur d’autres troupes ; une page `/compte` unique avec **deux sections clairement étiquetées** évite deux hubs.
- **Réaction BS N3 :** « Le déclin, je veux le savoir tout de suite » → pref orga **opt-in**, libellé actionnable, pas noyée dans les prefs membre opt-out.

### Empathy map (synthèse configuration)

| | Léa | Marc |
|---|-----|------|
| **Pense** | « Qu’est-ce que je ne recevrai plus si je coupe ? » | « Qu’est-ce qui m’alerte en temps réel vs en rappel planifié ? » |
| **Ressent** | Anxiété (raté un show) vs irritation (spam) | Urgence (trouver un remplaçant) vs saturation (trop de pings) |
| **Fait** | Désactive des toggles au feeling ; revient après un push gênant | Ouvre `/compte` rarement ; s’appuie sur push + inbox ops |
| **Entend** | Libellés longs, jargon « composition », « roster » | « Rappel hebdo compo incomplète » ≠ « Quelqu’un a décliné » |

---

## DEFINE — How Might We (4)

1. **HMW** montrer l’**effet concret** d’un toggle (exemples de messages) avant que l’utilisateur le coupe ?
2. **HMW** séparer **prefs membre (opt-out)** et **prefs orga (opt-in)** sur une même page sans confusion de modèle mental ?
3. **HMW** garantir qu’**aucune pref visible** ne soit une pref fantôme (A1) — masquer, pas badge « bientôt » sur un toggle inactif ?
4. **HMW** simplifier la grille **push / e-mail** tout en gardant le contrôle fin pour ceux qui en veulent ?

### Insights problème

- Les **7 catégories API** mélangent déclencheurs différents (demande dispo, confirmation, retrait, proxy) sous des libellés centrés « M'envoyer… » — illisibles en < 30 s.
- **Deux modèles** (opt-out membre / opt-in orga) sur le même compte exigent une **rhétorique de section** explicite, pas seulement un ordre de toggles.
- **D6** impose de retirer `COMPOSITION_SHARED` et `TEAM_CONFIRMED` de l’UI tant que non dispatchés — opportunité de regrouper le reste sans trou visuel.

---

## IDEATE — Convergence (3 concepts retenus)

### Concept A — **Libellé court + aide « Si désactivé… »** (retenu)

Chaque ligne = titre **≤ 6 mots** + texte d’aide en une phrase avec **exemple concret** + conséquence « Si désactivé : … ». Les libellés API restent côté backend ; l’UI porte le mapping utilisateur.

### Concept B — **Deux sections sur `/compte/notifications`** (retenu)

Même onglet, même route — **pas** de hub admin troupe pour les prefs notification (décision : compte global, aligné [ux-design-mon-compte.md](./ux-design-mon-compte.md) C1). Section orga visible **uniquement** si l’utilisateur a au moins un rôle orga/admin (API ou claim).

### Concept C — **Canaux : en-têtes Push / E-mail + intro** (retenu)

Conserver la **grille 2 colonnes** (déjà implémentée, tests 8.2) ; ajouter en-têtes de colonnes et une phrase d’intro par section. Pas de mode « Avancé » séparé pour le MVP UX — le coût cognitif du repli ne vaut pas le gain tant que ≤ 6 lignes visibles membre.

**Écarté :** fusion push+email en un seul toggle « Me prévenir » — régression pour Léa qui veut e-mail sans push (Tension B, discovery 2026-06-01).

---

## Arborescence proposée

### Membre — `/compte/notifications`

```
Notifications sur cet appareil          [push global — existant 8.1]

─── Messages pour moi ───  (opt-out · activé par défaut)
    Spectacles & disponibilités         AVAILABILITY_REQUEST
    Participation à un spectacle        CONFIRMATION_REQUEST
    Changements importants *            EVENT_DETAILS_CHANGED  (8.8)
    Spectacle annulé ou archivé *       EVENT_ARCHIVED         (8.8)
    Équipe au complet **                TEAM_CONFIRMED         (G-012 — masqué jusqu’au dispatch)

─── Rappels automatiques ───  (opt-out · activé par défaut)
    Dispos non renseignées (≈ 5 j)      AVAILABILITY_WEEKLY_REMINDER
    Semaine avant le spectacle          REMINDER_7_DAYS
    Veille du spectacle                 REMINDER_1_DAY

* Masqué jusqu’au ship story 8.8 (règle A1).
** Masqué jusqu’au dispatch TEAM_COMPLETE_MEMBER (D6).
† COMPOSITION_SHARED — jamais affiché membre (orga-only 8.4, D6).
```

### Organisateur — même page, section conditionnelle

```
─── Alertes organisateur ───  (opt-in · désactivé par défaut)
    Sous-titre : « Pour les spectacles où tu organises. N’active que ce dont tu as besoin. »

    Déclin d’un·e participant·e           ASSIGNEE_DECLINED        (8.4 / 8.4b)
    Équipe complète (tous confirmés)      TEAM_COMPLETE            (8.4)
    Composition incomplète (rappel)       COMPOSITION_INCOMPLETE_WEEKLY / DAILY_J7
    Dispos pas ouvertes (T-1 mois)        SLA_OPEN_AVAILABILITY
    Brouillon partagé (cercle orga)       DRAFT_COMPOSITION_SHARED
    Nouveau brouillon spectacle           EVENT_DRAFT_CREATED

    Absent de l’UI jusqu’au ship 8.4 — pas de teaser, pas de placeholder (décision PO party-mode).
```

**Alternative rejetée :** prefs orga dans le hub troupe/saison — bon pour le *contexte* événement, mauvais pour « tout régler au même endroit » et pour Marc multi-saisons.

**Alternative rejetée :** teaser du type *« Alertes organisateur — bientôt »* — bruit inutile tant que le dispatch orga ne fonctionne pas ; la section apparaît **d’un bloc** à l’activation du premier intent 8.4.

---

## Matrice des défauts (normatif — FR29 / FR31)

Source runtime actuelle : `NotificationPreference(push = true, email = true)` — clé JSON **absente** = canal autorisé (opt-out). Push global : gate séparée (`users.push_notifications_enabled` + abonnement appareil).

### Niveau 0 — Push sur cet appareil (story 8.1)

| Élément | Défaut | Modèle | Effet si OFF |
|---------|--------|--------|--------------|
| Permission navigateur | Refusée jusqu’à action utilisateur | Opt-in explicite | Aucun push, quelle que soit la pref catégorie |
| Toggle « Notifications sur cet appareil » | OFF si pas d’abonnement | Opt-in | Toggles push catégories grisés ; **e-mail catégories restent éditables** |

### Niveau 1 — Catégories membre (opt-out)

**Règle :** absent en base ou toggle ON → canal **actif**. L’utilisateur **désactive** pour couper.

| Clé | Push défaut | E-mail défaut | Visible UI (phase 1) | Notes |
|-----|-------------|---------------|----------------------|-------|
| `AVAILABILITY_REQUEST` | ON | ON | Oui | Inclut proxy dispo (D2) |
| `CONFIRMATION_REQUEST` | ON | ON | Oui | Inclut retrait, reconfirm, proxy participation (D1, D2) |
| `AVAILABILITY_WEEKLY_REMINDER` | ON | ON | Oui | Cadence ~5 j (8.7) |
| `REMINDER_7_DAYS` | ON | ON | Oui | Assignés confirmés uniquement |
| `REMINDER_1_DAY` | ON | ON | Oui | Idem J-1 |
| `COMPOSITION_SHARED` | ON | ON | **Non** (D6) | Orga-only ; jamais membre |
| `TEAM_CONFIRMED` | ON | ON | **Non** (D6) | Jusqu’à dispatch `TEAM_COMPLETE_MEMBER` |
| `EVENT_DETAILS_CHANGED` | ON | ON | **Non** | Jusqu’à ship 8.8 |
| `EVENT_ARCHIVED` | ON | ON | **Non** | Jusqu’à ship 8.8 |

**Nouveau compte / nouvelle catégorie shipée :** hérite ON/ON pour les canaux ; l’UI affiche les toggles ON tant qu’aucun PATCH explicite.

### Niveau 2 — Catégories orga (opt-in) — story 8.4, phase 3

**Règle :** absent en base ou toggle OFF → canal **inactif**. L’utilisateur **active** pour recevoir.

| Clé (proposée) | Push défaut | E-mail défaut | Visible UI | Notes |
|----------------|-------------|---------------|------------|-------|
| `ORG_ASSIGNEE_DECLINED` | **OFF** | **OFF** | Si scope orga + intent actif | Signal immédiat N3 |
| `ORG_TEAM_COMPLETE` | OFF | OFF | Idem | Clôture FR31b |
| `ORG_COMPOSITION_INCOMPLETE` | OFF | OFF | Idem | Cadences hebdo / J-7 |
| `ORG_SLA_OPEN_AVAILABILITY` | OFF | OFF | Idem | T-1 mois dispos fermées |
| `ORG_DRAFT_COMPOSITION` | OFF | OFF | Idem | Cercle orga |
| `ORG_EVENT_DRAFT_CREATED` | OFF | OFF | Idem | Création brouillon |

**Nouveau orga / nouvelle clé orga shipée :** hérite OFF/OFF ; pas de notification tant qu’activation explicite.

### Niveau 3 — Hors prefs HatCast (jamais de toggle)

| Type | Canaux | Défaut |
|------|--------|--------|
| Reset MDP, vérif e-mail | E-mail Identity | Toujours envoyé |
| `TROUPE_MEMBERSHIP_INVITE` (Epic 7) | E-mail transactionnel | Hors prefs app |
| Inbox `/accueil` (pull) | In-app | Indépendant des prefs push/e-mail |

### Conflits membre ↔ orga

| Situation | Règle |
|-----------|--------|
| Même personne membre **et** orga (Marc) | **Deux familles de prefs indépendantes** — intents et audiences disjoints ; pas de « override » orga sur membre ni l’inverse |
| Même événement, deux rôles | Un `ASSIGNEE_DECLINED` orga n’est pas filtré par une pref membre ; un `CONFIRMATION_REQUEST` membre n’est pas filtré par une pref orga |
| Push global OFF | Bloque **tous** les push membre **et** orga ; e-mail reste gouverné par pref catégorie |
| Pref membre OFF, inbox | L’inbox peut **toujours** afficher une action requise (pull ≠ journal d’envoi) |

### Mapping UI ↔ état toggle

| Section | Toggle ON signifie | Toggle OFF signifie |
|---------|-------------------|---------------------|
| Membre | Je **reçois** ce type (opt-out) | Je **ne reçois plus** (PATCH `push`/`email` false) |
| Orga (8.4+) | Je **veux** cette alerte ops (opt-in) | Pas d’alerte (absent ou false) |

---

## Tableau mapping — clé technique → UI

### Membre (visible après D6)

| Clé technique | Libellé UI court | Texte d’aide | Si désactivé… | Intents couverts | Opt-in/out | Push / e-mail |
|---------------|------------------|--------------|---------------|------------------|------------|---------------|
| `AVAILABILITY_REQUEST` | **Disponibilités** | Nouveau spectacle, rappel orga, ou quelqu’un a renseigné ta dispo pour toi. | Tu ne seras plus prévenu·e quand on attend ta dispo ou qu’une dispo est enregistrée pour toi. | `AVAILABILITY_OPENED`, `MANUAL_AVAILABILITY_ANNOUNCE`, `MANUAL_AVAILABILITY_NUDGE`, `PROXY_AVAILABILITY_RECORDED` | Opt-out | Indép. |
| `CONFIRMATION_REQUEST` | **Participation** | Confirmation, reconfirmation, retrait de la compo, ou action faite pour toi par un·e orga. | Tu ne seras plus prévenu·e pour confirmer, ni si tu es retiré·e ou si ta participation est modifiée pour toi. | `CONFIRMATION_REQUEST`, `RECONFIRMATION_REQUEST`, `REMOVED_FROM_COMPOSITION`, `PROXY_CONFIRMATION_RECORDED` | Opt-out (D1 retrait) | Indép. |
| `EVENT_DETAILS_CHANGED` | **Changements importants** | Date, lieu ou format d’un spectacle publié modifié. | Tu ne seras plus prévenu·e si la date, le lieu ou le format change. *(Pas si seule la description change — D4.)* | `EVENT_DETAILS_CHANGED` (8.8) | Opt-out | Indép. |
| `EVENT_ARCHIVED` | **Spectacle annulé** | Le spectacle disparaît de l’agenda (archivage). | Tu ne seras plus prévenu·e si un spectacle est annulé ou archivé. | `EVENT_ARCHIVED` (8.8) | Opt-out (D1) | Indép. |
| `TEAM_CONFIRMED` | **Équipe au complet** | Tous les participant·es ont confirmé — bonne nouvelle collective. | Tu ne recevras plus ce message de célébration quand l’équipe est bouclée. | `TEAM_COMPLETE_MEMBER` (G-012) | Opt-out | Indép. |
| `AVAILABILITY_WEEKLY_REMINDER` | **Dispos oubliées** | Rappel environ tous les **5 jours** tant que ta dispo n’est pas renseignée. | Plus de rappel automatique pour les dispos en attente. | `AVAILABILITY_PENDING_REMINDER` (8.7) | Opt-out | Indép. |
| `REMINDER_7_DAYS` | **Semaine avant** | Tu es assigné·e et confirmé·e — rappel **7 jours** avant. | Plus de rappel une semaine avant un spectacle où tu joues. | `ASSIGNEE_PRESENCE_REMINDER` (J-7) | Opt-out | Indép. |
| `REMINDER_1_DAY` | **Veille du spectacle** | Même chose **la veille** — avec lien pour décliner si besoin. | Plus de rappel la veille. | `ASSIGNEE_PRESENCE_REMINDER` (J-1) | Opt-out | Indép. |

### Masquées UI (D6 — ne pas afficher)

| Clé | Raison |
|-----|--------|
| `COMPOSITION_SHARED` | Intent orga-only / non émis membre (8.4) |
| `TEAM_CONFIRMED` | Jusqu’à dispatch `TEAM_COMPLETE_MEMBER` |
| `EVENT_*` (8.8) | Jusqu’au ship 8.8 |

### Organisateur (8.4 — section entière masquée jusqu’au ship)

| Clé technique (proposée) | Libellé UI court | Texte d’aide | Si **non** activé… | Intents | Opt-in/out | Push / e-mail |
|------------------------|------------------|--------------|---------------------|---------|------------|---------------|
| `ORG_ASSIGNEE_DECLINED` | **Déclin immédiat** | Quelqu’un décline après validation de la compo. | Tu ne seras pas alerté·e tout de suite — il faudra consulter l’app. | `ASSIGNEE_DECLINED` (N3) | **Opt-in** | Indép. |
| `ORG_TEAM_COMPLETE` | **Équipe bouclée** | Toutes les confirmations sont reçues. | Pas de notification de clôture. | `TEAM_COMPLETE` (FR31b) | Opt-in | Indép. |
| `ORG_COMPOSITION_INCOMPLETE` | **Compo incomplète** | Rappels hebdo puis quotidiens à J-7 si des places manquent. | Pas de rappel planifié (tu peux toujours voir l’état dans l’app). | `COMPOSITION_INCOMPLETE_*` | Opt-in | Indép. |
| `ORG_SLA_OPEN_AVAILABILITY` | **Ouvrir les dispos** | Spectacle dans ~1 mois, dispos encore fermées. | Pas d’alerte SLA. | `SLA_OPEN_AVAILABILITY` | Opt-in | Indép. |
| `ORG_DRAFT_COMPOSITION` | **Brouillon partagé** | Un brouillon de compo est partagé dans le cercle orga. | Pas de notif (coordination interne). | `DRAFT_COMPOSITION_SHARED` | Opt-in | Indép. |
| `ORG_EVENT_DRAFT_CREATED` | **Nouveau brouillon** | Un spectacle brouillon vient d’être créé. | Pas de notif à la création. | `EVENT_DRAFT_CREATED` | Opt-in | Indép. |

*Nommage clés orga : préfixe `ORG_` recommandé en implémentation pour éviter collision avec clés membre.*

---

## Wireframe texte — `/compte/notifications` (phase 1 membre — post-D6)

*Le bloc **Alertes organisateur** n’apparaît pas dans ce wireframe ; il sera ajouté tel quel en phase 3 (8.4), sans teaser intermédiaire.*

```
┌─────────────────────────────────────────────────────────────────┐
│ Mon compte                                    [ Se déconnecter ] │
│ Configure comment HatCast te contacte.                           │
│ [ Mon profil | Préférences | Notifications | À propos ]          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Notifications sur cet appareil                    [====○    ] │
│  Les notifications sont actives sur cet appareil.                │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  MESSAGES POUR MOI                                               │
│  Tu reçois ces messages par défaut. Désactive ce que tu         │
│  ne veux plus.                          Push          E-mail     │
│                                                                  │
│  Disponibilités                                                  │
│  Nouveau spectacle, rappel orga, dispo enregistrée pour toi.     │
│  Si désactivé : plus de demande de dispo ni d’accusé proxy dispo.│
│                                          [====○]      [====○]    │
│                                                                  │
│  Participation                                                   │
│  Confirmer, reconfirmer, retrait, action orga pour toi.          │
│  Si désactivé : plus de demande de confirmation ni alerte        │
│  retrait (D1 — opt-out accepté).                                 │
│                                          [====○]      [====○]    │
│                                                                  │
│  ── (EVENT_DETAILS_CHANGED / EVENT_ARCHIVED : absents jusqu’à 8.8)
│  ── (TEAM_CONFIRMED : absent jusqu’à G-012)                      │
│                                                                  │
│  RAPPELS AUTOMATIQUES                                            │
│  Rappels liés au calendrier, pas aux actions des orgas.          │
│                                          Push          E-mail     │
│                                                                  │
│  Dispos oubliées (~5 j)                                          │
│  Si désactivé : plus de rappel tant que ta dispo est vide.       │
│                                          [====○]      [====○]    │
│                                                                  │
│  Semaine avant le spectacle                                      │
│  Si désactivé : plus de rappel J-7 si tu es confirmé·e.           │
│                                          [====○]      [====○]    │
│                                                                  │
│  Veille du spectacle                                             │
│  Si désactivé : plus de rappel la veille.                       │
│                                          [====○]      [====○]    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Notes wireframe :**

- Intro de page (phase 1) : *« Chaque option décrit ce que tu ne recevras plus si tu la désactives. »* — mention orga ajoutée **uniquement** quand la section 8.4 est visible.
- Hint push global existant conservé quand push appareil off.
- Pas de lien « Voir le catalogue » — l’aide inline suffit ; lien optionnel vers FAQ si un jour.

---

## Règles normatives UX

### R1 — Pref = dispatch contract (anti-pattern A1)

| Situation | Règle UI |
|-----------|----------|
| Intent **non émis** (runtime) | **Ne pas afficher** le toggle. Pas de badge « Bientôt » sur une ligne interactive. |
| Story **planifiée** mais non ship | Documenter dans catalogue/backlog ; **silence UI**. |
| Ship partiel (intent actif, copy TBD) | Afficher avec libellé + aide dès que le dispatcher envoie réellement. |
| Section orga 8.4 | **Tout ou rien** : section entière absente jusqu’à au moins un intent orga actif. **Pas de teaser** ni placeholder. |

### R2 — Cohérence opt-out membre / opt-in orga

| | Membre | Orga |
|---|--------|------|
| **Modèle** | Opt-out ( défaut ON ) | Opt-in ( défaut OFF ) |
| **Copy section** | « Tu reçois… par défaut. Désactive… » | « Active seulement… tout est désactivé par défaut. » |
| **Toggle ON** | = je reçois | = je veux être alerté·e |
| **Justification affichée** | Footnote **uniquement quand la section orga est visible** (8.4+) : *« Les messages membre concernent ta participation. Les alertes orga concernent la coordination — tu choisis de les activer. »* |

### R3 — Libellés & copy

- **Titre UI** : nom du *sujet* (Disponibilités, Participation), pas « M'envoyer une notification… ».
- **Phase 1 as-shipped** : **une** phrase `description` par ligne, amorce **« Me prévenir quand »** (voir doc as-shipped). Pas de bloc « Si désactivé » en phase 1.
- **Orga (8.4+)** : « si non activé » pour opt-in — à définir à l’implémentation 8.4.
- **API** : conserver `label` long pour OpenAPI / compat ; UI Angular **mappe** clé → `notification-preference-ui-copy.ts`.

### R4 — Canaux appareil / e-mail

- Libellé canal membre : **Cet appareil** | **E-mail** (jamais Push/Mobile en UI).
- Toggle global : **Notifications sur cet appareil** (autorisation OS/navigateur) ; contenu dans **carte groupe** (as-shipped amendement 2026-06-08).
- Toggles **Cet appareil** **désactivés** si notifications appareil off — sans hint sous la grille.
- E-mail reste éditable indépendamment (fallback Tension B).
- **Deux switchers par notif** sur un seul écran — pas de routes séparées Push / E-mail.
- Légende canaux **une fois** en tête de chaque carte groupe ; **layout horizontal** texte + toggles sur **tous** viewports (as-shipped § Grille canaux).

### R5 — Regroupement intents (pas de split pref sans décision PO)

- Proxy confirmation sous **Participation** (D2).
- Retrait sous **Participation** (D1).
- N1 date/lieu/format : catégorie dédiée **Changements importants** (8.8), pas fusion avec Participation.

### R6 — Visibilité rôle orga

- Afficher section orga si `hasOrganizerScope` (à définir en story 8.4 — ex. au moins un rôle event orga / season admin / troupe admin).
- Léa pure : ne voit **jamais** la section orga (pas de toggles vides).

---

## TEST (light) — 5 scénarios guérilla

| # | Persona | Tâche | Pass | Fail |
|---|---------|-------|------|------|
| S1 | Léa | « Coupe les rappels toutes les 5 jours pour dispos attendues » | Trouve **Dispos attendues** en < 15 s ; cite *tous les 5 jours* | Cherche sous « Disponibilités » ou ne sait pas ce qui s’arrête |
| S2 | Léa | « Je ne veux plus les rappels veille / semaine, mais garder les demandes de dispo » | Désactive **Veille** + **Semaine avant** sans toucher **Disponibilités** | Désactive le mauvais bloc ou pense tout couper |
| S3 | Marc | « Active l’alerte quand quelqu’un décline » *(phase 3 — 8.4)* | Section **Alertes organisateur** → **Déclin immédiat** ; comprend opt-in | Cherche dans Rappels membre ou ne trouve pas la section |
| S4 | Nouveau membre | Notifications appareil **non** activées — ouvre prefs | Voit **Cet appareil** grisé ; peut régler e-mail ; pas de mur de hints | Confusion totale |
| S5 | Léa | « Si je coupe Participation, retrait compo ? » | Lit *Me prévenir quand… orga modifie ma participation* ; décision éclairée | Réponse « je ne sais pas » > 30 s |

**Critère phase 1 (membre) :** S1, S2, S4, S5 en **pass** (4/4) sans catalogue. **Phase 3 :** ajouter S3 après ship 8.4.

---

## Prochaines étapes (action items)

| Priorité | Action | Owner suggéré |
|----------|--------|---------------|
| **P0** | Story UI membre : masquer `COMPOSITION_SHARED` + `TEAM_CONFIRMED` (D6) + copy map + « Si désactivé » + intros + colonnes Push/E-mail | 8.2 follow-up |
| **P1** | Story **8.8** : `EVENT_DETAILS_CHANGED` + `EVENT_ARCHIVED` (membre, opt-out ON par défaut) | 8.8 |
| **P1** | G-012 : `TEAM_COMPLETE_MEMBER` puis ligne **Équipe au complet** | G-012 → 8.x |
| **P2** | Story **8.4** : section orga opt-in + clés `ORG_*` + gate rôle — **après** P0/P1 membre ; pas de teaser avant ship | 8.4 |
| P2 | MAJ [`NOTIFICATIONS_CATALOG.md`](../../docs/v2/technical/NOTIFICATIONS_CATALOG.md) § Modèle prefs avec libellés UI | Paige / dev |
| P2 | Tests guérilla S1–S5 sur prototype Figma ou staging | PO |

### Métriques de succès

- **Compréhension :** ≥ 80 % des testeurs répondent correctement à « Si je coupe X… » en < 30 s (S1, S2, S5).
- **Découvrabilité orga :** Marc trouve déclin immédiat en < 20 s (S3).
- **Confiance :** 0 toggle visible sans dispatch actif (audit A1 après chaque release Epic 8).
- **Support :** baisse des questions « j’ai désactivé mais je reçois encore » liées à prefs fantômes (qualitatif).

---

## Annexe — Écart UI (historique pré-8.2b)

| Avant 8.2b | Phase 1 as-shipped (2026-06-08) | Refresh visuel (2026-06-08) |
|------------|----------------------------------|----------------------------|
| Libellé = `category.label` API (long) | Titre court + *Me prévenir quand…* | Inchangé |
| 7 toggles dont 2 fantômes | 5 lignes ; D6 masqué client | 7 lignes après 8.8 |
| Colonnes sans en-tête | **Cet appareil** \| E-mail | Légende 1× en tête de carte |
| — | Cartes section + hiérarchie typo | Titres **hors** carte ; `body-small` descriptions ; layout horizontal mobile |
| — | Voir [`ux-notification-prefs-phase1-as-shipped-2026-06-08.md`](./ux-notification-prefs-phase1-as-shipped-2026-06-08.md) | § Refresh visuel 2026-06-08 |

---

*Généré — Design Thinking 2026-06-08 · amendements party-mode 2026-06-08 (priorité membre, silence orga, matrice défauts).*
