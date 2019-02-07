import React from "react"
import { Editor } from "slate-react"

import parse from "./parser"

const blockTypes = new Set(["p", "h1", "h2", "h3", "blockquote", "hr"])
const blockItemTypes = new Set(["li"])
const blockContainerTypes = new Set(["ul", "ol"])

const headerTest = /^(#{1,4})(?: |$)/
const blockQuoteTest = /^>(?: |$)/
const dividerTest = /^-{3,}$/
const listElementTest = /^- /

export default class Prototype extends React.Component {
	constructor(props) {
		super(props)
		this.state = { value: this.props.value }
		this.handleKeyDown = this.handleKeyDown.bind(this)
		this.handleKeyUp = this.handleKeyUp.bind(this)
	}

	handleKeyDown(event, editor, next) {
		const { metaKey, keyCode, shiftKey } = event
		// Intercept Cmd-S
		if (metaKey && keyCode === 83) {
			event.preventDefault()
			if (shiftKey) {
				// Do stuff
			}
		} else if (keyCode === 224) {
			document.body.classList.add("cmd")
		} else {
			return next()
		}
	}

	handleKeyUp(event, editor, next) {
		const { keyCode } = event
		if (keyCode === 224) {
			document.body.classList.remove("cmd")
		}
	}

	componentDidMount() {
		// if (this.editor) {
		// 	this.editor.moveToEndOfDocument()
		// }
	}

	render() {
		return (
			<Editor
				ref={editor => (this.editor = editor)}
				value={this.props.value}
				plugins={Prototype.plugins}
				onChange={this.props.onChange}
				onKeyDown={this.handleKeyDown}
				onKeyUp={this.handleKeyUp}
				renderNode={Prototype.renderNode}
				renderMark={Prototype.renderMark}
			/>
		)
	}

	static plugins = [
		{
			normalizeNode: Prototype.normalizeNode,
			decorateNode: Prototype.decorateNode,
		},
	]

	static renderNode(props, editor, next) {
		if (props.node.object === "block") {
			if (props.node.type === "hr") {
				return (
					<div className="divider" {...props.attributes}>
						{props.children}
					</div>
				)
			} else {
				return React.createElement(
					props.node.type,
					props.attributes,
					props.children
				)
			}
		} else {
			return next()
		}
	}

	static renderMark(props, editor, next) {
		if (props.mark.type === "a") {
			const href = props.mark.data.get("href")
			return (
				<a href={href} {...props.attributes}>
					{props.children}
				</a>
			)
		} else {
			return React.createElement(
				props.mark.type,
				props.attributes,
				props.children
			)
		}
	}

	static decorateNode(node, editor, next) {
		if (node.object === "block") {
			const decorations = []
			node.getTexts().forEach(({ key, text }) => parse(key, text, decorations))
			return decorations
		}
	}

	static normalizeNode(node, editor, next) {
		if (node.object === "block") {
			if (blockTypes.has(node.type)) {
				const { text } = node.getFirstText()
				const headerMatch = headerTest.exec(text)
				if (headerMatch && headerMatch[1].length < 4) {
					const type = "h" + headerMatch[1].length.toString()
					if (node.type !== type) {
						return () => editor.setNodeByKey(node.key, { type })
					}
				} else if (blockQuoteTest.test(text)) {
					if (node.type !== "blockquote") {
						return () => editor.setNodeByKey(node.key, { type: "blockquote" })
					}
				} else if (dividerTest.test(text)) {
					if (node.type !== "hr") {
						return () => editor.setNodeByKey(node.key, { type: "hr" })
					}
					// } else if (listElementTest.test(text)) {
					// 	if (node.type !== "li") {
					// 		return () => editor.setNodeByKey(node.key, { type: "li" })
					// 	}
				} else if (node.type !== "p") {
					return () => editor.setNodeByKey(node.key, { type: "p" })
				}
			} else if (blockItemTypes.has(node.type)) {
				return next()
			} else if (blockContainerTypes.has(node.type)) {
				console.log(node.type, node.nodes.size)
				return next()
			}
		} else if (node.object === "text") {
		} else if (node.object === "inline") {
		}
		return next()
	}
}
