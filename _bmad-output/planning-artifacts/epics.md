---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-hatcast-v2.md
  - SPEC.md
  - DOMAIN.md
---

# hatcast - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for **hatcast**, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories. Normative behaviour for the live product remains **SPEC.md** and **DOMAIN.md**; this file tracks **delivery** structure.

## Requirements Inventory

### Functional Requirements

- FR1: A user can sign in with an OAuth identity provider associated with "sign in with Google" (or equivalent) where offered.
- FR2: A user can sign in with email address and password.
- FR3: A user can request a password reset and complete password recovery via email.
- FR4: A user can stay signed in across visits on a trusted device when "remember me" (or equivalent) is selected.
- FR5: A signed-in user can sign out.
- FR6: A user can belong to a troupe as a member with a member profile for that troupe.
- FR7: A troupe administrator can manage which users are members and their baseline roles for that troupe, within the permission model.
- FR8: A user can navigate between troupes they belong to (when multiple membership exists).
- FR9: A member can edit a **troupe-specific display name (pseudo)** that the application uses as their visible name when identifying them **within that troupe**.
- FR10: A user can add or change a **profile avatar** image shown in the interface; when the user signs in with Google, they can **use the Google account profile image** as their avatar (or keep a custom image, according to product rules).
- FR11: An administrator can create, edit, and archive seasons for a troupe.
- FR12: An administrator can create, edit, and archive events (spectacles) within a season, including scheduling and venue-related information as supported by the product.
- FR13: A member can view the list of events in a season they belong to.
- FR14: An administrator can configure event types and required/optional roles for events according to troupe rules.
- FR15: A member can record availability (available / unavailable / unknown as applicable) per event.
- FR16: A member can indicate role-level availability when the event type requires role choices.
- FR17: An organizer or administrator can record or adjust availability on behalf of a member when permitted, with auditability of who acted.
- FR18: A member can add an optional comment on availability when the product provides that field.
- FR19: An organizer can view who is available for each role for an event.
- FR20: An organizer can run a weighted random draw to fill roles according to troupe/event rules.
- FR21: An organizer can manually assign or reassign players to roles when permitted.
- FR22: An organizer can save a draft composition that is not yet visible to ordinary members when the workflow defines draft visibility.
- FR23: An organizer can validate (lock) a composition when the workflow requires validation before confirmations.
- FR24: A member can view explainability information for selection odds when the product surfaces it for that event.
- FR25: A member can confirm or decline participation for their assigned role when a composition is in the confirmation phase.
- FR26: An organizer or administrator can confirm or decline on behalf of a member when permitted, with auditability.
- FR27: When a member withdraws or declines, organizers can see resulting gaps and take follow-up actions supported by the product (e.g. refill slot).
- FR28: The product can represent composition lifecycle states (e.g. preparing, awaiting confirmations, complete) consistently for an event.
- FR29: A user can opt in to browser push notifications globally or per relevant categories when offered.
- FR30: A user can manage notification preferences when the product defines notification types.
- FR31: The product can deliver notifications for key workflow events (e.g. availability open, composition ready, confirmation prompts) according to policy.
- FR32: A visitor without membership can browse the public troupe directory when the troupe is listed publicly.
- FR33: A visitor can view public season and event information for troupes and content marked public.
- FR34: A troupe administrator can configure who may act as organizer at season or event scope when the model supports it.
- FR35: An authorized user can view an audit trail of significant changes (including availability and composition changes and impersonation-style actions) with actor and timestamp.
- FR36: A user can update account credentials and profile fields supported by the product (e.g. email change flow).
- FR37: A user can delete their account when the product supports account deletion.
- FR38: An organizer can invite a non-member to contribute to a specific role for a specific event or set of events when that capability is enabled for the troupe.
- FR39: An invited non-member can submit availability for the invited scope without being subject to the same default draw rules as full members when the troupe configures alternative selection modes (e.g. organizer pick, last-resort/joker).
- FR40: A user can install or add the web application for quick access on supported platforms (PWA installability).
- FR41: After the organization deploys a new client version, users receive updated client behaviour without being expected to perform a technical manual cache-clear as the only remedy.

### NonFunctional Requirements

- **NFR-P1:** Primary interactive flows (season grid, event view, submit availability, open composition) remain usable on typical mobile network conditions; list views use paging or equivalent so loads do not transfer unbounded rows in one request.
- **NFR-P2:** API responses for common read operations stay within an acceptable interactive window for expected troupe sizes (numeric thresholds belong in service-level objectives outside this PRD).
- **NFR-S1:** Credentials and session tokens are protected in transit (TLS) and handled on client and server according to current best practices.
- **NFR-S2:** Personal data (email, avatar, troupe display names, participation data) is exposed only to identities and roles allowed by the permission model.
- **NFR-S3:** Account deletion and personal-data handling support expectations for EU users (e.g. GDPR-oriented processes at the organizational level—detailed in privacy policy and operations).
- **NFR-R1:** Staging and production **frontend and backend** deploy together so client and API versions do not drift unintentionally.
- **NFR-R2:** Asynchronous delivery (web push, email) fails gracefully: failures are observable and do not leave core domain state inconsistent.
- **NFR-SC1:** The system supports growth from a small number of troupes to a larger base without a redesign of core domain partitioning (horizontal scaling details are architectural).
- **NFR-A1:** Core member and organizer tasks are operable with keyboard where applicable, with semantic structure and visible focus; contrast meets a pragmatic baseline (formal WCAG level **TBD**).
- **NFR-I1:** Google sign-in and email used for password reset integrate reliably with provider behaviour; failures surface clearly to the user.

### Additional Requirements

_From `architecture.md` — technical constraints for implementation planning:_

