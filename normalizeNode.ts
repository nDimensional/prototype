import { Transforms, Element, Node, Editor } from "slate"

export function withPrototype(editor: Editor) {
	const { normalizeNode } = editor

	editor.normalizeNode = (entry) => {
		const [node, path] = entry

		if (Element.isElement(node)) {
			if (Editor.isEditor(node)) {
				// node.children
			} else {
        node
      }
		}

		// If the element is a paragraph, ensure its children are valid.
		if (Element.isElement(node) && node.type === "paragraph") {
			for (const [child, childPath] of Node.children(editor, path)) {
				if (Element.isElement(child) && !editor.isInline(child)) {
					Transforms.unwrapNodes(editor, { at: childPath })
					return
				}
			}
		}

		// Fall back to the original `normalizeNode` to enforce other constraints.
		normalizeNode(entry)
	}

	return editor
}
