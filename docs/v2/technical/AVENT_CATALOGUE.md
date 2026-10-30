# Catalogue privé des quiz de l’Avent 2026

## Décision et état

Après validation par Patrice, les quiz et leurs affirmations sont préparés directement en base par requêtes. Les bases de développement et de production sont distinctes ; seuls les quiz passent de développement en production, jamais les réponses ou états de test. Les portraits restent dans le bucket privé `gs://impro-selector-avent-content-private/portraits/`. Le contenu réel, les réponses et les portraits ne doivent pas être copiés dans Git, les assets publics, les logs ou les issues.

**La lecture des quiz en base et la procédure de transfert ne sont pas encore réalisées ni vérifiées.** Identifier et vérifier les cibles, les autorisations et la reprise avant toute opération ; la présente page ne fournit pas de requête exécutable. Le contenu et les portraits sont utilisés avec l’accord des personnes concernées. Patrice ne modifie pas les contributions pendant le jeu ; le risque de résultat incohérent en cas de modification exceptionnelle est accepté.

Un fichier JSON privé a été préparé dans le bucket. Il reste privé et n’est pas connecté à une version déployée ; il ne constitue plus la solution de publication retenue. Sa conservation ou son traitement ultérieur reste à décider. Les portraits restent privés et leur accès est contrôlé par l’API.

La future procédure devra décrire la validation des trois affirmations et de la fausse réponse, le ciblage de la bonne base, le transfert des seuls quiz, la vérification du résultat sans divulgation et les conditions de reprise. Elle ne doit jamais transférer les réponses de test. Une présence en base ou dans le bucket ne prouve pas à elle seule que le contenu est accessible dans une version déployée.

Piste proposée : depuis cet espace, un agent ou un script lit les quiz validés en développement et écrit les quiz sélectionnés en production via un accès API approprié. L’outillage Neon disponible permet des requêtes ciblées, mais les accès effectifs et les tables nécessaires restent à vérifier. Cette piste ne nécessite pas a priori une nouvelle interface d’administration HatCast et ne constitue pas une procédure prête à exécuter.
