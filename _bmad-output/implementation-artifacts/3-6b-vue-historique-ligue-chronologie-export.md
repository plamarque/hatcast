# Story 3.6b : Vue ligue « Historique » (chronologie événements passés)

Status: ready-for-dev

## Story

En tant que **membre ou organisateur**,  
je veux une vue **Historique** listant les **événements passés** de la ligue, groupés par mois,  
afin de parcourir le programme passé **sans** la grille de statistiques de participation (FR53, ADR 0012).

## Acceptance Criteria

1. **Given** des événements passés non archivés pour la ligue, **when** l'utilisateur ouvre **Historique** depuis le shell ligue (story **3.3**), **then** une liste chronologique groupée par mois s'affiche (cartes alignées sur l'Agenda : date, titre, statut composition, résumé dispo/rôle utilisateur) — **sans** colonnes JEU/DECORUM/DEPLAC./BÉNÉVOLE (UX-DR19).
2. **Given** la règle « passé », **when** la liste est chargée, **then** seuls les événements dont le jour civil est **strictement avant aujourd'hui** apparaissent (même fuseau que UX-DR12 / Agenda) ; événements archivés exclus sauf décision produit contraire documentée.
3. **Given** un clic sur une carte, **when** l'utilisateur interagit, **then** navigation vers le **détail événement** (FR51).
4. **Given** l'action **Exporter**, **when** l'utilisateur télécharge, **then** le CSV reflète la **chronologie visible** (colonnes événement/date/statut/rôle utilisateur selon spec) — **fichier distinct** de l'export Statistiques (story **3.6**, FR54).
5. **Given** un utilisateur autorisé sur la ligue, **when** il consulte Historique, **then** l'écran est accessible à **tous les membres** avec accès ligue (cohérent story 3.6).
6. **Couverture :** FR53–FR54 ; UX-DR19 ; NFR-P1.

## Dependencies

- Story **3.3** (shell ligue + view switcher Agenda | Historique | Statistiques)
- Story **3.6** (Statistiques — surface séparée)

## References

- [ux-design-hatcast-v2.md § Historique chronology](../planning-artifacts/ux-design-hatcast-v2.md#screen-league--historique-chronology)
- [ADR 0012](../../docs/adr/0012-league-views-travel-leagues-member-stats.md)
