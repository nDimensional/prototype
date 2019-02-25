import React from "react"
import { Editor } from "slate-react"
// import * as URI from "uri-js"
import { Map } from "immutable"
import { Decoration, Point, Mark } from "slate"

import parse from "./parser"
import { autoClose } from "./plugins"

const blockTypes = new Set([
	"p",
	"h1",
	"h2",
	"h3",
	"blockquote",
	"hr",
	"li",
	"img",
])
const blockContainerTypes = new Set(["ul", "ol"])

const headerTest = /^(#{1,4})(?: |$)/
const imageTest = /^!\[[^\[\]]*\]\(([^\[\]\(\) ]+)\)$/
const blockQuoteTest = /^>(?: |$)/
const dividerTest = /^-{3,}$/
const listElementTest = /^- /

export default class Prototype extends React.Component {
	static plugins = [
		autoClose,
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
			} else if (props.node.type === "img") {
				return (
					<figure>
						<figcaption>{props.children}</figcaption>
						<img src={props.node.data.get("src")} />
					</figure>
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
		if (props.mark.type === "math") {
			return <code {...props.attributes}>{props.children}</code>
		} else if (props.mark.type === "img") {
			const src = props.mark.data.get("src")
			return (
				<a href={src} {...props.attributes}>
					<span className="margin noselect">
						<img src={src} />
					</span>
					{props.children}
				</a>
			)
		} else if (props.mark.type === "a") {
			const href = props.mark.data.get("href")
			return (
				<React.Fragment>
					<a href={href} {...props.attributes}>
						{props.children}
					</a>
				</React.Fragment>
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
			if (node.type === "img") {
				console.log(node, node.data.get("src"), node.data.toJS())
				const { key, text } = node.nodes.get(0)
				const src = node.data.get("src")
				const anchor = Point.create({
					key,
					offset: text.length - 1 - src.length,
				})
				const focus = Point.create({ key, offset: text.length - 1 })
				const mark = Mark.create({ type: "a", data: Map({ href: src }) })
				const decoration = Decoration.create({ anchor, focus, mark })
				decorations.push(decoration)
			} else {
				const env = {}
				node
					.getTexts()
					.forEach(({ key, text }) => parse(key, text, decorations, env))
			}
			return decorations
		}
	}

	static normalizeNode(node, editor, next) {
		if (node.object === "block") {
			if (blockTypes.has(node.type)) {
				const { text } = node.getFirstText()
				const headerMatch = headerTest.exec(text)
				const imageMatch = imageTest.exec(text)
				if (headerMatch && headerMatch[1].length < 4) {
					const type = "h" + headerMatch[1].length.toString()
					if (node.type !== type) {
						return () => editor.setNodeByKey(node.key, type)
					}
				} else if (blockQuoteTest.test(text)) {
					if (node.type !== "blockquote") {
						return () => editor.setNodeByKey(node.key, "blockquote")
					}
				} else if (dividerTest.test(text)) {
					if (node.type !== "hr") {
						return () => editor.setNodeByKey(node.key, "hr")
					}
				} else if (listElementTest.test(text)) {
					if (node.type !== "li") {
						return () =>
							editor.setNodeByKey(node.key, "li").wrapBlockByKey(node.key, "ul")
					}
				} else if (imageMatch && imageMatch[1]) {
					if (node.type !== "img") {
						return () =>
							editor.setNodeByKey(node.key, {
								type: "img",
								data: { src: imageMatch[1] },
							})
					}
				} else if (node.type !== "p") {
					return () => editor.setNodeByKey(node.key, "p")
				}
			} else if (blockContainerTypes.has(node.type)) {
				if (node.type === "ul") {
					if (node.nodes.size === 0) {
						return () => editor.removeNodeByKey(node.key)
					}
					const split = node.nodes.find(node => node.type !== "li")
					if (split) {
						return () => editor.unwrapNodeByKey(split.key)
					}
					const nextSibling = editor.value.document.getNextSibling(node.key)
					const previousSibling = editor.value.document.getPreviousSibling(
						node.key
					)
					if (nextSibling && nextSibling.type === "ul") {
						return () => editor.mergeNodeByKey(nextSibling.key)
					}
					if (previousSibling && previousSibling.type === "ul") {
						return () => editor.mergeNodeByKey(node.key)
					}
				}
				// return next()
			}
		} else if (node.object === "text") {
		} else if (node.object === "inline") {
		}
		// return next()
	}

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
		// console.log("keydown", metaKey, keyCode)
		if (metaKey && keyCode === 83) {
			event.preventDefault()
			if (shiftKey) {
				// Do stuff
			}
		} else if (
			metaKey &&
			(keyCode === 224 || keyCode === 91 || keyCode === 93)
		) {
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

	handleChange(event) {
		this.props.onChange(event)
	}

	componentDidMount() {
		if (this.editor) {
			this.editor.moveToEndOfDocument()
		}
	}

	render() {
		return (
			<Editor
				autoFocus={true}
				ref={editor => (this.editor = editor)}
				value={this.props.value}
				plugins={Prototype.plugins}
				onChange={this.handleChange}
				onKeyDown={this.handleKeyDown}
				onKeyUp={this.handleKeyUp}
				renderNode={Prototype.renderNode}
				renderMark={Prototype.renderMark}
				onFocus={() => {}}
			/>
		)
	}
}
