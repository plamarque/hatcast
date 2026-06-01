import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog'
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
    total: 1,
    notifiableCount: 1,
    manualCount: 0,
    recipients: [
      {
        participantId: 'p-1',
        displayName: 'Alice',
        emailObfuscated: 'ali••@ex••.com',
        channels: { email: true, push: false },
      },
    ],
  },
}

const baseDialogData: ShareAnnounceDialogData = {
  intent: 'draw',
  seasonId: 'season-1',
  eventId: 'event-1',
  seasonSlug: 'saison-a',
  eventSlug: 'event-1',
  eventTitle: 'Spectacle test',
  eventDateIso: '2026-05-12T19:00:00.000Z',
  roleLines: [{ roleKey: 'player', displayNames: ['Alice'] }],
}

async function configureDialog(
  data: ShareAnnounceDialogData,
): Promise<ComponentFixture<ShareAnnounceDialog>> {
  await TestBed.configureTestingModule({
    imports: [ShareAnnounceDialog, NoopAnimationsModule],
    providers: [
      { provide: MatDialogRef, useValue: { close: vi.fn() } },
      { provide: MAT_DIALOG_DATA, useValue: data },
      {
        provide: ShareAnnounceApiService,
        useValue: {
          getRecipients: vi.fn().mockResolvedValue(recipientsMock),
          sendNotifications: vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            data: { accepted: true },
          }),
        },
      },
    ],
  }).compileComponents()
  const fixture = TestBed.createComponent(ShareAnnounceDialog)
  fixture.detectChanges()
  return fixture
}

describe('ShareAnnounceDialog', () => {
  it('prefills draw template and shows WhatsApp action', async () => {
    const fixture = await configureDialog(baseDialogData)
    await vi.waitFor(() => {
      const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement
      expect(textarea?.value).toContain('TIRAGE')
    })
    expect(fixture.nativeElement.textContent).toContain('Envoyer par WhatsApp')
  })

  it('loads recipients summary', async () => {
    const fixture = await configureDialog(baseDialogData)
    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('notifiable')
    })
    expect(fixture.nativeElement.textContent).toContain('ali••')
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

  it('shows guard warning when lastManualNudgeAt within guard window', async () => {
    const getRecipients = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        ...recipientsMock.data,
        lastManualNudgeAt: new Date().toISOString(),
        guardDays: 3,
      },
    })

    await TestBed.configureTestingModule({
      imports: [ShareAnnounceDialog, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: { ...baseDialogData, intent: 'availability_nudge' as const } },
        {
          provide: ShareAnnounceApiService,
          useValue: {
            getRecipients,
            sendNotifications: vi.fn(),
          },
        },
        { provide: MatDialog, useValue: { open: vi.fn() } },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(ShareAnnounceDialog)
    fixture.detectChanges()
    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Un rappel a déjà été envoyé')
    })
  })

  it('opens confirm dialog and blocks send when guard is active and user declines', async () => {
    const getRecipients = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        ...recipientsMock.data,
        lastManualNudgeAt: new Date().toISOString(),
        guardDays: 3,
      },
    })
    const sendNotifications = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: { accepted: true },
    })
    const matDialogOpen = vi.fn().mockReturnValue({ afterClosed: () => of(false) })

    await TestBed.configureTestingModule({
      imports: [ShareAnnounceDialog, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: { ...baseDialogData, intent: 'availability_nudge' as const } },
        {
          provide: ShareAnnounceApiService,
          useValue: { getRecipients, sendNotifications },
        },
        { provide: MatDialog, useValue: { open: matDialogOpen } },
      ],
    }).compileComponents()
    TestBed.overrideProvider(MatDialog, { useValue: { open: matDialogOpen } })

    const fixture = TestBed.createComponent(ShareAnnounceDialog)
    fixture.detectChanges()
    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Un rappel a déjà été envoyé')
    })

    const notifyBtn = fixture.nativeElement.querySelector(
      '.share-announce-dialog__notify',
    ) as HTMLButtonElement
    notifyBtn.click()
    await vi.waitFor(() => {
      expect(matDialogOpen).toHaveBeenCalledWith(ConfirmDialog, expect.any(Object))
    })
    expect(sendNotifications).not.toHaveBeenCalled()
  })

  it('sends after confirm when guard is active and user accepts', async () => {
    const getRecipients = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        ...recipientsMock.data,
        lastManualNudgeAt: new Date().toISOString(),
        guardDays: 3,
      },
    })
    const sendNotifications = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: { accepted: true },
    })
    const matDialogOpen = vi.fn().mockReturnValue({ afterClosed: () => of(true) })

    await TestBed.configureTestingModule({
      imports: [ShareAnnounceDialog, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: { ...baseDialogData, intent: 'availability_nudge' as const } },
        {
          provide: ShareAnnounceApiService,
          useValue: { getRecipients, sendNotifications },
        },
        { provide: MatDialog, useValue: { open: matDialogOpen } },
      ],
    }).compileComponents()
    TestBed.overrideProvider(MatDialog, { useValue: { open: matDialogOpen } })

    const fixture = TestBed.createComponent(ShareAnnounceDialog)
    fixture.detectChanges()
    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Un rappel a déjà été envoyé')
    })

    const notifyBtn = fixture.nativeElement.querySelector(
      '.share-announce-dialog__notify',
    ) as HTMLButtonElement
    notifyBtn.click()
    await vi.waitFor(() => {
      expect(sendNotifications).toHaveBeenCalled()
    })
  })
})
