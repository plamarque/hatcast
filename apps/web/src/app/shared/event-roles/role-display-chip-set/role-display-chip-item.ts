import type { RoleKey } from '../../../core/events/event-types'

export type RoleDisplayChipItem = {
  key: RoleKey
  /** Trailing text, e.g. ": 2" or " (3)". */
  suffix?: string
}

export function roleDisplayChipItems(
  keys: readonly RoleKey[],
  suffixForKey?: (key: RoleKey) => string | undefined,
): RoleDisplayChipItem[] {
  return keys.map((key) => ({
    key,
    suffix: suffixForKey?.(key),
  }))
}

export function roleSlotCountSuffix(count: number): string {
  return `: ${count}`
}

export function roleFavoriteCountSuffix(count: number): string {
  return ` (${count})`
}
