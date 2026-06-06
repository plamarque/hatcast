import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { describe, expect, it } from 'vitest'

import type { CompositionEquipeStatus } from '../../core/composition/composition-equipe-status'
import { CompositionEquipeStatusHeader } from './composition-equipe-status-header'

function status(overrides: Partial<CompositionEquipeStatus> = {}): CompositionEquipeStatus {
  return {
    type: 'none',
    label: 'À composer',
    tone: 'neutral',
    managerGuideline: 'À composer : Cliquez dans un emplacement…',
    ...overrides,
  }
}

describe('CompositionEquipeStatusHeader', () => {
  let fixture: ComponentFixture<CompositionEquipeStatusHeader>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompositionEquipeStatusHeader, NoopAnimationsModule],
    }).compileComponents()

    fixture = TestBed.createComponent(CompositionEquipeStatusHeader)
  })

  it('shows badge and help trigger for organizer guideline', () => {
    fixture.componentRef.setInput('status', status())
    fixture.detectChanges()

    const el = fixture.nativeElement as HTMLElement
    expect(el.querySelector('[data-testid="composition-status-badge"]')?.textContent?.trim()).toBe(
      'À composer',
    )
    const trigger = el.querySelector(
      '[data-testid="composition-status-help-trigger"]',
    ) as HTMLButtonElement
    expect(trigger).not.toBeNull()
    expect(trigger.getAttribute('aria-label')).toBe('Comprendre le statut : À composer')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(el.querySelector('[data-testid="composition-status-help-panel"]')).toBeNull()
  })

  it('hides help trigger when managerGuideline is null', () => {
    fixture.componentRef.setInput(
      'status',
      status({ managerGuideline: null, label: 'Confirmations en cours', type: 'pending_confirmation' }),
    )
    fixture.detectChanges()

    const el = fixture.nativeElement as HTMLElement
    expect(el.querySelector('[data-testid="composition-status-help-trigger"]')).toBeNull()
  })

  it('toggles reveal panel with guideline content', () => {
    fixture.componentRef.setInput('status', status())
    fixture.detectChanges()

    const trigger = fixture.nativeElement.querySelector(
      '[data-testid="composition-status-help-trigger"]',
    ) as HTMLButtonElement
    trigger.click()
    fixture.detectChanges()

    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    const hint = fixture.nativeElement.querySelector(
      '[data-testid="composition-status-hint"]',
    ) as HTMLElement
    expect(hint.textContent).toContain('À composer')
    expect(
      fixture.nativeElement.querySelector('[data-testid="composition-status-help-panel"]'),
    ).not.toBeNull()

    trigger.click()
    fixture.detectChanges()

    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(fixture.nativeElement.querySelector('[data-testid="composition-status-hint"]')).toBeNull()
  })

  it('closes panel when status type changes', () => {
    fixture.componentRef.setInput('status', status())
    fixture.detectChanges()

    const trigger = fixture.nativeElement.querySelector(
      '[data-testid="composition-status-help-trigger"]',
    ) as HTMLButtonElement
    trigger.click()
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('[data-testid="composition-status-help-panel"]')).not.toBeNull()

    fixture.componentRef.setInput(
      'status',
      status({
        type: 'draft',
        label: 'En préparation',
        tone: 'info',
        managerGuideline: 'En préparation : partagez…',
      }),
    )
    fixture.detectChanges()

    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(fixture.nativeElement.querySelector('[data-testid="composition-status-help-panel"]')).toBeNull()
  })

  it('applies success panel modifier for complete tone', () => {
    fixture.componentRef.setInput(
      'status',
      status({
        type: 'complete',
        label: 'Équipe complète',
        tone: 'success',
        managerGuideline: 'Équipe complète : Annoncez…',
      }),
    )
    fixture.detectChanges()

    const trigger = fixture.nativeElement.querySelector(
      '[data-testid="composition-status-help-trigger"]',
    ) as HTMLButtonElement
    trigger.click()
    fixture.detectChanges()

    const panel = fixture.nativeElement.querySelector(
      '[data-testid="composition-status-help-panel"]',
    ) as HTMLElement
    expect(panel.classList.contains('composition-equipe-status__help-panel--success')).toBe(true)
  })

  it('hides badge row when showBadge is false', () => {
    fixture.componentRef.setInput('status', status())
    fixture.componentRef.setInput('showBadge', false)
    fixture.detectChanges()

    expect(fixture.nativeElement.querySelector('[data-testid="composition-status-badge"]')).toBeNull()
    expect(fixture.nativeElement.querySelector('[data-testid="composition-status-help-trigger"]')).toBeNull()
  })

  it('shows slots_to_complete guideline in reveal panel', () => {
    fixture.componentRef.setInput(
      'status',
      status({
        type: 'slots_to_complete',
        label: 'À compléter',
        tone: 'warning',
        managerGuideline: 'À compléter : Cliquez dans un emplacement vide…',
      }),
    )
    fixture.detectChanges()

    const trigger = fixture.nativeElement.querySelector(
      '[data-testid="composition-status-help-trigger"]',
    ) as HTMLButtonElement
    trigger.click()
    fixture.detectChanges()

    expect(
      fixture.nativeElement.querySelector('[data-testid="composition-status-hint"]')?.textContent,
    ).toContain('À compléter')
  })

  it('shows has_declined guideline in reveal panel', () => {
    fixture.componentRef.setInput(
      'status',
      status({
        type: 'has_declined',
        label: 'À vérifier',
        tone: 'warning',
        managerGuideline: 'À vérifier : Des participants ont décliné…',
      }),
    )
    fixture.detectChanges()

    const trigger = fixture.nativeElement.querySelector(
      '[data-testid="composition-status-help-trigger"]',
    ) as HTMLButtonElement
    trigger.click()
    fixture.detectChanges()

    expect(
      fixture.nativeElement.querySelector('[data-testid="composition-status-hint"]')?.textContent,
    ).toContain('À vérifier')
  })

  it('keeps help panel open when status object is recreated with same type and label', () => {
    fixture.componentRef.setInput('status', status())
    fixture.detectChanges()

    const trigger = fixture.nativeElement.querySelector(
      '[data-testid="composition-status-help-trigger"]',
    ) as HTMLButtonElement
    trigger.click()
    fixture.detectChanges()

    fixture.componentRef.setInput(
      'status',
      status({ managerGuideline: 'À composer : texte mis à jour…' }),
    )
    fixture.detectChanges()

    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(
      fixture.nativeElement.querySelector('[data-testid="composition-status-help-panel"]'),
    ).not.toBeNull()
  })

})
