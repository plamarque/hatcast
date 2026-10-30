---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - ../../specs/spec-association-groups/SPEC.md
  - ../../specs/spec-association-groups/glossary.md
  - ../../specs/spec-association-groups/brownfield.md
  - ../../specs/spec-association-groups/configuration-contract.md
  - ../../specs/spec-association-groups/open-decisions.md
  - ../../specs/spec-association-groups/.memlog.md
  - ../architecture/architecture-association-groups-2026-10-27/ARCHITECTURE-SPINE.md
  - ../architecture/architecture-association-groups-2026-10-27/.memlog.md
  - ../architecture/architecture-association-groups-2026-10-27/reviews/review-rubric.md
  - ../architecture/architecture-association-groups-2026-10-27/reviews/review-adversary.md
  - ../architecture/architecture-association-groups-2026-10-27/reviews/review-reality.md
  - ../../../docs/v2/technical/FRONTEND_UI.md
---

# HatCast — Découpage association-groups

## Vue d’ensemble

Découpage validé en un epic et onze stories ; les étapes préparatoires 23.3a et 23.8a précèdent les activations complètes 23.3 et 23.8. Les identifiants CAP et AD sont conservés ; les exigences transverses ci-dessous sont des regroupements de lecture, pas de nouvelles décisions produit.

## Inventaire des exigences

### Exigences fonctionnelles

- **CAP-1 — Vocabulaire générique :** employer Groupe, Événement, Type et Sélection dans les interfaces existantes et nouvelles, noms accessibles, aides, notifications et messages générés ; préserver contenus utilisateur et traces d’audit.
- **CAP-2 — Identité et navigation :** afficher nom et logo du groupe résolu avec repli accessible et lisibilité mobile ; groupe, saison et statistiques partagent le contexte autorisé, y compris au changement de groupe et en cas de données indisponibles.
- **CAP-3 — Tirage facultatif :** défaut par groupe résolu pour chaque nouvel événement ; sans tirage, interdire tirage et simulations dans l’API et masquer formules, calculs et informations de chance, y compris dans le choix manuel ; conserver affectation, publication, couleurs de participation, catégories et statistiques.
- **CAP-4 — Rôles et préférences :** catalogues autonomes par groupe initialisés depuis les modèles existants ; créer, renommer et archiver sans impact intergroupe, avec identités et références historiques stables ; préserver les besoins déjà offerts après archivage ; préférences par adhésion, initialisées sans changer leur sens ; statistiques par rôle, total par personne compté une fois par événement, regroupements théâtre préservés.
- **CAP-5 — Types :** catalogue autonome par groupe, création, renommage et archivage avec identité stable ; chaque type fournit besoins par défaut et choix de confirmation à trois valeurs ; besoins propres à l’événement éditables et non écrasés silencieusement ; types et catégories restent distincts.
- **CAP-6 — Bénévolat :** défaut de groupe seul, obligatoire ou facultatif pour les nouveaux événements ; en facultatif, candidatures joueur seul, bénévole seul ou les deux valides si les rôles sont offerts, pour soi comme par proxy ; rôles non offerts indisponibles.
- **CAP-7 — Confirmation facultative :** choix par type avec défaut de groupe et règle effective durable ; sans confirmation, validation établit un engagement « sélectionné », notifié sans tâche ni demande de confirmation, avec désistement ; déverrouillage préserve les engagements, revalidation inchangée silencieuse, retrait non inversé et remplacement validé notifié aux personnes entrante et sortante ; aucune présence réelle ni acceptation fictive déduite.
- **CAP-9 — Vocabulaire par groupe :** personnaliser uniquement Groupe, Événement, Type et Sélection ; rôles nommés dans leur catalogue, repli sur les formes communes, chrome multigroupe commun, contexte propre par élément ; Saison, Dispos et Équipe inchangés par implication.
- **CAP-8 / Q-5 et CAP-10 / Q-4 — différés :** séries d’événements et participation simple sans sélection sont hors epic actif jusqu’à confirmation du besoin ; aucun mécanisme préparatoire dédié.

### Exigences non fonctionnelles et de préservation

