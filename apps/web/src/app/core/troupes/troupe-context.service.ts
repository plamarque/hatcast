import { Injectable, inject, signal } from '@angular/core'

import { TroupeApiService, type TroupeListItem } from './troupe-api.service'

const SELECTED_TROUPE_STORAGE_KEY = 'hatcast.selectedTroupeId'

@Injectable({ providedIn: 'root' })
export class TroupeContextService {
  private readonly api = inject(TroupeApiService)

  readonly activeTroupes = signal<TroupeListItem[]>([])
  readonly selectedTroupe = signal<TroupeListItem | null>(null)
  readonly loading = signal(false)
  readonly loadError = signal(false)

  async load(preferredTroupeId?: string): Promise<boolean> {
    this.loading.set(true)
    this.loadError.set(false)
    const result = await this.api.listMyTroupes()
    this.loading.set(false)

    if (!result.ok) {
      this.loadError.set(true)
      return false
    }

    const active = (result.data ?? []).filter((troupe) => troupe.membership.status === 'ACTIVE')
    this.activeTroupes.set(active)

    if (active.length === 0) {
      this.selectedTroupe.set(null)
      this.clearStoredTroupeId()
      return true
    }

    const storedTroupeId = preferredTroupeId ?? this.readStoredTroupeId()
    const selected = active.find((troupe) => troupe.id === storedTroupeId) ?? active[0]
    this.selectedTroupe.set(selected)
    this.writeStoredTroupeId(selected.id)
    return true
  }

  async reloadAndSelect(troupeId: string): Promise<boolean> {
    return this.load(troupeId)
  }

  selectTroupe(troupeId: string): boolean {
    const selected = this.activeTroupes().find((troupe) => troupe.id === troupeId)
    if (!selected) {
      return false
    }
    this.selectedTroupe.set(selected)
    this.writeStoredTroupeId(selected.id)
    return true
  }

  private readStoredTroupeId(): string | null {
    try {
      return globalThis.localStorage?.getItem(SELECTED_TROUPE_STORAGE_KEY) ?? null
    } catch {
      return null
    }
  }

  private writeStoredTroupeId(troupeId: string): void {
    try {
      globalThis.localStorage?.setItem(SELECTED_TROUPE_STORAGE_KEY, troupeId)
    } catch {
      // Storage can be unavailable in hardened browsers; the in-memory signal remains authoritative for this session.
    }
  }

  private clearStoredTroupeId(): void {
    try {
      globalThis.localStorage?.removeItem(SELECTED_TROUPE_STORAGE_KEY)
    } catch {
      // Ignore unavailable storage.
    }
  }
}
