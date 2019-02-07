import React from "react"
import ReactDOM from "react-dom"
import { Value } from "slate"
import Prototype from "./prototype"
import {
	defaultTheme,
	darkTheme,
	themes,
	defaultFont,
	fonts,
	inputSpacing,
	offsets,
	quoteSpacing,
} from "./constants"

const ctrlKey = navigator.platform === "MacIntel" ? "⌘" : "Ctrl"
document
	.querySelectorAll(".ctrl-key")
	.forEach(node => (node.textContent = ctrlKey))

const main = document.querySelector("main")
const settings = document.getElementById("settings")
const themeElement = document.getElementById("theme")

// const fontElements = {}
// fonts.forEach(id => (fontElements[id] = document.getElementById(id)))
const fontElements = Object.keys(fonts).map(id => document.getElementById(id))

const initialText = [
	"# Welcome to Tad!",
	"Use this space for scratch notes, reminders, and whatever else you want to keep around.",
	"Tad uses a new markup language called Prototype that's designed to be \"rendered as source\", but you don't have to worry about that if you don't want to. Mostly it works like you'd expect.",
	`Press ${ctrlKey}-Period to open and close the settings panel, where you can set the font and color theme.`,
	"> Block quotes start with a single right chevron. You can't have multi-line quotes, but the text will wrap with nice indentation.",
	"You can make a horizontal divider with line of only dashes - at least three in a row.",
	"---",
	"------",
	"You can *bold text* by wrapping it with asterisks. This is *different from markdown*, where a single pair of asterisks only buys you italics. If you want italics, _use underscores!_ They're much simpler.",
	"You can also `format text` inline! Formatted text is always rendered with a fixed-width font.",
	"",
]

const initialValue = Value.fromJSON({
	document: {
		nodes: initialText.map(text => ({
			object: "block",
			type: "p",
			nodes: [{ object: "text", leaves: [{ text }] }],
		})),
	},
})

const ID_KEY = "--tad-id--"
const FONT_KEY = "--tad-font--"
const SIZE_KEY = "--tad-size--"
const THEME_KEY = "--tad-theme--"
const VALUE_KEY = "--tad-storage--"
const SETTINGS_KEY = "--tad-settings--"

class Document extends React.Component {
	constructor(props) {
		super(props)
		this.state = { value: this.props.initialValue }
		this.sync = true
		this.handleChange = this.handleChange.bind(this)
	}

	async save(value) {
		this.sync = false
		this.value = null
		const json = value.toJSON()
		const data = { [VALUE_KEY]: json, [ID_KEY]: this.props.id }
		await window.browser.storage.sync.set(data)
		if (this.value !== null) this.save(this.value)
		else this.sync = true
	}

	componentDidMount() {
		main.focus()
		window.browser.storage.onChanged.addListener(
			({ [VALUE_KEY]: storage, [ID_KEY]: tab }, area) => {
				if (area === "sync" && storage && tab) {
					if (tab.newValue === this.props.id) return // ignore local edits
					const value = Value.fromJSON(storage.newValue)
					// Only update if the _document_ is different
					if (!is(value.document, this.state.value.document)) {
						this.setState({ value })
					}
				}
			}
		)
	}

	handleChange({ value }) {
		if (value.document !== this.state.value.document) {
			if (this.sync) this.save(value)
			else this.value = value
		}
		this.setState({ value })
	}

	render() {
		return <Prototype value={this.state.value} onChange={this.handleChange} />
	}
}

themeElement.addEventListener("change", () => {
	const theme = themeElement.checked ? darkTheme : defaultTheme
	window.browser.storage.sync.set({ [THEME_KEY]: theme })
})

fontElements.forEach(element =>
	element.addEventListener("change", () => {
		const checkedElement = fontElements.find(element => element.checked)
		if (checkedElement && checkedElement.id !== currentFont) {
			window.browser.storage.sync.set({ [FONT_KEY]: checkedElement.id })
		}
	})
)

let currentTheme = defaultTheme
function setTheme(theme) {
	if (theme !== currentTheme) {
		if (theme === defaultTheme) document.body.classList.remove(darkTheme)
		else document.body.classList.add(darkTheme)
		currentTheme = theme
	}
}

let currentFont = defaultFont
function setFont(font) {
	if (fonts.hasOwnProperty(font) && font !== currentFont) {
		fontElements.forEach(element => (element.checked = element.id === font))
		document.documentElement.style.setProperty("--h1-offset", offsets[font][0])
		document.documentElement.style.setProperty("--h2-offset", offsets[font][1])
		document.documentElement.style.setProperty("--h3-offset", offsets[font][2])
		document.documentElement.style.setProperty(
			"--quote-spacing",
			quoteSpacing[font]
		)
		document.documentElement.style.setProperty(
			"--input-spacing",
			inputSpacing[font]
		)
		document.documentElement.style.setProperty(
			"--main-font-family",
			fonts[font]
		)
		// document.body.style.fontFamily = fonts[font]
		currentFont = font
	}
}

// Get tab id & data from browser storage
window.browser = window.browser || window.chrome
const storageKeys = [VALUE_KEY, THEME_KEY, FONT_KEY]
Promise.all(
	window.chrome
		? [
				new Promise(resolve => chrome.tabs.getCurrent(resolve)),
				new Promise(resolve => chrome.storage.sync.get(storageKeys, resolve)),
		  ]
		: [
				window.browser.tabs.getCurrent(),
				window.browser.storage.sync.get(storageKeys),
		  ]
).then(
	([{ id }, { [VALUE_KEY]: json, [THEME_KEY]: theme, [FONT_KEY]: font }]) => {
		if (themes.has(theme)) {
			setTheme(theme)
			themeElement.checked = theme !== defaultTheme
		} else {
			window.browser.storage.sync.set({ [THEME_KEY]: defaultTheme })
		}

		if (fonts.hasOwnProperty(font)) {
			setFont(font)
			fontElements.forEach(element => (element.checked = element.id === font))
		} else {
			window.browser.storage.sync.set({ [FONT_KEY]: defaultFont })
		}

		// Attach theme listeners
		window.browser.commands.onCommand.addListener(command => {
			if (command === "toggle-settings") {
				settings.classList.contains("hidden")
					? settings.classList.remove("hidden")
					: settings.classList.add("hidden")
			}
		})

		window.browser.storage.onChanged.addListener(
			({ [THEME_KEY]: themeValue, [FONT_KEY]: fontValue }, areaName) => {
				if (areaName === "sync") {
					if (themeValue && themes.has(themeValue.newValue)) {
						setTheme(themeValue.newValue)
					}
					if (fontValue && fonts.hasOwnProperty(fontValue.newValue)) {
						setFont(fontValue.newValue)
					}
				}
			}
		)

		// const value = json ? Value.fromJSON(json) : initialValue
		const value = initialValue
		ReactDOM.render(<Document id={id} initialValue={value} />, main)
	}
)
