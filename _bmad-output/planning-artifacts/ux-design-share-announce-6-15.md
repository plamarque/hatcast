---
title: UX — Refonte modales Partager / Annoncer (story 6.15)
author: Sally (UX)
date: '2026-06-03'
status: approved
lastAmended: '2026-06-04'
amendedBy: Patrice (D10 statut canal ; D11 relance dispos gear)
relatedStories:
  - '6.15'
  - '6.10'
  - '6.10b'
  - '6.10c'
  - '3.21'
  - '8.3'
stakeholderDecisions:
  - unified-m3-dialog-shell-not-v1-dark-gradient
  - single-primary-notify-action-with-post-send-summary
  - copy-to-clipboard-alongside-whatsapp
  - extend-anti-spam-beyond-availability-nudge
  - notify-copy-whatsapp-single-row-notifier-first
  - copy-label-short-copier-with-aria-label
  - guard-confirm-on-notify-click-only-no-in-dialog-bandeau
  - no-auto-notif-info-bandeau-in-dialog
  - event-dialog-title-annonce-de-spectacle
  - event-announce-via-event-gear-menu
  - availability-nudge-via-event-gear-menu-relance-dispos
  - stub-notify-snack-demande-enregistree
  - recipient-detail-channel-status-not-obfuscated-email
waivedDecisions:
  - warn-when-auto-notification-already-sent-in-dialog-bandeau
relatedArtifacts:
  - _bmad-output/planning-artifacts/ux-design-hatcast-v2.md#pattern-share-announce
  - _bmad-output/planning-artifacts/ux-references/pattern-share-announce-modal-v1.png
  - _bmad-output/implementation-artifacts/6-10-partage-et-annonce-message-editable-canaux.md
  - _bmad-output/implementation-artifacts/6-10b-rappel-manuel-disponibilite-garde-anti-spam.md
  - _bmad-output/planning-artifacts/sprint-change-proposal-2026-06-02-v2.0.0-cutover-scope.md
  - apps/web/src/app/shared/share-announce/
  - docs/v2/technical/FRONTEND_UI.md
supersedes:
  - 'ux-design-hatcast-v2.md § Visual style (V1 mood) — remplacé par shell M3 documenté ici pour 6.15'
---

# UX Design — Modales Partager / Annoncer (6.15)

**Purpose:** Refondre **`ShareAnnounceDialog`** (stories **6.10** / **6.10b**) pour la **gate V2.0.0** : shell **Material 3** aligné sur le reste de l’app, zone message plus confortable, **copie** + **WhatsApp**, envoi manuel **simplifié** avec retour explicite, et **anti-spam** étendu (au-delà du seul rappel dispos).

**Principle:** Un seul composant, quatre **intents** ; seuls le **titre**, le **libellé message**, le **template par défaut**, l’**audience** et les **garde-fous** changent. Le parcours cognitif reste : *lire le message → notifier / copier / WhatsApp*.

**Amendements recette (2026-06-03, Patrice) :** voir décisions D4–D9 et § Garde-fous ; bandeaux info auto-notif **retirés** du dialog ; garde anti-spam **uniquement** via `ConfirmDialog` au clic Notifier.

**Amendement D10 (2026-06-04, Patrice) :** détail destinataires = **statut par canal** (email / push) — trois états absent · gris · coloré ; **retrait** email obfusqué ; légende compacte ; API `{ eligible, notified }` ; mapping intents → `notification_delivery_log`.

**Amendement D11 (2026-06-04, Patrice) :** point d’entrée **`availability_nudge`** déplacé de la toolbar Dispos vers le menu gear événement · **Relance dispos** (modale titre inchangé *Rappel disponibilité*) ; story **6.10c**.

**Référence visuelle V1 (ton, pas le chrome) :** [`pattern-share-announce-modal-v1.png`](ux-references/pattern-share-announce-modal-v1.png).

---

## Problème (état après 6.10 / 6.10b)

