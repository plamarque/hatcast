# Comprendre les pourcentages de tirage

**Public :** organisateurs et membres de troupe.  
**Objectif :** expliquer ce que signifient les **%** affichés dans HatCast, sans entrer dans le détail technique du calcul.

Pour les développeurs et la spec normative : [Draw weight engine — spec V1](../technical/draw-weight-engine-v1-spec.md) et [ADR 0019](../../adr/0019-draw-weight-engine.md).

---

## En bref

Les pourcentages indiquent votre **chance relative d’être tiré** pour un rôle donné sur un spectacle. Ce n’est **pas une garantie** : le tirage reste aléatoire, mais pondéré pour favoriser l’équité sur la saison.

Sur un spectacle **à venir**, les % évoluent à mesure que les dispos et l’historique de la saison changent. Sur un spectacle **passé**, l’onglet Dispos peut afficher des % **figés au tirage** ou **estimés** (voir [Spectacles passés](#spectacles-passés-snapshot-ou-recalcul)).

- **100 %** ne veut pas dire « vous serez choisi » — cela peut signifier que vous êtes le seul candidat éligible.
- **10 %** ne veut pas dire « une chance sur dix » au sens strict du hasard pur — le moteur tient compte de l’historique et du nombre de places à pourvoir.

Les % affichés correspondent au **même calcul** que celui utilisé par le serveur au moment du tirage. Vous ne voyez pas une estimation « marketing » différente de la réalité du tirage.

---

## Pourquoi l’historique compte

HatCast réduit la cote des personnes qui ont **déjà beaucoup joué** le même rôle dans la saison, pour laisser leur place aux autres.

### Exemple concret

Sur la saison en cours, pour le rôle **JEU** :

| Personne | Participations passées validées en JEU | Effet sur la cote |
|----------|----------------------------------------|-------------------|
| **Alice** | 3 spectacles | Cote **plus basse** — elle a déjà beaucoup joué |
| **Bob** | 0 spectacle | Cote **plus haute** — il n’a pas encore été tiré en JEU |

Seules comptent les participations sur des spectacles **déjà validés** (équipe figée par l’organisateur). Ne comptent pas :

- le spectacle en cours ;
- les spectacles archivés ;
- les créneaux où la personne avait été tirée puis avait **décliné**.

L’idée : **répartir les rôles de façon plus équitable** sur la saison, sans punir quelqu’un qui n’a jamais eu l’occasion de jouer.

> **Note :** aujourd’hui, seul ce facteur « participations passées » est actif. D’autres règles (parité, formules personnalisées, etc.) pourront arriver plus tard — voir [Ce qui n’est pas encore dans le produit](#ce-qui-nest-pas-encore-dans-le-produit).

---

## Plusieurs places sur le même rôle

Quand un spectacle demande **plusieurs personnes** pour un rôle (par exemple **5 joueurs**), le % **n’est pas** simplement « votre poids ÷ la somme des poids ».

### Exemple

**8** candidats éligibles pour **5 places** de JEU, tous sans historique :

- Une lecture naïve donnerait **12,5 %** chacun (5/8).
- En réalité, HatCast affiche plutôt **environ 63 %** chacun, parce que le calcul tient compte du fait qu’**il y a 5 tirages successifs** pour ce rôle (sans remettre deux fois la même personne sur le même rôle).

Autrement dit : avec plusieurs places, les % reflètent la probabilité d’être **sélectionné au moins une fois** parmi les tirages prévus pour ce rôle, pas une simple part du gâteau. Le détail du calcul est dans la [spec technique V1](../technical/draw-weight-engine-v1-spec.md).

---

## Où voir les pourcentages

### Onglet **Dispos → Tous**

Toute personne qui peut consulter les disponibilités du spectacle voit les % à côté des candidats par rôle.

| Situation du spectacle | Ce que vous voyez |
|------------------------|-------------------|
| **À venir** | % recalculés en **temps réel** à chaque consultation (dispos, historique de la saison, etc.) |
| **Passé**, avec tirage archivé | % **capturés au moment du tirage** (voir ci-dessous) |
| **Passé**, sans archive de tirage | % **estimés** — un message l’indique dans l’interface |

### Onglet **Équipe**

Les % sur les personnes **déjà assignées** à un créneau servent à **expliquer le tirage**.

| Qui | Brouillon (non validé) | Composition validée |
|-----|------------------------|---------------------|
| **Organisateur** | Voit l’équipe et les % (prévisualisation) | Voit l’équipe et les % |
| **Membre** | Ne voit pas l’équipe en brouillon | Voit l’équipe et les % |

La **publication** du brouillon est une étape pour l’organisateur ; la visibilité des membres sur l’onglet Équipe intervient surtout une fois la composition **validée**.

---

## Spectacles passés : snapshot ou recalcul ?

Pour un spectacle **déjà joué**, HatCast distingue deux modes d’affichage sur Dispos :

| Mode | Signification pour vous |
|------|-------------------------|
| **Snapshot** | % **enregistrés au moment du tirage** — ils ne changent pas si l’historique de la saison évolue ensuite |
| **Estimé** | Pas d’archive de tirage (spectacle migré, tirage antérieur sans sauvegarde, etc.) — % **reconstitués** à partir de l’historique connu aujourd’hui |

Sur un spectacle **à venir**, les % restent en **recalcul live** à chaque consultation.

### Pourquoi conserver un snapshot ?

Imaginez : le tirage affichait **40 %** pour vous en novembre. En décembre, d’autres spectacles se valident et votre historique change. Sur un spectacle **passé**, HatCast préfère montrer le **40 % du tirage**, pas un chiffre recalculé qui donnerait une impression différente de ce qui s’est réellement passé.

Le snapshot correspond à l’état **au début du tirage** (avant les sélections successives entre plusieurs rôles dans la même opération). C’est le % que l’organisateur et les participants pouvaient raisonnablement avoir en tête au moment du tirage.

---

## Ce qui n’est pas encore dans le produit

Les stories **Epic 19** prévoient des évolutions **non livrées** à ce jour. Cette page **ne promet pas** :

| Fonctionnalité | Statut |
|----------------|--------|
| Formules de tirage personnalisables par la troupe | Prévu (vague ultérieure) |
| Choix de formule par l’organisateur au moment du tirage | Prévu |
| Parité ou mix d’équipe comme facteur de cote | Prévu |
| Bonus / malus bénévole | Prévu |
| Détail « chaque facteur a influencé votre % » dans l’interface | Prévu (explainability avancée) |
| Politiques de tirage par catégorie de spectacle | Prévu |

Aujourd’hui, le produit applique **uniquement** la règle d’équité basée sur les **participations passées validées** pour le même rôle et la même saison.

---

## Questions fréquentes

**Les % garantissent-ils le résultat du tirage ?**  
Non. Ils décrivent des chances **relatives** avant le tirage. Le hasard intervient toujours.

**Pourquoi mon % diffère de celui d’un autre rôle ?**  
Chaque rôle (JEU, DJ, MC…) a son propre pool de candidats, son nombre de places et son historique par rôle.

**Pourquoi je ne vois pas les % sur l’Équipe ?**  
En tant que membre, l’onglet Équipe avec les % n’est visible qu’après **validation** de la composition. Les organisateurs voient les % plus tôt, pendant le brouillon.

**Où est la formule exacte ?**  
Dans la [spec technique V1](../technical/draw-weight-engine-v1-spec.md), réservée aux équipes techniques et aux audits de non-régression.

---

## Voir aussi

- [Spec normative — moteur de tirage V1](../technical/draw-weight-engine-v1-spec.md)
- [ADR 0019 — Draw weight engine](../../adr/0019-draw-weight-engine.md)
- Documentation V2 : [index](../README.md)
