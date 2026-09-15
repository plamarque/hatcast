import { Component, inject, input, OnInit, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatChipsModule } from '@angular/material/chips'
import { MatDialog } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { firstValueFrom } from 'rxjs'

import { DrawFormulaApiService } from '../../core/draw/draw-formula-api.service'
import {
  editorStateFromFactorConfig,
  type DrawFormula,
  type DrawFormulaEditorState,
} from '../../core/draw/draw-formula-payload'
import { formulaStatusLabel } from '../../core/draw/draw-factor-catalog'
import {
  DrawPolicyApiService,
  type DrawCategoryRule,
  type DrawPolicyRule,
  type TroupeDrawPolicy,
} from '../../core/draw/draw-policy-api.service'
import { TroupeApiService, type TroupeCategory } from '../../core/troupes/troupe-api.service'
import { DEFAULT_CATEGORY_SLUG } from '../event-detail/event-category.constants'
import {
  TroupeDrawFormulaArchiveDialog,
  type TroupeDrawFormulaArchiveDialogResult,
} from './troupe-draw-formula-archive-dialog'
import {
  TroupeDrawFormulaEditorDialog,
  type TroupeDrawFormulaEditorDialogResult,
} from './troupe-draw-formula-editor-dialog'
import { TroupeDrawFormulaProfileChart } from './troupe-draw-formula-profile-chart'

export const SYSTEM_FALLBACK_COPY = 'Spectacles et catégories sans formule dédiée'

export const SYSTEM_FORMULA_DISPLAY_NAME = 'Formule standard'

const POLICY_SAVE_ERROR = 'Impossible d’enregistrer la politique de tirage.'
const POLICY_LOAD_BLOCKED =
  'Politique de tirage indisponible. Recharge la page avant d’assigner une catégorie.'

/** Align with DrawPolicyResolutionService.resolveImplicitDefault: published non-system (name asc), then system V1. */
export function implicitChoiceDefaultRule(formulas: DrawFormula[]): DrawPolicyRule {
  const publishedNonSystemIds = formulas
    .filter((formula) => !formula.isSystem && formula.status === 'PUBLISHED')
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
    .map((formula) => formula.id)
  const systemId = formulas.find((formula) => formula.isSystem)?.id
  const allowedFormulaIds = systemId
    ? [...publishedNonSystemIds, systemId]
    : publishedNonSystemIds
  return { mode: 'CHOICE', allowedFormulaIds }
}

export function occupiedCategorySlugs(rules: DrawCategoryRule[] | null | undefined): Set<string> {
  return new Set(
    (rules ?? [])
      .filter((rule) => rule.mode === 'MANDATORY')
      .map((rule) => rule.category)
      .filter((slug): slug is string => !!slug),
  )
}

export function mandatoryChipsForFormula(
  rules: DrawCategoryRule[] | null | undefined,
  formulaId: string,
  glossary: TroupeCategory[],
): TroupeCategory[] {
  const bySlug = new Map(glossary.map((category) => [category.slug, category]))
  return (rules ?? [])
    .filter(
      (rule) =>
        rule.mode === 'MANDATORY' &&
        rule.mandatoryFormulaId === formulaId &&
        !!rule.category,
    )
    .map((rule) => {
      const slug = rule.category as string
      return bySlug.get(slug) ?? { slug, label: slug }
    })
}

export function freeGlossaryCategories(
  glossary: TroupeCategory[],
  rules: DrawCategoryRule[] | null | undefined,
): TroupeCategory[] {
  const occupied = occupiedCategorySlugs(rules)
  return glossary.filter(
    (category) => category.slug !== DEFAULT_CATEGORY_SLUG && !occupied.has(category.slug),
  )
}

export function withMandatoryCategory(
  policy: TroupeDrawPolicy,
  formulaId: string,
  slug: string,
): TroupeDrawPolicy {
  const categoryRules = policy.categoryRules ?? []
  return {
    ...policy,
    categoryRules: [
      ...categoryRules.filter((rule) => rule.category !== slug),
      { category: slug, mode: 'MANDATORY', mandatoryFormulaId: formulaId },
    ],
  }
}

