const pairs = ["()", "[]", "**", "__", "``", '""', "''", "{}"]

const openers = {}
const closers = {}
pairs.forEach(pair => {
	openers[pair[0]] = pair[1]
	closers[pair[1]] = pair[0]
})

const codeBlockTest = /^```([a-z]*)```$/

export const autoClose = {
	onKeyDown(event, editor, next) {
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
			if (selection.isCollapsed) {
				const { path, offset } = selection.focus
				if (path.size === 3) {
					// ul -> li -> text
					const container = document.getDescendant(path.slice(0, 1))
					if (container.type === "ul") {
						const { text } = document.getDescendant(path)
						if (text === "- ") {
							event.preventDefault()
							return editor.withoutNormalizing(() => {
								editor.splitNodeByKey(container.key, container.nodes.size - 1)
								editor.unwrapBlock("ul")
								editor.setBlocks("p")
								editor.deleteBackward(2)
							})
						} else if (offset > 2) {
							event.preventDefault()
							return editor.withoutNormalizing(() => {
								editor.splitBlock(1)
								editor.insertText("- ")
							})
						} else if (offset === 2) {
							event.preventDefault()
							return editor.deleteBackward(2)
						}
						return next()
					}
				} else {
					const { text } = document.getDescendant(path)
					const match = codeBlockTest.exec(text)
					if (match) {
						event.preventDefault()
						editor.withoutNormalizing(() => {
							editor.splitBlock(1)
							editor.splitBlock(1)
							editor.moveBackward(1)
						})
						return
					}
				}
			} else {
			}
		} else if (event.keyCode === 9) {
			// tab
			event.preventDefault()
			return
		}
		return next()
	},

	onBeforeInput(event, editor, next) {
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
			if (offset !== 0) {
				const { text } = document.getDescendant(key)
				if (text[offset] === data) {
					event.preventDefault()
					editor.moveForward(1)
					return
				} else if (text[offset - 1] !== " " && text[offset - 1] !== "`") {
					return next()
				}
			}
			event.preventDefault()
			editor.insertText("``")
			editor.moveBackward(1)
			return
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
	},
}
