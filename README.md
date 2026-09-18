# XLIFF Picker

[![made-with-javascript](https://img.shields.io/badge/Made%20with-JavaScript-1f425f.svg)](https://www.javascript.com)
![NPM Downloads](https://img.shields.io/npm/dw/%40digicademy%2Fxliff-picker?logo=npm)
[![Socket Badge](https://badge.socket.dev/npm/package/@digicademy/xliff-picker/1.0.1)](https://badge.socket.dev/npm/package/@digicademy/xliff-picker/1.0.1)

A tiny, dependency-free helper that loads language data from raw
[XLIFF](https://en.wikipedia.org/wiki/XLIFF) file content and returns the text
of a single translation unit by its `id`.

Designed to run in the browser after being processed by a bundler
(Webpack, Vite, …).

## Install

```bash
npm install @digicademy/xliff-picker
```

## Usage

Imports the XLIFF files you want to use at **build time** as raw strings and pass them to `createPicker`.

```js
// Vite: append `?raw` to import a file as a string.
import en from '/myApp/i18n/english.xlf?raw'
import de from '/myApp/i18n/german.xlf?raw'

import { createPicker } from '@digicademy/xliff-picker'

const picker = createPicker(
  { lang: 'en', xliff: en, leading: true },
  { lang: 'de', xliff: de }
)

picker.get('en', 'button.more') // -> "More"   (from <source>)
picker.get('de', 'button.more') // -> "Mehr"   (from <target>)
picker.get('en', 'missing.id')  // -> null
picker.languages                // -> ['en', 'de']
```

### Webpack

Configure a raw import for `.xlf` files, then import as above:

```js
// webpack.config.js
module.exports = {
  module: {
    rules: [{ test: /\.xlf$/i, type: 'asset/source' }],
  },
}
```

## API

### `createPicker(...configs) -> Picker`

Each config object:

| Property  | Type      | Required | Description                                                               |
| --------- | --------- | -------- | ------------------------------------------------------------------------- |
| `lang`    | `string`  | yes      | Language key, e.g. `'en'`. Passed to `get()`.                             |
| `xliff`   | `string`  | yes      | Raw XLIFF file content.                                                   |
| `leading` | `boolean` | no       | Marks the language whose values are read from `<source>` (see below).     |

**Leading language:** the first config with `leading: true`; if several are
marked, the first of those; if none, the first config passed. The leading
language is read from `<source>`; every other language from `<target>`.

### `picker.get(lang, id) -> string | null`

Returns the text content of the `<trans-unit>` with the given `id` — from
`<source>` for the leading language, `<target>` otherwise. Returns `null` if the
unit or its source/target element is absent. Throws if `lang` was not configured.

### `picker.languages -> string[]`

The configured language keys, in order.

## Notes / design

- **Parsed as XML.** XLIFF is XML, so files are parsed with
  `DOMParser.parseFromString(raw, 'application/xml')`.
- **Lookups** use `querySelector('trans-unit[id="..."]')` to find an element via `get()`.
- **Text is trimmed** — `textContent` is `.trim()`-ed before being returned, so
  surrounding whitespace from the source file's formatting is removed.

## Development

```bash
npm install
npm test         # Vitest (jsdom environment — supplies DOMParser)
```
