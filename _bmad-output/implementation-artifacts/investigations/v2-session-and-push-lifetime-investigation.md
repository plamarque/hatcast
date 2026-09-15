# V2 — session et durée de vie Web Push (BUG-014)

Date : 2026-08-24
Statut : résolu

## Constat

`rememberMe=true` appliquait déjà 2 592 000 secondes d’inactivité à la session JDBC, mais `HATCAST_SESSION` n’avait pas de `Max-Age`. Le navigateur mobile supprimait donc le handle HttpOnly à sa fermeture. Le problème était complet pour la connexion Google GIS : elle fournit un credential à l’API, sans créer de session Firebase client pouvant restaurer la session HatCast.

## Correctif vérifié

`AuthSessionPolicy` invalide d’abord toute session préexistante au login. C’est nécessaire car la page de connexion peut déjà porter un ancien `HATCAST_SESSION` : sans rotation, Spring réutilise cette session et n’émet aucun `Set-Cookie`, même si `rememberMe=true`. La nouvelle session JDBC conserve ensuite la décision comme booléen. `HatcastSessionCookieSerializer` lit la décision de la requête pour la connexion courante, ou celle de la session lors d’une réémission ultérieure :

- connexion mémorisée Google ou Identity Platform : cookie `HATCAST_SESSION` persistant avec un `Max-Age` de 30 jours à compter de son émission ou réémission ; l’intervalle serveur est, séparément, une inactivité glissante de 30 jours ;
- connexion non mémorisée : intervalle serveur 30 minutes, cookie de session navigateur sans `Max-Age` ni `Expires`. Certains navigateurs, dont Chrome pendant une restauration de session, peuvent néanmoins conserver ce cookie au redémarrage ; HatCast n’ajoute pas de déconnexion forcée au démarrage, qui casserait aussi un simple rechargement ;
- champ `rememberMe` absent : valeur DTO existante `true`, donc contrat historique conservé.

Le cookie reste `HttpOnly` et `SameSite=Lax`. Le profil `cloud` continue de fournir `Secure`; aucun ID token ou refresh token n’est ajouté à `localStorage`.

## Récupération client

La première tentative est toujours `GET /v1/auth/me` avec le cookie. Si le cookie persistant est indisponible, seul le parcours Identity Platform/email peut rééchanger un ID token lorsqu’un utilisateur Firebase client existe et que la préférence locale vaut vrai. Il ne s’agit pas d’un mécanisme de récupération Google GIS : sans cookie, Google demande une nouvelle connexion.

## Web Push

Les abonnements sont persistés dans `user_push_subscriptions`. `WebPushNotificationSender` les lit par `userId` et le dispatcher l’appelle après les événements de domaine, sans dépendre d’une requête ni d’un `HttpSession`. Une expiration ou une absence de session HTTP ne coupe donc pas la distribution des notifications éligibles.

## Preuves de test

- `AuthControllerIntegrationTest` vérifie les sign-ins Google et IdP mémorisés/non mémorisés, leurs intervalles serveur, la suppression du cookie au logout et la réémission persistante après un login avec session préexistante.
- `HatcastSessionCookieSerializerTest` vérifie le `Max-Age`, `HttpOnly`, `SameSite` et le contrat `Secure` cloud.
- `auth-api.service.spec.ts` couvre le cookie persistant Google sans fallback Firebase et le fallback IdP uniquement.
- `WebPushNotificationSenderTest` vérifie que `WebPushNotificationSender` lit `user_push_subscriptions` par utilisateur, sans session de requête.
- Smoke Chrome local : le `POST /v1/auth/google` émet `Max-Age=2592000` lorsque la case est cochée, et ne l’émet pas lorsqu’elle est décochée. La restauration de session Chrome conserve parfois le second cookie ; ce n’est pas interprété comme une régression applicative du contrat retenu.
