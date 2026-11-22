import { TestBed } from '@angular/core/testing'
import { describe, expect, it, vi } from 'vitest'
import { AvailabilityRecordedCandidates } from './availability-recorded-candidates'

describe('AvailabilityRecordedCandidates', () => {
  it('opens the selection sheet even when recorded data is missing', async () => {
    await TestBed.configureTestingModule({ imports: [AvailabilityRecordedCandidates] }).compileComponents()
    const fixture = TestBed.createComponent(AvailabilityRecordedCandidates)
    fixture.componentRef.setInput('interactive', true)
    fixture.componentRef.setInput('candidates', [
      { participantId: 'a', displayName: 'Alex', publishedAssignment: true, participationStatus: 'pending', chancePercent: 37, selectionChanceAt: '2026-01-02T12:00:00Z' },
      { participantId: 'b', displayName: 'Béa', chancePercent: 63 },
      { participantId: 'c', displayName: 'Camille', publishedAssignment: true, chancePercent: null },
    ])
    const tap = vi.fn()
    fixture.componentInstance.segmentTap.subscribe(tap)
    fixture.detectChanges()
    const selected = fixture.nativeElement.querySelector('[data-testid="composition-draw-segment-a"]') as HTMLButtonElement
    const other = fixture.nativeElement.querySelector('[data-testid="composition-draw-segment-b"]') as HTMLButtonElement
    const missing = fixture.nativeElement.querySelector('.recorded-missing') as HTMLButtonElement
    expect(selected.title).toContain('37 %')
    expect(selected.getAttribute('aria-label')).toContain('sélection en attente')
    expect(fixture.nativeElement.textContent).not.toContain('02/01/2026')
    selected.click()
    expect(tap).toHaveBeenCalledWith({ participantId: 'a', chancePercent: 37 })
    missing.click()
    expect(tap).toHaveBeenCalledWith({ participantId: 'c', chancePercent: null })
    expect(missing.textContent).not.toContain('%')
    other.click()
    expect(tap).toHaveBeenCalledWith({ participantId: 'b', chancePercent: 63 })
  })
  it('makes neutral and assigned badges accessible when interaction is enabled', async () => {
    await TestBed.configureTestingModule({ imports: [AvailabilityRecordedCandidates] }).compileComponents()
    const fixture = TestBed.createComponent(AvailabilityRecordedCandidates)
    fixture.componentRef.setInput('interactive', true)
    fixture.componentRef.setInput('candidates', [
      { participantId: 'neutral', displayName: 'Noor', chancePercent: null },
      { participantId: 'pending', displayName: 'Paul', chancePercent: null, publishedAssignment: true, participationStatus: 'pending' },
      { participantId: 'selected', displayName: 'Sam', chancePercent: null, publishedAssignment: true, participationStatus: 'confirmed' },
    ])
    fixture.detectChanges()
    const badges = [...fixture.nativeElement.querySelectorAll('.recorded-missing')] as HTMLButtonElement[]
    expect(badges[0].disabled).toBe(false)
    expect(badges[0].getAttribute('aria-label')).toBe('Voir les chances de Noor')
    expect(badges[0].classList.contains('recorded-missing--assigned')).toBe(false)
    expect(badges[1].disabled).toBe(false)
    expect(badges[1].getAttribute('aria-label')).toBe('Voir la fiche de sélection de Paul, capture des chances indisponible')
    expect(badges[1].classList.contains('recorded-missing--assigned')).toBe(true)
    expect(badges[2].classList.contains('recorded-missing--assigned')).toBe(true)
    fixture.componentRef.setInput('interactive', false)
    fixture.detectChanges()
    expect(badges.every(badge => badge.disabled)).toBe(true)
    expect(badges[1].classList.contains('recorded-missing--assigned')).toBe(true)
  })

})
