import React from "react"
import { Editor } from "slate-react"

import { autoClose } from "./plugins"
import renderNode from "./renderNode"
import renderMark from "./renderMark"

import normalizeNode from "./normalizeNode"
import decorateNode from "./decorateNode"

export default class Prototype extends React.Component {
	static plugins = [
		{
			normalizeNode,
			decorateNode,
			...autoClose,
		},
	]

	constructor(props) {
		super(props)
		this.state = { value: this.props.value }
		this.handleKeyDown = this.handleKeyDown.bind(this)
		this.handleKeyUp = this.handleKeyUp.bind(this)
		this.handleChange = this.handleChange.bind(this)
	}

	handleKeyDown(event, editor, next) {
		const { metaKey, keyCode, shiftKey } = event
		// Intercept Cmd-S
		if (metaKey && keyCode === 83) {
			event.preventDefault()
			if (shiftKey) {
				// Do stuff
			}
		} else if (keyCode === 224 || keyCode === 91 || keyCode === 93) {
			document.body.classList.add("cmd")
		} else {
			return next()
		}
	}

	handleKeyUp(event, editor, next) {
		const { keyCode } = event
		if (keyCode === 224 || keyCode === 91 || keyCode === 93) {
			document.body.classList.remove("cmd")
		}
	}

	handleChange(event, editor, next) {
		this.props.onChange(event)
	}

	render() {
		return (
			<Editor
				autoFocus={false}
				ref={editor => (this.editor = editor)}
				value={this.props.value}
				plugins={Prototype.plugins}
				onChange={this.handleChange}
				onKeyDown={this.handleKeyDown}
				onKeyUp={this.handleKeyUp}
				renderNode={renderNode}
				renderMark={renderMark}
				onFocus={() => {}}
			/>
		)
	}
}
