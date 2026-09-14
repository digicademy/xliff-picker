import { describe, it, expect } from 'vitest'
import { createPicker } from '../src/index.js'
import { EN_XLIFF, DE_XLIFF, MALFORMED_XLIFF } from './fixtures.js'

describe('createPicker', () => {
  it('reads <source> for the leading language', () => {
    const picker = createPicker(
      { lang: 'en', xliff: EN_XLIFF, leading: true },
      { lang: 'de', xliff: DE_XLIFF }
    )
    expect(picker.get('en', 'button.more')).toBe('More')
    expect(picker.get('en', 'label.title')).toBe('Title')
  })

  it('reads <target> for non-leading languages', () => {
    const picker = createPicker(
      { lang: 'en', xliff: EN_XLIFF, leading: true },
      { lang: 'de', xliff: DE_XLIFF }
    )
    expect(picker.get('de', 'button.more')).toBe('Mehr')
    expect(picker.get('de', 'label.title')).toBe('Titel')
  })

  it('treats the first config as leading when none is marked', () => {
    const picker = createPicker({ lang: 'en', xliff: EN_XLIFF }, { lang: 'de', xliff: DE_XLIFF })
    expect(picker.get('en', 'button.more')).toBe('More') // <source>
    expect(picker.get('de', 'button.more')).toBe('Mehr') // <target>
  })

  it('uses the first leading:true when several are marked', () => {
    const picker = createPicker(
      { lang: 'en', xliff: EN_XLIFF },
      { lang: 'de', xliff: DE_XLIFF, leading: true },
      { lang: 'fr', xliff: DE_XLIFF, leading: true }
    )
    // 'de' is the first marked leading -> reads <source>
    expect(picker.get('de', 'button.more')).toBe('More')
    // 'en' is not leading -> reads <target>, which the EN file lacks -> null
    expect(picker.get('en', 'button.more')).toBeNull()
  })

  it('returns null for an unknown id', () => {
    const picker = createPicker({ lang: 'en', xliff: EN_XLIFF })
    expect(picker.get('en', 'does.not.exist')).toBeNull()
  })

  it('returns null when the target element is missing', () => {
    const picker = createPicker(
      { lang: 'en', xliff: EN_XLIFF, leading: true },
      { lang: 'de', xliff: DE_XLIFF }
    )
    expect(picker.get('de', 'untranslated')).toBeNull()
  })

  it('handles ids and text containing quotes', () => {
    const picker = createPicker({ lang: 'en', xliff: EN_XLIFF })
    expect(picker.get('en', 'quote.example')).toBe('He said "hello"')
  })

  it('trims surrounding whitespace from the returned text', () => {
    const xliff = `<?xml version="1.0"?>
<xliff version="1.2"><file source-language="en"><body>
  <trans-unit id="spaced">
    <source>
      Padded value
    </source>
  </trans-unit>
</body></file></xliff>`
    const picker = createPicker({ lang: 'en', xliff })
    expect(picker.get('en', 'spaced')).toBe('Padded value')
  })

  it('exposes the configured languages', () => {
    const picker = createPicker({ lang: 'en', xliff: EN_XLIFF }, { lang: 'de', xliff: DE_XLIFF })
    expect(picker.languages).toEqual(['en', 'de'])
  })

  it('throws for an unknown language', () => {
    const picker = createPicker({ lang: 'en', xliff: EN_XLIFF })
    expect(() => picker.get('xx', 'button.more')).toThrow(/unknown language/)
  })

  it('throws when no config is given', () => {
    expect(() => createPicker()).toThrow(/at least one configuration/)
  })

  it('throws for a missing or empty lang', () => {
    expect(() => createPicker({ xliff: EN_XLIFF })).toThrow(/non-empty "lang"/)
  })

  it('throws for a missing xliff string', () => {
    expect(() => createPicker({ lang: 'en' })).toThrow(/non-empty "xliff"/)
  })

  it('throws for duplicate languages', () => {
    expect(() =>
      createPicker({ lang: 'en', xliff: EN_XLIFF }, { lang: 'en', xliff: EN_XLIFF })
    ).toThrow(/duplicate configuration/)
  })

  it('throws on malformed XLIFF', () => {
    expect(() => createPicker({ lang: 'en', xliff: MALFORMED_XLIFF })).toThrow(/failed to parse/)
  })
})
