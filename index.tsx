import React, { useCallback, useState, useMemo } from "react"
import ReactDOM from "react-dom"

import { createEditor } from "slate"
import { Slate, Editable, withReact } from "slate-react"

import { migrate } from "./migrate"
import { renderElement } from "./renderElement"

import type { DocumentNode } from "./elements"

// import renderBlock from "./src/renderBlock"
// import renderDecoration from "./src/renderDecoration"

// import normalizeNode from "./src/normalizeNode"
// import decorateNode from "./src/decorateNode"

// import Panel from "./panel"

// type CustomElement = { type: "paragraph"; children: CustomText[] }
// type CustomText = { text: string; bold?: true }

const initialValue = await fetch("value.json")
	.then((res) => res.json())
	.then(migrate)

console.log(initialValue)

function Document() {
	// const [settings, setSettings] = useState(false)

	const editor = useMemo(() => withReact(createEditor()), [])

	// const handleSave = useCallback(() => {}, [])

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLDivElement>) => {
			// const { keyCode, shiftKey } = event
			// // Intercept Cmd-S
			// if (CTRL_TEST(event) && keyCode === 83) {
			// 	event.preventDefault()
			// 	// handleSave(shiftKey)
			// } else if (keyCode === 224 || keyCode === 91 || keyCode === 93) {
			// 	document.body.classList.add("cmd")
			// }
		},
		[]
	)

	const handleKeyUp = useCallback(
		(event: React.KeyboardEvent<HTMLDivElement>) => {
			// const { keyCode } = event
			// if (keyCode === 224 || keyCode === 91 || keyCode === 93) {
			// 	document.body.classList.remove("cmd")
			// }
		},
		[]
	)

	const [value, setValue] = useState<DocumentNode[]>(initialValue)
	const handleChange = useCallback((value: DocumentNode[]) => {
		;(window as any).value = value
		setValue(value)
	}, [])

	return (
		<div
			id="editor"
			onFocus={() => document.body.classList.remove("cmd")}
			onBlur={() => document.body.classList.add("cmd")}
			onKeyDown={handleKeyDown}
			onKeyUp={handleKeyUp}
		>
			<Slate editor={editor} value={value} onChange={handleChange}>
				<Editable autoFocus={true} renderElement={renderElement} />
			</Slate>
		</div>
	)
}

const main = document.querySelector("main")
ReactDOM.render(<Document />, main)