export function withoutCategoryRule(
  policy: TroupeDrawPolicy,
  slug: string,
): TroupeDrawPolicy {
  return {
    ...policy,
    categoryRules: (policy.categoryRules ?? []).filter(
      (rule) => !(rule.category === slug && rule.mode === 'MANDATORY'),
    ),
  }
}

@Component({
  selector: 'app-troupe-draw-formulas-tab',
  imports: [
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    TroupeDrawFormulaProfileChart,
  ],
  templateUrl: './troupe-draw-formulas-tab.html',
  styleUrl: './troupe-draw-formulas-tab.scss',
})
export class TroupeDrawFormulasTab implements OnInit {
  private readonly drawFormulaApi = inject(DrawFormulaApiService)
  private readonly drawPolicyApi = inject(DrawPolicyApiService)
  private readonly troupeApi = inject(TroupeApiService)
  private readonly dialog = inject(MatDialog)
  private readonly snack = inject(MatSnackBar)

  readonly troupeId = input.required<string>()

  protected readonly loading = signal(true)
  protected readonly loadError = signal(false)
  protected readonly policyLoadWarning = signal(false)
  protected readonly formulas = signal<DrawFormula[]>([])
  protected readonly glossary = signal<TroupeCategory[]>([])
  protected readonly policy = signal<TroupeDrawPolicy | null>(null)
  protected readonly saving = signal(false)

  protected readonly systemFallbackCopy = SYSTEM_FALLBACK_COPY

  async ngOnInit(): Promise<void> {
    await this.reload()
  }

  protected statusLabel(status: DrawFormula['status']): string {
    return formulaStatusLabel(status)
  }

  protected displayName(formula: DrawFormula): string {
    return formula.isSystem ? SYSTEM_FORMULA_DISPLAY_NAME : formula.name
  }

  protected editorStateFor(formula: DrawFormula): DrawFormulaEditorState {
    return editorStateFromFactorConfig(formula.factorConfig)
  }

  protected showsAppliedToEditor(formula: DrawFormula): boolean {
    return !formula.isSystem && formula.status === 'PUBLISHED'
  }

  protected showsSystemFallback(formula: DrawFormula): boolean {
    return formula.isSystem
  }

  protected chipsFor(formula: DrawFormula): TroupeCategory[] {
    return mandatoryChipsForFormula(this.policy()?.categoryRules ?? [], formula.id, this.glossary())
  }

  protected freeCategories(): TroupeCategory[] {
    return freeGlossaryCategories(this.glossary(), this.policy()?.categoryRules ?? [])
  }

  protected async openCreate(): Promise<void> {
    const ref = this.dialog.open(TroupeDrawFormulaEditorDialog, {
      data: { mode: 'create', troupeId: this.troupeId() },
      width: 'min(480px, 100vw - 2rem)',
      maxHeight: '90vh',
      disableClose: true,
    })
    const result = (await firstValueFrom(ref.afterClosed())) as
      | TroupeDrawFormulaEditorDialogResult
      | undefined
    if (!result?.ok) return
    this.snack.open(
      result.published ? 'Formule publiée' : 'Formule enregistrée',
      'OK',
      { duration: 4000 },
    )
    await this.reload()
  }

  protected async openEdit(formula: DrawFormula): Promise<void> {
    const ref = this.dialog.open(TroupeDrawFormulaEditorDialog, {
      data: { mode: 'edit', troupeId: this.troupeId(), formula },
      width: 'min(480px, 100vw - 2rem)',
      maxHeight: '90vh',
      disableClose: true,
    })
    const result = (await firstValueFrom(ref.afterClosed())) as
      | TroupeDrawFormulaEditorDialogResult
      | undefined
    if (!result?.ok) return
    this.snack.open(
      result.published ? 'Formule publiée' : 'Formule enregistrée',
      'OK',
      { duration: 4000 },
    )
    await this.reload()
  }

