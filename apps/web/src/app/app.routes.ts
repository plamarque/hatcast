import { Routes } from '@angular/router';

import { MemberShell } from './layout/member-shell/member-shell';
import { AccountEmailVerification } from './pages/account-email-verification/account-email-verification';
import { AuthRedirect } from './pages/auth-redirect/auth-redirect';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { Login } from './pages/login/login';
import { ResetPassword } from './pages/reset-password/reset-password';
import { Signup } from './pages/signup/signup';
import { MemberHomeTodo } from './pages/member-home-todo/member-home-todo';

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
  { path: 'inscription', component: Signup },
  { path: 'mot-de-passe-oublie', component: ForgotPassword },
  { path: 'reinitialiser-mot-de-passe', component: ResetPassword },
  { path: 'compte/verification-email', component: AccountEmailVerification },
  {
    path: '',
    component: MemberShell,
    children: [
      { path: 'accueil', component: MemberHomeTodo },
      {
        path: 'agenda',
        loadComponent: () =>
          import('./pages/user-agenda/user-agenda').then((m) => m.UserAgenda),
      },
      {
        path: 'membre/:userSlug',
        loadComponent: () =>
          import('./pages/member-season-glance/member-season-glance').then(
            (m) => m.MemberSeasonGlance,
          ),
      },
      {
        path: 'compte',
        loadComponent: () =>
          import('./pages/account-placeholder/account-placeholder').then(
            (m) => m.AccountPlaceholder,
          ),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/account-placeholder/tabs/account-profile-tab').then(
                (m) => m.AccountProfileTab,
              ),
          },
          {
            path: 'preferences',
            loadComponent: () =>
              import('./pages/account-placeholder/tabs/account-preferences-tab').then(
                (m) => m.AccountPreferencesTab,
              ),
          },
          {
            path: 'notifications',
            loadComponent: () =>
              import('./pages/account-placeholder/tabs/account-notifications-tab').then(
                (m) => m.AccountNotificationsTab,
              ),
          },
          {
            path: 'securite',
            loadComponent: () =>
              import('./pages/account-placeholder/legacy-account-tab-redirect').then(
                (m) => m.LegacyAccountTabRedirect,
              ),
          },
          {
            path: 'identite',
            loadComponent: () =>
              import('./pages/account-placeholder/legacy-account-tab-redirect').then(
                (m) => m.LegacyAccountTabRedirect,
              ),
          },
          {
            path: 'a-propos',
            loadComponent: () =>
              import('./pages/account-placeholder/tabs/account-about-tab').then(
                (m) => m.AccountAboutTab,
              ),
          },
          { path: '**', redirectTo: '' },
        ],
      },
      {
        path: 'troupes',
        loadComponent: () =>
          import('./pages/troupes-list/troupes-list').then((m) => m.TroupesList),
      },
      {
        path: 'troupes/:slug/admin/membres',
        loadComponent: () =>
          import('./pages/admin-membres/admin-membres').then((m) => m.AdminMembres),
      },
      {
        path: 'troupes/:slug/admin/parametres',
        loadComponent: () =>
          import('./pages/troupe-settings/troupe-settings').then((m) => m.TroupeSettings),
      },
      {
        path: 'troupes/:slug/admin/audit',
        loadComponent: () =>
          import('./pages/admin-audit/admin-audit').then((m) => m.AdminAudit),
        data: { auditScope: 'troupe' },
      },
      {
        path: 'troupes/:slug',
        loadComponent: () =>
          import('./pages/troupe-hub/troupe-hub').then((m) => m.TroupeHub),
      },
      {
        path: 'troupe/admin/membres',
        loadComponent: () =>
          import('./pages/admin-membres/admin-membres').then((m) => m.AdminMembres),
      },
      {
        path: 'saison/:troupeSlug/:seasonSlug/event/:eventSlug/admin/participants',
        loadComponent: () =>
          import('./pages/admin-event-participants/admin-event-participants').then(
            (m) => m.AdminEventParticipants,
          ),
      },
      {
        path: 'saison/:troupeSlug/:seasonSlug/event/:eventSlug',
        loadComponent: () =>
          import('./pages/event-detail/event-detail').then((m) => m.EventDetail),
      },
      {
        path: 'saison/:troupeSlug/:seasonSlug/admin/membres',
        loadComponent: () =>
          import('./pages/admin-membres/admin-membres').then((m) => m.AdminMembres),
      },
      {
        path: 'saison/:troupeSlug/:seasonSlug/admin/participants',
        loadComponent: () =>
          import('./pages/admin-participants/admin-participants').then(
            (m) => m.AdminParticipants,
          ),
      },
      {
        path: 'saison/:troupeSlug/:seasonSlug/admin/audit',
        loadComponent: () =>
          import('./pages/admin-audit/admin-audit').then((m) => m.AdminAudit),
        data: { auditScope: 'season' },
      },
      {
        path: 'saison/:troupeSlug/:seasonSlug',
        loadComponent: () =>
          import('./pages/season-home/season-home').then((m) => m.SeasonHome),
      },
      {
        path: 'saison/:seasonSlug/event/:eventSlug/admin/participants',
        loadComponent: () =>
          import('./pages/saison-legacy-redirect/saison-legacy-redirect').then(
            (m) => m.SaisonLegacyRedirect,
          ),
      },
      {
        path: 'saison/:seasonSlug/event/:eventSlug',
        loadComponent: () =>
          import('./pages/saison-legacy-redirect/saison-legacy-redirect').then(
            (m) => m.SaisonLegacyRedirect,
          ),
      },
      {
        path: 'saison/:seasonSlug/admin/membres',
        loadComponent: () =>
          import('./pages/saison-legacy-redirect/saison-legacy-redirect').then(
            (m) => m.SaisonLegacyRedirect,
          ),
      },
      {
        path: 'saison/:seasonSlug/admin/participants',
        loadComponent: () =>
          import('./pages/saison-legacy-redirect/saison-legacy-redirect').then(
            (m) => m.SaisonLegacyRedirect,
          ),
      },
      {
        path: 'saison/:seasonSlug/admin/audit',
        loadComponent: () =>
          import('./pages/saison-legacy-redirect/saison-legacy-redirect').then(
            (m) => m.SaisonLegacyRedirect,
          ),
        data: { auditScope: 'season' },
      },
      {
        path: 'saison/:seasonSlug',
        loadComponent: () =>
          import('./pages/saison-legacy-redirect/saison-legacy-redirect').then(
            (m) => m.SaisonLegacyRedirect,
          ),
      },
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
];
