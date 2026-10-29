const { test } = require('node:test')
const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { join } = require('node:path')
const { chromium } = require('playwright')

test('door animation preserves visible focus and respects reduced motion', async () => {
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage({ viewport: { width: 375, height: 800 } })
    const css = readFileSync(join(__dirname, 'advent-test.scss'), 'utf8')
    await page.setContent(`<style>${css}</style><section class="advent__quiz"><div class="advent__opening" aria-hidden="true"></div><h2 id="quiz-title" tabindex="-1">Portrait fictif</h2><p>Quiz</p></section>`)
    const door = page.locator('.advent__opening')
    const title = page.locator('#quiz-title')
    assert.equal(await door.evaluate(e => getComputedStyle(e).animationName), 'advent-door-open')
    await title.focus()
    assert.equal(await title.evaluate(e => document.activeElement === e), true)
    assert.equal(await title.evaluate(e => {
      const rect = e.getBoundingClientRect()
      const top = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
      return top === e || e.contains(top)
    }), true)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    assert.equal(await door.evaluate(e => getComputedStyle(e).animationName), 'none')
    assert.equal(await door.evaluate(e => getComputedStyle(e).display), 'none')
    assert.equal(await title.isVisible(), true)
    assert.equal(await title.evaluate(e => document.activeElement === e), true)
  } finally {
    await browser.close()
  }
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
