# Charte voix & ton — HatCast V2 (UI membre)

**Statut :** approuvé (2026-05-31)  
**Périmètre :** libellés visibles dans `apps/web/` — hub membre, agenda, stats, compte, empty states, messages d’erreur, CTAs.  
**Langue UI :** français, **tutoiement** systématique.

Cette charte complète les specs écran (`ux-hub-a-faire.md`, `ux-design-journey-league-agenda.md`, etc.) lorsqu’elles ne précisent pas la formulation.

---

## Principes

1. **Parler à une personne**, pas à un compte — ton direct, chaleureux, sans jargon admin.
2. **Une voix par bloc** — ne pas mélanger « mon » et « ton » dans le même en-tête de page.
3. **Court et actionnable** — une idée par phrase ; les sous-titres de page tiennent sur **une ligne**.
4. **Cohérence produit** — mêmes termes partout (*spectacle*, *saison*, *troupe*, *dispo*, *composition*).

---

## Registres (quand utiliser quoi)

HatCast emploie **deux registres complémentaires**. Le piège est de les **combiner dans la même zone visuelle** (titre + sous-titre).

| Registre | Personne | Quand | Exemples |
|----------|----------|-------|----------|
| **Espace perso** | 1ʳᵉ personne (*mon / ma / mes*) | Titres de page (`h1`), navigation membre, chips d’accès rapide, libellés de sections « les miennes » | Mon agenda · Mes Stats · Mon compte · Mes troupes · Ma saison |
| **Adresse directe** | 2ᵉ personne (*tu / ton / ta / tes*) | Messages système, erreurs, empty states, feedback d’action, hints sous un contrôle, dialogues | « Nous n’avons pas pu charger ton agenda. » · « Tu n’es inscrit·e à aucune ligue. » · « Confirmer ta participation » |
| **Neutre** | Pas de possessif | Sous-titres descriptifs quand le titre est déjà possessif **ou** sujet générique | « Identité et sécurité du compte HatCast. » · « Disponibilités, sélections et rôles sur la saison. » (état chargement) |

### Règle d’or — couple titre + sous-titre

> Si le **`h1`** est en **Mon / Ma / Mes**, le **sous-titre** du même header reste en **mes / ma / mon** **ou** neutre (sans possessif).  
> **Jamais** *Mon X* suivi de *Tes Y* sur la même page.

| ✅ Correct | ❌ Incorrect |
|-----------|-------------|
| Mon agenda / **Mes** prochains spectacles… | Mon agenda / **Tes** prochains spectacles… |
| Mes Stats / **Mes** disponibilités… | Mes Stats / **Tes** disponibilités… |
| Mon compte / Identité et sécurité **du compte HatCast** | Mon compte / … de **ton** compte HatCast |

---

## Navigation et raccourcis (figés)

Libellés **1ʳᵉ personne** — ne pas remplacer par « Ton agenda » sans décision produit explicite :

| Libellé | Route / cible |
|---------|----------------|
| Mon agenda | `/agenda` |
| Ma saison · {titre} | `/saison/:slug` |
| Mes Stats | `/membre/:userSlug` (self) |
| Mes troupes | `/troupes` |
| Mon compte | `/compte` |

Sur mobile, le texte peut être masqué si `aria-label` reprend le libellé complet (ex. `member-agenda-shortcut`).

---

## Messages par type de surface

### En-tête de page (`h1` + sous-titre)

- **`h1`** : nom de l’espace perso (*Mon…*, *Mes…*) ou nom affiché (profil d’un autre membre).
- **Sous-titre** : précise le contenu en **1ʳᵉ personne** ou **neutre** — voir règle d’or ci-dessus.

### Empty states

- **Titre** : état factuel, souvent neutre (*Rien en attente*, *Tout est à jour*).
- **Corps** : **2ᵉ personne** — on parle à l’utilisateur·ice (*Tu n’es inscrit·e…*, *On te préviendra…*).
- **CTAs** : **1ʳᵉ personne** si destination perso (*Mes troupes*, *Mon agenda*) ; impératif ou verbe d’action sinon (*Découvrir les troupes*).

### Erreurs et chargement

- **2ᵉ personne** : *ton agenda*, *tes troupes*, *ton écran À faire*.
- Structure type : problème + action (*Réessaie dans un instant.*).

### Actions et formulaires

- **2ᵉ personne** pour ce que l’utilisateur·ice fait maintenant : *Confirmer **ta** participation*, *Indiquer **ta** dispo*, *Saisis **ton** email*.
- **1ʳᵉ personne** pour ce qui appartient déjà au compte : *Utiliser **ma** photo Google*.

### Vue organisateur·ice (sujet ≠ utilisateur connecté)

Quand un admin agit **pour le compte d’un autre membre**, le sujet de la phrase est le membre cible ; l’acteur est implicite ou explicite (*Confirmer la participation de {name}*). Ne pas utiliser *ta* si le sujet n’est pas l’utilisateur·ice connecté·e.

---

## Vocabulaire préféré

| Terme | Éviter |
|-------|--------|
| spectacle | événement (UI membre), match (sauf titre officiel) |
| saison | ligue (sauf contexte technique) |
| troupe | club, équipe (hors rôle « équipe » composition) |
| dispo / pas dispo | available, status codes |
| composition | lineup, roster |

---

## Checklist avant merge (copie UI)

- [ ] Tutoiement partout (pas de *vous* sauf citation légale).
- [ ] Couple `h1` + sous-titre : pas de mélange *mon* / *tes*.
- [ ] Nav et raccourcis : libellés *Mon / Ma / Mes* inchangés sauf spec contraire.
- [ ] Empty state : titre neutre OK, corps en *tu*.
- [ ] Erreur : *ton / ta / tes* + action claire.
- [ ] `aria-label` aligné sur le libellé visible ou plus explicite si icône seule.

---

## Références

- Hub membre : [ux-hub-a-faire.md](./ux-hub-a-faire.md)
- Parcours agenda : [ux-design-journey-league-agenda.md](./ux-design-journey-league-agenda.md)
- Compte : [ux-design-mon-compte.md](./ux-design-mon-compte.md)
- Checklist M3 (composants) : [docs/v2/technical/FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md)