| Point | Constat |
|-------|---------|
| **Hors M3** | Fond dégradé bleu nuit, boutons HTML verts (`#16a34a`), textarea native, fermeture « ✕ » custom — non conforme **UX-DR11** / checklist FRONTEND_UI. |
| **Message** | `rows="12"` mais hauteur visuelle modeste ; pas de **copier le message** (explicitement hors scope en 6.10, **demandé en 6.15**). |
| **Notifications** | CTA « Envoyer les notifications » + liste détaillée **avant** envoi : charge cognitive forte ; snack générique (*Rappel envoyé.*) sans **résumé chiffré**. |
| **Anti-spam** | Garde **3 jours** + confirm uniquement pour `availability_nudge` ; draw / compo / `event` sans alerte doublon ni rappel **notif auto** (publish **8.3**). |
| **draw / compo notify** | Toujours stub côté API pour intents non-nudge — l’UX doit rester cohérente et ne pas promettre un envoi réel tant que le produit ne l’active pas. |

Code actuel : [`share-announce-dialog.html`](../../apps/web/src/app/shared/share-announce/share-announce-dialog.html), [`share-announce-dialog.scss`](../../apps/web/src/app/shared/share-announce/share-announce-dialog.scss).

---

## Décisions produit

| # | Sujet | Décision |
|---|--------|----------|
| D1 | **Shell** | `MatDialog` standard : `mat-dialog-title`, `mat-dialog-content`, `mat-dialog-actions` — même famille que [`account-change-email-dialog`](../../apps/web/src/app/pages/account-placeholder/dialogs/account-change-email-dialog.html). **Supprimer** le panneau « carte sombre V1 ». |
| D2 | **Couleurs** | Tokens `--mat-sys-*` uniquement ; WhatsApp = `mat-stroked-button` + icône `chat` (pas de vert hex dédié). Action primaire notify = `mat-flat-button color="primary"`. |
| D3 | **Zone message** | `mat-form-field appearance="outline"` + `textarea matInput` ; **min-height ~14–16 lignes** (`min-rows` 14, `cdkTextareaAutosize` max ~24) ; compteur optionnel discret si > 450 caractères (limite API 500). |
| D4 | **Actions (une rangée)** | Sous le textarea, **une seule rangée** (wrap / colonne mobile) dans l’ordre : **Notifier X personnes** (`mat-flat-button primary`) · **Copier** (`mat-stroked-button`, `aria-label="Copier le message"`) · **WhatsApp** (`mat-stroked-button`). Snack *Message copié.* après presse-papiers. |
| D5 | **Destinataires** | Résumé compact N/X/Y ; liste nominative **repliée** par défaut (`mat-expansion-panel`). Section *Notifications* **sous** la rangée d’actions. |
| D6 | **Après envoi** | Fermer le dialog ; snack **5 s** : nudge réel → *« X notifications envoyées. »* ; intents stub (`draw` / `composition` / `event`) après Notifier → *« Demande enregistrée. »* ; nudge sans canal auto (X=0) → *« Message prêt — partage-le via Copier ou WhatsApp. »* |
| D7 | **Anti-spam** | **Aucun bandeau** visible dans le dialog. Si envoi manuel du **même intent** dans `guardDays` (défaut 3), au **clic** sur Notifier → `ConfirmDialog` (*Renvoyer un rappel ?* / *Renvoyer cette annonce ?* + *Envoyer quand même*). Pas de 409 POST. |
| D8 | **Intents stub** | POST accepté, **0 canal réel** pour `draw` / `composition` / `event` — snack *Demande enregistrée.* (ne pas simuler un envoi push/email massif). |
| D9 | **Entrée spectacle** | Intent `event` : titre **Annonce de spectacle** ; déclencheurs = post-publish (**3.21**) **et** menu gear événement (**Annoncer**, orga compo, spectacle publié) — même modale [`share-announce-open.ts`](../../apps/web/src/app/shared/share-announce/share-announce-open.ts). |
| D10 | **Détail destinataires** | Dans le panneau *Voir le détail* : **icônes par canal** (email `mail`, push `notifications_active`) avec **3 états** — **absent** (canal non éligible), **gris** (éligible, pas encore notifié), **coloré** (`color="primary"`) (déjà notifié sur ce canal). **Retirer** email obfusqué et icônes `check_circle` / `warning` en tête de ligne. **Conserver** `warning` + libellé *Contact manuel* uniquement si **aucun** canal éligible. **Légende** une ligne sous la liste. Résumé N/X/Y inchangé (D5). |
| D11 | **Entrée relance dispos** | Intent `availability_nudge` : item gear **Relance dispos** (`notifications_active`), visible si orga compo + publié + ≥1 dispo `unknown` ; **plus** de bouton toolbar onglet Dispos ; titre modale **Rappel disponibilité** inchangé ; helper `openAvailabilityNudgeDialog` dans [`share-announce-open.ts`](../../apps/web/src/app/shared/share-announce/share-announce-open.ts). Ordre menu : … **Annoncer** → **Relance dispos** → **Participants** … |
| D12 | **Deux actions volontaires** | **Ne pas fusionner** Annoncer et Relance dispos : même modale / stack technique, **deux intentions orga** (broadcast spectacle vs rappel non-répondus). Audience : `event` = roster ; `availability_nudge` = `unknown` only. Spec technique : [_tech-spec-share-announce-transparency-6-17.md_](tech-spec-share-announce-transparency-6-17.md). |

