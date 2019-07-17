import { listTest, checkTest } from "./normalizeNode"

const pairs = ["()", "[]", "**", "__", "``", '""', "''", "{}"]

const openers = {}
const closers = {}
pairs.forEach(pair => {
	openers[pair[0]] = pair[1]
	closers[pair[1]] = pair[0]
})

const getContainerTest = {
	ul: listTest,
	cl: checkTest,
}
const getDefaultText = {
	ul: text => text,
	cl: text => `${"\t".repeat(text.length - 4)}[ ] `,
}

function isContainerSelection(selection) {
	const { anchor, focus } = selection
	if (anchor.path.size === 3 && focus.path.size === 3) {
		const a = anchor.path.get(0)
		if (a === focus.path.get(0)) {
			return a + 1
		}
	}
	return 0
}

export function onKeyDown(event, editor, next) {
	if (event.keyCode === 8) {
		// delete
		const { document, selection } = editor.value
		if (selection.isCollapsed) {
			const { key, offset } = selection.focus
			const { text } = document.getDescendant(key)
			const pair = text.slice(offset - 1, offset + 1)
			if (pairs.includes(pair)) {
				event.preventDefault()
				editor.deleteForward(1)
				editor.deleteBackward(1)
				return
			}
		}
	} else if (event.keyCode === 13) {
		// enter
		const { document, selection } = editor.value
		if (CTRL_TEST(event)) {
			event.preventDefault()
			const index = isContainerSelection(selection)
			if (index) {
				const container = document.nodes.get(index - 1)
				if (container.type === "cl") {
					const { start, end } = selection
					const [s, e] = [start.path.get(1), end.path.get(1)]
					return editor.withoutNormalizing(() => {
						let empty = true
						for (let i = s; i <= e; i++) {
							const textNode = container.nodes.get(i).nodes.get(0)
							const text = textNode.text
							const offset = text.indexOf("[")
							if (text[offset + 1] === " ") {
								empty = false
								editor.removeTextByKey(textNode.key, offset + 1, 1)
								editor.insertTextByKey(textNode.key, offset + 1, "x")
							}
						}
						if (empty) {
							for (let i = s; i <= e; i++) {
								const textNode = container.nodes.get(i).nodes.get(0)
								const text = textNode.text
								const offset = text.indexOf("[")
								editor.removeTextByKey(textNode.key, offset + 1, 1)
								editor.insertTextByKey(textNode.key, offset + 1, " ")
							}
						}
					})
				}
			}
		} else if (selection.isCollapsed) {
			const { path, offset } = selection.focus
			if (path.size === 3) {
				// ul -> li -> text
				const container = document.getDescendant(path.slice(0, 1))
				if (container.type === "ul" || container.type === "cl") {
					const { text } = document.getDescendant(path)
					const test = getContainerTest[container.type]
					const [match] = test.exec(text)
					if (match.length === text.length) {
						event.preventDefault()
						if (event.shiftKey) {
							return editor.withoutNormalizing(() => {
								editor.splitBlock()
								editor.insertText(getDefaultText[container.type](match))
							})
						} else {
							return editor.withoutNormalizing(() => {
								editor.splitNodeByKey(container.key, container.nodes.size - 1)
								editor.unwrapBlock(container.type)
								editor.setBlocks("p")
								editor.deleteBackward(match.length)
							})
						}
					} else if (match && offset === match.length && !event.shiftKey) {
						event.preventDefault()
						return editor.deleteBackward(match.length)
					} else if (offset >= match.length) {
						event.preventDefault()
						return editor.withoutNormalizing(() => {
							editor.splitBlock(1)
							editor.insertText(getDefaultText[container.type](match))
						})
					}
					return next()
				}
			}
		} else {
		}
	} else if (event.keyCode === 9) {
		// tab
		event.preventDefault()
		const { document, selection } = editor.value
		const index = isContainerSelection(selection)
		if (index) {
			const { start, end } = selection
			const { shiftKey } = event
			const ul = document.nodes.get(index - 1)
			return editor.withoutNormalizing(() => {
				const [s, e] = [start.path.get(1), end.path.get(1)]
				for (let i = s; i <= e; i++) {
					if (shiftKey) {
						const text = ul.nodes.get(i).nodes.get(0)
						if (text.text[0] === "\t") {
							editor.removeTextByKey(text.key, 0, 1)
						}
					} else {
						editor.insertTextByPath(start.path.set(1, i), 0, "\t")
					}
				}
			})
		}
		return
	}
	return next()
}

export function onBeforeInput(event, editor, next) {
	const { data } = event

	if (data.length !== 1) return next()
	if (editor.value.selection.isExpanded) {
		if (openers.hasOwnProperty(data)) {
			event.preventDefault()
			editor.wrapText(data, openers[data])
			return
		} else {
			return next()
		}
	}

	if (data === "`") {
		const { document, selection } = editor.value
		const { key, offset } = selection.focus
		const { text } = document.getDescendant(key)

		if (offset !== 0) {
			if (text[offset] === data) {
				if (text[offset - 1] !== data) {
					event.preventDefault()
					editor.moveForward(1)
					return
				}
			} else if (text[offset - 1] !== " ") {
				return next()
			}
		}

		if (text.length > offset && text[offset] !== " " && text[offset] !== data) {
			return next()
		} else {
			event.preventDefault()
			editor.insertText("``")
			editor.moveBackward(1)
			return
		}
	}

	if (closers.hasOwnProperty(data)) {
		const { document, selection } = editor.value
		const { key, offset } = selection.focus
		const { text } = document.getDescendant(key)
		if (text[offset] === data) {
			event.preventDefault()
			editor.moveForward(1)
			return
		}
	}

	if (openers.hasOwnProperty(data)) {
		const { document, selection } = editor.value
		const { key, offset } = selection.focus
		const { text } = document.getDescendant(key)
		if (
			((offset === 0 || text[offset - 1] === " ") &&
				(offset === text.length || text[offset] === " ")) ||
			(offset && data === "[" && text[offset - 1] === "!") ||
			(offset && data === "(" && text[offset - 1] === "]")
		) {
			event.preventDefault()
			editor.insertText(data + openers[data])
			editor.moveBackward(1)
			return
		}
	}

	return next()
}
