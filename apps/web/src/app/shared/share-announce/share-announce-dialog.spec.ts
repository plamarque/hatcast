import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
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
})
