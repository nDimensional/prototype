const katexStyle = require("katex/dist/katex.min.css")
export const katexStyleSheet = new CSSStyleSheet()
katexStyleSheet.replaceSync(katexStyle)

export const defaultTheme = "light"
export const darkTheme = "dark"
export const themes = new Set([defaultTheme, darkTheme])
export const defaultSize = "medium"
export const sizes = {
	small: "Small",
	medium: "Medium",
	large: "Large",
	// ["x-large"]: "Extra Large",
}
export const defaultFont = "quattro"
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
	mono: "mono",
	fira: "mono",
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

export const listSpacing = {
	quattro: "-1.75ch",
	mono: "-2ch",
	fira: "-2ch",
	book: "-0.68em",
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

export const computedStyle = getComputedStyle(document.documentElement)
const style = document.body.style

export const properties = ["text", "highlight", "background", "highlight-text"]
export function setTheme(theme, temp) {
	properties.forEach(property => {
		const variable = `--panel-${property}-color`
		const reference = `var(${variable})`
		const value =
			theme === null
				? reference
				: computedStyle.getPropertyValue(`--${theme}-${property}-color`)
		if (temp) {
			style.setProperty(`--${property}-color`, value)
		} else {
			style.setProperty(variable, value)
			style.setProperty(`--${property}-color`, reference)
		}
	})
}

export function setFont(font, temp) {
	if (temp) {
		if (font === null) {
			style.setProperty("--h1-offset", "var(--panel-h1-offset)")
			style.setProperty("--h2-offset", "var(--panel-h2-offset)")
			style.setProperty("--h3-offset", "var(--panel-h3-offset)")
			style.setProperty("--font-family", "var(--panel-font-family)")
			style.setProperty("--quote-spacing", "var(--panel-quote-spacing)")
			style.setProperty("--input-spacing", "var(--panel-input-spacing)")
			style.setProperty("--list-spacing", "var(--panel-list-spacing)")
		} else {
			style.setProperty("--h1-offset", offsets[font][0])
			style.setProperty("--h2-offset", offsets[font][1])
			style.setProperty("--h3-offset", offsets[font][2])
			style.setProperty("--font-family", fonts[font])
			style.setProperty("--quote-spacing", quoteSpacing[font])
			style.setProperty("--input-spacing", inputSpacing[font])
			style.setProperty("--list-spacing", listSpacing[font])
		}
	} else {
		style.setProperty("--panel-h1-offset", offsets[font][0])
		style.setProperty("--panel-h2-offset", offsets[font][1])
		style.setProperty("--panel-h3-offset", offsets[font][2])
		style.setProperty("--panel-font-family", fonts[font])
		style.setProperty("--panel-quote-spacing", quoteSpacing[font])
		style.setProperty("--panel-input-spacing", inputSpacing[font])
		style.setProperty("--panel-list-spacing", listSpacing[font])
		style.setProperty("--h1-offset", "var(--panel-h1-offset)")
		style.setProperty("--h2-offset", "var(--panel-h2-offset)")
		style.setProperty("--h3-offset", "var(--panel-h3-offset)")
		style.setProperty("--font-family", "var(--panel-font-family)")
		style.setProperty("--quote-spacing", "var(--panel-quote-spacing)")
		style.setProperty("--input-spacing", "var(--panel-input-spacing)")
		style.setProperty("--list-spacing", "var(--panel-list-spacing)")
	}
}

export function setSize(size, temp) {
	if (temp) {
		if (size === null) {
			style.setProperty("--font-size", "var(--panel-font-size)")
		}
		style.setProperty("--font-size", size)
	} else {
		style.setProperty("--panel-font-size", size)
		style.setProperty("--font-size", "var(--panel-font-size)")
	}
}
