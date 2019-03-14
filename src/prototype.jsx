import React from "react"
import { Editor } from "slate-react"

import { onKeyDown, onBeforeInput } from "./events"
import renderNode from "./renderNode"
import renderMark from "./renderMark"

import normalizeNode from "./normalizeNode"
import decorateNode from "./decorateNode"

export default class Prototype extends React.Component {
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
		this.state = { value: this.props.value }
		this.handleChange = this.handleChange.bind(this)
	}

	handleChange(event, editor, next) {
		this.props.onChange(event)
	}

	render() {
		return (
			<Editor
				autoFocus={true}
				value={this.props.value}
				plugins={Prototype.plugins}
				onChange={this.handleChange}
				renderNode={renderNode}
				renderMark={renderMark}
				onFocus={() => {}}
			/>
		)
	}
}