- **NFR-1 — Continuité :** conserver identités, accès, adhésions, données théâtre, événements, disponibilités, affectations, historique, audit et snapshots de chances ; pas de réinterprétation silencieuse.
- **NFR-2 — Isolation et sécurité :** dériver l’autorité du groupe depuis événement, saison ou adhésion et les permissions existantes ; vérifier chaque référence ; agrégats multigroupes résolus par élément ; mutations et audit transactionnels, notifications après commit (AD-14).
- **NFR-3 — Stabilité temporelle :** les règles effectives et besoins résolus à la création ne sont pas modifiés par les défauts ultérieurs ni par un changement de type ; aucun éditeur implicite de règle de confirmation ou de bénévolat par événement (AD-13).
- **NFR-4 — Compatibilité :** préserver clés historiques et cas spéciaux dont `deplacement`, préférences vides dynamiques « tous les rôles » et disponibilités wildcard ; préparer correspondance, vérifications, transition mixte et retour arrière, y compris anciens clients PWA et lecteurs d’état (AD-15).
- **NFR-5 — Accessibilité et responsive :** mobile-first et desktop, Material 3 et tokens, navigation clavier, noms accessibles, contrastes et sens indépendant de la couleur ; appliquer la checklist UX-DR11.
- **NFR-6 — Cohérence :** UI et exports partagent le calcul statistique ; les états sélectionné et confirmé restent distincts, sans déduction de présence réelle ; les données d’un groupe ne contaminent pas un autre.

### Exigences architecturales complémentaires

- **AD-1 :** évolution ciblée de la V2 Angular / Kotlin-Spring / PostgreSQL existante, sans fork par activité, moteur générique ni infrastructure nouvelle.
- **AD-2 / AD-3 / AD-5 :** identités indépendantes des libellés, non recyclées ; catalogues persistants autonomes, sans héritage dynamique ; archives résolubles pour références et besoins existants, exclues des nouveaux choix.
- **AD-6 :** préférences portées par adhésion ; ancienne mutation globale ambiguë échoue explicitement et ne propage plus ; préparer transition des anciens clients.
- **AD-7 / AD-8 :** préserver calculs et regroupements théâtre, candidatures wildcard et parité existante ; rôles ajoutés comptés et éligibles au tirage autorisé, sans classification implicite ; ordre historique puis ordre stable du catalogue avec départage par identité, exclusions inter-rôles conservées.
- **AD-9 :** nouveaux groupes initialisés avec tirage autorisé, bénévolat obligatoire si proposé et confirmation requise par défaut.
- **AD-10 :** formes grammaticales explicites avec repli commun, y compris messages serveur et accessibilité ; ne pas réécrire audit ni contenu rédigé.
- **AD-4 / AD-11 / AD-12 :** statut persistant `SELECTED`, API `selected`, distinct de `CONFIRMED` et du brouillon ; engagements et équipe complète reconnus sans libellé fictif ; proxy, retrait, notifications, tâches, rappels et lecteurs cohérents.
- **AD-13 / AD-14 / AD-15 :** résolution serveur transactionnelle sur vue cohérente, autorisation contextualisée et transition compatible documentée avant toute opération réelle. Aucune migration exécutée dans ce cadrage.

### Exigences UX

- **UX-1 :** afficher nom et logo du groupe avec repli accessible, lisibles sur téléphone ; conserver un contexte cohérent et autorisé pour navigation et raccourcis.
- **UX-2 :** appliquer les mots communs et personnalisés aux libellés, formes grammaticales, aides, erreurs, noms accessibles et messages ; employer les mots communs pour le chrome multigroupe.
- **UX-3 :** sans tirage, retirer les commandes de tirage et formule et toute présentation de chance, sans masquer les actions manuelles, catégories, filtres ou états de participation.
- **UX-4 :** distinguer clairement sélectionné, confirmé, en attente et retrait sans dépendre uniquement de la couleur ; ne pas proposer d’action de confirmation aux sélectionnés sans confirmation.
- **UX-5 :** fournir les réglages autorisés de groupe, catalogues, préférences et type avec états d’erreur, repli, archivage et besoins existants compréhensibles ; composants Material, tokens, clavier et cibles tactiles selon UX-DR11.
- **UX-6 :** conserver les parcours et composants de disponibilité self/proxy, leur comportement mobile et les règles de participation applicables à chaque événement.

### Carte de couverture