---

## Intents (inchangés fonctionnellement)

| Intent | API | Déclencheur | Titre dialog | Libellé message |
|--------|-----|-------------|--------------|-----------------|
| `draw` | `draw` | Équipe · menu · **Partager** (brouillon, slots) | Partager le tirage | Message à partager (modifiable) : |
| `composition` | `composition` | Équipe · **Annoncer la compo** (validée) | Annoncer la compo | Annonce la compo avec ce message : |
| `event` | `event` | Publish **3.21** **ou** gear événement · **Annoncer** | **Annonce de spectacle** | Message pour inviter à indiquer les dispos : |
| `availability_nudge` | `availability_nudge` | Gear événement · **Relance dispos** | Rappel disponibilité | Message de rappel (modifiable) : |

Sous-titre commun (sous le titre) : **`{eventTitle} — {date longue locale}`** en `mat-dialog-title` second line ou `subtitle` classe `--mat-sys-on-surface-variant`.

Templates : inchangés dans [`share-announce-messages.ts`](../../apps/web/src/app/core/messaging/share-announce-messages.ts) sauf retouches copy validées par PO.

---

## Structure du dialog (cible M3)

```
┌─────────────────────────────────────────────────────────┐
│ [mat-dialog-title]  Annonce de spectacle            [×] │
│   Apérock Mai — samedi 15 juin 2026, 20h00             │
├─────────────────────────────────────────────────────────┤
│ [mat-dialog-content]                                    │
│                                                         │
│  Message pour inviter à indiquer les dispos :           │
│  ┌─────────────────────────────────────────────────┐   │
│  │ mat-form-field outline · textarea autosize       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [ Notifier 8 personnes ] [ Copier ] [ WhatsApp ]       │
│       mat-flat primary      stroked    stroked           │
│                                                         │
│  ─── Notifications ───                                  │
│  12 personnes concernées — 8 auto, 4 manuel             │
│  [mat-expansion-panel collapsed] Voir le détail         │
│    Marie Dupont                    [mail●] [notif○]     │
│    Jean Martin                     [mail○]              │
│    Paul Sans compte    ⚠ Contact manuel                 │
│    ● coloré = déjà notifié · ○ gris = prévu · — absent  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ [mat-dialog-actions align="end"]              [ Fermer ]│
└─────────────────────────────────────────────────────────┘
```

### Header

- **`mat-dialog-title`** : titre intent ; pas d’emoji dans le titre Material (les emojis restent dans le **corps** du message généré).
- Fermeture : **`mat-icon-button`** `mat-dialog-close` + `aria-label="Fermer"` + `close` icon.
- `cdkFocusInitial` sur le textarea après ouverture.

### Bloc message

- Label = colonne du tableau intents.
- `subscriptSizing="dynamic"` ; hint : *« WhatsApp et les notifications utilisent le texte ci-dessus. »*

