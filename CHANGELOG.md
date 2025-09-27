## [0.20.0] - 2025-09-27

### ✨ New Features

- feat: add permission props to EventModal and clean debug logs
- feat: centralize status color system for consistency across components
- feat: increase availability tab grid from 2 to 3 columns on desktop
- feat: add Bruno algorithm percentage in gray parentheses for composition slots
- feat: make composition slots clickable to open confirmation modal
- feat: add note field to confirmation modal
- feat: create new players.js service with simplified functions
- feat: enhance migration to include avatar and verification data

### 🐛 Bug Fixes

- fix: improve changelog.json generation with jq and validation
- fix: implement proper security for protected player modifications
- fix: resolve naming conflicts with isSuperAdmin function
- fix: remove hardcoded fallback from main.js route guard
- fix: add fallback for patrice.lamarque+albane@gmail.com in development mode
- fix: resolve admin role caching issues and improve admin UI
- fix: correct declined status display in Ma Dispo tab
- fix: open availability modal when clicking non-selected availability cell
- fix: implement correct modal logic for Ma Dispo tab clicks
- fix: correct role display and click behavior in Ma Dispo tab
- fix: add missing player-gender prop to PlayerAvatar in CompositionSlot
- fix: correct getPlayerProtectionData to getPlayerData in GridBoard.vue
- fix: resolve playersData variable name conflict in loadUsersWithPlayers
- fix: add missing updateDoc import in PlayerClaimModal
- fix: resolve variable name conflict in SeasonAdminPage loadUsersWithPlayers
- fix: resolve variable name conflict in SeasonAdminPage

### 🔧 Improvements

- refactor: create unified Cloud Functions utility in firebase.js
- refactor: use callFunction utility for Super Admin check
- perf: optimize Super Admin permission checks with early returns
- perf: optimize player associations loading with caching and parallel queries
- refactor: delete playerProtection.js and move migration function to players.js
- refactor: fix associatePlayerDirectly to use players.js service
- refactor: remove all remaining playerProtection collection references
- refactor: remove dead code and add missing finalizeProtectionAfterVerification
- refactor: simplify playerProtection.js to wrapper with migration function
- refactor: update remaining imports to use players.js service
- refactor: simplify getPlayerAssociation to use players.js service
- refactor: update all imports to use new players.js service
- refactor: prioritize players collection for all write operations
- refactor: prioritize players collection over playerProtection for all reads

### 📝 Other Changes

- debug: add detailed logging for SeasonHeader props and connection state
- debug: add permissionService initialization check in GridBoard.vue
- debug: add comprehensive logging for Super Admin verification
- improve admins handling
- feat(grid): deep link filters and focuses event
- release: version 0.19.0


# Changelog

## [0.20.0] - 2025-09-27
## [0.19.0] - 2025-09-26
## [0.18.0] - 2025-09-24
## [0.17.0] - 2025-09-19
## [0.16.2] - 2025-09-19
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
