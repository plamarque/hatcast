# Member troupe navigation — mobile human smoke

Date: 2026-10-22. Patrice accepted this mobile recipe and authorized local closure. The following scenarios and runtime details record the completed test. The dedicated stack is retired at closure; restart a full offline stack to repeat the recipe. No push or deployment is authorized.

## Connect

- Enable Tailscale on the phone and open https://patrices-macbook-pro.tail3f7249.ts.net/connexion in its browser.
- Use the fictional offline account `patrice@seed.improbots.test`, password `patricep`; Google and real-account login are not available against this H2 recipe.
- The full stack runs with `./scripts/start-dev.sh --offline`: Angular HTTPS 4200, API 8080, isolated persistent H2 under this worktree's `.local/hatcast-offline/`. The pre-existing Tailscale Serve proxy forwards to 4200. No production database is used.
- If an old tab from the previous recipe retains a stale session, return to `/connexion` and sign in again. Refresh once to load the latest local build.

## Prepared data

The seed **Les Improbots** provides active seasons **Les Improbots 2026-2027** and **Apérock 2026**, with real seed content. The parent added one local-only troupe, **Recette navigation — troupe au nom volontairement très long**, at `/troupes/recette-navigation`, and a season **Saison de recette au nom volontairement très long 2026–2027**, without any shows. Its long names deliberately exercise wrapping; its empty dashboard exercises permanent navigation links. These fixtures are in H2 only and are retained for the human test.

## Suggested checks

1. Open **Accueil**. Confirm the **Accès rapides** block is absent, while required actions (when any) and the next-show card retain their behavior.
2. Tap **Ma troupe** in the bottom bar. Confirm exactly three entries: the troupe name, season title and **Statistiques**. Tap outside to dismiss; reopen and exercise each destination. No selector or extra menu entry should appear.
3. On the troupe page, find **Voir la saison** and **Statistiques** immediately below the selected season title. On the empty recipe troupe, both permitted links remain visible despite zero shows and no chart.
4. Open the season, switch **Agenda / Statistiques**, and use the troupe logo to return to its page. **Mes stats** in the bottom bar still opens personal statistics.
5. On **Les Improbots**, use the chevron beside the season title to choose **Apérock 2026**. Check the two page links and global menu follow that season.
6. Use **Voir les autres troupes**, now near the troupe title, to open the empty recipe troupe. Return through the list to **Les Improbots**: **Apérock 2026** should still be selected. Repeat in the opposite direction; the long recipe season stays with its troupe.
7. Rotate the phone or use a narrow screen. Names remain readable or accessible, the menu stays inside the viewport, and title/navigation/admin controls do not overlap. The three menu entries remain easy to tap.

Without an active season, the intended menu retains the troupe entry and disables **Aucune saison** and **Statistiques**. This state was exercised before creating the recipe season. Restricted guest rights, missing/stale memory, transient failures and pagination are additionally covered by targeted unit tests; the recipe does not modify access permissions to force those states.

## Evidence and limits

- **128/128 targeted Angular tests passed**, no skips; production build and `git diff --check` passed. Keyboard regressions cover asynchronous resolution and Escape focus restoration on mobile/desktop components.
- API health, local HTTPS front, remote recipe URL and remote API proxy returned HTTP 200; API health was UP.
- Parent exercised authenticated desktop menu → troupe → collective statistics and mobile 390/320 px navigation with the real offline API. Mobile A → another season → B → A restored the remembered season; zero-show links and long-name menu geometry were checked. Menu rows measured 48 px high, and document width equalled viewport width at 320 px.
- Three independent bmad-build review lenses completed; actionable findings were corrected or covered by explicit runtime checks. Patrice confirmed acceptance after the mobile recipe on 2026-10-22.
- The repository Playwright regressions were updated and discovery-checked; the E1/e2e-profile suite was not executed against this offline stack. Do not treat this human-smoke stack as an E2E fixture server.
- Build warnings are existing Sass deprecations and component-style budgets; no test was skipped to obtain a pass.

After human acceptance, stop only this worktree's owned stack during local closure; leave the shared Tailscale Serve configuration and other worktrees intact. The local H2 fixtures are disposable recipe data.
