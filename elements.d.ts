import type { BaseEditor, BaseElement, BaseText } from "slate"
import type { ReactEditor } from "slate-react"

export interface H1Element extends BaseElement {
	type: "h1"
}

export interface H2ELement extends BaseElement {
	type: "h2"
}

export interface H3Element extends BaseElement {
	type: "h3"
}

export interface DividerElement extends BaseElement {
	type: "hr"
}

export interface BlockquoteElement extends BaseElement {
	type: "blockquote"
}

export interface ListElement extends BaseElement {
	type: "ul"
}

export interface ListItemElement extends BaseElement {
	type: "li"
}

export interface CheckListElement extends BaseElement {
	type: "cl"
}

export interface CheckListItemElement extends BaseElement {
	type: "ci"
	checked: boolean
}

export interface DefinitionListElement extends BaseElement {
	type: "dl"
}

export interface DefinitionListItemElement extends BaseElement {
	type: "di"
}

export interface ParagraphElement extends BaseElement {
	type: "p"
}

export type DocumentElement =
	| H1Element
	| H2ELement
	| H3Element
	| DividerElement
	| BlockquoteElement
	| ListElement
	| ListItemElement
	| CheckListElement
	| CheckListItemElement
	| DefinitionListElement
	| DefinitionListItemElement
	| ParagraphElement

export interface DocumentText extends BaseText {}

export type DocumentNode = DocumentElement | DocumentText

declare module "slate" {
	interface CustomTypes {
		Editor: BaseEditor & ReactEditor
		Element: DocumentElement
		Text: DocumentText
	}
}
