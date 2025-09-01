# TODO List - Hatcast

## Fonctionnalités à implémenter

- [x] Audit trail
- [ ] Bouton Install toujours visible
- [ ] Rappels dispo
- [ ] Rappels spectacle aux sélectionnés
- [ ] Rappel de confirmation
- [ ] Déclenchement de sélection auto à J-X jours
- [ ] Bouton feedback/aide
- [ ] Si connexion depuis home > lister saisons concernées
- [ ] Bug: se déconnecter sur home > icône compte reste

## Bugs à corriger

- [ ] **Fonction de réinitialisation de sélection** : La fonction `handleResetEventSelection` ne fonctionne plus correctement. L'audit est implémenté mais la fonction elle-même n'a pas d'effet. À corriger plus tard.

## Améliorations techniques

- [ ] **Contrainte d'unicité Firestore** : Les disponibilités sont indexées par nom de joueur, créant des conflits si deux joueurs ont le même nom. Solution actuelle : validation côté application dans `addPlayer()`. Amélioration future : ajouter une contrainte d'unicité au niveau Firestore avec des règles de sécurité dans `firestore.rules`. Priorité basse (solution actuelle fonctionne).

---

## Notes
- Ce fichier sert de pense-bête pour les fonctionnalités à développer
- Cocher les éléments au fur et à mesure de leur implémentation
- Ajouter de nouveaux éléments selon les besoins

## Migration Firebase Dynamic Links (avant août 2025)

- [x] Mettre à jour les SDK Firebase vers les dernières versions
- [ ] Migrer vers App Links/Universal Links si nécessaire
- [ ] Tester les nouvelles fonctionnalités d'authentification