- **Target stack:** **Angular 21** SPA with **Angular Material**; **Kotlin** + **Spring Boot** REST API; **PostgreSQL** on **Neon**; **OpenAPI** as API contract; static SPA on **GitHub Pages**; API on **Google Cloud Run**; **coupled CI** deploys for staging/production (NFR-R1).
- **Brownfield:** Legacy **Firebase** (Firestore, Auth, Functions) remains until migration slices in PLAN; dual paths per feature must stay explicit in stories.
- **Data:** PostgreSQL as system of record for target stack; **single active season per troupe** (SPEC/DOMAIN); migration strategy via PLAN/ADRs.
- **API:** REST `/v1/...`; **RFC 7807** Problem Details (or single documented envelope); **camelCase** JSON; **ISO 8601 UTC** dates; audit fields on proxy actions (FR17, FR26, FR35).
- **Persistence ADR:** JPA vs JDBC (or equivalent) — decide before complex persistence stories.
- **Auth ADR:** Session vs bearer token for SPA↔API — decide before secured API stories.
- **Observability:** Health/readiness for Cloud Run; structured logging; no secrets in logs.
- **Backend layout:** Spring Initializr baseline under `backend/`; layered packages (`api`, application, domain, infrastructure).

### UX Design Requirements

_Actionable items from `ux-design-hatcast-v2.md` (UX continuity V1 → V2, Angular Material):_

- **UX-DR1:** **Seasons list** (`/seasons`): card grid, primary CTA "Nouvelle saison", card click + kebab; back to landing; user menu top-right — implement with tokens (dark gradient, pill buttons).
- **UX-DR2:** **Season calendar / agenda:** header (back, troupe logo, season title, settings, avatar); participant + event filters; view switcher (agenda vs history); month-grouped event rows with date column, composition status, user dispo/role pill; card navigates to event detail.
- **UX-DR3:** **Availability modal:** three states (Dispo / Pas dispo / Non renseigné), optional comment, title shows whose availability; admin vs self copy — align with **MatDialog** (Angular Material).
- **UX-DR4:** **Event detail** full screen: tabs **Infos / Dispos / Équipe**; header type icon + title + date; composition status + org actions on Infos; canonical URL behaviour per SPEC.
- **UX-DR5:** **Dispos tab:** subject selector for org/admin; Moi/Tous; role candidacy when Dispo; Tous shows per-role grids with %; transparency rules.
- **UX-DR6:** **Équipe tab:** slots per role; manual pick from ordered list; draw animation (proportional bar + cursor); draft vs validated; declined section; participation modal (Confirmer / Décliner / À confirmer); share/validate/announce flows per spec.
- **UX-DR7:** **Share & announce modal:** editable generated message, WhatsApp, push/email recipient list — reusable for spectacle / tirage / compo.
- **UX-DR8:** **Member profile popover:** avatar click → season stats + month grid + favourite roles; Planning CTA.
- **UX-DR9:** **Historique view:** role columns (JEU, DECORUM, etc.) + monthly columns; expand/collapse details; exporter / masquer.
- **UX-DR10:** **Admin surfaces:** functional scope (members/roles, spectacles, troupe & seasons, one active season) — design flexible; **Angular Material** defaults acceptable.
- **UX-DR11:** **Theming:** Angular Material + design tokens; do not use Tailwind as primary styling surface (PRD); preserve V1 mood where referenced.

### FR Coverage Map

| FR | Epic | Résumé |
|----|------|--------|
| FR1–FR5, FR36–FR37 | Epic 1 | Auth, session, compte |
| FR6–FR10 | Epic 2 | Troupes, membres, profil |
| FR11–FR14, FR34, FR13 | Epic 3 | Saisons, spectacles, orga |
| FR32–FR33 | Epic 4 | Public / visiteurs |
| FR15–FR19 | Epic 5 | Disponibilités |
| FR20–FR28 | Epic 6 | Tirage, composition, confirmations |
| FR38–FR39 | Epic 7 | Invitations contributeurs externes |
| FR29–FR31 | Epic 8 | Notifications |
| FR35 | Epic 9 | Audit |
| FR40–FR41 | Epic 10 | PWA et mises à jour client |

**NFR (adressées au fil des epics / transverses) :** NFR-P1/P2 (perf, pagination) — surtout Epics 3, 5, 6, 10 ; NFR-S1/S2/S3 — Epics 1, 2, 9 ; NFR-R1/R2 — Epics 8, 10 + pipeline ; NFR-SC1 — architecture ; NFR-A1 — Epics 1–9 (UI) ; NFR-I1 — Epic 1.

**UX-DR :** UX-DR1–3 → Epics 3, 5 ; UX-DR4–7 → Epic 6 ; UX-DR5 aussi Epic 5 ; UX-DR8–9 → Epics 5, 6 ; UX-DR10 → Epics 2, 3 ; UX-DR11 → transverse (tous epics UI).

## Epic List

### Epic 1 — Compte et authentification

Les utilisateurs peuvent se connecter (Google, email/mot de passe), réinitialiser le mot de passe, rester connectés sur un appareil de confiance, se déconnecter, et gérer la suppression du compte ou les champs de compte supportés.

**FRs couverts :** FR1, FR2, FR3, FR4, FR5, FR36, FR37

### Epic 2 — Troupes, adhésion et profil membre

Les personnes peuvent appartenir à une ou plusieurs troupes, avec gestion des membres et rôles de base par les admins, navigation entre troupes, pseudo par troupe et avatar (y compris image Google).

**FRs couverts :** FR6, FR7, FR8, FR9, FR10

### Epic 3 — Saisons, spectacles et gouvernance organisateur

