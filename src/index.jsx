import React from "react"
import ReactDOM from "react-dom"

import { Editor } from "slate-react"
import { Value } from "slate"

const nodeTypes = new Set(["p"])

const value = Value.fromJSON({
	document: {
		nodes: [
			{
				object: "block",
				type: "p",
				nodes: [
					{
						object: "text",
						leaves: [
							{
								text: "A line of text in a paragraph.",
							},
						],
					},
				],
			},
		],
	},
})

class App extends React.Component {
	state = { value }
	onChange = ({ value }) => {
		this.setState({ value })
	}
	render() {
		return (
			<Editor
				autoFocus={true}
				value={this.state.value}
				onChange={this.onChange}
				renderNode={this.renderNode}
			/>
		)
	}
	renderNode = (props, editor, next) => {
		if (nodeTypes.has(props.node.type)) {
			return React.createElement("p", props)
		} else {
			return next()
		}
	}
}

const main = document.querySelector("main")
// main.addEventListener("input", ({ target }) => {})
// main.setAttribute("contenteditable", "true")
ReactDOM.render(<App />, main)
