import { Routes } from '@angular/router';

import { MemberShell } from './layout/member-shell/member-shell';
import { AccountPlaceholder } from './pages/account-placeholder/account-placeholder';
import { AuthRedirect } from './pages/auth-redirect/auth-redirect';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { MemberHomeTodo } from './pages/member-home-todo/member-home-todo';
import { Login } from './pages/login/login';
import { ResetPassword } from './pages/reset-password/reset-password';
import { EventDetail } from './pages/event-detail/event-detail';
import { AdminMembres } from './pages/admin-membres/admin-membres';
import { AdminParticipants } from './pages/admin-participants/admin-participants';
import { AdminEventParticipants } from './pages/admin-event-participants/admin-event-participants';
import { SeasonHome } from './pages/season-home/season-home';
import { MemberSeasonGlance } from './pages/member-season-glance/member-season-glance';
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
  {
    path: '',
    component: MemberShell,
    children: [
      { path: 'accueil', component: MemberHomeTodo },
      { path: 'agenda', component: UserAgenda },
      { path: 'membre/:userSlug', component: MemberSeasonGlance },
      { path: 'compte', component: AccountPlaceholder },
      { path: 'troupes', component: TroupesList },
      { path: 'troupes/:slug/admin/membres', component: AdminMembres },
      { path: 'troupes/:slug', component: TroupeHub },
      { path: 'troupe/admin/membres', component: AdminMembres },
      {
        path: 'saison/:slug/event/:eventSlug/admin/participants',
        component: AdminEventParticipants,
      },
      { path: 'saison/:slug/event/:eventSlug', component: EventDetail },
      { path: 'saison/:slug/admin/membres', component: AdminMembres },
      { path: 'saison/:slug/admin/participants', component: AdminParticipants },
      { path: 'saison/:slug', component: SeasonHome },
    ],
  },
  {
    path: 'seasons',
    redirectTo: (route) => redirectPathWithQuery('/troupes', route.queryParamMap),
  },
  {
    path: 'troupe/:troupeSlug/admin/membres',
    redirectTo: (route) => `/troupes/${route.params['troupeSlug']}/admin/membres`,
  },
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
    path: 'ligue/:slug/event/:eventSlug',
    redirectTo: (route) =>
      redirectPathWithQuery(
        `/saison/${route.params['slug']}/event/${route.params['eventSlug']}`,
        route.queryParamMap,
      ),
  },
  {
    path: 'ligue/:slug/event/:eventSlug/admin/participants',
    redirectTo: (route) =>
      redirectPathWithQuery(
        `/saison/${route.params['slug']}/event/${route.params['eventSlug']}/admin/participants`,
        route.queryParamMap,
      ),
  },
  {
    path: 'ligue/:slug',
    redirectTo: (route) =>
      redirectPathWithQuery(`/saison/${route.params['slug']}`, route.queryParamMap),
  },
];