Les administrateurs gèrent saisons et spectacles (CRUD, archivage), configurent types d’événements et rôles requis/optionnels, et qui peut agir comme organisateur ; les membres voient la liste des événements de la saison.

**FRs couverts :** FR11, FR12, FR13, FR14, FR34

### Epic 4 — Découverte publique (annuaire et pages visiteur)

Un visiteur sans adhésion peut parcourir l’annuaire public des troupes et consulter saisons/événements marqués publics.

**FRs couverts :** FR32, FR33

### Epic 5 — Disponibilités (membres et organisations)

Les membres enregistrent leur disponibilité par événement (y compris par rôle et commentaire), les orgas/admins peuvent agir pour autrui avec traçabilité ; les organisateurs voient qui est disponible par rôle.

**FRs couverts :** FR15, FR16, FR17, FR18, FR19

### Epic 6 — Tirage, composition et cycle de vie des confirmations

Les organisateurs utilisent tirage pondéré et assignation manuelle, brouillon vs composition validée, états de cycle de vie, transparence des cotes ; les membres confirment ou déclinent ; gestion des retraits et créneaux à combler.

**FRs couverts :** FR20, FR21, FR22, FR23, FR24, FR25, FR26, FR27, FR28

### Epic 7 — Invitations et contributeurs externes

Les organisateurs invitent des non-membres sur un périmètre rôle/événement ; les invités soumettent des dispos selon les modes alternatifs configurés (hors règles de tirage par défaut des membres pleins).

**FRs couverts :** FR38, FR39

### Epic 8 — Notifications (push, email, préférences)

L’utilisateur active les notifications navigateur et les préférences ; le produit notifie les jalons métier (dispos, composition, confirmations) avec livraison asynchrone robuste.

**FRs couverts :** FR29, FR30, FR31

### Epic 9 — Audit et historique des changements significatifs

Les utilisateurs autorisés consultent une piste d’audit (dispos, composition, actions « pour le compte de », etc.) avec acteur et horodatage.

**FRs couverts :** FR35

### Epic 10 — PWA et déploiement sans friction côté client

Installation/raccourci PWA et garantie que les déploiements de nouvelle version client ne reposent pas sur un « vide le cache » comme seul recours.

**FRs couverts :** FR40, FR41

---

**Dépendances naturelles (ordre de valeur, pas de couches techniques) :** Epic 1 → 2 → 3 ; Epic 4 peut être livré en parallèle tôt dès que le modèle « public » existe ; Epic 5 dépend des événements (Epic 3) ; Epic 6 dépend des dispos (Epic 5) ; Epic 7 s’appuie sur 3 et recoupe 5–6 ; Epic 8 recoupe plusieurs epics métier ; Epic 9 dès qu’il y a des actions auditables ; Epic 10 en continu sur le socle SPA.

---

## User stories (détail)

Chaque story est dimensionnée pour une implémentation incrémentale ; l’ordre **N.M** respecte les prérequis au sein de l’epic (aucune story ne dépend d’une story ultérieure du même epic). Les critères d’acceptation sont vérifiables ; les références **SPEC** / **DOMAIN** priment sur ce document en cas d’écart.

### Epic 1 — Compte et authentification

#### Story 1.1 : Connexion avec fournisseur OAuth (Google)

En tant qu’utilisateur,  
je veux me connecter avec « Se connecter avec Google » (ou équivalent),  
afin d’accéder à l’application sans créer un nouveau mot de passe HatCast.

**Acceptance Criteria**

- **Given** un utilisateur non authentifié sur l’écran de connexion, **when** il choisit la connexion Google et complète le flux OAuth avec succès, **then** une session applicative conforme au modèle d’auth retenu est établie et il est redirigé vers l’expérience connectée.
- **And** en cas d’échec ou d’annulation côté fournisseur, un message clair est affiché (NFR-I1) sans exposer de détails sensibles (NFR-S1).
- **And** les jetons/sessions sont gérés selon les bonnes pratiques (NFR-S1).

**Couverture :** FR1 ; NFR-I1, NFR-S1 (partiel).

---

#### Story 1.2 : Connexion email et mot de passe

En tant qu’utilisateur,  
je veux me connecter avec mon adresse email et mon mot de passe,  
afin d’utiliser HatCast sans compte Google.

**Acceptance Criteria**

- **Given** un compte email/mot de passe valide, **when** l’utilisateur soumet identifiants corrects, **then** la session est établie et l’utilisateur accède à l’app.
- **Given** des identifiants incorrects, **when** la connexion est tentée, **then** un message générique approprié est affiché (pas d’énumération d’utilisateurs).
- **Couverture :** FR2 ; NFR-S1.

---

#### Story 1.3 : Réinitialisation et récupération de mot de passe par email

En tant qu’utilisateur,  
je veux demander une réinitialisation et définir un nouveau mot de passe via un lien email,  
afin de récupérer l’accès si j’ai oublié mon mot de passe.

**Acceptance Criteria**

- **Given** un email associé à un compte, **when** l’utilisateur lance la demande de reset, **then** un email (ou flux équivalent documenté) est déclenché et une confirmation UI indique que la suite se fait par boîte mail.
- **Given** un lien de reset valide et non expiré, **when** l’utilisateur définit un nouveau mot de passe conforme aux règles produit, **then** il peut se connecter avec ce mot de passe.
- **Given** un lien invalide ou expiré, **when** il est utilisé, **then** un message clair invite à redemander un reset (NFR-I1).
- **Couverture :** FR3 ; NFR-I1.

---

#### Story 1.4 : Session persistante (« se souvenir de moi »)

En tant qu’utilisateur,  
je veux rester connecté sur un appareil de confiance lorsque l’option est proposée,  
afin de ne pas resaisir mes identifiants à chaque visite.

