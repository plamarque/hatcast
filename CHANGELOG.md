## [0.16.1] - 2025-09-19

### ✨ New Features

- feat: optimize changelog for better user experience
- feat: add user-focused changelog for version 0.16.0 and translate 0.14.0
- feat: add --no-user-changelog flag to skip OpenAI transformation while keeping technical changelog
- feat: add compact environment badge to footer
- feat: add vertical spacing between event rows in ParticipantsView
- feat: add spacing between event cells in ParticipantsView
- feat: harmonize event headers styling with TimelineView
- feat: remove gray backgrounds from grid elements for cleaner look
- feat: remove unnecessary column separators in grid views
- feat: make AvailabilityCell fill available space with fine margins
- feat: limit event titles to 2 lines maximum in grid views
- feat: set TimelineView as default view for all users
- feat: show required people count when no one is available
- feat: improve TimelineView event layout and alignment
- feat: enhance TimelineView avatars with overlapping effect
- feat: display event team avatars in TimelineView
- feat: rearrange TimelineView layout with availability cells on the right
- feat: improve mobile TimelineView layout with responsive badge positioning
- feat: implement fixed footer at bottom of screen
- feat: enable sticky behavior for ViewHeader
- feat: add min-width protection for events column and optimize desktop layout
- feat: optimize mobile column widths and remove debug styling
- feat: implement dynamic left column width based on player count
- feat: auto-select newly created player in grid view
- feat: improve new player creation flow
- feat: update SelectionStatusBadge to use eventStatusService styling
- feat: factorize event status logic and improve typography
- feat: increase desktop column widths for better text display
- feat: reduce participant column width in desktop Spectacles view
- feat: improve view icons and rename spectacles to events
- feat: add sticky table headers with proper z-index hierarchy
- feat: optimize mobile column widths for better visibility
- feat: afficher le nombre de participants/événements dans les en-têtes de colonnes
- feat: ajouter emoji et nombre de joueurs aux événements
- feat: améliorer l'interface utilisateur avec les nouveaux libellés
- feat: improve dropdown icon display for different participant states
- feat: add discrete counter for hidden participants near 'Afficher Plus'
- feat: implement player selection behavior in PlayerSelectorModal
- feat: improve PlayerSelectorModal text and UX
- feat: add player avatar and 'Tous' icon to ViewHeader dropdown
- feat: improve new participant modal UX
- feat: enhance PlayerSelectorModal with advanced player management
- feat: implement sticky header for chronological view
- feat: simplify events management section and add total count display
- feat: separate event type icon on dedicated line in column headers

### 🐛 Bug Fixes

