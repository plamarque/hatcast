# Story 16.1 : Route membre « Ma saison en un clin d'œil » (filtres troupe/ligue)

Status: backlog

## Story

En tant que **membre**,  
je veux ouvrir **ma saison en un clin d'œil** depuis l'espace utilisateur (et via les avatars en workspace ligue), avec filtres optionnels par troupe et ligue,  
afin de voir mes cartes récap, ma grille mensuelle et mes rôles favoris — et consulter le même écran pour un autre participant (transparence V1, FR58–FR59).

## Acceptance Criteria

1. **Given** un utilisateur connecté, **when** il ouvre `/membre/:userSlug` (ou alias approuvé), **then** l'écran affiche avatar, nom, trois cartes (Disponibilités / Sélections / Désistements avec % et tooltips V1), section *Ma saison en un clin d'œil* (grille mensuelle), rôles favoris, CTA **Planning** → agenda filtré si supporté (UX-DR8, `PlayerModal.vue`).
2. **Given** le membre participe à **plusieurs troupes ou ligues**, **when** l'écran charge, **then** filtres **troupe** et **ligue** sont disponibles ; **masqués** si un seul choix (FR55, RES-001).
3. **Given** un autre participant de la même ligue, **when** un membre autorisé ouvre `/membre/{autreSlug}`, **then** les mêmes blocs s'affichent pour ce participant (FR59).
4. **Given** un avatar en workspace ligue, **when** clic, **then** navigation vers `/membre/:userSlug` (query `?troupe=&ligue=` optionnel) — popover non requis.
5. **Given** les formules DOMAIN, **when** les stats sont calculées, **then** agrégation respecte les ligues sélectionnées ; événements **ligue déplacements** comptent en DEPLAC. si agrégation cross-ligue inclut stats détaillées (FR60 — scope minimal : cartes récap cohérentes avec ligues filtrées).
6. **Couverture :** FR55, FR58–FR59 ; UX-DR8 ; remplace objectif popover-only de story **2.7** pour le clin d'œil.

## Dependencies

- Stories **12.2–12.3** (agenda + filtres) recommandées pour CTA Planning
- Story **3.6** (formules stats) pour cohérence des compteurs

## References

- [ux-design-hatcast-v2.md § Personal season glance](../planning-artifacts/ux-design-hatcast-v2.md#screen-personal-season-glance)
- [2-7-popover-profil-membre-stats-saison-grille-mensuelle-roles-favoris.md](./2-7-popover-profil-membre-stats-saison-grille-mensuelle-roles-favoris.md)