**Acceptance Criteria**

- **Given** l’option « se souvenir de moi » (ou équivalent) cochée à la connexion, **when** l’utilisateur revient dans la fenêtre de validité définie, **then** la session est restaurée sans nouvelle saisie complète des identifiants (selon politique de sécurité retenue).
- **Given** l’option non cochée, **when** la session expire ou le navigateur est fermé (selon règles), **then** une nouvelle authentification est requise.
- **Couverture :** FR4 ; NFR-S1.

---

#### Story 1.5 : Déconnexion

En tant qu’utilisateur connecté,  
je veux me déconnecter explicitement,  
afin de terminer ma session sur cet appareil ou navigateur.

**Acceptance Criteria**

- **Given** une session active, **when** l’utilisateur choisit « Se déconnecter », **then** la session côté client et mécanisme serveur associé est invalidée conformément au modèle d’auth.
- **And** l’utilisateur ne peut plus accéder aux écrans membres sans se reconnecter.
- **Couverture :** FR5.

---

#### Story 1.6 : Mise à jour des identifiants et champs de compte supportés

En tant qu’utilisateur authentifié,  
je veux mettre à jour les informations de compte prévues (ex. flux de changement d’email),  
afin de garder mes coordonnées à jour.

**Acceptance Criteria**

- **Given** les champs supportés par le produit, **when** l’utilisateur modifie une valeur valide, **then** le compte reflète la modification après validation (y compris vérifications email si applicable).
- **Given** une modification soumise avec erreur de validation, **when** la sauvegarde est tentée, **then** des messages d’erreur exploitables sont affichés.
- **Couverture :** FR36 ; NFR-S2, NFR-S3 (processus compte).

---

#### Story 1.7 : Suppression de compte

En tant qu’utilisateur,  
je veux supprimer mon compte lorsque le produit le permet,  
afin que mes données personnelles soient traitées selon la politique annoncée.

**Acceptance Criteria**

- **Given** le parcours de suppression activé, **when** l’utilisateur confirme la suppression selon les garde-fous produit (confirmation, délai, etc.), **then** le compte est désactivé/supprimé selon le modèle documenté et l’utilisateur ne peut plus s’authentifier.
- **And** les attentes GDPR/niveau org sont respectées dans la mesure du périmètre produit (NFR-S3).
- **Couverture :** FR37 ; NFR-S3.

---

### Epic 2 — Troupes, adhésion et profil membre

#### Story 2.1 : Adhésion à une troupe et profil membre minimal

En tant qu’utilisateur authentifié,  
je veux appartenir à une troupe avec un profil membre pour cette troupe,  
afin de participer aux saisons et spectacles.

**Acceptance Criteria**

- **Given** une invitation ou un flux d’ajout conforme au modèle de permissions, **when** l’utilisateur rejoint une troupe, **then** un enregistrement de membership actif existe et le contexte troupe est accessible.
- **And** les données exposées respectent le modèle de permissions (NFR-S2).
- **Couverture :** FR6 ; NFR-S2.

---

#### Story 2.2 : Administration des membres et rôles de base

En tant qu’administrateur de troupe,  
je veux gérer la liste des membres et leurs rôles de base dans les limites du modèle de permissions,  
afin de contrôler qui accède à quoi au sein de la troupe.

**Acceptance Criteria**

- **Given** des droits administrateur sur la troupe, **when** l’admin ajoute, retire ou ajuste un rôle de base autorisé, **then** l’état persisté reflète le changement et l’UI des membres est à jour.
- **Given** une action non autorisée, **when** elle est tentée, **then** elle est refusée avec retour API/UI cohérent (NFR-S2).
- **Couverture :** FR7 ; UX-DR10 (surfaces admin membres) ; NFR-S2.

---

#### Story 2.3 : Navigation entre troupes

En tant que membre de plusieurs troupes,  
je veux basculer de troupe en troupe,  
afin de gérer chaque contexte séparément.

**Acceptance Criteria**

- **Given** au moins deux adhésions actives, **when** l’utilisateur sélectionne une autre troupe, **then** le contexte courant (données, navigation) correspond à la troupe choisie.
- **Couverture :** FR8.

---

#### Story 2.4 : Pseudo affiché par troupe

En tant que membre,  
je veux définir un pseudo visible dans cette troupe,  
afin d’être reconnu avec le nom d’usage de la troupe.

**Acceptance Criteria**

- **Given** un membre authentifié dans une troupe, **when** il enregistre un pseudo conforme aux règles (longueur/caractères), **then** ce pseudo est utilisé pour l’affichage intra-troupe (DOMAIN/SPEC).
- **Couverture :** FR9 ; NFR-S2.

---

#### Story 2.5 : Avatar et option image de profil Google

En tant qu’utilisateur,  
je veux définir ou mettre à jour mon avatar, y compris utiliser la photo du compte Google si je me connecte ainsi,  
afin d’être visuellement identifié dans l’interface.

**Acceptance Criteria**

- **Given** un fichier ou source d’avatar valide, **when** l’utilisateur enregistre son choix, **then** l’avatar s’affiche aux endroits prévus.
- **Given** une connexion Google avec photo disponible, **when** l’utilisateur choisit d’utiliser cette photo, **then** elle devient l’avatar affiché (ou les règles produit prime sur préférence custom — documenté dans l’UI).
- **Couverture :** FR10 ; NFR-S2.

---

#### Story 2.6 : Popover profil membre (stats saison, grille mensuelle, rôles favoris)

En tant que membre,  
je veux ouvrir un aperçu profil depuis un avatar avec statistiques de saison, grille mensuelle et rôles favoris, avec un accès rapide au planning,  
afin de comprendre mon activité dans la saison.