Couverture par story : CAP-1 → 23.1 et 23.9 ; CAP-2 → 23.2 ; CAP-3 → 23.3 et 23.6 ; CAP-4 → 23.3a, 23.3, 23.4 et 23.6 ; CAP-5 → 23.5 et 23.8 ; CAP-6 → 23.7 ; CAP-7 → 23.8a et 23.8 ; CAP-9 → 23.9. UX-1 → 23.2 ; UX-2 → 23.1 et 23.9 ; UX-3 → 23.6 ; UX-4 → 23.8 ; UX-5 → 23.3, 23.4, 23.5 et 23.9 ; UX-6 → 23.7.

- **CAP-1 → Epic association-groups :** vocabulaire commun
- **CAP-2 → Epic association-groups :** identité et navigation
- **CAP-3 → Epic association-groups :** tirage facultatif
- **CAP-4 → Epic association-groups :** rôles, préférences et statistiques
- **CAP-5 → Epic association-groups :** types et besoins
- **CAP-6 → Epic association-groups :** bénévolat facultatif
- **CAP-7 → Epic association-groups :** confirmation facultative
- **CAP-9 → Epic association-groups :** vocabulaire par groupe
- **CAP-8 et CAP-10 :** différés, hors epic actif.

## Epic et stories

## Epic 23 : Organiser les activités de son association avec HatCast

Les associations configurent leurs rôles, types, règles et vocabulaire, recueillent les disponibilités et organisent leurs sélections avec ou sans tirage et confirmation, en préservant les usages et données théâtre.

**Capacités :** CAP-1 à CAP-7 et CAP-9. Les stories seront livrables progressivement ; le vocabulaire commun et la navigation viennent en premier.

### Story 23.1 : Employer un vocabulaire commun aux associations

En tant que membre ou organisateur, je veux retrouver des termes compréhensibles pour mon association, afin d’utiliser HatCast sans devoir transposer le vocabulaire du théâtre.

**Références :** CAP-1, AD-1, AD-10, UX-DR11.

**Critères d’acceptation :**

1. **Étant donné** une interface HatCast V2, **lorsque** j’accède aux parcours existants ou à un événement ancien, **alors** les libellés communs utilisent « Groupe », « Événement », « Type » et « Sélection » à la place de « Troupe », « Spectacle », « Format » et « Compo/Composition », avec les formes grammaticales adaptées au contexte.
2. **Étant donné** un contrôle, une aide, une erreur ou un état vide, **lorsque** son libellé concerne l’un de ces concepts, **alors** son texte visible et son nom accessible utilisent le même vocabulaire commun.
3. **Étant donné** une notification ou un message généré, **lorsqu’il** emploie l’un de ces concepts, **alors** il utilise également le vocabulaire commun.
4. **Étant donné** un contenu rédigé par un utilisateur ou une trace d’audit historique, **lorsque** la nouvelle version est utilisée, **alors** ce contenu et cette trace restent inchangés. Les routes, identifiants techniques et données existantes n’ont pas à être renommés pour modifier les libellés.
5. **Étant donné** un groupe de théâtre existant, **lorsque** ses membres utilisent les parcours concernés, **alors** leurs accès, données et comportements restent inchangés ; la modification de vocabulaire respecte la checklist Material 3 et l’accessibilité de HatCast.

**Acceptance Criteria — Material 3 (UI) :** appliquer M3-1 à M3-5 du modèle de story et la checklist `docs/v2/technical/FRONTEND_UI.md` aux surfaces modifiées ; documenter les points non applicables ou dérogations.

### Story 23.2 : Reconnaître son groupe dans la navigation

En tant que membre de plusieurs groupes, je veux voir l’identité du groupe auquel mène le menu, afin de naviguer vers le bon groupe, sa saison et ses statistiques en confiance.

**Références :** CAP-2, AD-10, AD-14, UX-DR11.

**Critères d’acceptation :**

1. **Étant donné** un groupe accessible résolu, **lorsque** le menu de groupe est affiché, **alors** son déclencheur présente le nom et le logo ou l’icône de ce groupe, avec un nom accessible explicite.
2. **Étant donné** un logo absent ou indisponible, **lorsque** le déclencheur est affiché, **alors** un repli accessible permet toujours d’identifier le groupe. Sur mobile, son nom reste lisible et les contrôles restent utilisables.
3. **Étant donné** le contexte de groupe autorisé, **lorsque** j’ouvre les destinations Groupe, Saison ou Statistiques, **alors** chacune correspond à ce même contexte et respecte les droits existants.
4. **Étant donné** un changement de groupe, **lorsque** la navigation est résolue à nouveau, **alors** l’identité et les destinations reflètent le nouveau contexte autorisé, sans afficher les données du groupe précédent.
5. **Étant donné** un chargement en cours, un échec ou une saison indisponible, **lorsque** le contexte ne peut pas être résolu, **alors** l’interface présente un état adapté et ne propose pas une destination fondée sur un contexte périmé ou non autorisé.
6. **Étant donné** un événement dans une vue multigroupe, **lorsque** ses données sont affichées ou ouvertes, **alors** son propre groupe autorisé détermine son contexte, indépendamment du dernier groupe mémorisé dans la navigation.

