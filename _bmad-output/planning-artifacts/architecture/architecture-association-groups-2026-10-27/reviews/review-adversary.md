# Revue adversariale — contrat association-groups

Verdict : **à renforcer avant finalisation**. Les décisions convergent sur le produit, mais plusieurs contrats entre unités peuvent diverger malgré le respect littéral des AD.

## Élevé — état sélectionné et cycle complet

AD-12 demande un état distinct « sélectionné » et son traitement comme engagement ; il ne précise ni son identifiant de transport partagé, ni son effet sur le cycle de sélection, ni son vocabulaire de synthèse. Une unité peut le représenter par `selected`, une autre par `committed`, tandis qu'une troisième peut laisser l'équipe en attente de confirmation ou conserver le badge « Équipe confirmée » pour une sélection entièrement `selected`. Les deux interprétations satisfont littéralement AD-12 mais sont incompatibles et la seconde est trompeuse. Le code actuel (`CompositionLifecycleService.kt`, lignes 88, 112, 135) réserve l'état complet aux slots `CONFIRMED` et affiche « Équipe confirmée » ; le job `AssigneePresenceReminderJob.kt` filtre aussi `CONFIRMED`.

**Renforcement proposé :** un contrat canonique partagé API/persistance/consommateurs pour l'état choisi ; une sélection validée dont les places requises sont remplies par des engagements « sélectionné » / « confirmé » / dispensées peut être complète sans attente ; l'étiquette de synthèse ne dit pas « confirmé » si elle suggère une confirmation fictive ; les rappels préexistants ne doivent pas la réclamer. Préserver explicitement tous les traitements du désistement et de l'historique pour ce nouvel état.

## Élevé — ordre des nouveaux rôles au tirage

AD-8 impose le traitement des nouveaux rôles par les facteurs existants, mais le tri des rôles est explicitement différé. L'algorithme applique une exclusion entre rôles (`CompositionDrawService.kt`, boucle `requiredRoles`, lignes 158–181), donc l'ordre influe sur l'éligibilité et les résultats. Deux unités peuvent choisir ordre alphabétique ou ordre de création tout en respectant le contrat, et produire des résultats et snapshots de chances incompatibles.

**Renforcement proposé :** un ordre canonique déterministe, commun au tirage et à toutes les simulations/explications, préservant l'ordre historique des rôles existants et intégrant chaque rôle ajouté ; identités servant de départage stable. Le choix exact de l'ordre des nouveaux rôles peut être local à condition que sa source partagée, sa persistance et ses effets historiques soient précisés.

## Élevé — préférences dans les API existantes

AD-6 impose les préférences par adhésion mais ne spécifie pas le sort du chemin de compte global ni du chemin membership existants. Une unité peut garder l'API globale comme écriture sur toutes les adhésions ; une autre peut l'interpréter comme groupe courant ; la migration initiale ne résout pas cette divergence ni ne prévient l'écrasement ultérieur. Actuellement `MemberProfileService.updatePreferredRoles` délègue à `UserMemberPreferencesService`, dont `syncActiveMemberships` recopie globalement vers chaque adhésion.

**Renforcement proposé :** une seule autorité d'écriture/lecture des préférences par adhésion ; définir explicitement le comportement compatible de l'API historique globale lorsqu'aucun groupe n'est donné (lecture neutre ou échec explicite de mutation, avec transition versionnée), sans réécriture silencieuse d'autres groupes ; conserver le sens de la liste vide.

## Moyen — définitions archivées dans un événement existant

AD-3 interdit « les nouveaux choix » d'un rôle ou type archivé tout en le conservant résoluble. Une unité peut considérer que rouvrir et sauvegarder un événement existant comportant ce rôle est un nouveau choix et le rejeter ; une autre peut le conserver ou l'effacer. Les résultats divergent et le premier cas peut empêcher les opérations ordinaires sur l'historique.

**Renforcement proposé :** distinguer conservation/lecture de références déjà présentes, permises et sans mutation, d'une nouvelle attribution/sélection de définition archivée ; ne jamais supprimer silencieusement les besoins ou affectations existants. Préciser séparément si un ajout explicite à un événement existant est permis après archivage.

## Moyen — initialisation des besoins et des confirmations

AD-13 impose la résolution transactionnelle, mais ne précise pas que le choix de confirmation du type est trivalent (`hériter`, `requis`, `non requis`) ni que les sources sont lues de manière cohérente si une modification concurrente du groupe ou du type intervient. Les implémentations peuvent utiliser des booléens incompatibles ou produire un événement dont les besoins viennent d'une version et la confirmation d'une autre.

**Renforcement proposé :** contrat explicite de choix du type à trois valeurs et de résolution au moment de la création, cohérente au sein d'une transaction ; les besoins explicitement fournis lors de création restent applicables sous validation existante ; le défaut de groupe bénévolat ne se retrouve jamais au niveau type.

## Moyen — états et statistiques agrégées

AD-7 définit les compteurs par rôle et le total d'événements, sans préciser le traitement des slots en attente vs sélectionnés/confirmés et des réponses wildcard. Une unité peut compter une offre en attente comme sélection, une autre seulement un engagement ; les dénominateurs de disponibilité peuvent exclure les réponses anciennes wildcard malgré AD-15. Cela entraîne des tableaux et exports divergents.

**Renforcement proposé :** réutiliser les prédicats existants de statistiques théâtre pour l'ancien parcours, définir explicitement le prédicat commun et la granularité par rôle des ajouts et réutiliser le même calcul pour UI/export ; en particulier traiter les réponses wildcard par la règle historique et ne pas confondre sélection, acceptation ni présence.