**Acceptance Criteria**

- **Given** un avatar cliquable dans le contexte saison (SPEC), **when** l’utilisateur ouvre le popover, **then** les blocs prévus (stats, grille, rôles favoris) s’affichent avec données cohérentes avec le domaine.
- **Given** le CTA « Planning » (ou libellé équivalent), **when** l’utilisateur l’active, **then** il est conduit au flux agenda/liste prévu.
- **Couverture :** UX-DR8 ; croise FR9/FR10 (affichage identité).

---

### Epic 3 — Saisons, spectacles et gouvernance organisateur

#### Story 3.1 : Gestion des saisons (création, édition, archivage) et liste saisons

En tant qu’administrateur,  
je veux créer, modifier et archiver des saisons, avec une liste de cartes saisons,  
afin d’organiser le travail par saison (y compris une seule saison active par troupe si DOMAIN l’impose).

**Acceptance Criteria**

- **Given** droits admin sur la troupe, **when** l’admin crée ou modifie une saison avec champs requis, **then** la saison apparaît dans la liste et est persistée.
- **Given** une action d’archivage, **when** elle est confirmée, **then** l’état archived est reflété et la liste/accès suivent SPEC/DOMAIN (saison active unique).
- **Given** la vue liste `/seasons`, **when** l’utilisateur consulte l’écran, **then** la grille de cartes, le CTA « Nouvelle saison » et les actions carte/kebab sont disponibles conformément à UX-DR1 (Angular Material + tokens).
- **Couverture :** FR11 ; UX-DR1 ; NFR-P1 (pagination si liste longue).

---

#### Story 3.2 : Spectacles dans la saison et liste pour les membres

En tant qu’administrateur ou membre,  
je veux gérer les spectacles (CRUD côté admin) et voir la liste des événements de la saison côté membre,  
afin de planifier et consulter l’agenda de la troupe.

**Acceptance Criteria**

- **Given** une saison existante, **when** un admin crée ou modifie un spectacle avec date/lieu/champs supportés, **then** l’événement est listé pour les membres autorisés.
- **Given** un membre de la saison, **when** il ouvre la liste des événements, **then** il voit les spectacles auxquels il a accès, sans chargement illimité (pagination ou équivalent, NFR-P1).
- **Couverture :** FR12, FR13 ; NFR-P1, NFR-P2.

---

#### Story 3.3 : Vue calendrier / agenda saison (filtres, bascule agenda / historique)

En tant que membre ou organisateur,  
je veux une vue agenda avec en-tête (retour, logo, titre saison, réglages, avatar), filtres participants/événements et bascule agenda vs historique,  
afin de parcourir les spectacles par mois avec statut de composition et accès au détail.

**Acceptance Criteria**

- **Given** une saison avec événements, **when** l’utilisateur ouvre la vue agenda, **then** les lignes groupées par mois affichent date, titre, statut de composition, pastille dispo/rôle selon UX-DR2.
- **Given** un clic sur une ligne/carte, **when** l’utilisateur navigue, **then** il accède au détail événement (route canonique SPEC).
- **Couverture :** UX-DR2 ; appuie FR12, FR13.

---

#### Story 3.4 : Types d’événement et rôles requis / optionnels

En tant qu’administrateur,  
je veux configurer les types de spectacles et les rôles requis ou optionnels selon les règles de la troupe,  
afin que les dispos et compositions respectent le métier.

**Acceptance Criteria**

- **Given** un type d’événement éditable, **when** l’admin associe des rôles requis/optionnels, **then** ces contraintes pilotent les écrans dispo/composition (DOMAIN).
- **Couverture :** FR14 ; UX-DR10 (admin spectacles).

---

#### Story 3.5 : Délégation des organisateurs (périmètre saison / événement)

En tant qu’administrateur de troupe,  
je veux configurer qui peut agir comme organisateur au niveau saison ou événement lorsque le modèle le permet,  
afin de répartir l’organisation sans élargir les droits admin.

**Acceptance Criteria**

- **Given** le modèle de permissions (SPEC), **when** l’admin affecte ou retire des organisateurs sur le périmètre supporté, **then** les capacités organisateur (dispos, composition) suivent cette configuration.
- **Couverture :** FR34 ; NFR-S2.

---

#### Story 3.6 : Vue « Historique » (colonnes rôles / mois, export, masquage)

En tant que membre ou organisateur,  
je veux une vue historique avec colonnes par rôle et par mois, expansion des détails et options d’export ou masquage selon produit,  
afin d’analyser la participation sur la saison.

**Acceptance Criteria**

- **Given** des données d’historique disponibles pour la saison, **when** l’utilisateur ouvre la vue historique, **then** la grille colonnes rôles × mois est affichée avec lignes expand/collapse (UX-DR9).
- **Given** les actions « exporter » / « masquer » si offertes, **when** l’utilisateur les déclenche, **then** le comportement suit SPEC (formats, permissions).
- **Couverture :** UX-DR9 ; NFR-P1.

---

### Epic 4 — Découverte publique (annuaire et pages visiteur)

#### Story 4.1 : Annuaire public des troupes

En tant que visiteur sans compte,  
je veux parcourir l’annuaire des troupes listées publiquement,  
afin de découvrir les troupes ouvertes.

**Acceptance Criteria**

- **Given** des troupes marquées publiques, **when** un visiteur consulte l’annuaire, **then** seules les entrées publiques sont listées (NFR-S2).
- **Couverture :** FR32 ; NFR-P1.

---

#### Story 4.2 : Pages publiques saison et événements

En tant que visiteur,  
je veux consulter les informations publiques de saison et de spectacles pour un contenu marqué public,  
afin de m’informer sans adhésion.

**Acceptance Criteria**

