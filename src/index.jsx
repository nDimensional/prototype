import React from "react"
import ReactDOM from "react-dom"
import { Value } from "slate"
import { is } from "immutable"

import Prototype from "./prototype"
import {
	defaultTheme,
	themes,
	defaultFont,
	fonts,
	sizes,
	defaultSize,
	ctrlKey,
	setTheme,
	setFont,
	setSize,
} from "./constants"
import Panel from "./panel"

window.browser = window.browser || window.chrome
const storageAreaName = "local"
const storageArea = window.browser.storage[storageAreaName]

document
	.querySelectorAll(".ctrl-key")
	.forEach(node => (node.textContent = ctrlKey))

const main = document.querySelector("main")

const initialText = [
	"# Welcome to Prototype!",
	"Use this space for scratch notes, links, reminders, and whatever else you want to keep around.",
	"You make text *bold* and _italic_. `Backticks` render in a fixed-width font, and $\\sum_0^n{math}$ renders in the margin.",
	"You can also do inline images: ![](https://upload.wikimedia.org/wikipedia/en/3/33/Study_of_Regular_Division_of_the_Plane_with_Reptiles.jpg)",
	"You can make a horizontal divider with a line of dashes:",
	"---",
	"> Block quotes start with a single right arrow.",
	"- And there are lists too!",
	"- We all love lists.",
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

const ID_KEY = "<--prototype-id-->"
const FONT_KEY = "<--prototype-font-->"
const SIZE_KEY = "<--prototype-size-->"
const THEME_KEY = "<--prototype-theme-->"
const VALUE_KEY = "<--prototype-value-->"
const SETTINGS_KEY = "<--prototype-settings-->"

class Document extends React.Component {
	constructor(props) {
		super(props)
		const { id, value, theme, font, size, settings } = props
		this.state = { value, theme, font, size, settings }
		this.sync = true
		this.tabId = id
		this.handleValueChange = this.handleValueChange.bind(this)
		this.handleFontChange = this.handleFontChange.bind(this)
		this.handleSizeChange = this.handleSizeChange.bind(this)
		this.handleKeyDown = this.handleKeyDown.bind(this)
		this.handleKeyUp = this.handleKeyUp.bind(this)
	}

	async save(value) {
		this.sync = false
		this.value = null
		const json = value.toJSON()
		const data = { [VALUE_KEY]: json, [ID_KEY]: this.props.id }
		await storageArea.set(data)
		if (this.value !== null) this.save(this.value)
		else this.sync = true
	}

	componentDidMount() {
		window.browser.commands.onCommand.addListener(command => {
			if (command === "toggle-settings") {
				storageArea.set({
					[SETTINGS_KEY]: !this.state.settings,
				})
			}
		})

		window.browser.storage.onChanged.addListener(
			(
				{
					[VALUE_KEY]: json,
					[ID_KEY]: tab,
					[THEME_KEY]: themeValue,
					[FONT_KEY]: fontValue,
					[SIZE_KEY]: sizeValue,
					[SETTINGS_KEY]: settingsValue,
				},
				area
			) => {
				if (area === storageAreaName) {
					let { value } = this.state
					const state = {}
					if (tab) this.tabId = tab.newValue
					if (json && this.tabId !== this.props.id) {
						// ignore local edits
						const newValue = Value.fromJSON(json.newValue)
						// Only update if the _document_ is different
						if (!is(newValue.document, value.document)) {
							state.value = newValue
						}
					}

					if (themeValue && themes.has(themeValue.newValue)) {
						setTheme(themeValue.newValue, false)
						state.theme = themeValue.newValue
					}

					if (fontValue && fonts.hasOwnProperty(fontValue.newValue)) {
						setFont(fontValue.newValue, false)
						state.font = fontValue.newValue
					}

					if (sizeValue && sizes.hasOwnProperty(sizeValue.newValue)) {
						setSize(sizeValue.newValue, false)
						state.size = sizeValue.newValue
					}

					if (settingsValue) {
						if (settingsValue.newValue !== this.state.settings) {
							state.settings = settingsValue.newValue
						}
					}

					if (Object.keys(state).length > 0) {
						this.setState(state)
					}
				}
			}
		)
	}

	handleFontChange = font => storageArea.set({ [FONT_KEY]: font })
	handleSizeChange = size => storageArea.set({ [SIZE_KEY]: size })
	handleThemeChange = theme => storageArea.set({ [THEME_KEY]: theme })
	handleValueChange(event) {
		const { value } = event
		if (value.document !== this.state.value.document) {
			if (this.sync) this.save(value)
			else this.value = value
		}
		this.setState({ value })
	}

	handleKeyDown(event) {
		const { metaKey, keyCode, shiftKey } = event
		// Intercept Cmd-S
		if (metaKey && keyCode === 83) {
			event.preventDefault()
			if (shiftKey) {
				// Do stuff
			}
		} else if (keyCode === 224 || keyCode === 91 || keyCode === 93) {
			document.body.classList.add("cmd")
		}
	}

	handleKeyUp(event) {
		const { keyCode } = event
		if (keyCode === 224 || keyCode === 91 || keyCode === 93) {
			document.body.classList.remove("cmd")
		}
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
				<div
					id="editor"
					onFocus={() => document.body.classList.remove("cmd")}
					onBlur={() => document.body.classList.add("cmd")}
					onKeyDown={this.handleKeyDown}
					onKeyUp={this.handleKeyUp}
				>
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

// Get tab id & data from browser storage
const storageKeys = [VALUE_KEY, THEME_KEY, FONT_KEY, SIZE_KEY, SETTINGS_KEY]
Promise.all(
	window.chrome
		? [
				new Promise(resolve => chrome.tabs.getCurrent(resolve)),
				new Promise(resolve =>
					chrome.storage[storageAreaName].get(storageKeys, resolve)
				),
		  ]
		: [window.browser.tabs.getCurrent(), storageArea.get(storageKeys)]
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
			setTheme(theme, false)
		} else {
			storageArea.set({ [THEME_KEY]: defaultTheme })
			theme = defaultTheme
		}

		if (fonts.hasOwnProperty(font)) {
			setFont(font, false)
		} else {
			storageArea.set({ [FONT_KEY]: defaultFont })
			font = defaultFont

			setFont(font, false)
		}

		if (sizes.hasOwnProperty(size)) {
			setSize(size, false)
		} else {
			storageArea.set({ [SIZE_KEY]: defaultSize })
			size = defaultSize
		}

		if (settings !== true && settings !== false) {
			settings = true
			storageArea.set({ [SETTINGS_KEY]: true })
		}

		const value = initialValue
		// const value = json ? Value.fromJSON(json) : initialValue

		const props = { id, settings, theme, font, size, value }
		ReactDOM.render(<Document {...props} />, main)
	}
)
