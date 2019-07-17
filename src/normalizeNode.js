import { Map, is } from "immutable"

const containerItemMap = {
	ul: "li",
	cl: "ci",
	dl: "di",
}

const blockContainers = Object.keys(containerItemMap)
const blockItems = Object.values(containerItemMap)

const itemContainerMap = Object.fromEntries(
	Object.entries(containerItemMap).map(Array.reverse)
)

export const blockItemSet = new Set(blockItems)
export const blockContainerSet = new Set(blockContainers)

const blockTypes = [
	"p",
	"h1",
	"h2",
	"h3",
	"hr",
	"img",
	"blockquote",
	...blockItems,
]

const blockTypeSet = new Set(blockTypes)

const headerTest = /^(#{1,4})(?: |$)/
const imageTest = /^!\[[^\[\]]*\]\(([^\[\]\(\) ]+)\)$/
const rawImageTest = /^!(https?:\/\/[^\[\]\(\) ]+)$/
const blockQuoteTest = /^(<|>)(?: |$)/
const dividerTest = /^-{3,}$/
export const listTest = /^(\t*)- /
export const checkTest = /^(\t*)\[( |x)\] /
export const definitionTest = /^\[([a-zA-Z0-9-_ ]+)\]:(?: |$)/

export const containerTests = {
	ul: listTest,
	cl: checkTest,
	dl: definitionTest,
}

export const getDocumentData = document =>
	document.nodes.reduce(
		(data, node) =>
			node.type === "dl"
				? node.nodes.reduce((data, item) => {
						const term = item.data.get("term")
						const value = item.data.get("value")
						if (term && value) {
							return data.set(term, value)
						} else {
							return data
						}
				  }, data)
				: data,
		Map()
	)

export default function normalizeNode(node, editor, next) {
	window.editor = editor
	if (node.object === "block") {
		const { type, key } = node
		if (blockTypeSet.has(type)) {
			const { text } = node.getFirstText()
			const headerMatch = headerTest.exec(text)
			if (headerMatch && headerMatch[1].length < 4) {
				const headerType = "h" + headerMatch[1].length.toString()
				if (type !== headerType) {
					return () => editor.setNodeByKey(key, { type: headerType, data: {} })
				} else {
					return
				}
			}

			if (dividerTest.test(text)) {
				if (type !== "hr") {
					return () => editor.setNodeByKey(key, { type: "hr", data: {} })
				} else {
					return
				}
			}

			const quoteMatch = blockQuoteTest.exec(text)
			if (quoteMatch) {
				const align = quoteMatch[1] === "<"
				if (type !== "blockquote" || node.data.get("align") !== align) {
					return () =>
						editor.setNodeByKey(key, {
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
				if (type !== "li" || node.data.get("depth") !== depth) {
					return () => editor.setNodeByKey(key, { type: "li", data: { depth } })
				} else {
					return
				}
			}

			const checkMatch = checkTest.exec(text)
			if (checkMatch) {
				const depth = checkMatch[1].length
				const checked = checkMatch[2] === "x"
				if (
					type !== "ci" ||
					node.data.get("depth") !== depth ||
					node.data.get("checked") !== checked
				) {
					const data = { depth, checked }
					return () => editor.setNodeByKey(key, { type: "ci", data })
				} else {
					return
				}
			}

			const imageMatch = imageTest.exec(text)
			if (imageMatch && imageMatch[1]) {
				const src = imageMatch[1]
				if (
					type !== "img" ||
					node.data.get("src") !== src ||
					node.data.get("raw")
				) {
					const data = { src, raw: false }
					return () => editor.setNodeByKey(key, { type: "img", data })
				} else {
					return
				}
			}

			const rawImageMatch = rawImageTest.exec(text)
			if (rawImageMatch && rawImageMatch[1]) {
				const src = rawImageMatch[1]
				if (
					type !== "img" ||
					node.data.get("src") !== src ||
					!node.data.get("raw")
				) {
					const data = { src, raw: true }
					return () => editor.setNodeByKey(key, { type: "img", data })
				} else {
					return
				}
			}

			const definitionMatch = definitionTest.exec(text)
			if (definitionMatch) {
				const [_, term] = definitionMatch
				const value = text.slice(1 + term.length + 3)
				if (
					type !== "di" ||
					node.data.get("term") !== term ||
					node.data.get("value") !== value
				) {
					const data = { term, value }
					return () =>
						editor.withoutNormalizing(() =>
							editor
								.setNodeByKey(key, { type: "di", data })
								.setNodeByKey(editor.value.document.key, {
									data: getDocumentData(editor.value.document),
								})
						)
				} else {
					return
				}
			}

			if (node.type !== "p") {
				return () => editor.setNodeByKey(node.key, { type: "p", data: {} })
			}
		} else if (blockContainerSet.has(node.type)) {
			if (node.nodes.size === 0) {
				return () => editor.removeNodeByKey(node.key)
			}

			const itemType = containerItemMap[node.type]
			for (const child of node.nodes) {
				if (child.type !== itemType) {
					return () => editor.unwrapNodeByKey(child.key)
				}
			}
		}
	} else if (node.object === "text") {
	} else if (node.object === "inline") {
	} else if (node.object === "document") {
		let previous = null
		let previousType = null
		for (const child of node.nodes) {
			const { key, type } = child

			if (previousType !== null && blockContainerSet.has(previousType)) {
				if (type === previousType) {
					return () => editor.mergeNodeByKey(key)
				} else if (type === containerItemMap[previousType]) {
					return () =>
						editor.moveNodeByKey(key, previous.key, previous.nodes.size)
				}
			}

			if (blockItemSet.has(type)) {
				return () => editor.wrapBlockByKey(key, itemContainerMap[type])
			}

			previous = child
			previousType = type
		}
	}
}