**Acceptance Criteria — Material 3 (UI) :** appliquer M3-1 à M3-5 du modèle de story et la checklist `docs/v2/technical/FRONTEND_UI.md` aux surfaces modifiées ; documenter les points non applicables ou dérogations.

### Story 23.3a : Préparer les catalogues de rôles par groupe

En tant que responsable technique, je veux préparer des catalogues de rôles propres à chaque groupe, afin de préserver les données existantes avant d’activer les rôles personnalisés.

**Références :** CAP-4, AD-2, AD-3, AD-5, AD-14, AD-15.

**Critères d’acceptation :**

1. Chaque groupe nouveau ou existant dispose de définitions autonomes initialisées depuis les modèles existants ; leurs identités restent stables et les clés historiques conservent leur sens.
2. Les références sont résolues et vérifiées dans le contexte du groupe autorisé. Les données, affectations, historiques et audits existants sont préservés ; une correspondance vérifiable, une transition compatible et un retour arrière sont préparés avant toute opération réelle.
3. Les définitions archivées restent résolubles pour les références existantes et les besoins déjà offerts restent utilisables.
4. Cette étape ne propose pas de nouveaux rôles personnalisés dans les événements ni ne permet leur activation par un autre chemin avant la livraison complète de 23.3. Les rôles historiques restent utilisables comme auparavant.

**UI : N/A** — préparation technique sans nouvelle interface.

### Story 23.3 : Gérer les rôles de son groupe

En tant qu’administrateur de groupe, je veux créer, renommer et archiver les rôles propres à mon groupe, afin de décrire ses activités sans modifier les rôles des autres groupes.

**Références :** CAP-4, AD-2, AD-3, AD-5, AD-7, AD-8, AD-14, AD-15, UX-DR11. **Prérequis :** 23.3a.

Les nouveaux rôles ne sont activés qu’avec la prise en charge complète des parcours et statistiques ci-dessous.

**Critères d’acceptation :**

1. **Étant donné** un groupe nouveau ou existant, **lorsque** son catalogue est initialisé, **alors** il contient ses propres définitions issues des modèles existants. Une modification ultérieure des modèles ou d’un autre groupe ne modifie pas ce catalogue.
2. **Étant donné** les droits d’administration existants, **lorsque** je crée ou renomme un rôle, **alors** il possède une identité stable, indépendante de son libellé ; le nom courant apparaît dans les vues courantes et les traces d’audit historiques restent intactes.
3. **Étant donné** un rôle archivé, **lorsque** je crée de nouveaux besoins, **alors** il n’est plus proposé. Les besoins déjà offerts dans les événements existants restent lisibles et utilisables pour les candidatures et affectations ; aucune place ni donnée n’est supprimée.
4. **Étant donné** deux groupes, **lorsque** une définition est créée, modifiée ou archivée dans l’un, **alors** le catalogue et les références de l’autre restent inchangés. L’API rejette une référence qui n’appartient pas au groupe autorisé.
5. **Étant donné** les rôles et événements historiques, **lorsque** le catalogue est introduit, **alors** les clés et leur sens, les affectations, l’historique et l’audit sont préservés. La transition prévoit une correspondance vérifiable et un retour arrière avant toute exécution réelle.
6. **Étant donné** un rôle ajouté, **lorsqu’il** est proposé sur un événement, **alors** il ne reçoit pas implicitement la sémantique `player` ou `volunteer`. Les rôles historiques continuent de fonctionner comme auparavant.

