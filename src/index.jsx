import React from "react"
import ReactDOM from "react-dom"
import ReactDOMServer from "react-dom/server"
import { Value, KeyUtils } from "slate"

import { Editor } from "slate-react"

import { onKeyDown, onBeforeInput } from "./events"
import renderBlock from "./renderBlock"
import renderDecoration from "./renderDecoration"

import normalizeNode from "./normalizeNode"
import decorateNode from "./decorateNode"

import Panel from "./panel"

function createGenerator() {
	let key = 0
	return function generator() {
		key++
		return key.toString()
	}
}

class Document extends React.Component {
	static snapshotInterval = 2000
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
		const { id, value, settings, spellCheck, width, theme, font, size } = props
		this.state = { value, settings, spellCheck, width, theme, font, size }
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
		const data = { [VALUE_KEY]: value.toJSON(), [ID_KEY]: this.props.id }
		await window.saveData(data)
		if (this.value !== null) this.save(this.value)
		else this.sync = true
	}

	saveSnapshot() {
		if (!window.hydrate) return
		const { id, generator } = this.props
		const { settings, spellCheck, width, theme, font, size } = this.state
		const snapshotGenerator = createGenerator()
		KeyUtils.setGenerator(snapshotGenerator)
		const value = Value.fromJSON(this.state.value.toJSON())
		const props = { id, value, settings, theme, font, size }
		const html = ReactDOMServer.renderToString(<Document {...props} />)
		localStorage.setItem(SNAPSHOT_KEY, html)
		localStorage.setItem(SPELLCHECK_KEY, spellCheck)
		localStorage.setItem(WIDTH_KEY, width)
		localStorage.setItem(THEME_KEY, theme)
		localStorage.setItem(FONT_KEY, font)
		localStorage.setItem(SIZE_KEY, size)
		KeyUtils.setGenerator(generator)
	}

	componentDidMount() {
		if (window.hydrate) {
			setInterval(() => {
				if (this.syncHtml) {
					this.syncHtml = false
					this.saveSnapshot()
				}
			}, Document.snapshotInterval)
		}

		window.addEventListener("beforeunload", () => this.saveSnapshot())
		window.addEventListener("keydown", event => {
			if (CTRL_TEST(event) && event.keyCode === 190) {
				const settings = !this.state.settings
				window.setProperty(SETTINGS_KEY, settings)
				this.setState({ settings })
			}
		})

		window.attachChangeListener(this.props.id, state => this.setState(state))
	}

	handleFontChange = font => {
		SET_FONT(font, false)
		this.setState({ font })
		window.setProperty(FONT_KEY, font)
	}

	handleSizeChange = size => {
		SET_SIZE(size, false)
		this.setState({ size })
		window.setProperty(SIZE_KEY, size)
	}

	handleThemeChange = theme => {
		SET_THEME(theme, false)
		this.setState({ theme })
		window.setProperty(THEME_KEY, theme)
	}

	handleWidthChange = width => {
		SET_WIDTH(width, false)
		this.setState({ width })
		window.setProperty(WIDTH_KEY, width)
	}

	handleSpellCheckChange = spellCheck => {
		this.setState({ spellCheck })
		window.setProperty(SPELLCHECK_KEY, spellCheck)
	}

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
		const { keyCode, shiftKey } = event
		// Intercept Cmd-S
		if (CTRL_TEST(event) && keyCode === 83) {
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
		const { spellCheck, width, theme, font, size } = this.state
		return (
			<Panel
				spellCheck={spellCheck}
				theme={theme}
				width={width}
				font={font}
				size={size}
				onSpellCheckChange={this.handleSpellCheckChange}
				onWidthChange={this.handleWidthChange}
				onThemeChange={this.handleThemeChange}
				onFontChange={this.handleFontChange}
				onSizeChange={this.handleSizeChange}
			/>
		)
	}

	render() {
		const { settings, value, spellCheck } = this.state
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
						spellCheck={spellCheck}
						autoFocus={true}
						value={value}
						plugins={Document.plugins}
						onChange={this.handleValueChange}
						renderBlock={renderBlock}
						renderDecoration={renderDecoration}
						onFocus={() => {}}
					/>
				</div>
				{settings && this.renderPanel()}
			</React.Fragment>
		)
	}
}

window.initialize.then(async props => {
	const generator = createGenerator()
	KeyUtils.setGenerator(generator)

	const value = Value.fromJSON(
		props.value
			? props.value
			: await fetch("value.json").then(res => res.json())
	)

	props = Object.assign(props, { generator, value })

	console.log("hydrate", window.hydrate)

	if (window.hydrate) {
		const main = document.querySelector("main")
		ReactDOM.hydrate(<Document {...props} />, main)
	} else {
		const main = document.createElement("main")
		document.body.appendChild(main)
		ReactDOM.render(<Document {...props} />, main)
	}
})
