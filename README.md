# tad

> A scratch space for notes, reminders, and whatever else you want to keep around

Tad is a WebExtension that replaces the new tab page with a markdown scratchpad, inspired by [Papier](https://getpapier.com/). It's built with [SlateJS](https://github.com/ianstormtaylor/slate), all dependencies are vendored in, and it doesn't use JSX: `index.js` is ~100 lines and is loaded directly into `index.html`.

Font is [iA Writer Duospace](https://github.com/iaolo/iA-Fonts/tree/master/iA%20Writer%20Duospace), itself a fork of [IBM Plex](https://github.com/IBM/plex).

Markdown "support" is limited to h1-h4 and blockquotes for now.
