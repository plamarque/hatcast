import { Routes } from '@angular/router';

import { AccountPlaceholder } from './pages/account-placeholder/account-placeholder';
import { AuthRedirect } from './pages/auth-redirect/auth-redirect';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { HomeSignedIn } from './pages/home-signed-in/home-signed-in';
import { OauthDemo } from './pages/oauth-demo/oauth-demo';
import { ResetPassword } from './pages/reset-password/reset-password';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: AuthRedirect },
  { path: 'connexion', component: OauthDemo },
  { path: 'mot-de-passe-oublie', component: ForgotPassword },
  { path: 'reinitialiser-mot-de-passe', component: ResetPassword },
  { path: 'accueil', component: HomeSignedIn },
  { path: 'compte', component: AccountPlaceholder },
];
