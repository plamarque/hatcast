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
import { UserAgenda } from './pages/user-agenda/user-agenda';
import { TroupeHub } from './pages/troupe-hub/troupe-hub';
import { TroupesList } from './pages/troupes-list/troupes-list';

function redirectPathWithQuery(targetPath: string, queryParamMap: {
  keys: Iterable<string>;
  getAll: (name: string) => string[] | null;
}): string {
  const keys = [...queryParamMap.keys];
  if (keys.length === 0) {
    return targetPath;
  }
  const parts: string[] = [];
  for (const key of keys) {
    for (const value of queryParamMap.getAll(key) ?? []) {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  }
  return `${targetPath}?${parts.join('&')}`;
}

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: AuthRedirect },
  { path: 'connexion', component: Login },
  { path: 'mot-de-passe-oublie', component: ForgotPassword },
  { path: 'reinitialiser-mot-de-passe', component: ResetPassword },
  { path: 'accueil', component: HomeSignedIn },
  { path: 'compte', component: AccountPlaceholder },
  { path: 'agenda', component: UserAgenda },
  {
    path: 'seasons',
    redirectTo: (route) => redirectPathWithQuery('/troupes', route.queryParamMap),
  },
  { path: 'troupes', component: TroupesList },
  { path: 'troupes/:slug', component: TroupeHub },
  { path: 'troupes/:slug/admin/membres', component: AdminMembres },
  { path: 'troupe/admin/membres', component: AdminMembres },
  {
    path: 'troupe/:troupeSlug/admin/membres',
    redirectTo: (route) => `/troupes/${route.params['troupeSlug']}/admin/membres`,
  },
  { path: 'saison/:slug', component: SeasonHome },
  { path: 'saison/:slug/admin/membres', component: AdminMembres },
  { path: 'saison/:slug/admin/participants', component: AdminParticipants },
  { path: 'saison/:slug/event/:eventId', component: EventDetail },
  {
    path: 'ligue/:slug/admin/membres',
    redirectTo: (route) =>
      redirectPathWithQuery(
        `/saison/${route.params['slug']}/admin/membres`,
        route.queryParamMap,
      ),
  },
  {
    path: 'ligue/:slug/admin/participants',
    redirectTo: (route) =>
      redirectPathWithQuery(
        `/saison/${route.params['slug']}/admin/participants`,
        route.queryParamMap,
      ),
  },
  {
    path: 'ligue/:slug/event/:eventId',
    redirectTo: (route) =>
      redirectPathWithQuery(
        `/saison/${route.params['slug']}/event/${route.params['eventId']}`,
        route.queryParamMap,
      ),
  },
  {
    path: 'ligue/:slug',
    redirectTo: (route) =>
      redirectPathWithQuery(`/saison/${route.params['slug']}`, route.queryParamMap),
  },
];
