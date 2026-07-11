export type OnboardingVideoGuideId = 'member' | 'organizer' | 'admin'

export interface OnboardingVideoGuide {
  id: OnboardingVideoGuideId
  label: string
  ariaLabel: string
  url: string
}

export interface OnboardingVideoGuidesConfig {
  member: string
  organizer: string
  admin: string
}

export const ONBOARDING_VIDEO_GUIDE_LABELS: Record<
  OnboardingVideoGuideId,
  { label: string; ariaLabel: string }
> = {
  member: {
    label: 'Guide membre',
    ariaLabel: 'Ouvrir le guide vidéo membre (nouvel onglet)',
  },
  organizer: {
    label: 'Guide organisateur',
    ariaLabel: 'Ouvrir le guide vidéo organisateur (nouvel onglet)',
  },
  admin: {
    label: 'Guide administrateur',
    ariaLabel: 'Ouvrir le guide vidéo administrateur (nouvel onglet)',
  },
}

const GUIDE_ORDER: readonly OnboardingVideoGuideId[] = ['member', 'organizer', 'admin']

function isValidGuideUrl(url: string): boolean {
  const trimmed = url.trim()
  return trimmed.length > 0 && trimmed.startsWith('https://')
}

export function guidesFromEnvironment(env: {
  onboardingVideoGuides?: OnboardingVideoGuidesConfig
}): OnboardingVideoGuide[] {
  const guides = env.onboardingVideoGuides
  if (!guides) return []

  return GUIDE_ORDER.flatMap((id) => {
    const url = guides[id]?.trim() ?? ''
    if (!isValidGuideUrl(url)) return []
    const labels = ONBOARDING_VIDEO_GUIDE_LABELS[id]
    return [{ id, label: labels.label, ariaLabel: labels.ariaLabel, url }]
  })
}
