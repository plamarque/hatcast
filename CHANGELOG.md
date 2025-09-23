## [0.18.0] - 2025-09-24

### ✨ New Features

- feat: keep selection modal open after auto-composition
- feat: add return to full view button in composition mode
- feat: restore chance percentages display in event details
- feat: hide Fermer button when any selection exists (complete or incomplete)
- feat: hide Fermer button when composition is complete
- feat: separate permissions for Composition Auto vs Simulation
- feat: separate Composition Auto and Simulation with proper error handling
- feat: improve draw simulation band display and text layout
- feat: add player avatars to draw simulation bands
- feat: add DrawVisualization component for transparent draw process
- feat: add percentage badges to event details using chancesService
- feat: create centralized chancesService for all selection calculations
- feat: improve chances modal explanation formatting
- feat: optimize chances modal interface with collapsible explanations

### 🐛 Bug Fixes

- fix: prevent duplicate player selection in fillEmptyCastSlots
- fix: prevent currentSlotIndex from being overridden in prepareDrawData
- fix: prevent currentDrawRole from being overridden in prepareDrawData
- fix: prevent infinite loop on slots with no candidates
- fix: properly skip slots with no available candidates in simulation
- fix: display decimal values instead of percentages in chances details
- fix: use role-level values in chances modal explanations
- fix: correct chances modal display for 0 past selections
- fix: correct chances modal calculations and display
- fix: delay updateCast emission to avoid disrupting Composition Auto animation
- fix: add missing showDrawVisualization variable declaration
- fix: enable draw visualization and wait for DOM update
- fix: add canvas availability check before starting animation
- fix: stop simulation when canvas is missing to prevent background loops
- fix: Composition Auto button not working with complete selection
- fix: close selection modal on user logout for security
- fix: refresh parent data after Composition Auto completion
- fix: use direct player ID lookup instead of conversion function
- fix: resolve Firebase undefined values error in Composition Auto
- fix: correct allSeasonPlayers reference in showSelectionBoom
- fix: implement role priority order for slots display and simulation
- fix: handle simulation when no candidates available for a role
- fix: prevent cross-role player selections in simulation
- fix: prevent duplicate player selections in simulation
- fix: correct simulation band proportions to use weighted chances
- fix: use array of canvas refs instead of single ref
- fix: use calculateAllRoleChances in SelectionModal for consistent percentage calculation
- fix: use allSeasonPlayers instead of players in countSelections
- fix: correct dropdown role filtering and eliminate code duplication

### 🔧 Improvements

- refactor: use chancesService in fillEmptyCastSlots and fix priority order
- refactor: rename simulation functions to generic draw functions
- refactor: add player ID to chancesService for cleaner architecture
- refactor: remove avatar loading from simulation bands
- improve: display role with gender agreement in selection boom
- improve: display role emoji in selection boom effect
- improve: reverse display order in selection boom effect
- refactor: simplify calculatePlayerChanceForRole to use calculateRoleChances
- refactor: move countAvailablePlayers to playerAvailabilityService

### 📝 Other Changes

- Complete > Fill
- cleanup: remove unused DrawVisualization component
- cleanup: remove debug logs from chancesService
- debug: add detailed logs to track candidate data transformation
- debug: add logs to track chances calculation issues
- debug: add logs to track teamSlots generation after reset
- debug: add extensive logging to identify infinite loop issue
- release: version 0.17.0


# Changelog

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
