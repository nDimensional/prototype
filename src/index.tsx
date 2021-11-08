import React, { useCallback, useState } from "react"

import { Editable } from "slate-react"

import { onKeyDown, onBeforeInput } from "./events"
import renderBlock from "./renderBlock"
import renderDecoration from "./renderDecoration"

import normalizeNode from "./normalizeNode"
import decorateNode from "./decorateNode"

// import Panel from "../panel"

const snapshotInterval = 2000
const plugins = [
	{
		normalizeNode,
		decorateNode,
		onKeyDown,
		onBeforeInput,
	},
]

type DocumentValue = {}

export interface DocumentProps {
	value: DocumentValue
	width: "" | "" | ""
	theme: "" | "" | ""
	font: "" | "" | ""
	size: "" | "" | ""
	onValueChange: (value: DocumentValue) => void
}

export function Document(props: DocumentProps) {
	const [sync, setSync] = useState(true)

	const handleValueChange = useCallback(() => {}, [])
	const handleKeyDown = useCallback(() => {}, [])
	const handleKeyUp = useCallback(() => {}, [])
}

class Document extends React.Component {
	constructor(props) {
		super(props)
		const { id, value, settings, width, theme, font, size } = props
		this.state = { value, settings, width, theme, font, size }
		this.sync = true
		this.tabId = id

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

	componentDidMount() {
		window.addEventListener("keydown", (event) => {
			if (CTRL_TEST(event) && event.keyCode === 190) {
				const settings = !this.state.settings
				window.setProperty(SETTINGS_KEY, settings)
				this.setState({ settings })
			}
		})

		window.attachChangeListener(this.props.id, (state) => this.setState(state))
	}

	handleFontChange = (font) => {
		SET_FONT(font, false)
		this.setState({ font })
		window.setProperty(FONT_KEY, font)
	}

	handleSizeChange = (size) => {
		SET_SIZE(size, false)
		this.setState({ size })
		window.setProperty(SIZE_KEY, size)
	}

	handleThemeChange = (theme) => {
		SET_THEME(theme, false)
		this.setState({ theme })
		window.setProperty(THEME_KEY, theme)
	}

	handleWidthChange = (width) => {
		SET_WIDTH(width, false)
		this.setState({ width })
		window.setProperty(WIDTH_KEY, width)
	}

	handleValueChange(event, editor, next) {
		const { value } = event
		if (value.document !== this.state.value.document) {
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

	render() {
		const { settings, value } = this.state
		return (
			<div
				id="editor"
				onFocus={() => document.body.classList.remove("cmd")}
				onBlur={() => document.body.classList.add("cmd")}
				onKeyDown={this.handleKeyDown}
				onKeyUp={this.handleKeyUp}
			>
				<Editable
					autoFocus={true}
					value={value}
					plugins={Document.plugins}
					onChange={this.handleValueChange}
					renderBlock={renderBlock}
					renderDecoration={renderDecoration}
					onFocus={() => {}}
				/>
			</div>
		)
	}
}
