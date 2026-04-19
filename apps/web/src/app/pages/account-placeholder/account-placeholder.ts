import { Component } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { RouterLink } from '@angular/router'

/** Placeholder story 1.6 — paramètres de compte (email, mot de passe connecté). */
@Component({
  selector: 'app-account-placeholder',
  imports: [MatButtonModule, MatCardModule, RouterLink],
  templateUrl: './account-placeholder.html',
  styleUrl: './account-placeholder.scss',
})
export class AccountPlaceholder {}
