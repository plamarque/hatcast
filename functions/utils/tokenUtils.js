/**
 * Utility functions for token generation
 * Shared across Cloud Functions
 */

/**
 * Generate a random token of specified length
 * @param {number} length - Length of the token (default: 32)
 * @returns {string} Random token string
 */
function generateRandomToken(length = 32) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let token = ''
  for (let i = 0; i < length; i++) {
    token += charset[Math.floor(Math.random() * charset.length)]
  }
  return token
}

module.exports = {
  generateRandomToken
}
