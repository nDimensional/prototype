import type { DocumentElement, DocumentText, DocumentNode } from "./elements.js"

export function migrate(value: any): DocumentElement[] {
	console.log(value)
	if (Array.isArray(value)) {
		return value
	} else if (typeof value === "object" && value.object === "value") {
		return value.document.nodes.map(migrateNode)
	} else {
		throw new Error("Invalid value")
	}
}

type LegacyNode = LegacyBlock | LegacyText

interface LegacyBlock {
	object: "block"
	type: string
	nodes: LegacyBlock[]
}

interface LegacyText {
	object: "text"
	text: string
}

function migrateNode(node: LegacyNode): DocumentNode {
	if (node.object === "block") {
		if (node.type === "cl") {
		} else if (node.type === "dl") {
		} else {
			return {
				type: node.type,
				children: node.nodes.map(migrateNode),
			} as DocumentElement
		}
	} else if (node.object === "text") {
		return { text: node.text } as DocumentText
	} else {
		throw new Error("Invalid legacy node type")
	}
}
