export const defaultTheme = "light"
export const darkTheme = "dark"
export const themes = new Set([defaultTheme, darkTheme])
export const defaultSize = "medium"
export const sizes = ["small", "medium", "large", "larger"]
export const defaultFont = "book"
export const fonts = {
	book: "ET Book",
	go: "Go Regular",
	quattro: "iA Writer Quattro",
	mono: "iA Writer Mono",
	fira: "Fira Code",
}

export const fontProperty = {
	book: "serif",
	go: "sans",
	quattro: "sans",
	mono: "monospace",
	fira: "monospace",
}

export const inputSpacing = {
	quattro: "0.05em",
	mono: "0",
	fira: "0",
	book: "0.1em",
	go: "0.1em",
}

export const quoteSpacing = {
	quattro: "-1.75ch",
	mono: "-2ch",
	fira: "-2ch",
	book: "-1em",
	go: "-0.87em",
}

export const offsets = {
	quattro: ["-1.75ch", "-2.75ch", "-3.75ch"],
	mono: ["-2ch", "-3ch", "-4ch"],
	fira: ["-2ch", "-3ch", "-4ch"],
	book: ["-0.94em", "-1.64em", "-2.35em"],
	go: ["-0.87em", "-1.44em", "-2.05em"],
}

export const ctrlKey = navigator.platform === "MacIntel" ? "⌘" : "Ctrl"
