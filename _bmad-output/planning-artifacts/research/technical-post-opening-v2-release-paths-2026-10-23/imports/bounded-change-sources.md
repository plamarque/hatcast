# Supplemental primary code observations — 2026-10-23

Selected nature-of-change examples, not an exhaustive change partition. Sources: immutable Git commits below. Captured after user excluded historical duration comparisons. No runtime verification.

## 9bdceadb09ecffcc11c079dfee14bd1bbeaefa30
https://github.com/plamarque/hatcast/commit/9bdceadb09ecffcc11c079dfee14bd1bbeaefa30

9bdceadb09ecffcc11c079dfee14bd1bbeaefa30 fix(dispos): Show unavailable respondents
diff --git a/apps/web/src/app/shared/availability/availability-poll.spec.ts b/apps/web/src/app/shared/availability/availability-poll.spec.ts
index fcc1803c..75bced4d 100644
--- a/apps/web/src/app/shared/availability/availability-poll.spec.ts
+++ b/apps/web/src/app/shared/availability/availability-poll.spec.ts
@@ -436,6 +436,34 @@ describe('AvailabilityPoll', () => {
     expect(el.querySelector('app-composition-pool-preview')).toBeFalsy()
   })
 
+  it('shows unavailable respondents as a neutral pool with explainability enabled', async () => {
+    const { fixture, getEventAvailabilitySummary } = await setupPoll()
+    fixture.componentRef.setInput('summary', {
+      ...mockSummary,
+      participants: [
+        ...mockSummary.participants,
+        {
+          participantId: 'p3',
+          userId: 'user-3',
+          displayName: 'Camille',
+          avatarUrl: null,
+          status: 'unavailable' as const,
+          roleKeys: [],
+          comment: null,
+        },
+      ],
+    })
+    fixture.detectChanges()
+
+    const unavailableRow = fixture.nativeElement.querySelector('app-availability-poll-row') as HTMLElement
+    ;(unavailableRow.querySelector('.poll-row__gauge-trigger') as HTMLButtonElement).click()
+    await fixture.whenStable()
+    fixture.detectChanges()
+
+    expect(getEventAvailabilitySummary).not.toHaveBeenCalled()
+    expect(unavailableRow.querySelector('.poll-row__pool-neutral')?.textContent).toContain('Camille')
+  })
+
   it('saves comment without changing vote scope', async () => {
     const { fixture, setMyAvailability } = await setupPoll({
       initialStatus: 'available',
diff --git a/apps/web/src/app/shared/availability/availability-poll.ts b/apps/web/src/app/shared/availability/availability-poll.ts
index 78cf828f..78b4cb3e 100644
--- a/apps/web/src/app/shared/availability/availability-poll.ts
+++ b/apps/web/src/app/shared/availability/availability-poll.ts
@@ -280,7 +280,8 @@ export class AvailabilityPoll {
   }
 
   protected unavailablePoolShowNeutral(): boolean {
-    return !this.explainabilityEnabled() && this.unavailableAvatars().length > 0
+    // An unavailable response is not a draw candidate, so it never has chances to preview.
+    return this.unavailableAvatars().length > 0
   }
 
   protected flatAvailablePoolShowNeutral(): boolean {

## aa89f644c44e613f431f703366805cd5de79c196
https://github.com/plamarque/hatcast/commit/aa89f644c44e613f431f703366805cd5de79c196

aa89f644c44e613f431f703366805cd5de79c196 fix(troupe-hub): Fix mobile season chart
diff --git a/apps/web/e2e/e1/member-troupe-hub.mobile.spec.ts b/apps/web/e2e/e1/member-troupe-hub.mobile.spec.ts
index b2e1e19b..d8df8bc1 100644
--- a/apps/web/e2e/e1/member-troupe-hub.mobile.spec.ts
+++ b/apps/web/e2e/e1/member-troupe-hub.mobile.spec.ts
@@ -15,6 +15,7 @@ import {
   expectTroupeHubMetricTiles,
   expectTroupeHubPersonnesStrip,
   expectTroupeHubSeasonChartStatusBlocks,
+  expectTroupeHubSeasonChartMobileGeometry,
   expectTroupeHubSeasonChartVisible,
   fetchSeasonStatisticsEvents,
   gotoTroupeHub,
@@ -113,6 +114,7 @@ test.describe('E1 — membre hub Ma troupe dashboard (mobile)', () => {
     await expectTroupeHubMetricTiles(page)
     await expectTroupeHubSeasonChartVisible(page)
     await expectTroupeHubSeasonChartStatusBlocks(page)
+    await expectTroupeHubSeasonChartMobileGeometry(page, fx.troupeSlug, fx.seasonSlug)
     await assertNoHorizontalOverflow(page)
   })
 
diff --git a/apps/web/e2e/helpers/troupe-hub.ui.ts b/apps/web/e2e/helpers/troupe-hub.ui.ts
index 540d6ba0..17a66ce0 100644
--- a/apps/web/e2e/helpers/troupe-hub.ui.ts
+++ b/apps/web/e2e/helpers/troupe-hub.ui.ts
@@ -105,6 +105,71 @@ export async function expectTroupeHubSeasonChartStatusBlocks(page: Page): Promis
   await expect(toned.first()).toBeVisible()
 }
 
+/** BUG-028 — the chart owns lateral scrolling; month columns must not stack on mobile. */
+export async function expectTroupeHubSeasonChartMobileGeometry(
+  page: Page,
+  troupeSlug: string,
+  seasonSlug: string,
+): Promise<void> {
+  const chart = page.locator('.troupe-hub__season-chart')
+  const months = chart.locator('.member-profile__chart-months')
+  const cta = page.getByRole('link', { name: 'Voir toutes les stats', exact: true })
+  await expect(months).toBeVisible()
+  await expect(cta).toBeVisible()
+
+  const geometry = await chart.evaluate((chartElement) => {
+    const monthsElement = chartElement.querySelector('.member-profile__chart-months') as HTMLElement | null
+    const monthElements = Array.from(
+      chartElement.querySelectorAll('.member-profile__chart-month'),
+    ) as HTMLElement[]
+    const labels = monthElements.map(
+      (month) => month.querySelector('.member-profile__chart-month-label') as HTMLElement,
+    )
+    const labelsAreAligned =
+      monthElements.length >= 2 &&
+      labels.every(
+        (label, index) =>
+          label !== null &&
+          (index === 0 || Math.abs(label.getBoundingClientRect().top - labels[0].getBoundingClientRect().top) < 1),
+      )
+    const columnsIncreaseLeft =
+      monthElements.length >= 2 &&
+      monthElements.every(
+        (month, index) => index === 0 || month.getBoundingClientRect().left > monthElements[index - 1].getBoundingClientRect().left,
+      )
+    return {
+      chartOverflowX: getComputedStyle(chartElement).overflowX,
+      monthsDisplay: monthsElement ? getComputedStyle(monthsElement).display : null,
+      monthCount: monthElements.length,
+      labelsAreAligned,
+      columnsIncreaseLeft,
+    }
+  })
+  expect(geometry.monthsDisplay).toBe('flex')
+  expect(geometry.monthCount).toBeGreaterThanOrEqual(2)
+  expect(geometry.labelsAreAligned).toBe(true)
+  expect(geometry.columnsIncreaseLeft).toBe(true)
+  expect(geometry.chartOverflowX).toBe('auto')
+  await chart.evaluate((element) => {
+    const monthsElement = element.querySelector('.member-profile__chart-months') as HTMLElement
+    monthsElement.style.minWidth = `${element.clientWidth + 1}px`
+  })
+  expect(await chart.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true)
+  await chart.evaluate((element) => {
+    element.scrollLeft = element.scrollWidth
+  })
+  expect(await chart.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0)
+
+  await cta.scrollIntoViewIfNeeded()
+  const ctaBox = await cta.boundingBox()
+  const navigationBox = await page.locator('.member-nav__bottom').boundingBox()
+  expect(ctaBox).not.toBeNull()
+  expect(navigationBox).not.toBeNull()
+  expect(ctaBox!.y + ctaBox!.height).toBeLessThanOrEqual(navigationBox!.y)
+  await cta.click()
+  await expect(page).toHaveURL(seasonWorkspaceUrlPattern(troupeSlug, seasonSlug), { timeout: 30_000 })
+}
+
 export async function openTroupeHubSeasonStatsFromChart(
   page: Page,
   troupeSlug: string,
diff --git a/apps/web/src/app/pages/troupe-hub/troupe-hub.html b/apps/web/src/app/pages/troupe-hub/troupe-hub.html
index 3e9671a5..c6f7b813 100644
--- a/apps/web/src/app/pages/troupe-hub/troupe-hub.html
+++ b/apps/web/src/app/pages/troupe-hub/troupe-hub.html
@@ -192,25 +192,29 @@
               class="member-profile__chart troupe-hub__season-chart"
               aria-label="Répartition des spectacles passés par mois"
             >
-              @for (month of seasonMonthlyChart()!; track month.monthKey) {
-                <div class="member-profile__chart-month">
-                  <div class="member-profile__chart-blocks">
-                    @for (block of month.blocks; track block.eventId) {
-                      <button
-                        type="button"
-                        [class]="chartBlockModifierClass(block)"
-                        [matTooltip]="chartBlockTooltip(block)"
-                        matTooltipClass="member-profile__chart-tooltip"
-                        matTooltipPosition="above"
-                        [attr.aria-label]="chartBlockAriaLabel(block)"
-                        (click)="openChartEvent(block.eventSlug)"
-                        (keydown)="onChartBlockKeydown($event, block.eventSlug)"
-                      ></button>
-                    }
-                  </div>
-                  <span class="member-profile__chart-month-label">{{ chartMonthLabel(month.monthKey) }}</span>
+              <div class="member-profile__chart-timeline">
+                <div class="member-profile__chart-months">
+                  @for (month of seasonMonthlyChart()!; track month.monthKey) {
+                    <div class="member-profile__chart-month">
+                      <div class="member-profile__chart-blocks">
+                        @for (block of month.blocks; track block.eventId) {
+                          <button
+                            type="button"
+                            [class]="chartBlockModifierClass(block)"
+                            [matTooltip]="chartBlockTooltip(block)"
+                            matTooltipClass="member-profile__chart-tooltip"
+                            matTooltipPosition="above"
+                            [attr.aria-label]="chartBlockAriaLabel(block)"
+                            (click)="openChartEvent(block.eventSlug)"
+                            (keydown)="onChartBlockKeydown($event, block.eventSlug)"
+                          ></button>
+                        }
+                      </div>
+                      <span class="member-profile__chart-month-label">{{ chartMonthLabel(month.monthKey) }}</span>
+                    </div>
+                  }
                 </div>
-              }
+              </div>
             </div>
             <a
               mat-stroked-button
diff --git a/apps/web/src/app/pages/troupe-hub/troupe-hub.spec.ts b/apps/web/src/app/pages/troupe-hub/troupe-hub.spec.ts
index d3a7b17a..326f837a 100644
--- a/apps/web/src/app/pages/troupe-hub/troupe-hub.spec.ts
+++ b/apps/web/src/app/pages/troupe-hub/troupe-hub.spec.ts
@@ -637,6 +637,13 @@ describe('TroupeHub', () => {
     await vi.waitFor(() => {
       expect(fixture.nativeElement.querySelector('.troupe-hub__season-chart')).not.toBeNull()
     })
+    const chart = fixture.nativeElement.querySelector('.troupe-hub__season-chart') as HTMLElement
+    const timeline = chart.querySelector(':scope > .member-profile__chart-timeline')
+    const months = timeline?.querySelector(':scope > .member-profile__chart-months')
+    expect(timeline).not.toBeNull()
+    expect(months).not.toBeNull()
+    expect(months?.children).toHaveLength(3)
+    expect(Array.from(months?.children ?? []).every((node) => node.matches('.member-profile__chart-month'))).toBe(true)
     expect(fixture.nativeElement.querySelectorAll('.troupe-hub__season-chart-block').length).toBe(3)
     expect(
       fixture.nativeElement.querySelector('.troupe-hub__season-chart-block--confirmed'),
