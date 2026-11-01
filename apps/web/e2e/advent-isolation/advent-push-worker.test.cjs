const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const path = require('node:path')

function worker() {
  const handlers = {}
  const shown = []
  const opened = []
  const self = {
    location: { origin: 'https://hatcast.example.test' },
    addEventListener: (event, handler) => { handlers[event] = handler },
    registration: { showNotification: async (title, options) => { shown.push({ title, options }) } },
    clients: { matchAll: async () => [], openWindow: async url => { opened.push(url) } },
  }
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../src/custom-sw.js'), 'utf8'), { self, URL, importScripts: () => {} })
  return { handlers, shown, opened }
}

test('Advent push displays neutral text and follows its same-origin route', async () => {
  const { handlers, shown, opened } = worker()
  let pending
  handlers.push({ stopImmediatePropagation() {}, data: { json: () => ({ title: 'Quiz de l’Avent', body: 'Le quiz du jour t’attend !', url: '/avent' }) }, waitUntil: promise => { pending = promise } })
  await pending
  assert.equal(shown.length, 1)
  assert.equal(shown[0].title, 'Quiz de l’Avent')
  assert.equal(shown[0].options.body, 'Le quiz du jour t’attend !')
  assert.equal(shown[0].options.data.url, 'https://hatcast.example.test/avent')
  let closed = false
  handlers.notificationclick({ notification: { data: shown[0].options.data, close: () => { closed = true } }, waitUntil: promise => { pending = promise } })
  await pending
  assert.equal(closed, true)
  assert.deepEqual(opened, ['https://hatcast.example.test/avent'])
})

test('notification links cannot navigate to a different origin', async () => {
  const { handlers, shown } = worker()
  let pending
  handlers.push({ stopImmediatePropagation() {}, data: { json: () => ({ url: 'https://elsewhere.example/path' }) }, waitUntil: promise => { pending = promise } })
  await pending
  assert.equal(shown[0].options.data.url, 'https://hatcast.example.test/')
})