### Rangée d’actions (D4)

| Contrôle | Comportement |
|----------|----------------|
| **Notifier X personnes** | Premier bouton ; `mat-flat-button color="primary"` ; `X = notifiableCount` ; disabled si chargement, erreur GET, `sending`, ou `X === 0` (libellé *Aucune notification automatique*). Spinner dans le bouton pendant POST. |
| **Copier** | Label court **Copier** ; `aria-label="Copier le message"` ; snack *Message copié.* |
| **WhatsApp** | `whatsapp://send?text=` + texte courant ; tooltip *« Ouvre WhatsApp avec ce message »*. |

**Mobile (≤ 480px) :** les trois boutons en **colonne**, pleine largeur, cibles ≥ 48dp.

### Destinataires (D5, amendé D10)

**Par défaut :** ne pas afficher la grille de cartes (max-height scroll actuelle = bruit).

**Résumé compact** (toujours visible après chargement) :

- Ligne principale : *« **N** personnes concernées — **X** notifiables automatiquement, **Y** à contacter manuellement. »*
- Lien ou `mat-expansion-panel` *« Voir le détail »* → liste nominative (voir **D10** ci-dessous).

**Pendant chargement :** `mat-progress-bar` indeterminate ou spinner centré, `aria-busy="true"`.

**Erreur GET :** `mat-error` inline + bouton *Réessayer* (`mat-stroked-button`).

#### Détail par destinataire — statut canal (D10)

**Problème adressé :** l’email obfusqué n’aide pas l’orga à décider qui contacter. L’info utile = **quels canaux** sont disponibles et **si un envoi a déjà eu lieu** sur ce canal pour l’événement / l’intent.

**Par ligne** (`mat-list-item`) :

| Cas | Rendu |
|-----|--------|
| Au moins un canal éligible | **Nom** à gauche ; **pastilles canal** alignées à droite (email, push). |
| Aucun canal éligible | Icône `warning` + libellé secondaire *Contact manuel* — **pas** de pastilles canal. |

**Pastilles canal** (Material `mat-icon`, `aria-hidden="true"`) :

| État | Rendu | Sémantique |
|------|-------|------------|
| **Non éligible** | Pas d’icône | Canal indisponible (pas d’email / push non autorisé ou indisponible). |
| **Éligible, pas encore notifié** | Icône **grise** (`--mat-sys-on-surface-variant`, opacité ~40 %) | Sera touchée au prochain **Notifier** sur ce canal. |
| **Déjà notifié** | Icône **colorée** (`color="primary"`) | Au moins un log `SENT` ou `PARTIAL` dans `notification_delivery_log` pour l’intent pertinent (voir mapping API). |

**Icônes :** email → `mail` ; push → `notifications_active`.

**Retirer de la liste :**

- la 2ᵉ ligne **email obfusqué** ;
- l’icône **`check_circle` / `warning`** en tête de ligne pour les lignes notifiables (remplacée par la lecture canal).

**Légende** (une ligne, `mat-hint` ou classe `--mat-sys-on-surface-variant`, sous la `mat-list`) :

*« Icône colorée = déjà notifié · grise = prévu au prochain envoi · absente = canal indisponible »*

**Comportement temporel :**

- **Avant** clic Notifier : pastilles grises = « sera touché » sur ce canal.
- **Après** POST réussi : re-fetch GET **ou** merge réponse POST → pastilles passent en coloré pour les canaux effectivement `SENT` / `PARTIAL`.

**Accessibilité :** chaque `mat-list-item` porte un `aria-label` synthétique, ex. *« Marie Dupont — email déjà envoyé, push prévu au prochain envoi »* ; la légende est visible (pas de sens porté par la couleur seule).

**Hors scope D10 :** horodatage au survol (*« Notifié le … »*) — nice-to-have Epic 9 / FR35 ; nouveaux canaux (SMS, WhatsApp auto).

### Pied de dialog

| Bouton | Rôle |
|--------|------|
| **Fermer** | `mat-button` `mat-dialog-close` — seul contrôle en `mat-dialog-actions` |

