export const defaultTheme = "light"
export const darkTheme = "dark"
export const themes = new Set([defaultTheme, darkTheme])
export const defaultSize = "medium"
export const sizes = ["small", "medium", "large", "larger"]
export const defaultFont = "quattro"
export const fonts = {
	quattro: "iA Writer QuattroS",
	mono: "iA Writer MonoS",
	book: "et-book",
	go: "Go Regular",
}

export const inputSpacing = {
	quattro: "0.05em",
	mono: "0",
	book: "0.1em",
	go: "0.1em",
}

export const quoteSpacing = {
	quattro: "-1.75ch",
	mono: "-2ch",
	book: "-1em",
	go: "-0.87em",
}

export const offsets = {
	quattro: ["-1.75ch", "-2.75ch", "-3.75ch"],
	mono: ["-2ch", "-3ch", "-4ch"],
	book: ["-2ch", "-3.5ch", "-5ch"],
	go: ["-0.87em", "-1.44em", "-2.05em"],
}

export const ctrlKey = navigator.platform === "MacIntel" ? "⌘" : "Ctrl"
