import React from "react"
import type { RenderElementProps } from "slate-react"

export function renderElement({
	element,
	attributes,
	children,
}: RenderElementProps) {
	switch (element.type) {
		case "h1":
			return <h1 {...attributes}>{children}</h1>
		case "h2":
			return <h2 {...attributes}>{children}</h2>
		case "h3":
			return <h3 {...attributes}>{children}</h3>
		case "blockquote":
			return <blockquote {...attributes}>{children}</blockquote>
		case "hr":
			return (
				<div className="divider" {...attributes}>
					{children}
				</div>
			)
		case "ul":
			return <ul {...attributes}>{children}</ul>
		case "li":
			return <li {...attributes}>{children}</li>
		case "cl":
			return (
				<ul className="checklist" {...attributes}>
					{children}
				</ul>
			)
		case "ci":
			return (
				<li
					className="checkitem"
					data-checked={element.checked}
					{...attributes}
				>
					{children}
				</li>
			)
		case "dl":
			return (
				<ul className="definitionlist" {...attributes}>
					{children}
				</ul>
			)
		case "di":
			return (
				<li className="definitionitem" {...attributes}>
					{children}
				</li>
			)
		default:
			return <p {...attributes}>{children}</p>
	}
}
