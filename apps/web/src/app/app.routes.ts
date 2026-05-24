import { Routes } from '@angular/router';

import { AccountPlaceholder } from './pages/account-placeholder/account-placeholder';
import { AuthRedirect } from './pages/auth-redirect/auth-redirect';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { HomeSignedIn } from './pages/home-signed-in/home-signed-in';
import { Login } from './pages/login/login';
import { ResetPassword } from './pages/reset-password/reset-password';
import { EventDetail } from './pages/event-detail/event-detail';
import { AdminMembres } from './pages/admin-membres/admin-membres';
import { AdminParticipants } from './pages/admin-participants/admin-participants';
import { SeasonHome } from './pages/season-home/season-home';
import { SeasonsList } from './pages/seasons-list/seasons-list';
import { UserAgenda } from './pages/user-agenda/user-agenda';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: AuthRedirect },
  { path: 'connexion', component: Login },
  { path: 'mot-de-passe-oublie', component: ForgotPassword },
  { path: 'reinitialiser-mot-de-passe', component: ResetPassword },
  { path: 'accueil', component: HomeSignedIn },
  { path: 'compte', component: AccountPlaceholder },
  { path: 'agenda', component: UserAgenda },
  { path: 'seasons', component: SeasonsList },
  { path: 'troupe/admin/membres', component: AdminMembres },
  { path: 'troupe/:troupeSlug/admin/membres', component: AdminMembres },
  { path: 'saison/:slug', component: SeasonHome },
  { path: 'saison/:slug/admin/membres', component: AdminMembres },
  { path: 'saison/:slug/admin/participants', component: AdminParticipants },
  { path: 'saison/:slug/event/:eventId', component: EventDetail },
];
