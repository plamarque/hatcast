import { AfterViewChecked, Component, ElementRef, inject, OnDestroy, OnInit, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ChangelogService } from '../../../core/app/changelog.service';
import { HatcastDialogDismiss } from '../../dialog-chrome/hatcast-dialog-dismiss';
import { ProductAnalyticsService } from '../../../core/analytics/product-analytics.service';
import { dwellBucket, scrollBucket, type NotesSource } from '../../../core/analytics/release-context';

@Component({
  selector: 'app-changelog-dialog',
  imports: [HatcastDialogDismiss, MatButtonModule, MatDialogModule, MatProgressSpinnerModule],
  templateUrl: './changelog-dialog.html',
  styleUrl: './changelog-dialog.scss',
})
export class ChangelogDialog implements OnInit, OnDestroy, AfterViewChecked {
  private readonly changelog = inject(ChangelogService);
  private readonly analytics = inject(ProductAnalyticsService);
  private readonly data = inject<{ source?: NotesSource }>(MAT_DIALOG_DATA, { optional: true });
  private readonly source: NotesSource = this.data?.source === 'after_update' ? 'after_update' : 'account';
  private readonly content = viewChild<ElementRef<HTMLElement>>('content');
  private loaded = false;
  private destroyed = false;
  private visibleSince: number | null = null;
  private visibleMs = 0;
  private maxScroll: number | null = null;
  private ownerId: string | null = null;
  private readonly visibilityChanged = () => {
    this.accumulateVisibleTime();
    if (this.loaded && !document.hidden) this.visibleSince = Date.now();
  };

  protected readonly loading = this.changelog.loading;
  protected readonly error = this.changelog.error;
  protected readonly versions = this.changelog.versions;

  ngOnInit(): void {
    try { this.ownerId = this.analytics.captureReleaseNotesOpened(this.source); } catch { /* UX remains available */ }
    document.addEventListener('visibilitychange', this.visibilityChanged);
    void this.changelog.loadChangelog().then(() => {
      if (this.destroyed || this.loading() || this.error() || !this.versions().length) return;
      this.loaded = true;
      if (!document.hidden) this.visibleSince = Date.now();
    }).catch(() => { /* failed load cannot produce a reading signal */ });
  }

  ngAfterViewChecked(): void {
    if (this.loaded) this.observeScroll();
  }

  protected observeScroll(): void {
    const el = this.content()?.nativeElement;
    if (!this.loaded || !el) return;
    const range = el.scrollHeight - el.clientHeight;
    if (range > 0) this.maxScroll = Math.max(this.maxScroll ?? 0, Math.min(1, el.scrollTop / range));
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    document.removeEventListener('visibilitychange', this.visibilityChanged);
    this.accumulateVisibleTime();
    if (!this.loaded) return;
    try {
      this.analytics.captureReleaseNotesClosed(this.source, dwellBucket(this.visibleMs), scrollBucket(this.maxScroll), this.ownerId);
    } catch { /* analytics cannot interfere with closing */ }
  }

  private accumulateVisibleTime(): void {
    if (this.visibleSince !== null) this.visibleMs += Math.max(0, Date.now() - this.visibleSince);
    this.visibleSince = null;
  }
}
