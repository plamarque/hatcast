import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { of } from 'rxjs'
import { describe, expect, it, vi } from 'vitest'

import { buildWhatsAppSendUrl } from '../../core/messaging/share-announce-messages'
import { ShareAnnounceApiService } from '../../core/share-announce/share-announce-api.service'
import { ConfirmDialog } from '../../pages/seasons-list/confirm-dialog'
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
    sendNotifications?: ReturnType<typeof vi.fn>
    matDialogOpen?: ReturnType<typeof vi.fn>
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
          sendNotifications:
            options?.sendNotifications ??
            vi.fn().mockResolvedValue({
              ok: true,
              status: 200,
              data: { accepted: true, notifiedCount: 0, manualCount: 0, intent: data.intent },
            }),
        },
      },
      {
        provide: MatSnackBar,
        useValue: { open: vi.fn() },
      },
      ...(options?.matDialogOpen
        ? [{ provide: MatDialog, useValue: { open: options.matDialogOpen } }]
        : []),
    ],
  }).compileComponents()
  const fixture = TestBed.createComponent(ShareAnnounceDialog)
  fixture.detectChanges()
  return fixture
}

describe('ShareAnnounceDialog', () => {
  it('prefills draw template and shows M3 share actions', async () => {
    const fixture = await configureDialog(baseDialogData)
    await vi.waitFor(() => {
      const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement
      expect(textarea?.value).toContain('TIRAGE')
    })
    expect(fixture.nativeElement.textContent).toContain('Copier')
    expect(fixture.nativeElement.textContent).toContain('WhatsApp')
    expect(fixture.nativeElement.querySelector('h2[mat-dialog-title]')).toBeTruthy()
    expect(fixture.nativeElement.querySelector('.share-announce-dialog__actions-row')).toBeTruthy()
  })

  it('loads recipients summary with compact copy', async () => {
    const fixture = await configureDialog(baseDialogData)
    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('notifiable')
    })
    expect(fixture.nativeElement.textContent).toContain('concernée')
    expect(fixture.nativeElement.querySelector('mat-expansion-panel')).toBeTruthy()
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

  it('places Notifier before Copier in the actions row', async () => {
    const fixture = await configureDialog(baseDialogData)
    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Notifier 1 personne')
    })
    const row = fixture.nativeElement.querySelector(
      '.share-announce-dialog__actions-row',
    ) as HTMLElement
    const buttons = [...row.querySelectorAll('button')] as HTMLButtonElement[]
    const notifyBtn = row.querySelector('button[mat-flat-button]') as HTMLButtonElement
    const copyBtn = buttons.find((btn) => btn.textContent?.includes('Copier'))
    expect(copyBtn).toBeTruthy()
    expect(buttons.indexOf(notifyBtn)).toBeLessThan(buttons.indexOf(copyBtn!))
    expect(buttons[0]).toBe(notifyBtn)
  })

  it('does not show auto-notif info bandeau on published event', async () => {
    const fixture = await configureDialog({
      ...baseDialogData,
      intent: 'availability_nudge',
      availabilityOpenedAt: '2026-01-01T00:00:00.000Z',
    })
    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('notifiable')
    })
    expect(fixture.nativeElement.textContent).not.toContain('ouverture des disponibilités')
  })

  it('does not show guard bandeau before notify click for draw', async () => {
    const getRecipients = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        ...recipientsMock.data,
        lastManualNotifyAt: new Date().toISOString(),
      },
    })

    const fixture = await configureDialog(baseDialogData, { getRecipients })
    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('notifiable')
    })
    expect(fixture.nativeElement.textContent).not.toContain('Un envoi pour ce type d\'annonce')
  })

  it('does not show guard bandeau before notify click for nudge', async () => {
    const getRecipients = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        ...recipientsMock.data,
        lastManualNotifyAt: new Date().toISOString(),
      },
    })

    const fixture = await configureDialog(
      { ...baseDialogData, intent: 'availability_nudge' },
      { getRecipients },
    )
    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('notifiable')
    })
    expect(fixture.nativeElement.textContent).not.toContain('Un rappel a déjà été envoyé')
  })

  it('opens confirm dialog and blocks send when guard is active and user declines', async () => {
    const getRecipients = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        ...recipientsMock.data,
        lastManualNotifyAt: new Date().toISOString(),
      },
    })
    const sendNotifications = vi.fn()
    const matDialogOpen = vi.fn().mockReturnValue({ afterClosed: () => of(false) })

    await TestBed.configureTestingModule({
      imports: [ShareAnnounceDialog, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { ...baseDialogData, intent: 'availability_nudge' as const },
        },
        {
          provide: ShareAnnounceApiService,
          useValue: { getRecipients, sendNotifications },
        },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    }).compileComponents()
    TestBed.overrideProvider(MatDialog, { useValue: { open: matDialogOpen } })

    const fixture = TestBed.createComponent(ShareAnnounceDialog)
    fixture.detectChanges()
    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Notifier 1 personne')
    })

    const notifyBtn = fixture.nativeElement.querySelector(
      'button[mat-flat-button]',
    ) as HTMLButtonElement
    notifyBtn.click()
    await vi.waitFor(() => {
      expect(matDialogOpen).toHaveBeenCalledWith(
        ConfirmDialog,
        expect.objectContaining({
          data: expect.objectContaining({
            message: expect.stringContaining('Un rappel a déjà été envoyé'),
          }),
        }),
      )
    })
    expect(sendNotifications).not.toHaveBeenCalled()
  })

  it('sends after confirm when guard is active and user accepts', async () => {
    const getRecipients = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        ...recipientsMock.data,
        lastManualNotifyAt: new Date().toISOString(),
      },
    })
    const sendNotifications = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        accepted: true,
        notifiedCount: 1,
        manualCount: 0,
        intent: 'availability_nudge',
      },
    })
    const matDialogOpen = vi.fn().mockReturnValue({ afterClosed: () => of(true) })
    const close = vi.fn()

    await TestBed.configureTestingModule({
      imports: [ShareAnnounceDialog, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: { close } },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { ...baseDialogData, intent: 'availability_nudge' as const },
        },
        {
          provide: ShareAnnounceApiService,
          useValue: { getRecipients, sendNotifications },
        },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    }).compileComponents()
    TestBed.overrideProvider(MatDialog, { useValue: { open: matDialogOpen } })

    const fixture = TestBed.createComponent(ShareAnnounceDialog)
    fixture.detectChanges()
    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Notifier 1 personne')
    })

    const notifyBtn = fixture.nativeElement.querySelector(
      'button[mat-flat-button]',
    ) as HTMLButtonElement
    notifyBtn.click()
    await vi.waitFor(() => {
      expect(sendNotifications).toHaveBeenCalled()
      expect(close).toHaveBeenCalledWith({
        intent: 'availability_nudge',
        notifiedCount: 1,
        manualCount: 0,
      })
    })
  })

  it('uses dynamic notify button label from notifiableCount', async () => {
    const fixture = await configureDialog(baseDialogData)
    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Notifier 1 personne')
    })
  })

  it('shows channel pills and legend without obfuscated email in expanded detail', async () => {
    const fixture = await configureDialog(baseDialogData)
    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('mat-expansion-panel')).toBeTruthy()
    })

    const header = fixture.nativeElement.querySelector(
      'mat-expansion-panel-header',
    ) as HTMLElement
    header.click()
    fixture.detectChanges()
    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain(
        'Icône colorée = déjà notifié · grise = prévu au prochain envoi · absente = canal indisponible',
      )
    })

    expect(fixture.nativeElement.textContent).not.toContain('ali••@ex••.com')
    expect(fixture.nativeElement.textContent).toContain('Contact manuel')
    const mailIcon = fixture.nativeElement.querySelector(
      '.share-announce-dialog__channels mat-icon',
    ) as HTMLElement
    expect(mailIcon?.classList.contains('mat-primary')).toBe(true)
    expect(mailIcon?.classList.contains('share-announce-dialog__channel--pending')).toBe(false)
  })

  it('shows pending grey channel icon when eligible but not yet notified', async () => {
    const getRecipients = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        ...recipientsMock.data,
        recipients: [
          {
            participantId: 'p-3',
            displayName: 'Carol',
            emailObfuscated: 'car••@ex••.com',
            channels: {
              email: { eligible: true, notified: false },
              push: { eligible: true, notified: false },
            },
          },
        ],
      },
    })

    const fixture = await configureDialog(baseDialogData, { getRecipients })
    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('mat-expansion-panel')).toBeTruthy()
    })

    const header = fixture.nativeElement.querySelector(
      'mat-expansion-panel-header',
    ) as HTMLElement
    header.click()
    fixture.detectChanges()
    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelectorAll('.share-announce-dialog__channel--pending').length).toBe(2)
    })
    expect(
      fixture.nativeElement.querySelector('.share-announce-dialog__channels .mat-primary'),
    ).toBeNull()
  })
})
