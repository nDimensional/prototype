import React from "react"

export default function renderBlock(props, editor, next) {
	const { type, data } = props.node
	if (type === "hr") {
		return (
			<div className="divider" {...props.attributes}>
				{props.children}
			</div>
		)
	} else if (type === "img") {
		return (
			<figure {...props.attributes}>
				<figcaption>{props.children}</figcaption>
				<img src={data.get("src")} />
			</figure>
		)
	} else if (type === "cl") {
		return (
			<ul className="checklist" {...props.attributes}>
				{props.children}
			</ul>
		)
	} else if (type === "ci") {
		const className = ["checkitem"]
		if (data.get("checked")) {
			className.push("checked")
		}
		const depth = data.get("depth")
		const paddingLeft = `calc(-${depth} * var(--check-indent))`
		return (
			<li
				className={className.join(" ")}
				style={{ paddingLeft }}
				{...props.attributes}
			>
				{props.children}
			</li>
		)
	} else if (type === "li") {
		const depth = data.get("depth")
		const paddingLeft = `calc(-${depth} * var(--list-indent))`
		return (
			<li style={{ paddingLeft }} {...props.attributes}>
				{props.children}
			</li>
		)
	} else if (type === "di") {
		return <div {...props.attributes}>{props.children}</div>
	} else if (type === "blockquote") {
		const align = data.get("align")
		const className = align ? "align" : ""
		return (
			<blockquote className={className} {...props.attributes}>
				{props.children}
			</blockquote>
		)
	} else {
		return React.createElement(type, props.attributes, props.children)
	}
}
