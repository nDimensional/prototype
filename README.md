# tad

> A scratch space for notes, reminders, and whatever else you want to keep around

Tad is a WebExtension that replaces the new tab page with a markdown scratchpad, inspired by [Papier](https://getpapier.com/). It's built with [SlateJS](https://github.com/ianstormtaylor/slate), all dependencies are vendored in, and it doesn't use JSX: `index.js` is ~150 lines and is loaded directly into `index.html`.

Markdown "support" is limited to h1-h4 and blockquotes for now.

## Fonts

Fonts are [iA Writer Quatto](https://github.com/iaolo/iA-Fonts/tree/master/iA%20Writer%20Quattro) and [iA Writer Mono](https://github.com/iaolo/iA-Fonts/tree/master/iA%20Writer%20Mono), which are themselves both forks of [IBM Plex](https://github.com/IBM/plex).

## Vendored libraries

| name         | version | unpkg link                                                                                        |
| ------------ | ------- | ------------------------------------------------------------------------------------------------- |
| `Immutable`  | 3.8.2   | [immutable.min.js](https://unpkg.com/immutable@3.8.2/dist/immutable.min.js)                       |
| `ReactDOM`   | 16.7.0  | [react-dom.production.min.js](https://unpkg.com/react-dom@16.7.0/umd/react-dom.production.min.js) |
| `React`      | 16.7.0  | [react-production.min.js](https://unpkg.com/react@16.7.0/umd/react.production.min.js)             |
| `SlateReact` | 0.21.15 | [slate-react.min.js](https://unpkg.com/slate-react@0.21.15/dist/slate-react.min.js)               |
| `Slate`      | 0.44.9  | [slate.min.js](https://unpkg.com/slate@0.44.9/dist/slate.min.js)                                  |
