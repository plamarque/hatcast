## [0.11.0] - 2025-09-11

### ✨ New Features

- feat: add migration script for selections to casts
- feat: improve template type handling and customization protection
- feat: allow manual slot filling in locked selections
- feat: harmonize audit system with 'cast' terminology
- feat: implement comprehensive selection audit system
- feat: prevent redrawing declined players in completeSelectionSlots
- feat: add complete selection functionality and improve UI messages
- feat: allow slot clearing for declined players even when selection is locked
- feat: add multi-role system section to general help
- feat: add role priority system for selections
- feat: add clickable version in footer with changelog modal
- feat: reorganize footer layout
- feat: improve event modal player layout
- feat: optimize event modal mobile layout
- feat: add database migration scripts for production data replication
- feat: add role-based chance percentages with toggle in event detail modal
- feat: implement OpenAI-powered user-focused changelog generation
- feat: implement new changelog architecture with OpenAI integration
- feat: add dual sorting system for changelog version order
- feat: replace composition status badges with event type badges in grid header
- feat: replace 'Sélection' with 'Composition' in UI and documentation
- feat: implement complete z-index hierarchy system with comprehensive documentation
- feat: unify password reset systems on Firebase Auth
- feat: use player gender for role labels in availability cells
- feat: add Long Form show type with 4 players, 1 MC, 1 DJ

### 🐛 Bug Fixes

- fix: harmonize slot colors and fix declined player detection
- fix: correct slot management and status updates in selection modal
- fix: encode player names for Firestore field paths
- fix: remove redundant action field in player_recast audit log
- fix: ensure selection status updates correctly when players confirm
- fix: prevent duplicate players in completeSelectionSlots
- fix: recalculate status in confirmCast using castStatusService
- fix: sync UI status with database by loading status fields in loadCasts
- fix: resolve 'selections is not defined' error in SelectionModal
- fix: reload cast data after validation to sync UI with database
- fix: correct slot clearing and status detection logic
- fix: filter declined players from selection slots display
- fix: ensure footer visibility on help page
- fix: add missing AppFooter to seasons and help pages
- fix: prevent scroll from hiding event modal buttons
- fix: handle player declines in selection status logic
- fix: correct player availability check for multi-role events
- fix: improve incomplete selection UI by removing redundant message and enhancing tooltip
- fix: correct requiredCount calculation for multi-role events
- fix: increase HowItWorksModal z-index to display above SelectionModal
- fix: correct slot initialization and watchers for multi-role selections
- fix: correct selection status extraction in SelectionModal
- fix: correct const to let for filled variable in SelectionModal
- fix: eliminate double password verification in player edit flow
- fix: use player gender for role labels in availability modals
- fix: increase AvailabilityModal z-index to appear above EventDetailsModal
- fix: insert new changelog versions at the beginning for chronological order
- fix: resolve JSON parsing error in release script
- fix: improve changelog readability with user-focused language
- fix: improve changelog readability with user-focused language
- fix: increase PinModal z-index to appear above SelectionModal
- fix: corriger régression bouton Réinitialiser et erreurs de cache
- fix: move Composition Auto confirmation modal to SelectionModal with proper z-index
- fix: complete replacement of 'Sélection' with 'Composition' in remaining files
- fix: correct changelog.json path in release script
- fix: update changelog.json with latest version information
- fix: improve waitForInitialization to handle early calls
- fix: wait for Firebase initialization before auth service
- fix: move waitForInitialization to very beginning of onMounted
- fix: add specific error handling for waitForInitialization failures
- fix: move auth access after waitForInitialization to prevent crashes
- fix: replace logger calls with console.log to avoid Firebase dependency
- fix: use existing waitForInitialization service for auth readiness
- fix: resolve password reset token verification issue
- fix: persist event template type and improve template structure

### 🔧 Improvements

- refactor: migrate from selections to casts collection
- refactor: déplacer actions événement dans entête et corriger z-index
- refactor: rename selection functions to cast functions in code
- refactor: replace console.log with logger calls in PasswordReset.vue

### 📝 Other Changes

- chore: remove polluting debug logs from GridBoard
- chore: add dotenv dependency for debug scripts
- chore: bump version to 0.10.0 for production release
- chore: bump version to 0.9.4 for production release
- release: version 0.9.3
- merge: update changelog.json from staging
- hotfix: merge changelog readability improvements
- chore: remove obsolete public/changelog.md file
- chore: remove obsolete changelog_fr.md file
- chore: add OpenAI dependency and environment configuration
- chore: bump version to 0.9.3 for production release
- unify: replace magic link system with Firebase Auth for player protection
- debug: add console.log statements for password reset debugging


# Changelog

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
