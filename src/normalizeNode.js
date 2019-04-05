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

const blockContainerTypes = new Set(["ul"])

const headerTest = /^(#{1,4})(?: |$)/
const imageTest = /^!\[[^\[\]]*\]\(([^\[\]\(\) ]+)\)$/
const rawImageTest = /^!(https?:\/\/[^\[\]\(\) ]+)$/
const blockQuoteTest = /^>(?: |$)/
const dividerTest = /^-{3,}$/
const listElementTest = /^- /

export default function normalizeNode(node, editor, next) {
	if (node.object === "block") {
		if (blockTypes.has(node.type)) {
			const { text } = node.getFirstText()

			const headerMatch = headerTest.exec(text)
			if (headerMatch && headerMatch[1].length < 4) {
				const type = "h" + headerMatch[1].length.toString()
				if (node.type !== type) {
					return () => editor.setNodeByKey(node.key, { type, data: {} })
				}
				return
			}

			if (blockQuoteTest.test(text)) {
				if (node.type !== "blockquote") {
					return () =>
						editor.setNodeByKey(node.key, { type: "blockquote", data: {} })
				}
				return
			}

			if (dividerTest.test(text)) {
				if (node.type !== "hr") {
					return () => editor.setNodeByKey(node.key, { type: "hr", data: {} })
				}
				return
			}

			if (listElementTest.test(text)) {
				if (node.type !== "li") {
					return editor =>
						editor.setNodeByKey(node.key, { type: "li", data: {} })
				}
				return
			}

			const imageMatch = imageTest.exec(text)
			if (imageMatch && imageMatch[1]) {
				const data = { src: imageMatch[1], raw: false }
				if (node.type !== "img") {
					return () => editor.setNodeByKey(node.key, { type: "img", data })
				} else if (node.data.get("src") !== data.src || node.data.get("raw")) {
					return () => editor.setNodeByKey(node.key, { data })
				}
				return
			}

			const rawImageMatch = rawImageTest.exec(text)
			if (rawImageMatch && rawImageMatch[1]) {
				const data = { src: rawImageMatch[1], raw: true }
				if (node.type !== "img") {
					return () => editor.setNodeByKey(node.key, { type: "img", data })
				} else if (node.data.get("src") !== data.src || !node.data.get("raw")) {
					return () => editor.setNodeByKey(node.key, { data })
				}
				return
			}

			if (node.type !== "p") {
				return () => editor.setNodeByKey(node.key, { type: "p", data: {} })
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
			}
		}
	} else if (node.object === "text") {
	} else if (node.object === "inline") {
	} else if (node.object === "document") {
		let previous = false
		let previousNode = null
		for (let i = 0; i < node.nodes.size; i++) {
			const child = node.nodes.get(i)
			const next = child.type === "ul"
			if (previous && next) {
				return () => editor.mergeNodeByKey(child.key)
			} else if (child.type === "li") {
				if (previous) {
					return () =>
						editor.moveNodeByKey(
							child.key,
							previousNode.key,
							previousNode.nodes.size
						)
				} else {
					return () => editor.wrapBlockByKey(child.key, "ul")
				}
			}
			previous = next
			previousNode = child
		}
	}
}
