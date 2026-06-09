import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { describe, expect, it, vi } from 'vitest'

import { buildWhatsAppSendUrl } from '../../core/messaging/share-announce-messages'
import { ShareAnnounceApiService } from '../../core/share-announce/share-announce-api.service'
import { ShareAnnounceDialog, type ShareAnnounceDialogData } from './share-announce-dialog'

const recipientsMock = {
  ok: true as const,
  status: 200,
  data: {
    total: 2,
    notifiableCount: 1,
    manualCount: 1,
    recipients: [
      {
        participantId: 'p-1',
        displayName: 'Alice',
        emailObfuscated: 'ali••@ex••.com',
        channels: {
          email: { eligible: true, notified: true },
          push: { eligible: false, notified: false },
        },
      },
      {
        participantId: 'p-2',
        displayName: 'Bob',
        emailObfuscated: null,
        channels: {
          email: { eligible: false, notified: false },
          push: { eligible: false, notified: false },
        },
      },
    ],
    guardDays: 3,
  },
}

const baseDialogData: ShareAnnounceDialogData = {
  intent: 'draw',
  seasonId: 'season-1',
  eventId: 'event-1',
  seasonSlug: 'saison-a',
  troupeSlug: 'troupe-a',
  eventSlug: 'event-1',
  eventTitle: 'Spectacle test',
  eventDateIso: '2026-05-12T19:00:00.000Z',
  roleLines: [{ roleKey: 'player', displayNames: ['Alice'] }],
}

async function configureDialog(
  data: ShareAnnounceDialogData,
  options?: {
    getRecipients?: ReturnType<typeof vi.fn>
  },
): Promise<ComponentFixture<ShareAnnounceDialog>> {
  await TestBed.configureTestingModule({
    imports: [ShareAnnounceDialog, NoopAnimationsModule],
    providers: [
      { provide: MatDialogRef, useValue: { close: vi.fn() } },
      { provide: MAT_DIALOG_DATA, useValue: data },
      {
        provide: ShareAnnounceApiService,
        useValue: {
          getRecipients: options?.getRecipients ?? vi.fn().mockResolvedValue(recipientsMock),
        },
      },
      {
        provide: MatSnackBar,
        useValue: { open: vi.fn() },
      },
    ],
  }).compileComponents()
  const fixture = TestBed.createComponent(ShareAnnounceDialog)
  fixture.detectChanges()
  return fixture
}

