import { expect, type Page } from '@playwright/test'

import type { E1CutoverFixture } from './e2e-api'
import { openEventTab } from './e1.ui'
import { E2E_SEED_TROUPE_ID } from './story-19-19c.ui'

export type DrawFormulaListItem = {
  id: string
  name: string
  status: string
  isSystem: boolean
  factorConfig: Array<{
    factorId: string
    enabled: boolean
    params?: Record<string, unknown>
  }>
}

export type EffectiveDrawPolicyDto = {
  policySource: string
  resolvedMode: 'MANDATORY' | 'CHOICE'
  allowedFormulaIds: string[]
  allowedFormulas: Array<{ id: string; name: string }>
  effectiveFormulaId: string | null
  selectorVisible: boolean
  requiresFormulaIdOnDraw: boolean
}

export type PoolPreviewSegment = {
  participantId: string
  displayName: string
  chancePercent: number
}

export type ChoiceFormulaPair = {
  formulaAId: string
  formulaBId: string
  formulaAName: string
  formulaBName: string
}

const DEFAULT_FACTOR_CONFIG = [
  { factorId: 'equity_tag', enabled: true },
  { factorId: 'past_participation', enabled: true },
]

export async function listDrawFormulas(
  page: Page,
  troupeId = E2E_SEED_TROUPE_ID,
): Promise<DrawFormulaListItem[]> {
  const response = await page.request.get(`/v1/troupes/${troupeId}/draw-formulas`)
  if (!response.ok()) {
    throw new Error(`List draw formulas failed (${response.status()}): ${await response.text()}`)
  }
  return response.json() as Promise<DrawFormulaListItem[]>
}

export async function createPublishedDrawFormula(
  page: Page,
  name: string,
  pastParticipationStrength = 1,
  troupeId = E2E_SEED_TROUPE_ID,
): Promise<DrawFormulaListItem> {
  const response = await page.request.post(`/v1/troupes/${troupeId}/draw-formulas`, {
    data: {
      name,
      status: 'PUBLISHED',
      factorConfig: DEFAULT_FACTOR_CONFIG.map((entry) =>
        entry.factorId === 'past_participation'
          ? {
              ...entry,
              params: { strength: pastParticipationStrength },
            }
          : entry,
      ),
    },
  })
  if (!response.ok()) {
    throw new Error(`Create draw formula failed (${response.status()}): ${await response.text()}`)
  }
  return response.json() as Promise<DrawFormulaListItem>
}

export async function upsertTroupeDrawPolicy(
  page: Page,
  body: {
    defaultRule: {
      mode: 'MANDATORY' | 'CHOICE'
      mandatoryFormulaId?: string
      allowedFormulaIds?: string[]
    }
    categoryRules?: unknown[]
  },
  troupeId = E2E_SEED_TROUPE_ID,
): Promise<void> {
  const response = await page.request.put(`/v1/troupes/${troupeId}/draw-policy`, {
    data: {
      categoryRules: body.categoryRules ?? [],
      defaultRule: body.defaultRule,
    },
  })
  if (!response.ok()) {
    throw new Error(`Upsert draw policy failed (${response.status()}): ${await response.text()}`)
  }
}

export async function resolveEventId(
  page: Page,
  seasonId: string,
  eventSlug: string,
): Promise<string> {
  const response = await page.request.get(
    `/v1/seasons/${seasonId}/events/by-slug/${encodeURIComponent(eventSlug)}`,
  )
  if (!response.ok()) {
    throw new Error(`Event lookup failed (${response.status()}): ${await response.text()}`)
  }
  const event = (await response.json()) as { id: string }
  return event.id
}

export async function getEffectiveDrawPolicy(
  page: Page,
  seasonId: string,
  eventId: string,
): Promise<EffectiveDrawPolicyDto> {
  const response = await page.request.get(
    `/v1/seasons/${seasonId}/events/${eventId}/draw-policy/effective`,
  )
  if (!response.ok()) {
    throw new Error(
      `Effective draw policy failed (${response.status()}): ${await response.text()}`,
    )
  }
  return response.json() as Promise<EffectiveDrawPolicyDto>
}

