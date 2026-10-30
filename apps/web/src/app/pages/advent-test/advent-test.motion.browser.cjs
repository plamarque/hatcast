const { test } = require('node:test')
const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { join } = require('node:path')
const { chromium } = require('playwright')

test('elf approach respects reduced motion and gift remains accessible', async () => {
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage({ viewport: { width: 375, height: 800 } })
    const css = readFileSync(join(__dirname, 'advent-test.scss'), 'utf8')
    await page.setContent(`<style>${css}</style><div class="advent__scene"><div class="advent__elf"><button class="advent__gift" aria-label="Ouvrir le cadeau du jour 12"></button></div></div>`)
    const elf = page.locator('.advent__elf')
    const gift = page.getByRole('button', { name: 'Ouvrir le cadeau du jour 12' })
    assert.equal(await elf.evaluate(e => getComputedStyle(e).animationName), 'advent-approach')
    await gift.focus()
    assert.equal(await gift.evaluate(e => document.activeElement === e), true)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    assert.equal(await elf.evaluate(e => getComputedStyle(e).animationName), 'none')
    assert.equal(await gift.isVisible(), true)
  } finally { await browser.close() }
})

test('PWA banners stay in flow on the Advent preview at mobile and enlarged text sizes', async () => {
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage({ viewport: { width: 320, height: 800 } })
    const styles = readFileSync(join(__dirname, '../../../styles.scss'), 'utf8')
    const rule = styles.slice(styles.indexOf('app-root:has(app-advent-test) .pwa-system-banner.pwa-system-banner'))
    await page.setContent(`<style>${rule} .pwa-system-banner[_ngcontent-test] { position:fixed; top:0; height:80px; }</style><app-root><div><app-pwa-install-banner><div class="pwa-system-banner" _ngcontent-test>Install</div></app-pwa-install-banner><app-pwa-update-banner><div class="pwa-system-banner" _ngcontent-test>Update</div></app-pwa-update-banner></div><app-advent-test><p id="test-label">Mode test · contenu fictif</p></app-advent-test></app-root>`)
    for (const zoom of ['100%', '200%']) {
      await page.evaluate(value => { document.documentElement.style.zoom = value }, zoom)
      const boxes = await page.locator('.pwa-system-banner').evaluateAll(elements => elements.map(e => ({ position: getComputedStyle(e).position, ...e.getBoundingClientRect().toJSON() })))
      const label = await page.locator('#test-label').boundingBox()
      assert.equal(boxes[0].position, 'relative')
      assert.equal(boxes[1].position, 'relative')
      assert.ok(label.y >= Math.max(...boxes.map(b => b.bottom)))
    }
  } finally {
    await browser.close()
  }
})
