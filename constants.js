const ID_KEY = "<--prototype-id-->"
const KIKI = "<--prototype-key-->"
const FONT_KEY = "<--prototype-font-->"
const SIZE_KEY = "<--prototype-size-->"
const THEME_KEY = "<--prototype-theme-->"
const WIDTH_KEY = "<--prototype-width-->"
const VALUE_KEY = "<--prototype-value-->"
const SPELLCHECK_KEY = "<--prototype-spellcheck-->"
const SETTINGS_KEY = "<--prototype-settings-->"
const SNAPSHOT_KEY = "<--prototype-snapshot-->"

const isMac = navigator.platform === "MacIntel"
const CTRL_KEY = isMac ? "⌘" : "Ctrl"
const CTRL_TEST = isMac ? (event) => event.metaKey : (event) => event.ctrlKey

const DEFAULT_THEME = "light"
const DARK_THEME = "dark"

const DEFAULT_SIZE = "medium"

const DEFAULT_WIDTH = "narrow"

const DEFAULT_FONT = "quattro"

const THEMES = {
	light: "light",
	dark: "dark",
}

const WIDTHS = {
	narrow: "1024px",
	wide: "1280px",
	full: "none",
}

const SIZES = {
	small: "small",
	medium: "medium",
	large: "large",
}

const FONTS = {
	book: {
		"font-family": "ET Book",
		"h1-offset": "-0.94em",
		"h2-offset": "-1.64em",
		"h3-offset": "-2.35em",
		"list-indent": "-0.68em",
		"check-indent": "-1.44em",
		"quote-indent": "-1em",
		"input-spacing": "0.25em",
		"check-spacing": "0.275em",
	},
	quattro: {
		"font-family": "iA Writer Quattro",
		"h1-offset": "-1.75ch",
		"h2-offset": "-2.75ch",
		"h3-offset": "-3.75ch",
		"list-indent": "-1.75ch",
		"check-indent": "-3.75ch",
		"quote-indent": "-1.75ch",
		"input-spacing": "0.25ch",
		"check-spacing": "0.25ch",
	},
	fira: {
		"font-family": "Fira Code",
		"h1-offset": "-2ch",
		"h2-offset": "-3ch",
		"h3-offset": "-4ch",
		"list-indent": "-2ch",
		"check-indent": "-4ch",
		"quote-indent": "-2ch",
		"input-spacing": "0",
		"check-spacing": "0",
	},
}

const fontKeys = Object.keys(FONTS[DEFAULT_FONT])

const computedStyle = getComputedStyle(document.documentElement)
const style = document.documentElement.style

const themeProperties = ["text", "highlight", "background", "highlight-text"]
function SET_THEME(theme, temp) {
	themeProperties.forEach((property) => {
		const variable = `--panel-${property}-color`
		const reference = `var(${variable})`
		const value =
			theme === null
				? reference
				: computedStyle.getPropertyValue(`--${THEMES[theme]}-${property}-color`)
		if (temp) {
			style.setProperty(`--${property}-color`, value)
		} else {
			style.setProperty(variable, value)
			style.setProperty(`--${property}-color`, reference)
		}
	})
}

function SET_FONT(font, temp) {
	if (temp) {
		if (font === null) {
			fontKeys.forEach((key) =>
				style.setProperty(`--${key}`, `var(--panel-${key})`)
			)
		} else {
			fontKeys.forEach((key) => style.setProperty(`--${key}`, FONTS[font][key]))
		}
	} else {
		fontKeys.forEach((key) => {
			style.setProperty(`--panel-${key}`, FONTS[font][key])
			style.setProperty(`--${key}`, `var(--panel-${key})`)
		})
	}
}

function SET_SIZE(size, temp) {
	if (temp) {
		if (size === null) {
			style.setProperty("--font-size", "var(--panel-font-size)")
		} else {
			style.setProperty("--font-size", SIZES[size])
		}
	} else {
		style.setProperty("--panel-font-size", SIZES[size])
		style.setProperty("--font-size", "var(--panel-font-size)")
	}
}

function SET_WIDTH(width, temp) {
	if (temp) {
		if (width === null) {
			style.setProperty("--max-width", "var(--panel-max-width)")
		} else {
			style.setProperty("--max-width", WIDTHS[width])
		}
	} else {
		style.setProperty("--panel-max-width", WIDTHS[width])
		style.setProperty("--font-size", "var(--panel-font-size)")
	}
}

{
	const font = localStorage.getItem(FONT_KEY)
	if (font && FONTS.hasOwnProperty(font)) {
		SET_FONT(font, false)
	}

	const size = localStorage.getItem(SIZE_KEY)
	if (size && SIZES.hasOwnProperty(size)) {
		SET_SIZE(size, false)
	}

	const theme = localStorage.getItem(THEME_KEY)
	if (theme && THEMES.hasOwnProperty(theme)) {
		SET_THEME(theme, false)
	}

	const width = localStorage.getItem(WIDTH_KEY)
	if (width && WIDTHS.hasOwnProperty(width)) {
		SET_WIDTH(width, false)
	}
}