- **Given** une troupe/saison/événement publics, **when** le visiteur ouvre la page dédiée, **then** les champs publics s’affichent et les données membres restreintes ne fuient pas (NFR-S2).
- **Couverture :** FR33 ; NFR-S2.

---

### Epic 5 — Disponibilités (membres et organisations)

#### Story 5.1 : Saisie de disponibilité par événement (états Dispo / Pas dispo / Non renseigné)

En tant que membre,  
je veux enregistrer ma disponibilité pour chaque spectacle avec les trois états prévus,  
afin que les organisateurs planifient la présence.

**Acceptance Criteria**

- **Given** un spectacle auquel j’ai accès, **when** j’ouvre la modale de disponibilité (UX-DR3, **MatDialog**), **then** je peux choisir Dispo / Pas dispo / Non renseigné et enregistrer.
- **And** le titre de la modale indique clairement pour qui porte la saisie lorsque pertinent.
- **Couverture :** FR15 ; UX-DR3 ; NFR-A1 (focus clavier sur dialog).

---

#### Story 5.2 : Disponibilité par rôle lorsque le type d’événement l’exige

En tant que membre,  
je veux indiquer ma disponibilité au niveau des rôles requis,  
afin de signaler sur quels postes je peux jouer.

**Acceptance Criteria**

- **Given** un type d’événement avec choix de rôles (DOMAIN), **when** je suis « Dispo », **then** je peux exprimer la candidature par rôle conformément aux règles.
- **Couverture :** FR16 ; UX-DR5 (candidature rôle si Dispo).

---

#### Story 5.3 : Vue organisateur — disponibilités par rôle et vues Moi / Tous

En tant qu’organisateur,  
je veux voir qui est disponible pour chaque rôle, avec sélecteur de sujet (moi/autre) et bascule Moi/Tous,  
afin de préparer la composition.

**Acceptance Criteria**

- **Given** un événement avec dispos saisies, **when** l’organisateur ouvre l’onglet Dispos, **then** les grilles par rôle et pourcentages/transparence suivent UX-DR5 et SPEC.
- **Couverture :** FR19 ; UX-DR5.

---

#### Story 5.4 : Commentaire optionnel sur la disponibilité

En tant que membre,  
je veux ajouter un commentaire facultatif à ma disponibilité,  
afin de préciser des contraintes utiles aux organisateurs.

**Acceptance Criteria**

- **Given** le champ commentaire activé, **when** je sauvegarde une dispo avec texte dans les limites, **then** le commentaire est stocké et visible aux rôles autorisés.
- **Couverture :** FR18 ; NFR-S2.

---

#### Story 5.5 : Saisie de disponibilité pour un autre membre (proxy) avec audit

En tant qu’organisateur ou administrateur autorisé,  
je veux saisir ou ajuster la disponibilité pour le compte d’un membre,  
afin de corriger des cas réels tout en laissant une trace d’audit.

**Acceptance Criteria**

- **Given** les permissions proxy (SPEC), **when** l’orga enregistre une dispo pour un membre cible, **then** l’enregistrement inclut l’identité de l’acteur réel pour audit (FR35 lié, FR17).
- **Given** un utilisateur sans droit proxy, **when** il tente l’action, **then** elle est refusée.
- **Couverture :** FR17 ; prépare FR35 ; NFR-S2.

---

### Epic 6 — Tirage, composition et cycle de vie des confirmations

#### Story 6.1 : États de cycle de vie de composition et cohérence UI

En tant qu’utilisateur autorisé,  
je veux voir un état de composition cohérent (préparation, attente confirmations, terminé, etc.) sur un événement,  
afin de comprendre où en est le processus.

**Acceptance Criteria**

- **Given** un événement dans la saison, **when** tout utilisateur autorisé consulte l’écran, **then** l’état affiché correspond au modèle de cycle de vie (FR28, SPEC).
- **Couverture :** FR28 ; UX-DR4 (bandeau / zone statut sur Infos).

---

#### Story 6.2 : Détail événement plein écran — onglets Infos / Dispos / Équipe

En tant que membre ou organisateur,  
je veux un écran détail avec onglets Infos, Dispos et Équipe et une URL canonique,  
afin de naviguer clairement dans le spectacle.

**Acceptance Criteria**

- **Given** un événement accessible, **when** j’ouvre le détail, **then** les trois onglets sont présents avec contenu pertinent et l’URL respecte SPEC (UX-DR4).
- **Couverture :** UX-DR4 ; s’appuie sur Epic 5 pour Dispos.

---

#### Story 6.3 : Composition brouillon non visible aux membres ordinaires

En tant qu’organisateur,  
je veux enregistrer une composition en brouillon invisible aux membres non autorisés tant que le workflow l’exige,  
afin d’itérer avant publication.

**Acceptance Criteria**

- **Given** une composition en draft selon règles de visibilité, **when** un membre ordinaire consulte l’événement, **then** il ne voit pas la composition draft (FR22).
- **Given** un organisateur, **when** il consulte l’onglet Équipe, **then** il voit le draft.
- **Couverture :** FR22 ; UX-DR6 (draft vs validée).

---

#### Story 6.4 : Tirage aléatoire pondéré et affichage des cotes (explainability)

En tant qu’organisateur,  
je veux lancer un tirage pondéré pour remplir les rôles et voir les informations de cotes/explicabilité pour les membres lorsque le produit les affiche,  
afin d’alléger le travail manuel tout en restant transparent.

**Acceptance Criteria**

- **Given** des dispos et règles de tirage (DOMAIN), **when** l’organisateur lance le tirage, **then** les rôles sont pourvus selon les règles et le résultat est persisté.
- **Given** un membre autorisé, **when** il consulte l’info de cotes pour l’événement, **then** les données affichées correspondent aux règles d’explainability (FR24).
- **Couverture :** FR20, FR24 ; UX-DR6 (animation barre proportionnelle + curseur si applicable).

