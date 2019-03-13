# tad

> A scratch space for notes, reminders, and whatever else you want to keep around

Tad is a WebExtension that replaces the new tab page with a markdown scratchpad, inspired by [Papier](https://getpapier.com/). It's built with [SlateJS](https://github.com/ianstormtaylor/slate), all dependencies are vendored in, and it doesn't use JSX: `index.js` is ~150 lines and is loaded directly into `index.html`.

Markdown "support" is limited to h1-h3 and blockquotes for now.

## Fonts

Fonts include:

- [iA Writer Quatto](https://github.com/iaolo/iA-Fonts/tree/master/iA%20Writer%20Quattro) and [iA Writer Mono](https://github.com/iaolo/iA-Fonts/tree/master/iA%20Writer%20Mono), which are themselves both forks of [IBM Plex](https://github.com/IBM/plex)
- [Go Regular](https://blog.golang.org/go-fonts) by Bigelow & Holmes
- [ET Book](https://edwardtufte.github.io/et-book/) by Dmitry Krasny, Bonnie Scranton, and Edward Tufte
- [Fira Code](https://github.com/tonsky/FiraCode), an extension of Fira Mono by Carrois Apostrophe with programming ligatures

## Philosophy

**See the whole state**. There are no menus or buttons or any hidden state whatsoever. Every piece of style and formatting is a pure function of the **visible text** on the page. Your shortcuts for bolding and italicizing will still work, they'll just edit the text surrounding your selection. WYSIWYG is less relevant since it's so common to create and consume in the same place, especially in a 'personal notes' context, and nothing is more personal than your new tab page. What we really want is WYTIWYS ('witty-whiz') - What You Type Is What You See.

This has occasional surprises: there's no auto-styling of raw URLs in text, and non-URL-text enclosed in square brackets will still render as an HTML achor tag.

The one exception to this is the color sheme - which you can toggle with Ctrl/Cmd-Period (only a default binding, since it uses the WebExtension commands API - change it your browser settings). In the future this shortcut will be deprecated and replaced with `prefers-color-scheme` in CSS once browsers implement it.
