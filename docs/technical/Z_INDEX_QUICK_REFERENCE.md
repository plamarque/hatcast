# Référence Rapide Z-Index - HatCast

## 🚀 Guide rapide pour les développeurs

### Ajouter un nouveau composant modal

1. **Identifier la catégorie** :
   - **Onboarding** : `z-[1100-1110]`
   - **Principal** : `z-[1010-1070]`
   - **Secondaire** : `z-[1200-1280]`
   - **Sécurité** : `z-[1290-1380]`
   - **Spécialisé** : `z-[1400-1420]`
   - **Critique** : `z-[9990-9999]`

2. **Choisir le prochain z-index disponible** dans la catégorie

3. **Appliquer dans le template** :
   ```vue
   <div class="fixed inset-0 bg-black/50 z-[XXXX]">
   ```

4. **Documenter** dans `Z_INDEX_HIERARCHY.md`

### Z-index les plus utilisés

| Composant | Z-Index | Usage |
|-----------|---------|-------|
| `PlayerModal` | `z-[1050]` | Détails joueur |
| `EventModal` | `z-[1010]` | Création événement |
| `AccountDropdown` | `z-[1250]` | Menu utilisateur |
| `PasswordVerificationModal` | `z-[9995]` | Vérification critique |
| `ToastNotifications` | `z-[9999]` | Notifications |

### Règles importantes

- ✅ **Respecter la hiérarchie** : Ne pas utiliser un z-index plus élevé sans justification
- ✅ **Gaps de sécurité** : Laisser 10-50 points entre les niveaux
- ❌ **Éviter** : `z-[9999]` sauf pour les toasts
- ❌ **Éviter** : Z-index identiques entre composants superposables

### Cas spéciaux

- **Modales imbriquées** : L'enfant doit avoir un z-index plus élevé que le parent
- **Dropdowns dans modales** : Z-index plus élevé que la modale parent
- **Toasts** : Toujours `z-[9999]` pour être visibles

### Debugging

Si un composant n'apparaît pas :
1. Vérifier le z-index dans le template
2. Consulter `Z_INDEX_HIERARCHY.md`
3. Tester avec un z-index temporaire plus élevé
4. Vérifier les conflits avec d'autres composants

---

*Pour plus de détails, voir `Z_INDEX_HIERARCHY.md`*
