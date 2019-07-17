import { Map } from "immutable"
import * as MarkdownIt from "markdown-it"
import { Point, Decoration, Mark } from "slate"

import styles, { tags } from "./parser"
import { blockContainerSet } from "./normalizeNode"

const md = new MarkdownIt({ linkify: true })
window.md = md

md.inline.ruler.after("image", "styles", styles)

md.inline.ruler.enableOnly(["text", "link", "image", "styles"])
md.inline.ruler2.enableOnly(["text_collapse"])

const inlines = new Set(Object.values(tags).map(([_, inline]) => inline))

export const makeClass = className =>
	Mark.create({ type: "class", data: { className } })

function decorate({ key, index, offset }, start, end, type, data) {
	const anchor = Point.create({ key, path: [index], offset: start + offset })
	const focus = Point.create({ key, path: [index], offset: end + offset })
	return Decoration.create({ type, data, anchor, focus })
}

function parse(key, offset, index, text, decorations, environment) {
	const tokens = md.parseInline(offset ? text.slice(offset) : text, environment)
	const env = { key, index, offset }
	if (tokens.length > 0) {
		const [{ children }] = tokens
		let [linkOffset, linkData] = [null, null]
		children.reduce((offset, token) => {
			const { tag, attrs, type, markup, content } = token
			if (type === "text") {
				return offset + content.length
			} else if (type === "image") {
				const [[_, src]] = attrs
				const start = offset + 2 + content.length
				const end = start + 2 + src.length
				decorations.push(
					decorate(env, offset, end + 1, "token"),
					decorate(env, offset + 2, start, "term"),
					decorate(env, start + 2, end, "image", Map(attrs))
				)
				return end + 1
			} else if (inlines.has(type)) {
				const start = offset + 1
				const end = start + content.length
				if (type === "code_inline") {
					decorations.push(
						decorate(env, offset, start, "open"),
						decorate(env, start, end, tag),
						decorate(env, end, end + 1, "close")
					)
				} else if (type === "ref_inline") {
					decorations.push(
						decorate(env, offset, end + 1, "token"),
						decorate(env, start, end, tag, { term: content })
					)
				} else {
					decorations.push(
						decorate(env, offset, start, "token"),
						decorate(env, start, end, tag),
						decorate(env, end, end + 1, "token")
					)
				}

				return end + 1
			} else if (type === "link_open") {
				linkOffset = offset
				linkData = Map(attrs)
				if (markup === "linkify") {
					return offset
				} else {
					return offset + 1
				}
			} else if (type === "link_close") {
				if (markup === "linkify") {
					if (
						linkOffset > 0 &&
						text[linkOffset - 1] === "!" &&
						(linkOffset === 1 || text[linkOffset - 2] === " ")
					) {
						const data = { src: linkData.get("href"), raw: true }
						decorations.push(
							decorate(env, linkOffset - 1, offset, "token"),
							decorate(env, linkOffset, offset, "image", data)
						)
					} else {
						decorations.push(
							decorate(env, linkOffset, offset, "link", linkData)
						)
					}
					return offset
				} else {
					const { length } = linkData.get("href")
					const end = offset + 2 + length

					decorations.push(
						decorate(env, linkOffset, linkOffset + 1, "open"),
						decorate(env, offset, offset + 2, "open"),
						decorate(env, offset + 2, end, "link", linkData),
						decorate(env, end, end + 1, "close")
					)

					return end + 1
				}
			}
		}, 0)
	}
}

export default function decorateNode(node, editor, next) {
	if (node.object === "block") {
		const decorations = []
		let startOffset = 0
		const { key, text } = node.nodes.get(0)
		const env = { key, index: 0, offset: 0 }
		if (blockContainerSet.has(node.type)) {
			return decorations
		} else if (node.type === "blockquote") {
			decorations.push(decorate(env, 0, 1, "token"))
			startOffset = 2
		} else if (node.type === "li") {
			const offset = text.indexOf("-")
			decorations.push(decorate(env, offset, offset + 1, "token"))
			startOffset = offset + 2
		} else if (node.type === "ci") {
			const offset = text.indexOf("[")
			decorations.push(decorate(env, offset, offset + 3, "token"))
			const name = text[offset + 1] === " " ? "uncheck" : "check"
			decorations.push(decorate(env, offset + 1, offset + 2, name))
			startOffset = offset + 4
		} else if (node.type === "di") {
			const start = 1 + node.data.get("term").length
			decorations.push(decorate(env, 0, 1, "token"))
			decorations.push(decorate(env, start, start + 2, "token"))
			startOffset = start + 3
		} else if (node.type === "img") {
			const src = node.data.get("src")
			const raw = node.data.get("raw")
			const data = Map({ href: src })
			if (raw) {
				decorations.push(
					decorate(env, 0, 1, "token"),
					decorate(env, 1, text.length, "link", data)
				)
			} else {
				const end = text.length - 1
				const start = end - src.length
				decorations.push(
					decorate(env, 0, 2, "token"),
					decorate(env, start - 2, start, "token"),
					decorate(env, start, end, "link", data),
					decorate(env, end, text.length, "token")
				)
			}
			return decorations
		}

		parse(key, startOffset, 0, text, decorations, {})

		// const env = {}
		// node
		// 	.getTexts()
		// 	.forEach(({ key, text }, index) =>
		// 		parse(key, index || startOffset, index, text, decorations, env)
		// 	)

		return decorations
	}
}
