import { Map } from "immutable"
import * as MarkdownIt from "markdown-it"
import { Point, Decoration, Mark } from "slate"

const md = new MarkdownIt({ linkify: true })

md.inline.ruler.after("text", "styles", require("./styles"))
md.inline.ruler.enableOnly(["text", "link", "image", "autolink", "styles"])
md.inline.ruler2.enableOnly(["text_collapse"])

const inlines = new Set([
	"code_inline",
	"math_inline",
	"em_inline",
	"strong_inline",
])

window.md = md

const makeClass = className =>
	Mark.create({ type: "class", data: { className } })

function parse(key, text, decorations, environment) {
	const tokens = md.parseInline(text, environment)
	if (tokens.length > 0) {
		const [{ children }] = tokens
		const stack = []
		children.reduce((offset, token) => {
			const { tag, attrs, type, markup, content } = token
			if (type === "text") {
				return offset + content.length
			} else if (type === "image") {
				const [[_, src]] = attrs
				const start = offset + 2 + content.length + 2
				const end = start + src.length
				decorations.push(
					Decoration.create({
						anchor: Point.create({ key, offset }),
						focus: Point.create({ key, offset: offset + 2 }),
						mark: makeClass("open"),
					})
				)
				decorations.push(
					Decoration.create({
						anchor: Point.create({ key, offset: start - 2 }),
						focus: Point.create({ key, offset: start }),
						mark: makeClass("open"),
					})
				)
				decorations.push(
					Decoration.create({
						anchor: Point.create({ key, offset: start }),
						focus: Point.create({ key, offset: end }),
						mark: Mark.create({ type: "img", data: Map(attrs) }),
					})
				)
				decorations.push(
					Decoration.create({
						anchor: Point.create({ key, offset: end }),
						focus: Point.create({ key, offset: end + 1 }),
						mark: makeClass("close"),
					})
				)
				return end + 1
			} else if (inlines.has(type)) {
				const nextOffset = offset + 1 + content.length + 1
				const open = Point.create({ key, offset: offset + 1 })
				const close = Point.create({ key, offset: nextOffset - 1 })
				decorations.push(
					Decoration.create({
						anchor: Point.create({ key, offset: offset }),
						focus: open,
						mark: makeClass(`${tag} open`),
					})
				)
				decorations.push(
					Decoration.create({
						anchor: open,
						focus: close,
						mark: Mark.create({ type: tag }),
					})
				)
				decorations.push(
					Decoration.create({
						anchor: close,
						focus: Point.create({ key, offset: nextOffset }),
						mark: makeClass(`${tag} close`),
					})
				)
				return nextOffset
			} else if (type === "link_open") {
				stack.push({ markup, offset, type: "a", data: Map(attrs) })
				if (markup === "linkify") {
					return offset
				} else {
					return offset + 1
				}
			} else if (type === "link_close") {
				const token = stack.pop()
				if (markup === "linkify") {
					const anchor = Point.create({ key, offset: token.offset })
					const focus = Point.create({ key, offset })
					const mark = Mark.create({ type: token.type, data: token.data })
					decorations.push(Decoration.create({ anchor, focus, mark }))
					return offset
				}
				const nextOffset =
					markup === "linkify"
						? offset
						: offset + token.data.get("href").length + 3
				const anchor = Point.create({ key, offset: token.offset })
				const focus = Point.create({ key, offset: nextOffset })
				const mark = Mark.create({ type: token.type, data: token.data })
				decorations.push(Decoration.create({ anchor, focus, mark }))
				return nextOffset
			}
		}, 0)
		if (stack.length > 0) {
			console.error("Token stack not empty")
		}
	}
}

export default function decorateNode(node, editor, next) {
	if (node.object === "block") {
		const decorations = []
		if (node.type === "img") {
			const { key, text } = node.nodes.get(0)
			const src = node.data.get("src")
			decorations.push(
				Decoration.create({
					anchor: Point.create({ key, offset: 0 }),
					focus: Point.create({ key, offset: 2 }),
					mark: makeClass("open"),
				})
			)
			decorations.push(
				Decoration.create({
					anchor: Point.create({
						key,
						offset: text.length - 1 - src.length - 2,
					}),
					focus: Point.create({ key, offset: text.length - 1 - src.length }),
					mark: makeClass("open"),
				})
			)
			decorations.push(
				Decoration.create({
					anchor: Point.create({
						key,
						offset: text.length - 1 - src.length,
					}),
					focus: Point.create({ key, offset: text.length - 1 }),
					mark: Mark.create({ type: "a", data: Map({ href: src }) }),
				})
			)
			decorations.push(
				Decoration.create({
					anchor: Point.create({
						key,
						offset: text.length - 1,
					}),
					focus: Point.create({ key, offset: text.length }),
					mark: makeClass("close"),
				})
			)
		} else if (node.type === "math") {
			const { key, text } = node.nodes.get(0)
			const open = Point.create({ key, offset: 2 })
			const close = Point.create({ key, offset: text.length - 2 })
			decorations.push(
				Decoration.create({
					anchor: Point.create({ key, offset: 0 }),
					focus: open,
					mark: makeClass("math open"),
				})
			)
			decorations.push(
				Decoration.create({
					anchor: open,
					focus: close,
					mark: makeClass("math"),
				})
			)
			decorations.push(
				Decoration.create({
					anchor: close,
					focus: Point.create({ key, offset: text.length }),
					mark: makeClass("math close"),
				})
			)
			// } else if (node.type === "table") {
			// } else if (node.type === "tr") {
			// 	let offset = 0
			// 	const { key, text } = node.nodes.get(0)
			// 	text.split("\t").reduce((anchor, cell, index, { length }) => {
			// 		offset += cell.length
			// 		const focus = Point.create({ key, offset })
			// 		decorations.push(
			// 			Decoration.create({ anchor, focus, mark: makeClass("cell") })
			// 		)
			// 		if (index < length - 1) {
			// 			offset += 1
			// 			const next = Point.create({ key, offset })
			// 			decorations.push(
			// 				Decoration.create({
			// 					anchor: focus,
			// 					focus: next,
			// 					mark: makeClass("tab"),
			// 				})
			// 			)
			// 			return next
			// 		}
			// 	}, Point.create({ key, offset: 0 }))
			// 	return decorations
		} else {
			const env = {}
			node
				.getTexts()
				.forEach(({ key, text }) => parse(key, text, decorations, env))
		}

		return decorations
	}
}
