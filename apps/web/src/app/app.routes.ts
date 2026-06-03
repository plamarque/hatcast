import { Routes } from '@angular/router';

import { MemberShell } from './layout/member-shell/member-shell';
import { AccountPlaceholder } from './pages/account-placeholder/account-placeholder';
import { AccountEmailVerification } from './pages/account-email-verification/account-email-verification';
import { AccountAboutTab } from './pages/account-placeholder/tabs/account-about-tab';
import { AccountIdentityTab } from './pages/account-placeholder/tabs/account-identity-tab';
import { AccountNotificationsTab } from './pages/account-placeholder/tabs/account-notifications-tab';
import { AccountPreferencesTab } from './pages/account-placeholder/tabs/account-preferences-tab';
import { AccountSecurityTab } from './pages/account-placeholder/tabs/account-security-tab';
import { AuthRedirect } from './pages/auth-redirect/auth-redirect';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { MemberHomeTodo } from './pages/member-home-todo/member-home-todo';
import { Login } from './pages/login/login';
import { ResetPassword } from './pages/reset-password/reset-password';
import { Signup } from './pages/signup/signup';
import { EventDetail } from './pages/event-detail/event-detail';
import { AdminMembres } from './pages/admin-membres/admin-membres';
import { AdminParticipants } from './pages/admin-participants/admin-participants';
import { AdminEventParticipants } from './pages/admin-event-participants/admin-event-participants';
import { AdminAudit } from './pages/admin-audit/admin-audit';
import { SeasonHome } from './pages/season-home/season-home';
import { SaisonLegacyRedirect } from './pages/saison-legacy-redirect/saison-legacy-redirect';
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
  { path: 'inscription', component: Signup },
  { path: 'mot-de-passe-oublie', component: ForgotPassword },
  { path: 'reinitialiser-mot-de-passe', component: ResetPassword },
  {
    path: '',
    component: MemberShell,
    children: [
      { path: 'accueil', component: MemberHomeTodo },
      { path: 'agenda', component: UserAgenda },
      { path: 'membre/:userSlug', component: MemberSeasonGlance },
      { path: 'compte/verification-email', component: AccountEmailVerification },
      {
        path: 'compte',
        component: AccountPlaceholder,
        children: [
          { path: '', component: AccountIdentityTab },
          { path: 'preferences', component: AccountPreferencesTab },
          { path: 'notifications', component: AccountNotificationsTab },
          { path: 'securite', component: AccountSecurityTab },
          { path: 'a-propos', component: AccountAboutTab },
          { path: '**', redirectTo: '' },
        ],
      },
      { path: 'troupes', component: TroupesList },
      { path: 'troupes/:slug/admin/membres', component: AdminMembres },
      { path: 'troupes/:slug/admin/audit', component: AdminAudit, data: { auditScope: 'troupe' } },
      { path: 'troupes/:slug', component: TroupeHub },
      { path: 'troupe/admin/membres', component: AdminMembres },
      {
        path: 'saison/:troupeSlug/:seasonSlug/event/:eventSlug/admin/participants',
        component: AdminEventParticipants,
      },
      { path: 'saison/:troupeSlug/:seasonSlug/event/:eventSlug', component: EventDetail },
      { path: 'saison/:troupeSlug/:seasonSlug/admin/membres', component: AdminMembres },
      { path: 'saison/:troupeSlug/:seasonSlug/admin/participants', component: AdminParticipants },
      {
        path: 'saison/:troupeSlug/:seasonSlug/admin/audit',
        component: AdminAudit,
        data: { auditScope: 'season' },
      },
      { path: 'saison/:troupeSlug/:seasonSlug', component: SeasonHome },
      {
        path: 'saison/:seasonSlug/event/:eventSlug/admin/participants',
        component: SaisonLegacyRedirect,
      },
      { path: 'saison/:seasonSlug/event/:eventSlug', component: SaisonLegacyRedirect },
      { path: 'saison/:seasonSlug/admin/membres', component: SaisonLegacyRedirect },
      { path: 'saison/:seasonSlug/admin/participants', component: SaisonLegacyRedirect },
      {
        path: 'saison/:seasonSlug/admin/audit',
        component: SaisonLegacyRedirect,
        data: { auditScope: 'season' },
      },
      { path: 'saison/:seasonSlug', component: SaisonLegacyRedirect },
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
