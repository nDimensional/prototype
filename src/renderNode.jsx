import React from "react"
import katex from "katex/dist/katex.min.js"

import { katexStyleSheet } from "./constants"

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
		} else if (props.node.type === "math") {
			const src = props.node.data.get("src")
			return (
				<figure {...props.attributes}>
					<figcaption className="math" spellCheck={false}>
						{props.children}
					</figcaption>
					<div
						className="latex"
						ref={div => {
							if (!div) return
							if (!div.shadowRoot) {
								const root = div.attachShadow({ mode: "open" })
								root.adoptedStyleSheets = [katexStyleSheet]
							}
							katex.render(src, div.shadowRoot, {
								throwOnError: false,
								displayMode: true,
							})
						}}
					/>
				</figure>
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
