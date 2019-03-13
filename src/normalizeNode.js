const blockTypes = new Set([
	"p",
	"h1",
	"h2",
	"h3",
	"blockquote",
	"hr",
	"li",
	"img",
	"math",
])

const blockContainerTypes = new Set(["ul", "ol"])

const headerTest = /^(#{1,4})(?: |$)/
const imageTest = /^!\[[^\[\]]*\]\(([^\[\]\(\) ]+)\)$/
const latexTest = /^\$\$(.+)\$\$$/
const blockQuoteTest = /^>(?: |$)/
const dividerTest = /^-{3,}$/
const listElementTest = /^- /

export default function normalizeNode(node, editor, next) {
	if (node.object === "block") {
		if (blockTypes.has(node.type)) {
			const { text } = node.getFirstText()
			const headerMatch = headerTest.exec(text)
			const imageMatch = imageTest.exec(text)
			const latexMatch = latexTest.exec(text)
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
				} else if (editor.value.document.getDepth(node.key) === 1) {
					return () => editor.wrapBlockByKey(node.key, "ul")
				}
			} else if (imageMatch && imageMatch[1]) {
				const data = { src: imageMatch[1] }
				if (node.type !== "img") {
					return () => editor.setNodeByKey(node.key, { type: "img", data })
				} else if (node.data.get("src") !== data.src) {
					return () => editor.setNodeByKey(node.key, { data })
				}
			} else if (latexMatch && latexMatch[1]) {
				const data = { src: latexMatch[1] }
				if (node.type !== "math") {
					return () => editor.setNodeByKey(node.key, { type: "math", data })
				} else if (node.data.get("src") !== data.src) {
					return () => editor.setNodeByKey(node.key, { data })
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
			}
		}
	} else if (node.object === "text") {
	} else if (node.object === "inline") {
	} else if (node.object === "document") {
		let previous = false
		for (let i = 0; i < node.nodes.size; i++) {
			const child = node.nodes.get(i)
			const next = child.type === "ul"
			if (previous && next) {
				return () => editor.mergeNodeByKey(child.key)
			}
			previous = next
		}
	}
}
