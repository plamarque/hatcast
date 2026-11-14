import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Firebase module mocks differ between suites; do not share their module registry.
    isolate: true,
  },
})
