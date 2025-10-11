# Google Avatar Synchronization

## Overview

The application now automatically synchronizes Google profile pictures with player avatars in Firestore. When users sign in with their Google account, their profile photo is automatically stored in all their associated player documents.

## How It Works

### 1. Authentication Flow

When a user signs in with Google:

1. **authState.js** detects the authentication state change
2. If the user has a `photoURL` (Google profile picture):
   - Stores it temporarily in memory cache via `storeUserAvatar()`
   - Calls `syncGooglePhotoToPlayers()` to persist it in Firestore

### 2. Synchronization Process

The `syncGooglePhotoToPlayers()` function:

1. Finds all players associated with the user's email across all seasons
2. Updates each player document in Firestore with the Google `photoURL`
3. Clears the avatar cache for updated players
4. Emits an `avatars-synced` event to notify UI components

```javascript
// Called automatically on Google sign-in
const syncCount = await syncGooglePhotoToPlayers(email, photoURL)
```

### 3. Avatar Display Logic

The `PlayerAvatar.vue` component displays avatars with the following priority:

1. **Google Photo**: If the player has a `photoURL` stored in Firestore
2. **Gender Emoji**: Fallback to 👨 (male), 👩 (female), or 👤 (non-specified)

The component listens for the `avatars-synced` event and automatically reloads the avatar when updated.

## Key Functions

### playerAvatars.js

#### `syncGooglePhotoToPlayers(email, photoURL)`

Synchronizes a Google profile picture to all players associated with an email.

**Parameters:**
- `email` (string): User's email address
- `photoURL` (string): Google profile picture URL

**Returns:**
- `Promise<number>`: Number of players successfully updated

**Example:**
```javascript
const count = await syncGooglePhotoToPlayers('user@example.com', 'https://...')
// Returns: 3 (updated 3 players)
```

#### `resolvePlayerAvatar(playerId, seasonId, playerGender)`

Resolves the avatar to display for a player (photo or emoji).

**Parameters:**
- `playerId` (string): Player ID
- `seasonId` (string|null): Season ID (optional)
- `playerGender` (string): 'male', 'female', or 'non-specified'

**Returns:**
```javascript
{
  type: 'photo' | 'emoji',
  value: string, // URL or emoji
  email: string | null,
  isAssociated: boolean
}
```

**Example:**
```javascript
const avatar = await resolvePlayerAvatar('player123', 'season456', 'male')
// Returns: { type: 'photo', value: 'https://...', email: 'user@example.com', isAssociated: true }
// OR: { type: 'emoji', value: '👨', email: null, isAssociated: false }
```

## Storage Location

Google avatars are stored in Firestore at:
```
/seasons/{seasonId}/players/{playerId}
  - photoURL: string (Google profile picture URL)
  - updatedAt: timestamp
```

## Events

### `avatars-synced`

Emitted when Google avatars are successfully synced to Firestore.

**Event Detail:**
```javascript
{
  email: string,
  playerIds: string[],
  photoURL: string
}
```

**Usage:**
```javascript
window.addEventListener('avatars-synced', (event) => {
  const { email, playerIds, photoURL } = event.detail
  // Refresh UI for affected players
})
```

## Caching

The avatar system uses multiple cache layers:

1. **In-memory cache** (`userAvatarsCache`): Temporary storage during session
2. **Avatar cache** (`avatarCache`): Caches resolved avatars per player/season
3. **Association cache** (`associationCache`): Caches player-user associations

Caches are automatically cleared:
- When avatars are updated
- When users sign out
- When players are reassociated

## URL Sanitization

Google avatar URLs are automatically sanitized to improve compatibility:

```javascript
// Before: https://lh3.googleusercontent.com/a/default-user=s96-c
// After:  https://lh3.googleusercontent.com/a/default-user=s96
```

The `=s96-c` parameter is replaced with `=s96` to avoid potential CORS issues.

## Troubleshooting

### Avatar not displaying after Google sign-in

1. Check browser console for sync confirmation:
   ```
   ✅ Google avatar synced to N player(s) in Firestore
   ```

2. Verify the player is associated with the user's email:
   ```javascript
   const associations = await listAssociationsForEmail(email)
   console.log(associations) // Should include the player
   ```

3. Check Firestore to confirm `photoURL` is stored:
   ```
   /seasons/{seasonId}/players/{playerId}/photoURL
   ```

### Avatar shows emoji instead of photo

1. The player may not have a Google account associated
2. The user may not have a Google profile picture set
3. CORS/security policies may be blocking the image (check browser console)

### Old avatar still showing

The cache may need to be cleared manually:
```javascript
import { clearPlayerAvatarCache } from './services/playerAvatars.js'
clearPlayerAvatarCache()
```

## Future Improvements

Potential enhancements:

1. **Avatar upload**: Allow users to upload custom avatars
2. **Avatar cropping**: Let users adjust their Google photo
3. **Fallback sources**: Try multiple avatar sources (Gravatar, etc.)
4. **Avatar proxy**: Use a proxy to avoid CORS issues
5. **Batch updates**: Optimize bulk avatar updates across multiple seasons

