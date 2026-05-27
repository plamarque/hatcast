import { Component } from '@angular/core'

import { MemberAgendaShortcut } from './member-agenda-shortcut'
import { MemberSeasonShortcut } from './member-season-shortcut'

@Component({
  selector: 'app-member-cross-nav-shortcuts',
  imports: [MemberAgendaShortcut, MemberSeasonShortcut],
  templateUrl: './member-cross-nav-shortcuts.html',
  styleUrl: './member-cross-nav.scss',
})
export class MemberCrossNavShortcuts {}
