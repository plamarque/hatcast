import { Component, ViewEncapsulation } from '@angular/core'

import { MemberPreferencesForm } from '../../../shared/member-preferences-form/member-preferences-form'

@Component({
  selector: 'app-account-preferences-tab',
  imports: [MemberPreferencesForm],
  templateUrl: './account-preferences-tab.html',
  styleUrl: '../account-placeholder.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AccountPreferencesTab {}
