import { Routes } from '@angular/router';

import { AuthRedirect } from './pages/auth-redirect/auth-redirect';
import { HomeSignedIn } from './pages/home-signed-in/home-signed-in';
import { OauthDemo } from './pages/oauth-demo/oauth-demo';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: AuthRedirect },
  { path: 'connexion', component: OauthDemo },
  { path: 'accueil', component: HomeSignedIn },
];
