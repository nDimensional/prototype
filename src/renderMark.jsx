import React from "react"

function handleLinkClick(event, href) {
	if (event.metaKey) {
		event.preventDefault()
		const target = event.shiftKey ? "_self" : "_blank"
		window.open(href, target)
	}
}

export default function renderMark(props, editor, next) {
	if (props.mark.type === "class") {
		const className = props.mark.data.get("className")
		return (
			<span className={className} {...props.attributes}>
				{props.children}
			</span>
		)
	} else if (props.mark.type === "img") {
		const src = props.mark.data.get("src")
		return (
			<a
				href={src}
				onClick={event => handleLinkClick(event, src)}
				{...props.attributes}
			>
				<span className="margin noselect">
					<img src={src} />
				</span>
				{props.children}
			</a>
		)
	} else if (props.mark.type === "a") {
		const href = props.mark.data.get("href")
		return (
			<a
				href={href}
				onClick={event => handleLinkClick(event, href)}
				{...props.attributes}
			>
				{props.children}
			</a>
		)
	} else if (props.mark.type === "code") {
		return (
			<code className="code" spellCheck={false} {...props.attributes}>
				{props.children}
			</code>
		)
	} else {
		return React.createElement(
			props.mark.type,
			props.attributes,
			props.children
		)
	}
}
