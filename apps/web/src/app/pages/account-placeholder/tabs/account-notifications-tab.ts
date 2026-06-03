import { Component, ViewEncapsulation } from '@angular/core'

import { NotificationPreferencesSection } from '../../../shared/notification-preferences-section/notification-preferences-section'
import { PushNotificationsSection } from '../../../shared/push-notifications-section/push-notifications-section'

@Component({
  selector: 'app-account-notifications-tab',
  imports: [PushNotificationsSection, NotificationPreferencesSection],
  templateUrl: './account-notifications-tab.html',
  styleUrl: '../account-placeholder.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AccountNotificationsTab {}