7. **Étant donné** un rôle personnalisé offert sur un événement, **lorsque** ses besoins, disponibilités, affectations manuelles et tirages sont utilisés, **alors** tous ces parcours le prennent en charge dès cette livraison, avec les facteurs communs, son historique propre, l’ordre historique suivi de l’ordre stable du catalogue et les exclusions inter-rôles existantes ; il n’est pas assimilé à `player` ou `volunteer` et la parité conserve son périmètre.
8. **Étant donné** un rôle historique ou personnalisé, **lorsque** les statistiques ou exports sont consultés, **alors** disponibilités, sélections et retraits sont calculés par rôle avec le libellé courant ; une personne multirôle compte au plus une fois par événement dans le total, sans perdre ses compteurs par rôle.
9. **Étant donné** les données théâtre, les réponses wildcard et les catégories, **lorsque** statistiques et exports sont calculés, **alors** les prédicats, regroupements Jeu, Décorum et Bénévolat et filtres historiques sont préservés ; les rôles ajoutés ne sont pas classés implicitement, aucun rôle ni donnée ne fuit entre groupes et un calcul commun alimente interface et exports. Une sélection ne prouve pas une présence réelle.

**Acceptance Criteria — Material 3 (UI) :** appliquer M3-1 à M3-5 du modèle de story et la checklist `docs/v2/technical/FRONTEND_UI.md` aux surfaces modifiées ; documenter les points non applicables ou dérogations.

### Story 23.4 : Choisir ses rôles préférés pour chaque groupe

En tant que membre de plusieurs groupes, je veux définir mes préférences de rôles séparément dans chacun, afin que mes choix correspondent aux activités de chaque association.

**Références :** CAP-4, AD-3, AD-6, AD-14, AD-15, UX-DR11.

**Critères d’acceptation :**

1. **Étant donné** que j’accède aux préférences de rôles depuis un contexte de groupe identifié, **lorsque** je les consulte ou les modifie, **alors** l’interface indique clairement le groupe concerné et présente ses rôles et mes préférences pour cette adhésion.
2. **Étant donné** deux adhésions, **lorsque** je modifie mes préférences dans l’une, **alors** celles de l’autre restent inchangées. Une référence à un rôle d’un autre groupe est rejetée par l’API.
3. **Étant donné** des préférences historiques explicites, **lorsque** les préférences par groupe sont initialisées, **alors** elles conservent leur signification. Une préférence historique vide continue de signifier tous les rôles du groupe, y compris les rôles ajoutés ultérieurement.
4. **Étant donné** un ancien client ou une requête sans contexte de groupe, **lorsqu’une** modification de préférences est ambiguë, **alors** elle échoue explicitement sans écraser les préférences des adhésions. La transition de ces clients est définie avant déploiement.
5. **Étant donné** un rôle archivé ou une réponse historique wildcard, **lorsque** les préférences et disponibilités existantes sont lues, **alors** leur sens et les références historiques sont préservés ; les nouveaux choix respectent le catalogue actif.
6. **Étant donné** que j’appartiens à plusieurs groupes, **lorsque** j’accède aux préférences de chacun, **alors** je peux identifier sans ambiguïté le groupe concerné et modifier ses préférences séparément. Mon nom et mon genre restent communs à mon profil.

Le chemin précis — sélecteur dans les préférences ou accès depuis chaque groupe — est à concevoir ; il doit rester clair et praticable pour tous les groupes accessibles.

**Acceptance Criteria — Material 3 (UI) :** appliquer M3-1 à M3-5 du modèle de story et la checklist `docs/v2/technical/FRONTEND_UI.md` aux surfaces modifiées ; documenter les points non applicables ou dérogations.

### Story 23.5 : Définir les types d’événements de son groupe

En tant qu’administrateur de groupe, je veux gérer des types d’événements adaptés à nos activités, afin de réutiliser des besoins de rôles sans configurer chaque événement à partir de zéro.

**Références :** CAP-5, AD-2, AD-3, AD-5, AD-13, AD-14, AD-15, UX-DR11.

**Critères d’acceptation :**

