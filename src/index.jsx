import React from "react"
import ReactDOM from "react-dom"
import ReactDOMServer from "react-dom/server"
import { Value, KeyUtils } from "slate"
import { is } from "immutable"

import { Editor } from "slate-react"

import { onKeyDown, onBeforeInput } from "./events"
import renderNode from "./renderNode"
import renderMark from "./renderMark"

import normalizeNode from "./normalizeNode"
import decorateNode from "./decorateNode"

import Panel from "./panel"

window.browser = window.browser || window.chrome
const storageAreaName = "local"
const storageArea = window.browser.storage[storageAreaName]

function createGenerator() {
	let key = 0
	return function generator() {
		key++
		return key.toString()
	}
}

class Document extends React.Component {
	static setStyle(key, value) {
		storageArea.set({ [key]: value })
		localStorage.setItem(key, value)
	}

	static plugins = [
		{
			normalizeNode,
			decorateNode,
			onKeyDown,
			onBeforeInput,
		},
	]

	constructor(props) {
		super(props)
		const { id, value, settings, theme, font, size } = props
		this.state = { value, settings, theme, font, size }
		this.sync = true
		this.tabId = id
		this.syncHtml = false

		this.handleValueChange = this.handleValueChange.bind(this)
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

	saveSnapshot() {
		const { id, generator } = this.props
		const { settings, theme, font, size } = this.state
		const snapshotGenerator = createGenerator()
		KeyUtils.setGenerator(snapshotGenerator)
		const value = Value.fromJSON(this.state.value.toJSON())
		const props = { id, value, settings, theme, font, size }
		const html = ReactDOMServer.renderToString(<Document {...props} />)
		localStorage.setItem(SNAPSHOT_KEY, html)
		localStorage.setItem(THEME_KEY, theme)
		localStorage.setItem(FONT_KEY, font)
		localStorage.setItem(SIZE_KEY, size)
		KeyUtils.setGenerator(generator)
	}

	componentDidMount() {
		setInterval(() => {
			if (this.syncHtml) {
				this.syncHtml = false
				this.saveSnapshot()
			}
		}, 2000)

		window.addEventListener("beforeunload", () => this.saveSnapshot())

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

					if (themeValue && THEMES.has(themeValue.newValue)) {
						SET_THEME(themeValue.newValue, false)
						state.theme = themeValue.newValue
					}

					if (fontValue && FONTS.hasOwnProperty(fontValue.newValue)) {
						SET_FONT(fontValue.newValue, false)
						state.font = fontValue.newValue
					}

					if (sizeValue && SIZES.hasOwnProperty(sizeValue.newValue)) {
						SET_SIZE(sizeValue.newValue, false)
						state.size = sizeValue.newValue
					}

					if (settingsValue) {
						if (settingsValue.newValue !== this.state.settings) {
							this.syncHtml = true
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

	handleFontChange = font => Document.setStyle(FONT_KEY, font)

	handleSizeChange = size => Document.setStyle(SIZE_KEY, size)

	handleThemeChange = theme => Document.setStyle(THEME_KEY, theme)

	handleValueChange(event, editor, next) {
		const { value } = event
		if (value.document !== this.state.value.document) {
			this.syncHtml = true
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
			this.handleSave(shiftKey)
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

	handleSave(shiftKey) {
		this.saveSnapshot()
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
					<Editor
						autoFocus={true}
						value={this.state.value}
						plugins={Document.plugins}
						onChange={this.handleValueChange}
						renderNode={renderNode}
						renderMark={renderMark}
						onFocus={() => {}}
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
	async ([
		{ id },
		{
			[VALUE_KEY]: json,
			[THEME_KEY]: theme,
			[FONT_KEY]: font,
			[SIZE_KEY]: size,
			[SETTINGS_KEY]: settings,
		},
	]) => {
		if (!THEMES.has(theme)) {
			storageArea.set({ [THEME_KEY]: DEFAULT_THEME })
			theme = DEFAULT_THEME
		}

		if (!FONTS.hasOwnProperty(font)) {
			storageArea.set({ [FONT_KEY]: DEFAULT_FONT })
			font = DEFAULT_FONT
		}

		if (!SIZES.hasOwnProperty(size)) {
			storageArea.set({ [SIZE_KEY]: DEFAULT_SIZE })
			size = DEFAULT_SIZE
		}

		if (settings !== true && settings !== false) {
			settings = true
			storageArea.set({ [SETTINGS_KEY]: true })
		}

		const generator = createGenerator()
		KeyUtils.setGenerator(generator)
		const value = Value.fromJSON(
			json ? json : await fetch("initialValue.json").then(res => res.json())
		)

		const props = { id, generator, settings, theme, font, size, value }
		if (window.hydrated) {
			const main = document.querySelector("main")
			ReactDOM.hydrate(<Document {...props} />, main)
		} else {
			const main = document.createElement("main")
			document.body.appendChild(main)
			ReactDOM.render(<Document {...props} />, main)
		}
	}
)
