// Import React dependencies.
import React, { useEffect, useMemo, useState } from "react"
// Import the Slate editor factory.
import { createEditor, Node } from "slate"

// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from "slate-react"

const App = () => {
	const editor = useMemo(() => withReact(createEditor()), [])
	// Add the initial value when setting up our state.
	const s: Node[] = [
		{
			type: "paragraph",
			children: [{ text: "A line of text in a paragraph." }],
		},
	]

	const [value, setValue] = useState(s)

	return (
		<Slate editor={editor} value={value} onChange={value => setValue(value)}>
			<Editable />
		</Slate>
	)
}