- fix: optimize mobile footer layout and prevent horizontal scrolling
- fix: increase footer z-index to prevent transparency on scroll
- fix: restore opaque background to AppFooter
- fix: remove border radius from participant cells for cleaner scroll
- fix: add dark background to participant cells in SpectaclesView
- fix: use dark background for left column header
- fix: add missing changes to ParticipantsView
- fix: remove background from first column cells to match inter-cell space
- fix: add opaque background to first column td elements
- fix: restore full opacity for event headers to prevent text mixing
- fix: increase mobile spacing between availability cells
- fix: add proper spacing between availability cells
- fix: prevent event title overflow in TimelineView
- fix: prevent event propagation in AvailabilityCell to avoid modal conflicts
- fix: add null safety check for isSelectionComplete function
- fix: unify status logic in TimelineView to display correct statuses when player is selected
- fix: correct status codes in TimelineView to use proper status codes instead of French labels
- fix: add opaque background and spacing to TimelineView
- fix: restore overflow-x-auto to contain horizontal scrolling
- fix: increase events column width for desktop based on player count
- fix: remove overflow-x-auto to enable thead sticky positioning
- fix: add opaque background to tbody
- fix: improve sticky header z-index hierarchy
- fix: restore sticky behavior for left column cells
- fix: add margin to events header text for better spacing
- fix: remove 120px CSS rules from main.css that override dynamic styles
- fix: add missing props to PlayerAvatar in ViewHeader
- fix: explicitly override bold font-weight in 'Afficher Plus' button
- fix: harmonize 'Afficher Plus' button styling across views
- fix: add player gender prop to AvailabilityCell components
- fix: further increase event column width in Participants view
- fix: remove duplicate showPlayerDetails function declaration
- fix: add click handler for player names in EventsView
- fix: increase participants column width to prevent text wrapping
- fix: correct prop name for event column width in EventsView
- fix: add missing props to EventsView for proper status calculation
- fix: add missing headerOffsetX and headerScrollX props to ParticipantsView
- fix: reduce left column width on mobile to prevent overflow
- fix: connect player selection in timeline view to ViewHeader
- fix: add missing props to TimelineView for player selection status
- fix: show event selection status instead of 'Non renseigné' in timeline view
- fix: restore sticky left column in events view
- fix: resolve ViewHeader dropdown visibility and improve styling
- fix: improve ViewHeader mobile experience
- fix: disable ViewHeader sticky for grid views to allow table header sticky
- fix: correct PlayerModal show prop type
- fix: add missing headerOffsetX and headerScrollX props
- fix: correct props usage in ColumnView and LinesView
- fix: réduire la largeur de la colonne joueurs sur mobile pour la vue lignes
- fix: corriger l'utilisation des props dans getEventStatus
- fix: ajouter la fonction openEventModal manquante dans LinesView
- fix: corriger l'affichage des en-têtes d'événements dans la vue lignes
- fix: supprimer les boutons 'Afficher Plus' redondants dans les lignes d'événements
- fix: corriger l'ouverture de la modale d'événement
- fix: réduire l'espacement du ViewHeader sur mobile
- fix: optimiser l'affichage responsive pour iPhone 16 et 16 Plus
- fix: corriger les styles CSS pour l'affichage mobile
- fix: corriger les erreurs et améliorer la robustesse
- fix: ajouter les props manquantes aux avatars dans les en-têtes
- fix: uniformiser la hauteur des cellules de disponibilité
- fix: correct player selection display logic and prop types
- fix: use allSeasonPlayers in PlayerSelectorModal instead of displayed players
- fix: separate PlayerModal and PlayerSelectorModal state management
- fix: enable player selector dropdown in all views
- fix: correct z-index hierarchy for ViewHeader dropdown
- fix: separate dropdown state for timeline view
- fix: remove verbose debug logs from PlayerAvatar service
- fix: resolve Vue warnings and improve player selection in chronological view
- fix: resolve Vue warnings and clean up debug logs

### 🔧 Improvements

- refactor: replace dropdown with tab switcher and reorganize layout
- refactor: rename view modes from lines/columns to spectacles/participants
- refactor: simplifier GridBoard et utiliser les nouvelles vues
- refactor: créer BaseGridView et factoriser les utilitaires
- refactor: centraliser les libellés et renommer les termes
- refactor: extract ViewHeader component for all views

### 📝 Other Changes

- fix --no-user-changelog
- Merge branch 'staging'
- resolve: merge conflict in changelog.json - keep user-focused version
- chore: bump version to 0.16.0 for production release
- remove: delete old floating EnvironmentBadge component
- style: increase event title width and standardize date section width
- style: standardize AvailabilityCell dimensions for visual harmony
- style: increase ViewHeader vertical spacing for better visual balance
- style: fix desktop ViewHeader spacing and alignment
- style: reduce excessive bottom padding in ViewHeader for better mobile balance
- style: simplify ViewHeader structure and fix mobile alignment
- style: improve AvailabilityCell appearance with border radius and padding
- revert: remove complex sticky header solution
- working on vertical scroll
- debug: add avatar loading events to PlayerAvatar component
- remove: 'Déjà affiché' indicator in timeline view player selector
- style: adopter un style plus sobre pour le bouton 'Afficher Plus' en vue colonnes
- style: reduce ViewHeader padding for more compact mobile layout
- clear excessive logsfor avatar laoding


# Changelog

## [0.16.1] - 2025-09-19
## [0.16.0] - 2025-09-18
## [0.15.2] - 2025-09-15
## [0.15.1] - 2025-09-15
## [0.15.0] - 2025-09-15
## [0.14.1] - 2025-09-14
## [0.14.0] - 2025-09-14
## [0.13.0] - 2025-09-14
## [0.12.0] - 2025-09-12
## [0.11.0] - 2025-09-11
## [0.10.0] - 2025-09-10
## [0.9.4] - 2025-09-09
## [0.9.3] - 2025-09-08