1. **Étant donné** un groupe nouveau ou existant, **lorsque** son catalogue est initialisé, **alors** il possède ses propres types issus des modèles existants, sans héritage dynamique des modifications ultérieures des modèles ou des autres groupes.
2. **Étant donné** les droits d’administration existants, **lorsque** je crée, renomme ou archive un type, **alors** son identité reste stable et n’est jamais recyclée. Son nom courant apparaît dans les vues courantes, tandis que l’audit historique est préservé.
3. **Étant donné** un type actif, **lorsque** je définis ses besoins de rôles par défaut, **alors** seuls les rôles autorisés de ce groupe sont proposés. Le type reste distinct de la catégorie de l’événement.
4. **Étant donné** un nouvel événement individuel, **lorsque** je choisis un type, **alors** ses besoins sont repris comme valeurs initiales et restent modifiables pour cet événement. Des besoins explicitement fournis et valides sont respectés.
5. **Étant donné** un événement existant, **lorsque** les besoins par défaut de son type changent ou que je change son type, **alors** ses besoins ne sont pas réinitialisés silencieusement.
6. **Étant donné** un type archivé, **lorsque** je crée un événement, **alors** il n’est plus proposé ; les événements qui le référencent restent lisibles et utilisables. Les clés et comportements historiques, notamment ceux de `deplacement`, sont préservés.
7. **Étant donné** plusieurs groupes, **lorsqu’un** type est modifié dans l’un, **alors** les autres catalogues restent inchangés et l’API refuse toute référence hors du groupe autorisé.

Le choix de confirmation associé au type est introduit avec le parcours de confirmation facultative, sans changement rétroactif des événements existants.

**Acceptance Criteria — Material 3 (UI) :** appliquer M3-1 à M3-5 du modèle de story et la checklist `docs/v2/technical/FRONTEND_UI.md` aux surfaces modifiées ; documenter les points non applicables ou dérogations.

### Story 23.6 : Organiser une sélection sans tirage et régler la priorité des rôles

En tant qu’administrateur de groupe, je veux désactiver le tirage pour les nouveaux événements ou régler la priorité des rôles lorsqu’il est actif, afin d’organiser les sélections selon les besoins de mon association.

**Références :** CAP-3, CAP-4, AD-7, AD-8, AD-9, AD-13, AD-14, AD-15, UX-DR11.

**Critères d’acceptation :**

1. **Étant donné** un nouveau groupe, **lorsqu’il** est créé, **alors** le tirage est autorisé par défaut. Un administrateur autorisé peut modifier ce défaut pour les nouveaux événements.
2. **Étant donné** le défaut de tirage du groupe, **lorsqu’un** événement individuel est créé, **alors** le serveur résout et conserve sa règle effective. Un changement ultérieur du défaut ne modifie pas le comportement des événements existants.
3. **Étant donné** un événement dont le tirage est désactivé, **lorsqu’un** utilisateur consulte ses parcours, **alors** les commandes de tirage et de simulation, choix de formule, pourcentages, couleurs de probabilité et explications de chance ne sont pas présentés, y compris dans le choix manuel de candidats.
4. **Étant donné** ce même événement, **lorsqu’une** requête tente d’exécuter ou de simuler un tirage, **alors** l’API la refuse ; les parcours de candidats ne divulguent pas de données de chance tout en restant utilisables pour l’affectation manuelle.
5. **Étant donné** un événement sans tirage, **lorsque** l’organisateur prépare et publie sa sélection, **alors** l’affectation manuelle, les couleurs de participation, la gestion des catégories et leurs filtres statistiques restent disponibles.
6. **Étant donné** les paramètres de tirage, **lorsqu’un** administrateur autorisé consulte ou modifie la priorité des rôles, **alors** une section dédiée affiche leur ordre et explique que les rôles traités en premier peuvent réduire les candidatures disponibles pour les suivants. Le nouvel ordre s’applique aux tirages et simulations futurs ; les résultats et snapshots déjà enregistrés ne sont pas réécrits.
7. **Étant donné** un groupe sans ordre personnalisé, **lorsqu’un** tirage ou une simulation est effectué, **alors** les rôles historiques conservent leur ordre existant et les rôles ajoutés suivent l’ordre stable du catalogue avec départage par identité. Tous les rôles offerts sont inclus ; facteurs communs, historique propre, exclusions entre rôles et périmètre de parité existant sont préservés.
8. **Étant donné** des événements théâtre existants, **lorsque** cette capacité est introduite, **alors** leurs règles, données et snapshots historiques de chances sont préservés ; la transition et le retour arrière sont documentés avant toute opération réelle.

**Décision Patrice du 27 octobre 2026 :** priorité modifiable dans un réglage dédié au tirage ; ordre décrit par AD-8 utilisé comme valeur initiale. Cette décision fait évoluer AD-8 ; le contrat d’architecture est aligné sur cette décision.

**Acceptance Criteria — Material 3 (UI) :** appliquer M3-1 à M3-5 du modèle de story et la checklist `docs/v2/technical/FRONTEND_UI.md` aux surfaces modifiées ; documenter les points non applicables ou dérogations.

