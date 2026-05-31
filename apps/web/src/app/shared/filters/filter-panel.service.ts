import { BreakpointObserver } from '@angular/cdk/layout'
import { inject, Injectable } from '@angular/core'
import { MatBottomSheet } from '@angular/material/bottom-sheet'
import { MatDialog } from '@angular/material/dialog'
import { firstValueFrom } from 'rxjs'

import { FilterCategoriesPicker } from './filter-categories-picker'
import { FilterEventPicker } from './filter-event-picker'
import { FilterHub } from './filter-hub'
import { FilterParticipantPicker } from './filter-participant-picker'
import { FilterSinglePicker } from './filter-single-picker'
import {
  FILTER_MOBILE_BREAKPOINT,
  type CategoriesPickerData,
  type CategoriesPickerResult,
  type EventPickerData,
  type EventPickerResult,
  type FilterDimensionKey,
  type FilterHubData,
  type FilterPanelData,
  type FilterPanelResult,
  type ParticipantPickerData,
  type ParticipantPickerResult,
  type SinglePickerData,
  type SinglePickerResult,
} from './filter.types'

@Injectable({ providedIn: 'root' })
export class FilterPanelService {
  private readonly bottomSheet = inject(MatBottomSheet)
  private readonly dialog = inject(MatDialog)
  private readonly breakpointObserver = inject(BreakpointObserver)
  private overlayOpen = false

  isMobile(): boolean {
    return this.breakpointObserver.isMatched(FILTER_MOBILE_BREAKPOINT)
  }

  /** Lightweight hub — summary rows only (UX-DR22.1). */
  async openHub(data: Omit<FilterHubData, 'isMobile'>): Promise<FilterDimensionKey | undefined> {
    if (this.overlayOpen) {
      return undefined
    }
    this.overlayOpen = true
    try {
      const isMobile = this.isMobile()
      const hubData: FilterHubData = { ...data, isMobile }

      if (isMobile) {
        return await firstValueFrom(
          this.bottomSheet
            .open(FilterHub, {
              data: hubData,
              panelClass: 'filter-hub-sheet',
            })
            .afterDismissed(),
        )
      }

      return await firstValueFrom(
        this.dialog
          .open(FilterHub, {
            data: hubData,
            width: 'min(100vw - 2rem, 20rem)',
            panelClass: 'filter-hub-dialog',
          })
          .afterClosed(),
      )
    } finally {
      this.overlayOpen = false
    }
  }

  async openParticipantPicker(
    data: Omit<ParticipantPickerData, 'isMobile'>,
  ): Promise<ParticipantPickerResult | undefined> {
    return this.openPickerOverlay(FilterParticipantPicker, data)
  }

  async openEventPicker(
    data: Omit<EventPickerData, 'isMobile'>,
  ): Promise<EventPickerResult | undefined> {
    return this.openPickerOverlay(FilterEventPicker, data, 'min(100vw - 2rem, 24rem)')
  }

  async openCategoriesPicker(
    data: Omit<CategoriesPickerData, 'isMobile'>,
  ): Promise<CategoriesPickerResult | undefined> {
    return this.openPickerOverlay(FilterCategoriesPicker, data)
  }

  async openSinglePicker(
    data: Omit<SinglePickerData, 'isMobile'>,
  ): Promise<SinglePickerResult | undefined> {
    return this.openPickerOverlay(FilterSinglePicker, data)
  }

  /** @deprecated 17.27 mega-panel — use openHub + pickers. Kept for gradual migration tests. */
  async openPanel(data: Omit<FilterPanelData, 'isMobile'>): Promise<FilterPanelResult | undefined> {
    const { FilterPanelContent } = await import('./filter-panel-content')
    if (this.overlayOpen) {
      return undefined
    }
    this.overlayOpen = true
    try {
      const isMobile = this.isMobile()
      const panelData: FilterPanelData = { ...data, isMobile }

      if (isMobile) {
        return await firstValueFrom(
          this.bottomSheet
            .open(FilterPanelContent, {
              data: panelData,
              panelClass: 'filter-panel-sheet',
            })
            .afterDismissed(),
        )
      }

      return await firstValueFrom(
        this.dialog
          .open(FilterPanelContent, {
            data: panelData,
            width: 'min(100vw - 2rem, 24rem)',
            panelClass: 'filter-panel-dialog',
          })
          .afterClosed(),
      )
    } finally {
      this.overlayOpen = false
    }
  }

  private async openPickerOverlay<TData extends { isMobile: boolean }, TResult>(
    component: new (...args: unknown[]) => object,
    data: Omit<TData, 'isMobile'>,
    dialogWidth = 'min(100vw - 2rem, 24rem)',
  ): Promise<TResult | undefined> {
    if (this.overlayOpen) {
      return undefined
    }
    this.overlayOpen = true
    try {
      const isMobile = this.isMobile()
      const payload = { ...data, isMobile } as TData

      if (isMobile) {
        return await firstValueFrom(
          this.bottomSheet
            .open(component, {
              data: payload,
              panelClass: 'filter-picker-sheet',
              maxHeight: 'min(28rem, 55dvh)',
            })
            .afterDismissed(),
        )
      }

      return await firstValueFrom(
        this.dialog
          .open(component, {
            data: payload,
            width: dialogWidth,
            maxHeight: '85vh',
            panelClass: 'filter-picker-dialog',
          })
          .afterClosed(),
      )
    } finally {
      this.overlayOpen = false
    }
  }
}
