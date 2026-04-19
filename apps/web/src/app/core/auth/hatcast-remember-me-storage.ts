/** Clé localStorage : alignée sur la case « Se souvenir de moi » (restauration session après redémarrage API). */
const STORAGE_KEY = 'hatcastRememberMe'

export function setHatcastRememberMePreference(on: boolean): void {
  if (typeof localStorage === 'undefined') return
  if (on) {
    localStorage.setItem(STORAGE_KEY, '1')
  } else {
    localStorage.setItem(STORAGE_KEY, '0')
  }
}

export function getHatcastRememberMePreference(): boolean {
  if (typeof localStorage === 'undefined') return false
  return localStorage.getItem(STORAGE_KEY) === '1'
}

export function clearHatcastRememberMePreference(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
