import { defineConfig } from 'vitest/config'

// DOMParser is a browser API; jsdom provides it (and querySelector on XML
// documents) so the picker can be tested in Node.
export default defineConfig({
  test: {
    environment: 'jsdom',
  },
})
