import React from "react"

export default function renderNode(props, editor, next) {
	if (props.node.object === "block") {
		if (props.node.type === "hr") {
			return (
				<div className="divider" {...props.attributes}>
					{props.children}
				</div>
			)
		} else if (props.node.type === "img") {
			return (
				<figure {...props.attributes}>
					<figcaption>{props.children}</figcaption>
					<img src={props.node.data.get("src")} />
				</figure>
			)
		} else if (props.node.type === "cl") {
			return (
				<ul className="checklist" {...props.attributes}>
					{props.children}
				</ul>
			)
		} else if (props.node.type === "ci") {
			return (
				<li className="checkitem" {...props.attributes}>
					{props.children}
				</li>
			)
		} else {
			return React.createElement(
				props.node.type,
				props.attributes,
				props.children
			)
		}
	} else {
		return next()
	}
}