### ✨ New Features
- feat: implement complete z-index hierarchy system with comprehensive documentation
- feat: unify password reset systems on Firebase Auth
- feat: use player gender for role labels in availability cells
- feat: add Long Form show type with 4 players, 1 MC, 1 DJ

### 🔧 Improvements
- refactor: replace console.log with logger calls in PasswordReset.vue

### 🐛 Bug Fixes
- fix: improve waitForInitialization to handle early calls
- fix: wait for Firebase initialization before auth service
- fix: move waitForInitialization to very beginning of onMounted
- fix: add specific error handling for waitForInitialization failures
- fix: move auth access after waitForInitialization to prevent crashes
- fix: replace logger calls with console.log to avoid Firebase dependency
- fix: use existing waitForInitialization service for auth readiness
- fix: resolve password reset token verification issue
- fix: persist event template type and improve template structure

### 📝 Other Changes
- unify: replace magic link system with Firebase Auth for player protection
- debug: add console.log statements for password reset debugging

---

## [0.9.2] - 2025-09-07

### ✨ New Features
- feat: apply role preferences only to favorite players
- feat(ui): Redesign availability input modal
- feat: add gender-based avatar customization and edit icon
- feat: add inclusive writing with middle dot for role labels
- feat: implement complete server-side changelog translation system
- feat: implement complete server-side changelog translation system
- feat: implement server-side changelog translation and rename deployment script

### 🐛 Bug Fixes
- fix: protect player edit modal access with password verification
- fix: replace 'volontaire' with 'bénévole' terminology
- fix: resolve modal layering and event editing form issues
- fix: improve filter dropdown positioning
- fix: correct translation of 'modique' to 'modale' in changelog
- fix: remove duplicate 0.9.1 entry in changelog
- fix: resolve changelog display issues in help page

### 📝 Other Changes
- chore: prepare for 0.9.0 release by setting current version to 0.8.0

---

## [0.9.1] - 2025-09-05

### 🐛 Bug Fixes
- fix: resolve changelog display issues in help page

---

## [0.9.0] - 2025-09-04

### ✨ New Features
- feat: add comprehensive changelog system with automatic translation and version management
- feat: add intelligent production deployment script with automatic versioning and dry-run capabilities
- feat: add Google authentication and avatar display system
- feat: add player protection system with multi-role availability and confirmation flow
- feat: add advanced filtering system with dropdown interface
- feat: add comprehensive audit trail and development tools
- feat: add PWA support with installation prompts and push notifications
- feat: add comprehensive help system and user onboarding  
- feat: add event management and archiving functionality  

### 🔧 Improvements
- improve: centralize environment detection and CORS configuration
- improve: migrate to firestoreService for better data management
- improve: enhance mobile responsiveness and UI consistency
- improve: optimize performance and reduce code duplication
- improve: improve mobile UI/UX and responsive design

### 🐛 Bug Fixes
- fix: correct player protection and authentication flow
- fix: fix mobile UI issues and modal positioning
- fix: correct data synchronization and state management issues

### 📝 Other Changes
- docs: update deployment documentation with comprehensive IAM permissions
- docs: add commit message guidelines following conventional commits standard
- chore: add automated testing suite with Playwright
- chore: add environment-specific deployment workflows (development/staging/production)  
- chore: complete migration to firestoreService and cleanup legacy code
- fix: resolve Firebase migration issues and database conflicts
- fix: resolve deployment and workflow conflicts

---

## [0.8.0] - 2025-08-04

### ✨ New Features
- feat: add comprehensive player management and protection system
- feat: add season and event management with availability tracking
- feat: add mobile-first responsive design with PWA support
- feat: add push notifications and email notification system
- feat: add user authentication and account management
- feat: add automatic selection algorithm and reminder system
- feat: add comprehensive audit trail and development tools

### 🐛 Bug Fixes
- fix: resolve availability selection and authentication issues
- fix: correct UI display problems and data synchronization
- fix: resolve email sending and navigation issues

### 🔧 Improvements
- improve: enhance mobile responsiveness and user experience
- improve: optimize performance and database queries
- improve: enhance security and loading performance

### 🎨 UI/UX
- ui: implement modern mobile-first design with PWA support
- ui: improve accessibility, usability and visual design