  protected async openArchive(formula: DrawFormula): Promise<void> {
    const ref = this.dialog.open(TroupeDrawFormulaArchiveDialog, {
      data: {
        troupeId: this.troupeId(),
        formulaId: formula.id,
        name: formula.name,
      },
      width: 'min(24rem, 100vw - 2rem)',
      disableClose: true,
    })
    const result = (await firstValueFrom(ref.afterClosed())) as
      | TroupeDrawFormulaArchiveDialogResult
      | undefined
    if (!result) return
    if (!result.ok) {
      this.snack.open(result.message, 'OK', { duration: 7000 })
      return
    }
    this.snack.open('Formule archivée', 'OK', { duration: 4000 })
    await this.reload()
  }

  protected async assignCategory(formula: DrawFormula, slug: string): Promise<void> {
    const current = this.requirePolicyDocument()
    await this.persistPolicy(withMandatoryCategory(current, formula.id, slug))
  }

  protected async unassignCategory(slug: string): Promise<void> {
    const current = this.requirePolicyDocument()
    await this.persistPolicy(withoutCategoryRule(current, slug))
  }

  private requirePolicyDocument(): TroupeDrawPolicy {
    return (
      this.policy() ?? {
        defaultRule: implicitChoiceDefaultRule(this.formulas()),
        categoryRules: [],
      }
    )
  }

  private async persistPolicy(next: TroupeDrawPolicy): Promise<void> {
    if (this.policyLoadWarning()) {
      this.snack.open(POLICY_LOAD_BLOCKED, 'OK', { duration: 7000 })
      return
    }
    if (this.saving()) return
    this.saving.set(true)
    try {
      const result = await this.drawPolicyApi.putTroupeDrawPolicy(this.troupeId(), {
        defaultRule: next.defaultRule,
        categoryRules: next.categoryRules ?? [],
      })
      if (!result.ok) {
        this.snack.open(result.errorMessage?.trim() || POLICY_SAVE_ERROR, 'OK', { duration: 7000 })
        await this.reloadPolicyOnly()
        return
      }
      this.policy.set(result.data)
    } finally {
      this.saving.set(false)
    }
  }

  private async reloadPolicyOnly(): Promise<void> {
    const policyResult = await this.drawPolicyApi.getTroupeDrawPolicy(this.troupeId())
    if (!policyResult.ok) {
      this.policyLoadWarning.set(true)
      return
    }
    this.policyLoadWarning.set(false)
    this.policy.set(
      policyResult.data ?? {
        defaultRule: implicitChoiceDefaultRule(this.formulas()),
        categoryRules: [],
      },
    )
  }

  private async reload(): Promise<void> {
    this.loading.set(true)
    this.loadError.set(false)
    const troupeId = this.troupeId()
    const [formulasResult, categoriesResult, policyResult] = await Promise.all([
      this.drawFormulaApi.list(troupeId),
      this.troupeApi.listCategories(troupeId),
      this.drawPolicyApi.getTroupeDrawPolicy(troupeId),
    ])
    this.loading.set(false)
    if (
      !formulasResult.ok ||
      !formulasResult.data ||
      !categoriesResult.ok ||
      !categoriesResult.data
    ) {
      this.loadError.set(true)
      this.policyLoadWarning.set(false)
      this.formulas.set([])
      this.glossary.set([])
      this.policy.set(null)
      return
    }
    const formulas = formulasResult.data
    this.formulas.set(formulas)
    this.glossary.set(categoriesResult.data)
    if (!policyResult.ok) {
      this.policyLoadWarning.set(true)
      this.policy.set({
        defaultRule: implicitChoiceDefaultRule(formulas),
        categoryRules: [],
      })
      return
    }
    this.policyLoadWarning.set(false)
    this.policy.set(
      policyResult.data ?? {
        defaultRule: implicitChoiceDefaultRule(formulas),
        categoryRules: [],
      },
    )
  }
}
