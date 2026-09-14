/**
 * Sample XLIFF content mirroring the structure of TYPO3 `locallang.xlf` files.
 * The leading (source) file carries only <source>; target files add <target>.
 */

export const EN_XLIFF = `<?xml version="1.0" encoding="UTF-8"?>
<xliff version="1.2">
  <file source-language="en" datatype="plaintext" original="EXT:foo/Resources/Private/Language/locallang.xlf">
    <header/>
    <body>
      <trans-unit id="button.more">
        <source>More</source>
      </trans-unit>
      <trans-unit id="label.title">
        <source>Title</source>
      </trans-unit>
      <trans-unit id="quote.example">
        <source>He said "hello"</source>
      </trans-unit>
    </body>
  </file>
</xliff>`

export const DE_XLIFF = `<?xml version="1.0" encoding="UTF-8"?>
<xliff version="1.2">
  <file source-language="en" target-language="de" datatype="plaintext" original="EXT:foo/Resources/Private/Language/de.locallang.xlf">
    <header/>
    <body>
      <trans-unit id="button.more">
        <source>More</source>
        <target>Mehr</target>
      </trans-unit>
      <trans-unit id="label.title">
        <source>Title</source>
        <target>Titel</target>
      </trans-unit>
      <trans-unit id="untranslated">
        <source>Only source here</source>
      </trans-unit>
    </body>
  </file>
</xliff>`

export const MALFORMED_XLIFF = `<?xml version="1.0"?><xliff><file><body><trans-unit id="x"><source>oops</body></xliff>`
