# PRD Quality Review — Calendrier de l’Avent La Malice

## Overall verdict
Le PRD porte clairement l’intention, les règles et les parcours convenus et constitue une base solide pour l’UX et l’architecture. Quelques frontières temporelles et états de consultation restent à clarifier pour éviter des interprétations divergentes ; leur résolution ne remet pas en cause la vision.

## Decision-readiness — adequate
Les arbitrages de rattrapage, d’accès et d’exclusion des organisateurs sont explicites ; des points d’exécution sont transmis aux disciplines suivantes.

### Findings
- **[medium]** États de consultation après le 25 (§ FR-9–10) — Les réponses cessent, mais le document ne dit pas explicitement si le calendrier et les cases passées restent consultables, ni si la bonne réponse d’une case non jouée est révélée. *Fix :* identifier cette décision pour l’UX et le propriétaire produit, sans inventer la réponse.

## Substance over theater — strong
La vision et les indicateurs reflètent l’animation réelle et les retours informels demandés ; les parcours servent directement les exigences.

## Strategic coherence — strong
Le jeu quotidien, les rattrapages et les portraits concourent à la découverte mutuelle et à la cohésion ; le classement et son contrepoids sont alignés avec le plaisir.

## Done-ness clarity — adequate
Les exigences sont généralement vérifiables, en particulier le barème, les accès et le test isolé.

### Findings
- **[medium]** Dernière minute de jeu (§ Définitions) — « au plus tard le 25 décembre à 23 h 59 » peut exclure les 60 dernières secondes alors que la règle convenue est jusqu’à minuit. *Fix :* dire « avant le 26 décembre à 00 h, heure de Paris ».
- **[medium]** Questions en attente (§ FR-10 et FR-12) — Le texte « pas de quiz aujourd’hui » sur une case passée peut laisser croire que le quiz courant manque ; le 25, l’invitation à revenir demain contredit le message de Noël. *Fix :* transmettre à l’UX le choix des libellés selon la date consultée et le 25, en conservant le placeholder demandé.
- **[low]** Rangs ex æquo (§ FR-8) — La numérotation suivant des égalités n’est pas définie (1, 1, 3 ou 1, 1, 2). *Fix :* laisser explicitement ce détail à préciser avant l’implémentation.

## Scope honesty — adequate
Les exclusions et la publication par release sont claires. Les travaux UX, architecture, mesure et conservation sont explicitement laissés à la suite.

## Downstream usability — adequate
FR-1 à FR-13 et UJ-1 à UJ-3 sont uniques et continus ; les parcours et définitions sont utiles. La numérotation des points ouverts commence à 4 après des suppressions, et FR/UJ ne sont pas croisés formellement.

## Shape fit — strong
Le format, avec parcours de membre et préparation, convient à une mini-application interne qui doit alimenter UX et architecture.

## Mechanical notes
- Corriger la numérotation des points ouverts.
- Vérifier la distinction jour prévu / jour courant et la date limite exclusive dans les livrables suivants.
- Aucune hypothèse marquée explicitement ; les sujets non décidés sont listés en points ouverts.