export async function ensureChoicePolicyWithTwoFormulas(
  page: Page,
  labelPrefix = 'E2E 19.21',
): Promise<ChoiceFormulaPair> {
  const ts = Date.now()
  const system = (await listDrawFormulas(page)).find(
    (formula) => formula.isSystem && formula.status === 'PUBLISHED',
  )
  if (!system) {
    throw new Error('Published system draw formula missing from seed')
  }

  const custom = await createPublishedDrawFormula(
    page,
    `${labelPrefix} custom ${ts}`,
    2,
  )

  await upsertTroupeDrawPolicy(page, {
    defaultRule: {
      mode: 'CHOICE',
      allowedFormulaIds: [system.id, custom.id],
    },
  })

  return {
    formulaAId: system.id,
    formulaBId: custom.id,
    formulaAName: system.name,
    formulaBName: custom.name,
  }
}

export async function setMandatoryDrawPolicy(
  page: Page,
  mandatoryFormulaId: string,
): Promise<void> {
  await upsertTroupeDrawPolicy(page, {
    defaultRule: {
      mode: 'MANDATORY',
      mandatoryFormulaId,
    },
  })
}

export async function setChoiceSingleFormulaPolicy(
  page: Page,
  formulaId: string,
): Promise<void> {
  await upsertTroupeDrawPolicy(page, {
    defaultRule: {
      mode: 'CHOICE',
      allowedFormulaIds: [formulaId],
    },
  })
}

export async function openDrawEventEquipeTab(
  page: Page,
  fx: E1CutoverFixture,
): Promise<void> {
  await openEventTab(page, fx, fx.eventDrawSlug, 'equipe')
  await expect(page.getByTestId('composition-actions-toolbar')).toBeVisible({ timeout: 30_000 })
}

export async function expectEquipePolicyLoaded(page: Page): Promise<void> {
  await expect(page.locator('app-event-equipe-tab')).toBeVisible({ timeout: 30_000 })
  const draw = page.getByRole('button', { name: 'Tirer au sort' })
  await expect(draw).toBeVisible({ timeout: 30_000 })
  await expect(draw).toBeEnabled({ timeout: 30_000 })
}

export async function openEquipeOverflowMenu(page: Page): Promise<void> {
  const overflow = page.getByTestId('composition-actions-overflow')
  await expect(overflow).toBeVisible({ timeout: 15_000 })
  await overflow.click()
  await expect(page.getByTestId('composition-draw-formula-menu')).toBeVisible({ timeout: 10_000 })
}

export async function selectDrawFormulaFromOverflowMenu(
  page: Page,
  formulaId: string,
): Promise<void> {
  await openEquipeOverflowMenu(page)
  await page.getByTestId(`composition-draw-formula-option-${formulaId}`).click()
}

export async function openRolePoolPreview(page: Page, roleKey = 'player'): Promise<void> {
  const trigger = page.locator(`[data-testid="composition-role-pool-trigger"]`).first()
  await expect(trigger).toBeVisible({ timeout: 15_000 })
  await trigger.click()
  await expect(page.getByTestId('composition-pool-preview')).toBeVisible({ timeout: 15_000 })
}

export async function fetchPoolPreviewSegments(
  page: Page,
  seasonId: string,
  eventId: string,
  roleKey: string,
  formulaId: string,
): Promise<PoolPreviewSegment[]> {
  const params = new URLSearchParams({ roleKey, formulaId })
  const response = await page.request.get(
    `/v1/seasons/${seasonId}/events/${eventId}/composition/pool-preview?${params}`,
  )
  if (!response.ok()) {
    throw new Error(`Pool preview failed (${response.status()}): ${await response.text()}`)
  }
  const body = (await response.json()) as { segments: PoolPreviewSegment[] }
  return body.segments ?? []
}

export function chanceSignature(segments: PoolPreviewSegment[]): string {
  return segments
    .map((segment) => `${segment.participantId}:${segment.chancePercent}`)
    .sort()
    .join('|')
}
