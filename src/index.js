/**
 * xliff-picker
 *
 * Loads language data from raw XLIFF (translation) file content and lets you
 * retrieve the text of a single translation unit by its id.
 *
 * The package is meant to run in the browser after being processed by a
 * bundler (Webpack, Vite, ...). Because bundlers resolve raw file imports at
 * build time, the *consumer* imports each XLIFF file as a raw string and hands
 * that string to {@link createPicker}. The picker itself never touches the
 * filesystem.
 *
 * @example
 * // In the consuming app (Vite shown; Webpack: use an `asset/source` rule):
 * import en from '/.../Resources/Private/Language/locallang.xlf?raw'
 * import de from '/.../Resources/Private/Language/de.locallang.xlf?raw'
 * import { createPicker } from 'xliff-picker'
 *
 * const picker = createPicker(
 *   { lang: 'en', xliff: en, leading: true },
 *   { lang: 'de', xliff: de }
 * )
 *
 * picker.get('en', 'button.more') // -> "More"   (read from <source>)
 * picker.get('de', 'button.more') // -> "Mehr"   (read from <target>)
 */

/**
 * @typedef {Object} PickerConfig
 * @property {string} lang - Language key, e.g. 'en'. Used as the argument to `get()`.
 * @property {string} xliff - Raw XLIFF file content as a string.
 * @property {boolean} [leading] - Marks this language as the leading one, whose
 *   values are read from `<source>` instead of `<target>`.
 */

/**
 * @typedef {Object} Picker
 * @property {(lang: string, id: string) => (string|null)} get - Retrieve a unit's text.
 * @property {string[]} languages - The configured language keys.
 */

/**
 * XLIFF is XML, so we parse it as XML.
 * @type {DOMParserSupportedType}
 */
const XML_MIME = 'application/xml'

/**
 * Parse a raw XLIFF string into an XML Document, throwing on empty input or a
 * parser error.
 *
 * @param {string} raw - Raw XLIFF file content.
 * @param {string} lang - Language key, used only for error messages.
 * @returns {Document}
 */
const parseXliff = (raw, lang) => {
  if (typeof raw !== 'string' || raw.length === 0) {
    throw new TypeError(`xliff-picker: config for "${lang}" is missing a non-empty "xliff" string.`)
  }

  const doc = new DOMParser().parseFromString(raw, XML_MIME)

  // On a malformed document, DOMParser does not throw; it returns a document
  // containing a <parsererror> element instead. Surface that as a real error.
  const error = doc.querySelector('parsererror')
  if (error) {
    throw new Error(`xliff-picker: failed to parse XLIFF for "${lang}": ${error.textContent.trim()}`)
  }

  return doc
}

/**
 * Escape a value so it can be embedded safely inside a double-quoted attribute
 * selector, e.g. `[id="..."]`. Ids containing `"` or `\` would otherwise break
 * the selector or throw a SyntaxError.
 *
 * @param {string} value
 * @returns {string}
 */
const escapeAttributeValue = (value) => String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')

/**
 * Create a picker over one or more XLIFF language files.
 *
 * The leading language (whose values live in `<source>`) is the first config
 * with `leading === true`; if several are marked, the first of those wins; if
 * none are marked, the first config passed is treated as leading. Every other
 * language is read from `<target>`.
 *
 * @param {...PickerConfig} configs - One config object per language.
 * @returns {Picker}
 * @throws {Error} If no config is given or a `lang` is duplicated.
 * @throws {TypeError} If a config lacks a valid `lang` or `xliff`.
 */
export const createPicker = (...configs) => {
  if (configs.length === 0) {
    throw new Error('xliff-picker: createPicker requires at least one configuration object.')
  }

  // Resolve the leading language: first `leading: true`, otherwise the first config.
  const markedIndex = configs.findIndex((config) => config && config.leading === true)
  const leadingIndex = markedIndex === -1 ? 0 : markedIndex

  /** @type {Map<string, {doc: Document, isLeading: boolean}>} */
  const entries = new Map()

  configs.forEach((config, index) => {
    if (!config || typeof config.lang !== 'string' || config.lang === '') {
      throw new TypeError('xliff-picker: every configuration object needs a non-empty "lang" string.')
    }
    if (entries.has(config.lang)) {
      throw new Error(`xliff-picker: duplicate configuration for language "${config.lang}".`)
    }

    entries.set(config.lang, {
      doc: parseXliff(config.xliff, config.lang),
      isLeading: index === leadingIndex,
    })
  })

  return {
    /**
     * Retrieve the text content of a translation unit.
     *
     * Finds the `<trans-unit>` with the given id, then reads `<source>` for the
     * leading language or `<target>` for any other language.
     *
     * @param {string} lang - A language key used when the picker was created.
     * @param {string} id - The `id` attribute of the `<trans-unit>` to read.
     * @returns {string|null} The element's trimmed text content, or `null` if
     *   the unit or its source/target element does not exist.
     * @throws {Error} If `lang` was not configured.
     */
    get(lang, id) {
      const entry = entries.get(lang)
      if (!entry) {
        throw new Error(`xliff-picker: unknown language "${lang}".`)
      }

      const unit = entry.doc.querySelector(`trans-unit[id="${escapeAttributeValue(id)}"]`)
      if (!unit) {
        return null
      }

      const node = unit.querySelector(entry.isLeading ? 'source' : 'target')
      return node ? node.textContent.trim() : null
    },

    /**
     * The configured language keys, in the order they were passed.
     * @returns {string[]}
     */
    get languages() {
      return [...entries.keys()]
    },
  }
}
