import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ChangelogService } from '../../../core/app/changelog.service';
import { HatcastDialogDismiss } from '../../dialog-chrome/hatcast-dialog-dismiss';

@Component({
  selector: 'app-changelog-dialog',
  imports: [HatcastDialogDismiss, MatButtonModule, MatDialogModule, MatProgressSpinnerModule],
  templateUrl: './changelog-dialog.html',
  styleUrl: './changelog-dialog.scss',
})
export class ChangelogDialog implements OnInit {
  private readonly changelog = inject(ChangelogService);

  protected readonly loading = this.changelog.loading;
  protected readonly error = this.changelog.error;
  protected readonly versions = this.changelog.versions;

  ngOnInit(): void {
    void this.changelog.loadChangelog();
  }
}