---

#### Story 6.5 : Assignation manuelle et réassignation des rôles

En tant qu’organisateur,  
je veux assigner ou réassigner manuellement des joueurs aux rôles depuis les listes ordonnées,  
afin d’ajuster le tirage ou gérer des cas particuliers.

**Acceptance Criteria**

- **Given** des candidats éligibles pour un rôle, **when** l’organisateur sélectionne un membre pour un créneau, **then** la composition reflète le choix (FR21).
- **Couverture :** FR21 ; UX-DR6 (sélection dans liste ordonnée).

---

#### Story 6.6 : Validation (verrouillage) de la composition

En tant qu’organisateur,  
je veux valider/verrouiller la composition lorsque le workflow l’exige avant confirmations,  
afin de figer la proposition officielle.

**Acceptance Criteria**

- **Given** une composition prête et les prérequis métier, **when** l’organisateur valide, **then** l’état passe en « validé » et les règles de confirmation s’appliquent (FR23, FR28).
- **Couverture :** FR23.

---

#### Story 6.7 : Confirmation ou déclinaison de participation (membre)

En tant que membre avec un rôle assigné en phase de confirmation,  
je veux confirmer ou décliner ma participation,  
afin de verrouiller mon engagement ou signaler mon indisponibilité.

**Acceptance Criteria**

- **Given** une composition en phase confirmation, **when** le membre choisit Confirmer ou Décliner, **then** l’état de participation est mis à jour et visible aux rôles autorisés (FR25).
- **Couverture :** FR25 ; UX-DR6 (modale participation).

---

#### Story 6.8 : Confirmation ou déclinaison pour le compte d’un membre (proxy)

En tant qu’organisateur ou administrateur autorisé,  
je veux confirmer ou décliner pour le compte d’un membre avec traçabilité,  
afin de débloquer la situation lorsque c’est légitime.

**Acceptance Criteria**

- **Given** les permissions proxy, **when** l’orga enregistre une décision pour un membre, **then** l’audit enregistre l’acteur réel (FR26, lien FR35).
- **Couverture :** FR26.

---

#### Story 6.9 : Créneaux vacants après déclin et actions de suivi

En tant qu’organisateur,  
je veux voir les trous laissés par un déclin ou retrait et agir (ex. recréneau, nouveau tirage) selon ce que le produit supporte,  
afin de compléter l’équipe.

**Acceptance Criteria**

- **Given** un déclin ou retrait, **when** l’organisateur consulte l’événement, **then** les gaps sont mis en évidence et les actions supportées sont proposées (FR27).
- **Couverture :** FR27.

---

#### Story 6.10 : Partage et annonce (message éditable, canaux)

En tant qu’organisateur,  
je veux ouvrir une modale de partage/annonce avec message généré éditable et envoi vers canaux supportés (ex. WhatsApp, liste push/email),  
afin de communiquer sur le spectacle ou la composition.

**Acceptance Criteria**

- **Given** un événement ou jalons composition, **when** l’organisateur ouvre « partager / annoncer », **then** le texte est prérempli, éditable et les actions de canal disponibles suivent SPEC (UX-DR7).
- **Couverture :** UX-DR7 ; croise FR31 pour canaux.

---

### Epic 7 — Invitations et contributeurs externes

#### Story 7.1 : Inviter un non-membre sur un rôle et un périmètre d’événements

En tant qu’organisateur,  
je veux inviter une personne externe à contribuer sur un rôle pour un ou plusieurs spectacles lorsque la troupe l’autorise,  
afin d’élargir le vivier sans adhésion complète.

**Acceptance Criteria**

- **Given** la capacité activée pour la troupe, **when** l’organisateur crée une invitation avec rôle et périmètre, **then** l’invité reçoit le flux prévu (lien, email, etc.) et l’invitation est traçable.
- **Couverture :** FR38 ; NFR-S2.

---

#### Story 7.2 : Disponibilités invité et modes de sélection alternatifs

En tant qu’invité non-membre,  
je veux soumettre mes disponibilités sur le périmètre invité selon des modes alternatifs (ex. choix organisateur, joker) sans les mêmes règles de tirage par défaut que les membres complets,  
afin de respecter le cadre convenu avec la troupe.

**Acceptance Criteria**

- **Given** une invitation valide, **when** l’invité saisit ses dispos, **then** elles s’appliquent au scope invité uniquement.
- **Given** la configuration de mode alternatif, **when** l’organisateur constitue l’équipe, **then** les règles FR39 sont respectées (pas de tirage par défaut des membres pleins sur cet invité si configuré ainsi).
- **Couverture :** FR39 ; aligné DOMAIN/SPEC.

---

### Epic 8 — Notifications (push, email, préférences)

#### Story 8.1 : Opt-in aux notifications navigateur et catégories

En tant qu’utilisateur,  
je veux activer les notifications push du navigateur globalement ou par catégories pertinentes,  
afin d’être informé des événements importants.

**Acceptance Criteria**

- **Given** un navigateur supporté, **when** l’utilisateur accepte les permissions, **then** l’inscription push est enregistrée côté serveur et l’état UI reflète l’opt-in (FR29).
- **Couverture :** FR29 ; NFR-R2 (gestion erreurs livraison).

---

#### Story 8.2 : Préférences de notification

En tant qu’utilisateur,  
je veux gérer mes préférences pour les types de notifications définis par le produit,  
afin de réduire le bruit.

**Acceptance Criteria**