describe('ShareAnnounceDialog', () => {
  it('prefills draw template and shows only Copier and WhatsApp actions', async () => {
    const fixture = await configureDialog(baseDialogData)
    await vi.waitFor(() => {
      const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement
      expect(textarea?.value).toContain('TIRAGE')
    })
    expect(fixture.nativeElement.textContent).toContain('Copier')
    expect(fixture.nativeElement.textContent).toContain('WhatsApp')
    expect(fixture.nativeElement.textContent).not.toContain('Notifier')
    expect(fixture.nativeElement.querySelector('button[mat-flat-button]')).toBeNull()
    expect(fixture.nativeElement.querySelector('h2[mat-dialog-title]')).toBeTruthy()
    expect(fixture.nativeElement.querySelector('.share-announce-dialog__actions-row')).toBeTruthy()
    expect(fixture.nativeElement.querySelector('button[mat-icon-button]')).toBeNull()
    expect(fixture.nativeElement.textContent).toContain('Fermer')
  })

  it('shows compact recipients line with Reste à prévenir chips', async () => {
    const fixture = await configureDialog(baseDialogData)
    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Reste à prévenir')
    })
    expect(fixture.nativeElement.textContent).toContain('Bob')
    expect(fixture.nativeElement.textContent).toContain('1 personne')
    expect(fixture.nativeElement.textContent).toContain('déjà notifiée automatiquement')
    expect(fixture.nativeElement.querySelector('mat-expansion-panel')).toBeNull()
    expect(fixture.nativeElement.querySelector('mat-chip')).toBeTruthy()
  })

  it('uses updated hint and textarea min rows', async () => {
    const fixture = await configureDialog(baseDialogData)
    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain(
        'Copier et WhatsApp utilisent le texte ci-dessus.',
      )
    })
    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement
    expect(textarea.getAttribute('cdkautosizeminrows')).toBe('8')
  })

  it('copies message to clipboard and shows snack', async () => {
    const fixture = await configureDialog(baseDialogData)
    const snack = TestBed.inject(MatSnackBar)
    const writeText = vi.fn().mockResolvedValue(undefined)
    const originalNavigator = globalThis.navigator
    vi.stubGlobal('navigator', {
      ...originalNavigator,
      clipboard: { writeText },
    })

    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('textarea')).toBeTruthy()
    })

    const copyBtn = [...fixture.nativeElement.querySelectorAll('button')].find((btn: HTMLButtonElement) =>
      btn.textContent?.includes('Copier'),
    ) as HTMLButtonElement
    copyBtn.click()
    await vi.waitFor(() => {
      expect(writeText).toHaveBeenCalled()
      expect(snack.open).toHaveBeenCalledWith('Message copié.', 'OK', { duration: 3000 })
    })

    vi.stubGlobal('navigator', originalNavigator)
  })

  it('opens WhatsApp with edited message text', async () => {
    const fixture = await configureDialog(baseDialogData)
    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('textarea')).toBeTruthy()
    })
    const edited = 'Message personnalisé #test'
    Reflect.set(fixture.componentInstance, 'messageText', edited)

    let navigatedTo = ''
    vi.stubGlobal('location', {
      ...window.location,
      set href(url: string) {
        navigatedTo = url
      },
      get href() {
        return navigatedTo
      },
    })

    fixture.componentInstance['openWhatsApp']()
    expect(navigatedTo).toBe(buildWhatsAppSendUrl(edited))
  })

  it('prefills composition template with confirm link', async () => {
    const fixture = await configureDialog({ ...baseDialogData, intent: 'composition' })
    await vi.waitFor(() => {
      const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement
      expect(textarea?.value).toContain('COMPO')
      expect(textarea?.value).toContain('showConfirm=true')
    })
    expect(fixture.nativeElement.textContent).toContain('Annoncer la compo')
  })

  it('prefills availability nudge reminder template and title', async () => {
    const fixture = await configureDialog({ ...baseDialogData, intent: 'availability_nudge' })
    await vi.waitFor(() => {
      const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement
      expect(textarea?.value).toContain('⏰ Rappel disponibilité')
      expect(textarea?.value).toContain('?tab=dispos')
    })
    expect(fixture.nativeElement.textContent).toContain('Rappel disponibilité')
  })

  it('shows event intent title Annonce de spectacle', async () => {
    const fixture = await configureDialog({ ...baseDialogData, intent: 'event' })
    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('textarea')).toBeTruthy()
    })
    const title = fixture.nativeElement.querySelector('h2[mat-dialog-title]')
    expect(title?.textContent?.trim()).toBe('Annonce de spectacle')
  })

  it('opens already-notified menu on link click', async () => {
    const fixture = await configureDialog(baseDialogData)
    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('.share-announce-dialog__already-link')).toBeTruthy()
    })

    const linkBtn = fixture.nativeElement.querySelector(
      '.share-announce-dialog__already-link',
    ) as HTMLButtonElement
    expect(linkBtn.getAttribute('aria-label')).toBe('1 personne déjà notifiée — afficher les noms')
    linkBtn.click()
    fixture.detectChanges()
    await vi.waitFor(() => {
      const menuItem = document.querySelector('.mat-mdc-menu-item')
      expect(menuItem?.textContent?.trim()).toBe('Alice')
    })
  })

  it('shows only Reste à prévenir when nobody was notified yet', async () => {
    const getRecipients = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        total: 1,
        notifiableCount: 1,
        manualCount: 0,
        recipients: [
          {
            participantId: 'p-3',
            displayName: 'Carol',
            emailObfuscated: 'car••@ex••.com',
            channels: {
              email: { eligible: true, notified: false },
              push: { eligible: false, notified: false },
            },
          },
        ],
      },
    })
    const fixture = await configureDialog(baseDialogData, { getRecipients })
    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Reste à prévenir')
    })
    expect(fixture.nativeElement.textContent).toContain('Carol')
    expect(fixture.nativeElement.textContent).not.toContain('déjà notifiées automatiquement')
    expect(fixture.nativeElement.querySelector('.share-announce-dialog__already-link')).toBeNull()
  })

  it('shows only already-notified segment when everyone was notified', async () => {
    const getRecipients = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        total: 1,
        notifiableCount: 1,
        manualCount: 0,
        recipients: [
          {
            participantId: 'p-1',
            displayName: 'Alice',
            emailObfuscated: 'ali••@ex••.com',
            channels: {
              email: { eligible: true, notified: true },
              push: { eligible: false, notified: false },
            },
          },
        ],
      },
    })
    const fixture = await configureDialog(baseDialogData, { getRecipients })
    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('déjà notifiée automatiquement.')
    })
    expect(fixture.nativeElement.textContent).not.toContain('Reste à prévenir')
    expect(fixture.nativeElement.querySelector('mat-chip')).toBeNull()
  })

  it('shows empty recipients hint when roster is empty', async () => {
    const getRecipients = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        total: 0,
        notifiableCount: 0,
        manualCount: 0,
        recipients: [],
      },
    })
    const fixture = await configureDialog(baseDialogData, { getRecipients })
    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Aucun destinataire pour cette action.')
    })
  })
})