---

## Garde-fous anti-spam (D7)

**Règle UX (recette Patrice) :** ne **jamais** afficher de bandeau garde-fou ou info dans le corps du dialog. La confirmation n’apparaît **que** si nécessaire, **au clic** sur Notifier.

| Étape | Comportement |
|-------|----------------|
| GET | Exposer `lastManualNotifyAt` + `guardDays` (défaut 3) par `(eventId, intent)` |
| Ouverture modale | Aucun avertissement visible |
| Clic **Notifier** si envoi récent (`< guardDays`) | Ouvrir **`ConfirmDialog`** : titre *Renvoyer un rappel ?* (nudge) ou *Renvoyer cette annonce ?* (autres intents) ; message *« Un rappel / envoi … il y a X jour(s). »* ; *Envoyer quand même* / annuler |
| Confirm annulée | Rester dans la modale ; pas de POST ; pas de snack |
| Pas d’envoi récent | POST direct |

Intents **distincts** : un envoi **draw** n’alerte pas un envoi **composition**. Pas de **409** POST.

### Bandeaux « notif auto déjà envoyée » — **waived**

Proposition initiale (bandeau info si publish **3.21** / validate **8.3**) **non retenue** en recette : trop de bruit ; l’orga peut renvoyer via Notifier ; garde anti-spam couvre les doublons manuels.

---

## Après envoi (D6)

| Résultat | Feedback |
|----------|----------|
| POST OK, `availability_nudge`, `notifiedCount > 0` | Snack : *« **X** notifications envoyées. »* |
| POST OK, intents stub (`draw` / `composition` / `event`) | Snack : *« Demande enregistrée. »* |
| POST OK, nudge, `notifiedCount === 0` | Snack : *« Message prêt — partage-le via Copier ou WhatsApp. »* |
| POST erreur | Rester dans le dialog ; `mat-error` |
| Guard confirm annulé | Aucun snack |

**API suggérée (6.15) :** enrichir la réponse POST :

```json
{
  "accepted": true,
  "notifiedCount": 8,
  "manualCount": 4,
  "intent": "availability_nudge"
}
```

Sinon le client garde `notifiableCount` du GET (moins précis si échecs partiels canal).

---

## Points d’entrée

| Surface | Action | Intent |
|---------|--------|--------|
| [`event-equipe-tab`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.ts) | Partager (overflow) | `draw` |
| Équipe | Annoncer la compo | `composition` |
| [`event-detail`](../../apps/web/src/app/pages/event-detail/event-detail.ts) · menu gear · **Relance dispos** | Publié, dispos `unknown`, `canManageComposition` | `availability_nudge` |
| [`event-detail-draft-banner`](../../apps/web/src/app/pages/event-detail/event-detail-draft-banner.ts) | Post-publish (optionnel) | `event` |
| [`event-detail`](../../apps/web/src/app/pages/event-detail/event-detail.ts) · menu gear · **Annoncer** | Spectacle **publié**, `canManageComposition` | `event` |

Helper partagé : [`share-announce-open.ts`](../../apps/web/src/app/shared/share-announce/share-announce-open.ts) (`openEventAnnounceDialog`).

`MatDialog.open` : conserver `width: 'min(42rem, 96vw)'`, `maxHeight: '92vh'` ; **`panelClass`** : migrer vers classe qui **n’écrase pas** le fond M3 (supprimer styles globaux type fond V1 sur `.share-announce-dialog-panel` si présents).

---

## Accessibilité & mobile

- Cibles tactiles **≥ 48dp** sur Notifier, Copier, WhatsApp.
- `aria-labelledby` sur le dialog via `mat-dialog-title` id.
- **Copier** : libellé court + `aria-label` complet pour lecteurs d’écran.
- Erreurs : `role="alert"` ; pas de bandeau garde permanent.
- Expansion destinataires : `aria-expanded` sur le trigger ; `aria-label` synthétique par ligne (D10) ; pastilles canal `aria-hidden="true"`.
- Français, tutoiement ([ux-voice-and-tone.md](./ux-voice-and-tone.md)).

