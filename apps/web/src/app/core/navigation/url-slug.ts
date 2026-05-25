/** Mirrors API [SeasonSlugGenerator] / [EventSlugGenerator] for client-side slug preview. */
const MAX_SLUG_LEN = 128

export function slugifyTitle(title: string): string {
  const trimmed = title.trim()
  if (!trimmed) {
    return ''
  }
  const nfd = trimmed.normalize('NFD')
  const noMarks = nfd.replace(/\p{M}+/gu, '')
  const lower = noMarks.toLowerCase()
  const alnum = lower.replace(/[^a-z0-9]+/g, '-')
  const collapsed = alnum.replace(/-+/g, '-').replace(/^-|-$/g, '')
  return collapsed.slice(0, MAX_SLUG_LEN)
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isValidSlug(slug: string): boolean {
  const trimmed = slug.trim().slice(0, MAX_SLUG_LEN).replace(/-+$/g, '')
  if (trimmed.length === 0 || UUID_IN_PATH_REGEX.test(trimmed)) {
    return false
  }
  return SLUG_PATTERN.test(trimmed)
}

export const UUID_IN_PATH_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
