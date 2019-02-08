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
	sizes,
	inputSpacing,
	offsets,
	quoteSpacing,
	defaultSize,
	ctrlKey,
} from "./constants"
import Panel from "./panel"

document
	.querySelectorAll(".ctrl-key")
	.forEach(node => (node.textContent = ctrlKey))

const main = document.querySelector("main")

const initialText = [
	"# Welcome to Tad!",
	"Use this space for scratch notes, reminders, and whatever else you want to keep around.",
	"Tad uses a new markup language called Prototype that's designed to be \"rendered as source\", but you don't have to worry about that if you don't want to. Mostly it works like you'd expect.",
	`Press ${ctrlKey}-Period to open and close the settings panel, where you can set the font and color theme.`,
	"You can *bold text* by wrapping it with asterisks. This is *different from markdown*, where a single pair of asterisks only buys you italics. If you want italics, _use underscores!_ They're much simpler.",
	"You can also `format text` inline! Formatted text is always rendered with a fixed-width font.",
	"You can make a horizontal divider with a line of only dashes (at least three in a row).",
	"---",
	"------",
	"> Block quotes start with a single right chevron. You can't have multi-line quotes, but the text will wrap with nice indentation.",
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
		const { value, theme, font, size, settings } = props
		this.state = { value, theme, font, size, settings }
		this.sync = true
		this.handleValueChange = this.handleValueChange.bind(this)
		this.handleThemeChange = this.handleThemeChange.bind(this)
		this.handleFontChange = this.handleFontChange.bind(this)
		this.handleSizeChange = this.handleSizeChange.bind(this)
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
		window.browser.commands.onCommand.addListener(command => {
			if (command === "toggle-settings") {
				window.browser.storage.sync.set({
					[SETTINGS_KEY]: !this.state.settings,
				})
			}
		})

		window.browser.storage.onChanged.addListener(
			(
				{
					[VALUE_KEY]: storage,
					[ID_KEY]: tab,
					[THEME_KEY]: themeValue,
					[FONT_KEY]: fontValue,
					[SIZE_KEY]: sizeValue,
					[SETTINGS_KEY]: settingsValue,
				},
				area
			) => {
				if (area === "sync") {
					let { value, theme, font, size, settings } = this.state
					let update = false
					if (storage && tab && tab.newValue !== this.props.id) {
						// ignore local edits
						const newValue = Value.fromJSON(storage.newValue)
						// Only update if the _document_ is different
						if (!is(newValue.document, value.document)) {
							value = newValue
							update = true
						}
					}

					if (themeValue && themes.has(themeValue.newValue)) {
						setTheme(themeValue.newValue)
						theme = themeValue.newValue
						update = true
					}

					if (fontValue && fonts.hasOwnProperty(fontValue.newValue)) {
						setFont(fontValue.newValue)
						font = fontValue.newValue
						update = true
					}

					if (sizeValue && sizes.includes(sizeValue.newValue)) {
						setSize(sizeValue.newValue)
						size = sizeValue.newValue
						update = true
					}

					if (settingsValue) {
						if (settingsValue.newValue !== this.state.settings) {
							settings = settingsValue.newValue
							update = true
						}
					}

					if (update) this.setState({ value, theme, font, size, settings })
				}
			}
		)
	}

	handleValueChange({ value }) {
		if (value.document !== this.state.value.document) {
			if (this.sync) this.save(value)
			else this.value = value
		}
		this.setState({ value })
	}

	handleThemeChange(theme) {
		window.browser.storage.sync.set({ [THEME_KEY]: theme })
	}

	handleFontChange(font) {
		window.browser.storage.sync.set({ [FONT_KEY]: font })
	}

	handleSizeChange(size) {
		window.browser.storage.sync.set({ [SIZE_KEY]: size })
	}

	renderPanel() {
		const { theme, font, size } = this.state
		return (
			<div id="settings">
				<Panel
					theme={theme}
					font={font}
					size={size}
					onThemeChange={this.handleThemeChange}
					onFontChange={this.handleFontChange}
					onSizeChange={this.handleSizeChange}
				/>
			</div>
		)
	}

	render() {
		return (
			<React.Fragment>
				<div id="editor">
					<Prototype
						value={this.state.value}
						onChange={this.handleValueChange}
					/>
				</div>
				{this.state.settings && this.renderPanel()}
			</React.Fragment>
		)
	}
}

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
		currentFont = font
		// fontElements.forEach(element => (element.checked = element.id === font))
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
	}
}

let currentSize = defaultSize
function setSize(size) {
	if (sizes.includes(size) && size !== currentSize) {
		currentSize = size
		// sizeElements.forEach(element => (element.checked = element.id === size))
		document.documentElement.style.setProperty("--main-font-size", size)
	}
}

// Get tab id & data from browser storage
window.browser = window.browser || window.chrome
const storageKeys = [VALUE_KEY, THEME_KEY, FONT_KEY, SIZE_KEY, SETTINGS_KEY]
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
	([
		{ id },
		{
			[VALUE_KEY]: json,
			[THEME_KEY]: theme,
			[FONT_KEY]: font,
			[SIZE_KEY]: size,
			[SETTINGS_KEY]: settings,
		},
	]) => {
		if (themes.has(theme)) {
			setTheme(theme)
		} else {
			window.browser.storage.sync.set({ [THEME_KEY]: defaultTheme })
			theme = defaultTheme
		}

		if (fonts.hasOwnProperty(font)) {
			setFont(font)
		} else {
			window.browser.storage.sync.set({ [FONT_KEY]: defaultFont })
			font = defaultFont
		}

		if (sizes.includes(size)) {
			setSize(size)
		} else {
			window.browser.storage.sync.set({ [SIZE_KEY]: defaultSize })
			size = defaultSize
		}

		if (settings !== true && settings !== false) {
			settings = true
			window.browser.storage.sync.set({ [SETTINGS_KEY]: true })
		}

		// const value = json ? Value.fromJSON(json) : initialValue
		const value = initialValue
		ReactDOM.render(
			<Document
				id={id}
				settings={settings}
				theme={theme}
				font={font}
				size={size}
				value={value}
			/>,
			main
		)
	}
)