---

## Acceptance Criteria — Material 3 (pour story 6.15)

**M3-1.** `mat-dialog-title` / `content` / `actions` ; `mat-form-field` + `textarea matInput` ; boutons `mat-button` / `mat-stroked-button` / `mat-flat-button` ; `mat-icon` ; `ConfirmDialog` pour garde ; pastilles canal email/push dans le détail destinataires (D10) ; pas de `<button class="share-announce-dialog__whatsapp">`.

**M3-2.** SCSS : uniquement `var(--mat-sys-*)` et `color-mix` ; supprimer hex `#1a2744`, `#16a34a`, etc.

**M3-3.** Mobile ≤ 480px : rangée Notifier / Copier / WhatsApp en **colonne** ; textarea confortable ; dialog scroll via `mat-dialog-content`.

**M3-4.** N/A (pas de chrome navigation).

**M3-5.** Checklist FRONTEND_UI.md parcourue ; mettre à jour [`ux-design-hatcast-v2.md`](./ux-design-hatcast-v2.md) § pattern Share & announce (lien vers ce doc).

---

## Acceptance Criteria — Fonctionnel (proposition story)

1. **Given** un intent supporté, **when** l’organisateur ouvre la modale, **then** shell M3 (D1–D3) ; rangée **Notifier · Copier · WhatsApp** (D4) ; message prérempli éditable.
2. **Given** GET recipients OK, **when** la modale s’affiche, **then** résumé N/X/Y ; détail **replié** ; **aucun** bandeau garde visible (D7) ; **pas** d’email obfusqué dans le détail (D10).
3. **Given** le panneau *Voir le détail* est ouvert, **when** une ligne destinataire s’affiche, **then** pastilles email/push suivent les 3 états absent · gris · coloré (D10) ; légende visible sous la liste ; *Contact manuel* si aucun canal éligible.
4. **Given** notify cliqué avec succès (nudge, X>0), **when** le dialog se ferme, **then** snack *X notifications envoyées* (D6).
5. **Given** envoi manuel récent du même intent, **when** Notifier est cliqué, **then** `ConfirmDialog` **avant** POST uniquement (D7).
6. **Given** intents stub après Notifier, **then** snack *Demande enregistrée.* — pas de claim push/email massif (D8).
7. **Given** spectacle publié, **when** orga ouvre gear · **Annoncer**, **then** même modale `event` titre *Annonce de spectacle* (D9).
8. **Given** régression 6.10/6.10b, **when** tests, **then** matrices intent / permissions / WhatsApp / nudge inchangées côté métier.

---

## API / backend (notes pour dev story)

| Besoin | Suggestion |
|--------|------------|
| Garde par intent | Table `event_manual_share_notify` ; GET `lastManualNotifyAt`, `guardDays` |
| POST response | `notifiedCount`, `manualCount`, `intent` |
| Auto déjà envoyé (bandeau) | **Waived** — hors UI dialog |
| draw/compo notify réel | Hors scope 6.15 sauf décision PO — documenter dans story |
| **Canaux par destinataire (D10)** | Enrichir `ShareRecipientChannelsDto` — remplacer les booléens plats par objet par canal |

### DTO canal enrichi (D10)

```json
{
  "participantId": "…",
  "displayName": "Marie Dupont",
  "channels": {
    "email": { "eligible": true,  "notified": true  },
    "push":  { "eligible": true,  "notified": false }
  }
}
```

| Champ | Source |
|-------|--------|
| `eligible` | Logique actuelle : email = adresse normalisée non vide ; push = `PushNotificationEligibilityPort` + catégorie intent (ex. `AVAILABILITY_REQUEST` pour nudge). |
| `notified` | Au moins une entrée `notification_delivery_log` avec `status` ∈ `{ SENT, PARTIAL }` pour `(event_id, user_id, channel, intent)` dans l’ensemble d’intents ci-dessous. |

`emailObfuscated` : **deprecated pour l’UI** — peut rester dans le DTO pour compat tests / clients anciens ; **non affiché** dans le dialog (D10).

