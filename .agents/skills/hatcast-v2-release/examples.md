# Exemples de cutovers validés

Référence ton et granularité — ne pas copier mot pour mot si la release diffère.

## v2.2.0 (extrait)

Source : [`scripts/v2/changelog-entries/v2.2.0-cutover.json`](../../../scripts/v2/changelog-entries/v2.2.0-cutover.json)

```
✨ Équipe — ajoute un participant en le cherchant dans le carnet (membres, externes, saison)
✨ Membres — carnet des externes de la troupe et édition d'un membre par les admins
✨ Externes invités — dispos et agenda limités à ta portée d'invitation (sans accès membre complet)
✨ Composition — déverrouiller conserve les confirmations déjà obtenues
✨ Agenda — confirme ou décline ta participation depuis la grille des dispos
🐛 Dispos — le bon spectacle est présélectionné quand tu renseignes tes disponibilités
🐛 Composition — les alertes ne s'affichent qu'après validation de la compo
```

**Ce qui fonctionne** : préfixe domaine + bénéfice concret ; pas de jargon pipeline / IdP / XSRF.

## v2.1.0 (extrait)

Source : [`scripts/v2/changelog-entries/v2.1.0-cutover.json`](../../../scripts/v2/changelog-entries/v2.1.0-cutover.json)

```
✨ Mon compte — tu peux renseigner ton genre sur ton profil (optionnel)
✨ Composition — alerte si tu enchaînes plusieurs spectacles d'affilée
✨ Infos spectacle — ajoute la date à ton calendrier et ouvre le lieu dans Plans
✨ Tirage — meilleure prise en compte des multi-rôles et des joueurs déjà tirés ailleurs
🔧 Mobile — formulaire d'événement, menu admin et onglet dispos plus confortables
```

## Contre-exemples (à ne pas publier)

```
❌ feat(draw): Migrate past participation malus to factor pipeline
❌ refactor(auth): Move IdP deleteUser to post-commit
❌ fix(api): Publish XSRF cookie after CSRF filter chain
❌ Amélioration de la stabilité et des performances
```
