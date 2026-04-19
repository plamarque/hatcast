# Interface V2 — Angular Material, CDK et responsive

Ce document fixe les **références officielles** et les **principes d’implémentation** pour le client [`apps/web/`](../../../apps/web/) (Angular + Angular Material). Il complète le PRD / l’architecture produit sous [`_bmad-output/planning-artifacts/`](../../../_bmad-output/planning-artifacts/).

## Documentation officielle

- **Angular Material (composants, guides)** : [material.angular.dev](https://material.angular.dev/)  
  C’est la source normative pour les patterns UI V2 : privilégier au maximum les **composants Material standard** plutôt que des implémentations ad hoc.

## Thème et personnalisation

- Choisir un **thème Material** (préconstruit ou sur mesure), puis le **personnaliser** via le système de theming documenté ici :  
  [Theming — Angular Material](https://material.angular.dev/guide/theming)

## Composants personnalisés

Lorsqu’un besoin ne peut pas être couvert proprement par les composants Material existants :

- S’appuyer sur le **CDK** (primitives sans style imposé) : [CDK — catégories](https://material.angular.dev/cdk/categories)
- Pour le style des composants maison, suivre :  
  [Theming your components](https://material.angular.dev/guide/theming-your-components)  
  afin de rester **aligné sur les tokens / variables de thème** et d’éviter un îlot de CSS incohérent avec le reste de l’app.

## Responsive et mobile-first

**HatCast** vise une utilisation **mobile-first** : les écrans doivent être **pensés et testés d’abord pour les téléphones** (petites largeurs, interactions tactiles, densité lisible).  
L’usage sur **navigateur desktop** reste **pleinement supporté** : layouts adaptatifs (breakpoints, grilles, navigation) pour que l’expérience soit confortable sur grand écran sans dupliquer des parcours métier distincts.

Cette exigence est alignée avec le positionnement produit (PWA, usage sur le terrain) et les NFR d’accessibilité (voir PRD / epics).