### Story 23.7 : Rendre le bénévolat facultatif

En tant qu’administrateur de groupe, je veux décider si une disponibilité implique aussi une candidature bénévole, afin que les membres puissent répondre selon l’organisation de leur association.

**Références :** CAP-6, AD-9, AD-13, AD-14, AD-15, UX-DR11.

**Critères d’acceptation :**

1. **Étant donné** un nouveau groupe, **lorsqu’il** est créé, **alors** le bénévolat est obligatoire par défaut lorsque l’événement propose des places bénévoles. Un administrateur autorisé peut rendre cette obligation facultative pour les nouveaux événements.
2. **Étant donné** le réglage du groupe, **lorsqu’un** événement individuel est créé, **alors** le serveur résout et conserve sa règle effective. Modifier le réglage ne change ni les événements existants ni leurs réponses. Aucun réglage distinct n’est ajouté au type ou à l’événement.
3. **Étant donné** un événement où le bénévolat est facultatif et où les rôles correspondants sont offerts, **lorsqu’une** disponibilité est saisie pour soi ou par proxy, **alors** les candidatures joueur seul, bénévole seul et les deux sont acceptées selon les mêmes règles.
4. **Étant donné** un rôle non offert sur l’événement, **lorsqu’une** disponibilité est saisie, **alors** ce rôle ne peut pas être choisi. Les rôles personnalisés ne sont pas automatiquement assimilés à `player` ou `volunteer`.
5. **Étant donné** un événement dont la règle effective conserve le bénévolat obligatoire, **lorsqu’une** disponibilité est saisie pour soi ou par proxy, **alors** le comportement historique applicable est conservé. Les réponses historiques, notamment wildcard, ne sont pas réécrites lors de leur lecture.
6. **Étant donné** les formulaires de disponibilité, **lorsque** l’utilisateur répond sur mobile ou au clavier, **alors** les choix et éventuelles obligations sont compréhensibles et accessibles, conformément à la checklist Material 3.

**Acceptance Criteria — Material 3 (UI) :** appliquer M3-1 à M3-5 du modèle de story et la checklist `docs/v2/technical/FRONTEND_UI.md` aux surfaces modifiées ; documenter les points non applicables ou dérogations.

### Story 23.8a : Préparer la compatibilité de l’état sélectionné

En tant que responsable technique, je veux préparer les lecteurs et clients à l’état sélectionné, afin de pouvoir activer la sélection sans confirmation sans transition incompatible.

**Références :** CAP-7, AD-4, AD-11, AD-12, AD-14, AD-15.

**Critères d’acceptation :**

1. Les API et lecteurs concernés, notamment interface, agenda, statistiques, tâches, rappels et notifications, sont inventoriés et préparés à traiter explicitement `SELECTED` / `selected` comme engagement distinct de `CONFIRMED`, sans déduire une présence réelle.
2. La compatibilité des anciens clients PWA, la transition mixte, les vérifications et le retour arrière sont définis et vérifiés avant toute écriture de `SELECTED` ; une transition incompatible est empêchée.
3. Aucun événement ne produit `SELECTED` et aucune option de confirmation facultative n’est activée dans cette étape. Le parcours de confirmation existant et sa provenance proxy restent inchangés.

**UI : N/A** pour l’activation produit ; les adaptations nécessaires aux lecteurs UI respectent la checklist Material 3 lorsque applicable.

### Story 23.8 : Sélectionner sans demander de confirmation

En tant qu’organisateur, je veux pouvoir valider une sélection sans demander une seconde réponse aux personnes choisies, afin de respecter le fonctionnement de mon groupe tout en les informant.

**Références :** CAP-5, CAP-7, AD-4, AD-9, AD-11 à AD-15, UX-DR11. **Prérequis :** 23.8a.

L’activation de `SELECTED` et du parcours sans confirmation intervient ensemble après vérification de la transition.

**Critères d’acceptation :**