- **Given** les types exposés par le produit, **when** l’utilisateur modifie ses préférences, **then** seuls les canaux/types autorisés sont modifiés et appliqués aux envois futurs (FR30).
- **Couverture :** FR30.

---

#### Story 8.3 : Notifications aux jalons métier (dispos, composition, confirmations)

En tant que **membre ou organisateur**,  
je veux **recevoir des notifications** aux moments importants du parcours troupe (ex. ouverture des dispos, composition prête à regarder, rappels de confirmation), **sur les canaux et types que j’ai acceptés**,  
afin de **ne pas rater une étape** et de faire avancer le spectacle sans dépendre uniquement du passage volontaire dans l’app.

**Acceptance Criteria**

- **Given** un jalon métier défini par le produit et des destinataires **éligibles** dont les **préférences** (Story 8.2) et l’**opt-in push** (Story 8.1) autorisent l’envoi, **when** le jalon se produit, **then** chaque destinataire concerné **reçoit** la notification sur le(s) canal(aux) applicable(s) (push et/ou email selon politique) avec un contenu aligné au jalon (FR31) ; l’absence d’opt-in ou de canal disponible ne crée pas d’erreur domaine incohérente.
- **Given** un utilisateur qui a autorisé au moins un canal, **when** la notification est émise, **then** elle est **vérifiable** côté produit (réception effective sur l’appareil ou boîte mail selon le canal, ou trace côté expéditeur / journaux d’envoi documentés pour la recette).
- **Given** un **échec** de livraison asynchrone (push ou email), **when** le traitement d’arrière-plan gère l’échec, **then** l’état métier (dispos, composition, confirmations) **reste cohérent** et l’échec est **observable** pour exploitation (logs, métriques, file d’échecs — sans corruption silencieuse du domaine) (NFR-R2).
- **Couverture :** FR31 ; NFR-R2 ; croise Story 6.10 pour les annonces manuelles / partage (canaux et message éditorial).

---

### Epic 9 — Audit et historique des changements significatifs

#### Story 9.1 : Consultation de la piste d’audit pour utilisateurs autorisés

En tant qu’utilisateur autorisé,  
je veux consulter une piste d’audit des changements significatifs (dispos, composition, actions pour le compte de, etc.) avec acteur et horodatage,  
afin de comprendre ce qui s’est passé.

**Acceptance Criteria**

- **Given** des événements d’audit enregistrés pour les actions couvertes, **when** un utilisateur avec droit de lecture ouvre la vue audit, **then** les entrées affichent action, cible, acteur réel, horodatage (FR35).
- **Given** un utilisateur non autorisé, **when** il tente l’accès, **then** il est refusé (NFR-S2).
- **Couverture :** FR35 ; prolonge FR17, FR26 ; NFR-S2.

---

### Epic 10 — PWA et déploiement sans friction côté client

#### Story 10.1 : Installabilité PWA (raccourci / ajouter à l’écran d’accueil)

En tant qu’utilisateur,  
je veux installer ou ajouter l’application web pour un accès rapide sur les plateformes supportées,  
afin d’ouvrir HatCast comme une app.

**Acceptance Criteria**

- **Given** un manifest et service worker conformes au périmètre produit, **when** l’utilisateur suit le flux d’installation du navigateur/plateforme, **then** le raccourci est créé et ouvre l’app (FR40).
- **Couverture :** FR40.

---

#### Story 10.2 : Détection de mise à jour client + action utilisateur (rechargement au clic)

En tant qu’utilisateur,  
je veux être **informé clairement** lorsqu’une **nouvelle version** du client est disponible après déploiement, avec un **bouton bien visible** pour appliquer la mise à jour,  
afin de **passer au nouveau comportement** sans devoir vider le cache manuellement ni subir un rechargement surprise au milieu d’une action.

**Acceptance Criteria**

- **Given** un nouveau bundle client déployé (service worker / stratégie PWA conforme à **@angular/pwa** ou à la config retenue), **when** l’app détecte automatiquement qu’une mise à jour est prête, **then** une **zone ou bannière visible** (non discrète : contraste, placement fixe ou pattern **Material** équivalent) indique qu’une mise à jour est disponible (FR41).
- **Given** cette indication affichée, **when** l’utilisateur **clique sur le bouton** dédié (libellé explicite du type « Mettre à jour » / « Charger la nouvelle version »), **then** **seulement à ce moment** la page (ou l’app PWA) **se recharge** pour activer le nouveau client — pas de rechargement forcé avant le clic, sauf règle produit exceptionnelle documentée.
- **Given** aucune nouvelle version en attente, **when** l’utilisateur utilise l’app, **then** aucune bannière de mise à jour intrusive n’apparaît.
- **And** le déploiement du client reste **aligné** avec le pipeline **couplé** front/API décrit pour NFR-R1 (voir `architecture.md`) : pas de divergence volontaire entre bundle déployé et API sur un même environnement.
- **Couverture :** FR41 ; NFR-R1 (gouvernance release) ; accessibilité : bouton utilisable clavier + libellé clair (NFR-A1).

---

### Couverture UX-DR (contrôle croisé)

| UX-DR | Story(s) principale(s) |
|-------|-------------------------|
| UX-DR1 | 3.1 |
| UX-DR2 | 3.3 |
| UX-DR3 | 5.1 |
| UX-DR4 | 6.1, 6.2 |
| UX-DR5 | 5.2, 5.3 |
| UX-DR6 | 6.3–6.7 |
| UX-DR7 | 6.10 |
| UX-DR8 | 2.6 |
| UX-DR9 | 3.6 |
| UX-DR10 | 2.2, 3.4, 3.5 |
| UX-DR11 | (critères transverses NFR-A1 + Angular Material + tokens — intégrer en revue/recette par epic UI) |
