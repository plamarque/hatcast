---
title: UX — Prefs notification orga (brief pré-story 8.4)
author: Sally (UX) + Patrice
date: '2026-06-08'
status: decision-brief
route: /compte/notifications
relatedStories:
  - '8.4'
parentSpec: ux-design-notification-preferences-2026-06-08.md
asShippedMember: ux-notification-prefs-phase1-as-shipped-2026-06-08.md
---

# Prefs orga — brief UX (pré-story 8.4)

**Usage :** entrée rapide pour rédiger la story **8.4** (UI prefs organisateur). Le détail (wireframe, mapping clés, tests S3) reste dans [`ux-design-notification-preferences-2026-06-08.md`](./ux-design-notification-preferences-2026-06-08.md) § Organisateur.

---

## Décision surface

| Choix | Retenu | Rejeté |
|-------|--------|--------|
| Où | **3ᵉ section** sur `/compte/notifications` (même onglet Mon compte) | Onglet Membre \| Orga ; hub saison/troupe ; teaser « bientôt » |
| Pattern UI | Même grille que membre (carte, titres hors carte, **Cet appareil** \| **E-mail**) | Routes ou onglets séparés push/e-mail |

---

## Section « Alertes organisateur »

- **Titre :** Alertes organisateur
- **Intro :** *« Pour les spectacles où tu organises. Active seulement ce dont tu as besoin. »*
- **Modèle :** **opt-in** — push et e-mail **OFF** par défaut ; toggle ON = je veux cette alerte.
- **Visibilité :** section **entière absente** si l’utilisateur n’a pas de scope orga (`hasOrganizerScope` — à définir en 8.4). Léa ne voit **jamais** la section.
- **Ship :** section apparaît **d’un bloc** quand au moins **un** intent orga dispatch réellement (règle **A1**) — pas de placeholder avant.

---

## Règles à ne pas oublier en story

1. **Prefs orga ≠ prefs membre** — intents et clés disjoints (`ORG_*` recommandé) ; pas d’override croisé (ex. couper « Participation » membre n’affecte pas « Déclin immédiat » orga).
2. **Push global appareil OFF** bloque push orga **et** membre ; e-mail reste gouverné par pref catégorie.
3. **Une ligne = un intent actif** — masquer toute clé sans dispatch (comme D6 côté membre).
4. **Grammaire visuelle** — alignée sur [`ux-notification-prefs-phase1-as-shipped-2026-06-08.md`](./ux-notification-prefs-phase1-as-shipped-2026-06-08.md) (pas de régression layout M3).
5. **Hors scope UI 8.4** — inbox `/accueil`, fil historique des notifs, prefs par saison/troupe.

---

## Lignes prévues (catalogue 8.4 — copy détaillé en story)

| Clé proposée | Libellé court |
|--------------|---------------|
| `ORG_ASSIGNEE_DECLINED` | Déclin immédiat |
| `ORG_TEAM_COMPLETE` | Équipe bouclée |
| `ORG_COMPOSITION_INCOMPLETE` | Compo incomplète |
| `ORG_SLA_OPEN_AVAILABILITY` | Ouvrir les dispos |
| `ORG_DRAFT_COMPOSITION` | Brouillon partagé |
| `ORG_EVENT_DRAFT_CREATED` | Nouveau brouillon |

Regrouper visuellement **signaux immédiats** vs **rappels planifiés** si utile — **sans** sous-onglet.

---

## Test guérilla cible

**S3 (Marc) :** trouve et active « Déclin immédiat » dans **Alertes organisateur** en < 20 s — pas dans Rappels membre.

---

*Brief 2026-06-08 — à lier depuis la story 8.4 et `NOTIFICATIONS_CATALOG.md` § 8.4.*
