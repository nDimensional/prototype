# prototype

> A scratch space for notes, reminders, and whatever else you want to keep around

Prototype is a WebExtension that replaces the new tab page with a self-styling scratchpad. It's built with [SlateJS](https://github.com/ianstormtaylor/slate).

## Fonts

- [iA Writer Quatto](https://github.com/iaolo/iA-Fonts/tree/master/iA%20Writer%20Quattro) and [iA Writer Mono](https://github.com/iaolo/iA-Fonts/tree/master/iA%20Writer%20Mono), which are themselves both forks of [IBM Plex](https://github.com/IBM/plex)
- [Go Regular](https://blog.golang.org/go-fonts) by Bigelow & Holmes
- [ET Book](https://edwardtufte.github.io/et-book/) by Dmitry Krasny, Bonnie Scranton, and Edward Tufte
- [Fira Code](https://github.com/tonsky/FiraCode), an extension of Fira Mono by Carrois Apostrophe with programming ligatures

## Philosophy

**See the whole state**. The page is "rendered as source" - there are no menus or buttons or [invisible formatting](https://xkcd.com/2109/) or any hidden state whatsoever. Every piece of style is a pure function of the _visible text_. This makes it easy to learn, easy to manipulate, easy to copy & paste, and grounds reading & writing in the same shared environment.