### Mapping intent dialog → `notification_delivery_log.intent` (D10)

| Intent dialog (`share-recipients?intent=`) | Intents log à considérer pour `notified` / `lastNotifiedAt` |
|--------------------------------------------|-------------------------------------------------------------|
| `availability_nudge` | `AVAILABILITY_OPENED`, `MANUAL_AVAILABILITY_NUDGE`, `MANUAL_AVAILABILITY_ANNOUNCE` |
| `event` | `AVAILABILITY_OPENED`, `MANUAL_AVAILABILITY_ANNOUNCE` |
| `draw` | Aucun envoi réel aujourd’hui → `notified` toujours `false` ; pastilles éligibles = gris |
| `composition` | Idem stub — `notified` toujours `false` jusqu’à dispatch réel |

**Runtime 6.16 :** `MANUAL_AVAILABILITY_ANNOUNCE` absent ; POST `event` stub. Cible story **6.17** — [_tech-spec-share-announce-transparency-6-17.md_](tech-spec-share-announce-transparency-6-17.md).

**Table journal :** [`notification_delivery_log`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDeliveryLogEntity.kt) — colonnes `event_id`, `user_id`, `channel` (`PUSH` \| `EMAIL`), `status`, `intent`.

**Après POST notify réussi :** le client re-fetch GET ou applique la réponse POST pour rafraîchir les pastilles `notified`.

---

## Hors scope 6.15

- Branchement **dispatch réel** pour `draw` / `composition` / `event` (Epic 8 suite).
- **FR35** audit ligne par envoi.
- Nouveaux canaux (SMS, Telegram).
- Message **par destinataire** personnalisé.
- Refonte des **templates** métier (emoji, ton) — copy mineure seulement si bloquant UX.

---

## Livrables implémentation

| Fichier | Action |
|---------|--------|
| `share-announce-dialog.html` | Réécriture structure M3 |
| `share-announce-dialog.scss` | Tokens ; suppression thème V1 |
| `share-announce-dialog.ts` | Copier, libellés dynamiques X, expansion panel ; pastilles canal D10 |
| `share-announce-open.ts` | Helper ouverture modale (publish + gear) |
| `share-announce-api.service.ts` + DTO Kotlin | POST enrichi ; GET `lastManualNotifyAt`, `guardDays` ; channels `{ eligible, notified }` ; lookup `notification_delivery_log` |
| `event-detail.ts` | Menu gear · **Annoncer** (intent `event`) |
| `ux-design-hatcast-v2.md` | Lien + retrait « V1 mood » comme cible |
| `6-15-*.md` (à créer via `bmad-create-story`) | Reprendre AC ci-dessus |

---

## Checklist revue design (Patrice / QA)

- [x] Dialog M3 (compte, confirm), pas modale V1.
- [x] Textarea utilisable sur mobile.
- [x] Copier + WhatsApp avec message **édité**.
- [x] Notifier · Copier · WhatsApp sur **une rangée**, Notifier en premier.
- [x] Libellé **Copier** (+ aria-label complet).
- [x] Titre intent `event` = **Annonce de spectacle**.
- [x] Gear événement · **Annoncer** (spectacle publié).
- [x] Garde anti-spam : **ConfirmDialog au clic Notifier** seulement — pas de bandeau.
- [x] Snack stub après Notifier = *Demande enregistrée.*
- [x] Relance dispos (gear) : snack chiffré si envoi réel — **D11** ; toolbar Dispos sans bouton (story **6.10c**).
- [ ] ~~Bandeau « déjà notifié à l’ouverture »~~ — waived recette 2026-06-03.
- [x] D10 — Détail destinataires : statut par canal (absent / gris / coloré), sans email obfusqué, légende sous la liste (validé Patrice 2026-06-04).

---

*Spec amendée 2026-06-04 (D10 statut canal ; D11 relance dispos gear, Patrice). Précédemment 2026-06-03 recette story 6.15. Alignée implémentation `apps/web/src/app/shared/share-announce/` ; entry **Relance dispos** = story **6.10c** ready-for-dev.*
