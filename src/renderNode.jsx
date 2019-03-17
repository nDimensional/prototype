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
		} else if (props.node.type === "table") {
			return (
				<div className="table" {...props.attributes}>
					{props.children}
				</div>
			)
		} else if (props.node.type === "tr") {
			return (
				<div className="row" {...props.attributes}>
					{props.children}
				</div>
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
