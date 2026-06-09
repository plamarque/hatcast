# Règles éditoriales — notes « Nouveautés » HatCast

Inspiré du [playbook Argil — product updates](https://www.argil.io/playbooks/product/writing-product-updates-and-releases).

## Principes

1. **Résultat avant livrable** — ce que l'utilisateur peut faire ou constater, pas ce que l'équipe a codé.
2. **Test « et alors ? »** — bénéfice évident en 3 secondes, sinon supprimer la ligne.
3. **Titre = bénéfice** — « Confirme ta dispo depuis l'agenda », pas « Nouveau handler de statut ».
4. **Court et scannable** — max 5 puces par version ; une idée par ligne (~120 caractères).
5. **Zéro bruit** — en cas de doute, ne pas inclure. Liste vide acceptable pour une RC technique pure.
6. **Ancrage** — chaque puce doit refléter un changement réel (commit / story / diff), sans invention.

## Inclure

- Nouvelle action ou parcours (connexion, dispos, compo, notifications, compte…)
- Correction d'un bug qui gênait l'usage réel
- Amélioration visible (mobile, clarté, rapidité perçue)

## Exclure

- CI, déploiement, migrations, refactors internes, tests, lint, dépendances
- Noms de fichiers, classes Angular, routes API, ADR, docs techniques
- Ajustements CSS imperceptibles
- « Stabilité / performances » sans exemple concret côté utilisateur
- Sujets de commit traduits mot à mot

## Vocabulaire HatCast (OK)

troupe, ligue, saison, spectacle, disos, compo, MC, DJ, orga, PWA, agenda, carnet, externe, mixité

## Formulations

- Remplacer « modal / modale » par **fenêtre**
- Tutoiement (« tu », « ton »)
- Préfixe domaine optionnel : `✨ Équipe — …`, `🐛 Composition — …`, `✨ Agenda — …`

## Emojis

| Emoji | Usage |
|-------|--------|
| ✨ | Nouveauté utilisateur |
| 🐛 | Correction ressentie |
| 🔧 | Amélioration visible (pas pour du technique invisible) |
