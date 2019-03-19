# prototype

> A scratch space for notes, links, reminders, and whatever else you want to keep around

Prototype is a WebExtension that replaces the new tab page with a self-styling scratchpad. It's built with [SlateJS](https://github.com/ianstormtaylor/slate).

The `master` branch is organized as a WebExtension that writes to `storage.local`; the `gh-pages` branch is organized as a single-page application that writes to `localStorage`. You can play with it at http://prototypical.xyz.

## Install

- [Chrome Web Store](https://chrome.google.com/webstore/detail/prototype/mcfikpkmjbdlfjdlmbeodbfkenhpieam)

```
git clone https://github.com/nDimensional/prototype.git
cd prototype
npm install
npm run build
```

Then load the unpacked extension in your favorite browser.

## Philosophy

**See the whole state**. The page is "rendered as source" - there are no menus or buttons or [invisible formatting](https://xkcd.com/2109/) or any hidden state whatsoever. Every piece of style is a pure function of the _visible text_. This makes it easy to learn, easy to manipulate, easy to copy & paste, and grounds reading & writing in the same shared environment.

Ctrl-B and Ctrl-I keyboard shortcuts are deliberately excluded. 🙃

## Relation to Markdown

The Prototype editor does not use Markdown. It uses its own markup language, also called Prototype.

The most symbolic difference is using a single pair of asterisks for bold and a single pair of underscores for italics. This is what Slack and Facebook Messenger use for styling; it makes more sense to most people and two-character style directives look atrocious and waste space.

There are no ordered lists, and only `-` makes unordered lists (not `*`).

There's no way to esacpe style characters.

There are only H1-H3 headers.

There are no newlines within paragraphs. With the exeption of unordered lists (which are conceptually grouped as a single "list" block) and code blocks (eventually), every newline character begins an independent, self-contained block.

Images can be embedded either with `![alt text](http://web.site)` or just with `!http://web.site`. This mirrors links, which can be inlined like Markdown's `[text](http://web.site)`, but also auto-link when pasted directly as `http://web.site`.

## Roadmap

**Code blocks**. These are straightforward and just need implementation.

**Inline tables as TSVs**. This is spiritually pure interpretation of the tab character, and is vastly superior to Markdown's ASCII-art approach. This means single-column tables won't be possible, and that any line with a tab character will be rendered as a table row. There are lots of edges cases around cursor & selection behavior to iron out first.

**Inline LaTeX**. This is on hold mostly for performance reasons. [KaTeX](https://github.com/KaTeX/KaTeX) is large and requires its own CSS stylesheet; ideally the library could be loaded dynamically (only if necessary) and each instance of `$inline latex$` would render in a shadow root with a single global instance of the KaTeX CSS attached as a [constructable stylesheet](https://developers.google.com/web/updates/2019/02/constructable-stylesheets).

**Definitions**. Allow arbitrary URI "terms" to be defined with `[text of term]: http://web.site`, and then used as inline links (`[text of term]`), inline images (`![text of term]`), This continues the generalization of Markdown's handling of images described earlier, where the `[link text](http://web.site)` construction is interpreted as an "inline definition" (also allowing `[link text]` to be re-used further on). This sort of retcons an object model onto Markdown's link syntax.

**Margin notes**. Re-use the term definition syntax for unstructured text: `[text of term]: some unstructured text as a margin note`, and render `some unstructured text as a margin note` in the margin wherever `[text of term]` is invoked. Consider limiting margin notes to numeric terms.

**Transclusion by content hash**. Why not?

## Fonts

- [iA Writer Quatto](https://github.com/iaolo/iA-Fonts/tree/master/iA%20Writer%20Quattro), a fork of [IBM Plex](https://github.com/IBM/plex)
- [ET Book](https://edwardtufte.github.io/et-book/) by Dmitry Krasny, Bonnie Scranton, and Edward Tufte
- [Fira Code](https://github.com/tonsky/FiraCode), an extension of Fira Mono by Carrois Apostrophe with programming ligatures
