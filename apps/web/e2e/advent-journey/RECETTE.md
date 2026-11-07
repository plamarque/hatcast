# Recette locale Advent 1–26 décembre

Depuis ce checkout, lancer dans un terminal :

```bash
bash apps/web/e2e/advent-journey/run-journey.sh --run
```

Le lanceur vérifie la disponibilité du front construit, de Chromium, de FFmpeg, du catalogue privé et des ports, puis démarre une API H2 en mémoire isolée. Il demande le mot de passe administrateur dans le terminal : ne jamais le saisir dans une conversation. L’horloge système du Mac est modifiée pendant la recette puis restaurée avec le réglage initial de synchronisation automatique. Garder le Mac allumé et laisser la commande se terminer après le 26 décembre.

Le programme affiche à la fin le répertoire privé contenant `journey.webm` et `evidence.json`. La vidéo utilise des captures successives à cadence fixe ; elle peut contenir des quiz et réponses confidentiels. Ne pas la committer, la publier, ni diffuser son lien publiquement. Vérifier les résultats et la vidéo : un rapport complet ne prouve pas qu’une scène donnée est visible dans le film.

Le nombre de quiz officiels disponibles varie avec le catalogue privé ; les jours sans contribution complète ne sont pas remplacés par des quiz présentés comme officiels. Le profil isolé utilisé ici ne prouve pas l’activation ou la réception d’un rappel push.

En cas d’interruption, de message d’erreur ou de restauration non confirmée, ne pas relancer immédiatement. Vérifier l’heure, le réglage de synchronisation et la présence du journal `/var/db/hatcast-avent-clock/clock-recovery.json`. Si une récupération est nécessaire, consulter `RECOVERY.md` et les instructions actuelles du lanceur avant toute commande. Ne jamais supprimer manuellement un journal pour contourner le garde-fou.

La skill personnelle `$avent-dry-run` guide la préparation, la revue visuelle facultative et l’accès Tailscale privé à la vidéo. Utiliser le lanceur de la révision choisie du dépôt.
