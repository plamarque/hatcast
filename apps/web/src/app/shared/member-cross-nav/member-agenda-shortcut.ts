import { Component } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { RouterLink } from '@angular/router'

@Component({
  selector: 'app-member-agenda-shortcut',
  imports: [MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './member-agenda-shortcut.html',
  styleUrl: './member-cross-nav.scss',
})
export class MemberAgendaShortcut {}
