import React from "react"
import katex from "katex/dist/katex.min.js"

import { katexStyleSheet } from "./constants"

export default function renderMark(props, editor, next) {
	if (props.mark.type === "class") {
		const className = props.mark.data.get("className")
		return (
			<span className={className} {...props.attributes}>
				{props.children}
			</span>
		)
	} else if (props.mark.type === "math") {
		// const src = props.mark.data.get("src")
		const src = props.children.props.children // lol what
		return (
			<span className="math" spellCheck={false} {...props.attributes}>
				<span
					className="margin noselect latex"
					ref={span => {
						if (!span) return
						if (!span.shadowRoot) {
							const root = span.attachShadow({ mode: "open" })
							root.adoptedStyleSheets = [katexStyleSheet]
						}
						katex.render(src, span.shadowRoot, {
							throwOnError: false,
							displayMode: false, // can't decide what's best here
							// displayMode: true,
						})
					}}
				/>
				{props.children}
			</span>
		)
	} else if (props.mark.type === "img") {
		const src = props.mark.data.get("src")
		return (
			<a href={src} {...props.attributes}>
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
				{...props.attributes}
				onClick={event => {
					if (event.metaKey) {
						const target = event.shiftKey ? "_self" : "_blank"
						window.open(href, target)
					}
				}}
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