1. **Étant donné** les réglages du groupe et d’un type, **lorsqu’un** administrateur les configure, **alors** le groupe possède un défaut de confirmation et le type peut choisir hériter, requise ou non requise. La confirmation est requise par défaut pour un nouveau groupe.
2. **Étant donné** ces réglages, **lorsqu’un** événement individuel est créé, **alors** le serveur résout et conserve sa règle effective. Les modifications ultérieures des défauts ou du type ne la changent pas ; aucun éditeur de confirmation par événement n’est ajouté.
3. **Étant donné** un événement sans confirmation, **lorsque** l’organisateur valide une affectation, **alors** celle-ci devient un engagement persistant `SELECTED`, exposé `selected` et présenté comme sélectionné, distinct de `CONFIRMED`. La personne est informée après validation, sans tâche, demande ni rappel de confirmation.
4. **Étant donné** une équipe dont les places requises sont engagées ou dispensées, **lorsque** son état est affiché, **alors** elle peut être complète sans prétendre que toutes les personnes ont confirmé. Aucune action de confirmation, y compris par proxy ou agenda, n’est proposée ni acceptée par l’API pour cet événement.
5. **Étant donné** une sélection validée sans confirmation, **lorsqu’elle** est déverrouillée puis revalidée sans changement, **alors** les engagements sont conservés et aucune nouvelle notification n’est envoyée. Les modifications de brouillon restent silencieuses.
6. **Étant donné** une personne sélectionnée qui se désiste, **lorsqu’elle** se retire, **alors** sa place est libérée et son retrait reste dans l’historique ; une revalidation ne la réaffecte pas silencieusement. Une nouvelle affectation devient un engagement après validation explicite.
7. **Étant donné** un remplacement, **lorsqu’il** est validé, **alors** la personne entrante et la personne sortante sont informées après la transaction. Le remplissage autorisé d’une place libre dans une sélection déjà validée suit la même règle de validation explicite.
8. **Étant donné** un événement nécessitant une confirmation, **lorsque** le parcours existant est utilisé, **alors** les confirmations, y compris par proxy avec leur provenance, gardent leur sens et leur fonctionnement. Ni sélection ni confirmation ne prouve la présence réelle.
9. **Étant donné** les API, lecteurs, statistiques, notifications et clients PWA existants, **lorsque** ce nouvel état est introduit, **alors** leur compatibilité et le retour arrière sont préparés avant toute écriture de `SELECTED` ; une transition mixte incompatible est empêchée.

**Acceptance Criteria — Material 3 (UI) :** appliquer M3-1 à M3-5 du modèle de story et la checklist `docs/v2/technical/FRONTEND_UI.md` aux surfaces modifiées ; documenter les points non applicables ou dérogations.

### Story 23.9 : Adapter le vocabulaire à son groupe

En tant qu’administrateur de groupe, je veux personnaliser quelques mots utilisés pour notre activité, afin que les membres retrouvent un vocabulaire familier.

**Références :** CAP-1, CAP-9, AD-10, AD-14, UX-DR11.

**Critères d’acceptation :**

1. **Étant donné** les droits d’administration du groupe, **lorsque** je configure son vocabulaire, **alors** je peux personnaliser les concepts Groupe, Événement, Type et Sélection. Les noms de rôles restent gérés dans leur catalogue ; Saison, Dispos et Équipe ne changent pas par implication.
2. **Étant donné** les formes grammaticales nécessaires à l’interface, **lorsque** je renseigne les termes du groupe, **alors** leurs formes explicites peuvent être utilisées sans construire une phrase incorrecte. Une forme absente utilise la forme commune correspondante.
3. **Étant donné** une surface, notification ou un message généré clairement rattaché à un groupe, **lorsqu’il** est affiché ou produit, **alors** il utilise les termes de ce groupe, y compris dans les noms accessibles, aides et erreurs.
4. **Étant donné** une vue multigroupe ou un contenu sans groupe univoque, **lorsqu’il** est affiché, **alors** son chrome utilise les termes communs. Chaque élément associé clairement à un groupe utilise les termes de ce groupe, sans reprendre ceux d’un autre groupe.
5. **Étant donné** un contenu rédigé par un utilisateur ou une trace d’audit historique, **lorsque** le vocabulaire est modifié, **alors** ce contenu et cette trace ne sont pas réécrits.
6. **Étant donné** deux groupes, **lorsqu’un** administrateur modifie le vocabulaire de l’un, **alors** les termes de l’autre restent inchangés et les règles d’accès existantes sont respectées.

La présentation précise des formes grammaticales reste à concevoir dans le respect de ce contrat.

**Acceptance Criteria — Material 3 (UI) :** appliquer M3-1 à M3-5 du modèle de story et la checklist `docs/v2/technical/FRONTEND_UI.md` aux surfaces modifiées ; documenter les points non applicables ou dérogations.
