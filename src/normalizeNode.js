export const blockTypes = new Set([
	"p",
	"h1",
	"h2",
	"h3",
	"blockquote",
	"hr",
	"li",
	"ci",
	"img",
])

export const blockContainerTypes = new Set(["ul", "cl"])

export const blockItemTypes = {
	ul: "li",
	cl: "ci",
}

const headerTest = /^(#{1,4})(?: |$)/
const imageTest = /^!\[[^\[\]]*\]\(([^\[\]\(\) ]+)\)$/
const rawImageTest = /^!(https?:\/\/[^\[\]\(\) ]+)$/
const blockQuoteTest = /^(<|>)(?: |$)/
const dividerTest = /^-{3,}$/
export const listTest = /^(\t*)- /
export const checkTest = /^(\t*)\[( |x)\] /

export default function normalizeNode(node, editor, next) {
	if (node.object === "block") {
		if (blockTypes.has(node.type)) {
			const { text } = node.getFirstText()
			const headerMatch = headerTest.exec(text)
			if (headerMatch && headerMatch[1].length < 4) {
				const type = "h" + headerMatch[1].length.toString()
				if (node.type !== type) {
					return () => editor.setNodeByKey(node.key, { type, data: {} })
				} else {
					return
				}
			}

			if (dividerTest.test(text)) {
				if (node.type !== "hr") {
					return () => editor.setNodeByKey(node.key, { type: "hr", data: {} })
				} else {
					return
				}
			}

			const quoteMatch = blockQuoteTest.exec(text)
			if (quoteMatch) {
				const align = quoteMatch[1] === "<"
				if (node.type !== "blockquote" || node.data.get("align") !== align) {
					return () =>
						editor.setNodeByKey(node.key, {
							type: "blockquote",
							data: { align },
						})
				} else {
					return
				}
			}

			const listMatch = listTest.exec(text)
			if (listMatch) {
				const depth = listMatch[1].length
				if (node.type !== "li" || node.data.get("depth") !== depth) {
					return () =>
						editor.setNodeByKey(node.key, { type: "li", data: { depth } })
				} else {
					return
				}
			}

			const checkMatch = checkTest.exec(text)
			if (checkMatch) {
				const depth = checkMatch[1].length
				const checked = checkMatch[2] === "x"
				if (
					node.type !== "ci" ||
					node.data.get("depth") !== depth ||
					node.data.get("checked") !== checked
				) {
					return () =>
						editor.setNodeByKey(node.key, {
							type: "ci",
							data: { depth, checked },
						})
				} else {
					return
				}
			}

			const imageMatch = imageTest.exec(text)
			if (imageMatch && imageMatch[1]) {
				const src = imageMatch[1]
				if (
					node.type !== "img" ||
					node.data.get("src") !== src ||
					node.data.get("raw")
				) {
					return () =>
						editor.setNodeByKey(node.key, {
							type: "img",
							data: { src, raw: false },
						})
				} else {
					return
				}
			}

			const rawImageMatch = rawImageTest.exec(text)
			if (rawImageMatch && rawImageMatch[1]) {
				const src = rawImageMatch[1]
				if (
					node.type !== "img" ||
					node.data.get("src") !== src ||
					!node.data.get("raw")
				) {
					return () =>
						editor.setNodeByKey(node.key, {
							type: "img",
							data: { src, raw: true },
						})
				} else {
					return
				}
			}

			if (node.type !== "p") {
				return () => editor.setNodeByKey(node.key, { type: "p", data: {} })
			}
		} else if (blockContainerTypes.has(node.type)) {
			if (node.nodes.size === 0) {
				return () => editor.removeNodeByKey(node.key)
			}

			const itemType = blockItemTypes[node.type]
			const split = node.nodes.find(node => node.type !== itemType)
			if (split) {
				return () => editor.unwrapNodeByKey(split.key)
			}
		}
	} else if (node.object === "text") {
	} else if (node.object === "inline") {
	} else if (node.object === "document") {
		let previous = null
		let [pl, pc] = [false, false]
		for (let i = 0; i < node.nodes.size; i++) {
			const child = node.nodes.get(i)
			const [nl, nc] = [child.type === "ul", child.type === "cl"]
			if ((pl && nl) || (pc && nc)) {
				return () => editor.mergeNodeByKey(child.key)
			} else if (child.type === "li") {
				if (pl) {
					return () =>
						editor.moveNodeByKey(child.key, previous.key, previous.nodes.size)
				} else {
					return () => editor.wrapBlockByKey(child.key, "ul")
				}
			} else if (child.type === "ci") {
				if (pc) {
					return () =>
						editor.moveNodeByKey(child.key, previous.key, previous.nodes.size)
				} else {
					return () => editor.wrapBlockByKey(child.key, "cl")
				}
			}

			pl = nl
			pc = nc
			previous = child
		}
	}
}
