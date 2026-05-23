import { Routes } from '@angular/router';

import { AccountPlaceholder } from './pages/account-placeholder/account-placeholder';
import { AuthRedirect } from './pages/auth-redirect/auth-redirect';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { HomeSignedIn } from './pages/home-signed-in/home-signed-in';
import { Login } from './pages/login/login';
import { ResetPassword } from './pages/reset-password/reset-password';
import { EventDetailPlaceholder } from './pages/event-detail-placeholder/event-detail-placeholder';
import { AdminMembres } from './pages/admin-membres/admin-membres';
import { SeasonHome } from './pages/season-home/season-home';
import { SeasonsList } from './pages/seasons-list/seasons-list';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: AuthRedirect },
  { path: 'connexion', component: Login },
  { path: 'mot-de-passe-oublie', component: ForgotPassword },
  { path: 'reinitialiser-mot-de-passe', component: ResetPassword },
  { path: 'accueil', component: HomeSignedIn },
  { path: 'compte', component: AccountPlaceholder },
  { path: 'seasons', component: SeasonsList },
  { path: 'saison/:slug', component: SeasonHome },
  { path: 'saison/:slug/admin/membres', component: AdminMembres },
  { path: 'saison/:slug/event/:eventId', component: EventDetailPlaceholder },
];
