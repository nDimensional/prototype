import React from "react"

function handleLinkClick(event, href) {
	if (CTRL_TEST(event)) {
		event.preventDefault()
		const target = event.shiftKey ? "_self" : "_blank"
		window.open(href, target)
	}
}

const urlTest = /^https?:\/\//
function isURL(href) {
	return urlTest.test(href)
}

export default function renderDecoration(props, editor, next) {
	const { type, data } = props.decoration
	if (type === "image") {
		const src = data.get("src")
		return (
			<span className="image" {...props.attributes}>
				<span className="margin noselect">
					<img src={src} />
				</span>
				<a href={src} onClick={event => handleLinkClick(event, src)}>
					{props.children}
				</a>
			</span>
		)
	} else if (type === "link") {
		const href = data.get("href")
		return (
			<a
				href={href}
				onClick={event => handleLinkClick(event, href)}
				{...props.attributes}
			>
				{props.children}
			</a>
		)
	} else if (type === "code") {
		return (
			<code className="code" spellCheck={false} {...props.attributes}>
				{props.children}
			</code>
		)
	} else if (type === "open" || type === "close") {
		return (
			<span className={`${type} token code`} {...props.attributes}>
				{props.children}
			</span>
		)
	} else if (type === "token" || type === "uncheck") {
		return (
			<span className={type} {...props.attributes}>
				{props.children}
			</span>
		)
	} else if (type === "check") {
		return (
			<span className="check" {...props.attributes}>
				{props.children}
			</span>
		)
	} else if (type === "term") {
		return (
			<span className="term" {...props.attributes}>
				{props.children}
			</span>
		)
	} else if (type === "ref") {
		const term = data.get("term")
		const { document } = editor.value
		if (document.data.has(term)) {
			const value = document.data.get(term)
			if (value && isURL(value)) {
				return (
					<a className="ref" href={value} {...props.attributes}>
						{props.children}
					</a>
				)
			} else {
				return (
					<span className="ref" {...props.attributes}>
						<span spellCheck={false} className="margin noselect">
							<aside>{value}</aside>
						</span>
						{props.children}
					</span>
				)
			}
		}
	} else {
		return React.createElement(type, props.attributes, props.children)
	}
}
