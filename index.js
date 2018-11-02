const blockTypes = new Set(["p", "h1", "h2", "h3", "h4"])
const initialText = "A line of text in a paragraph."
const initialNodes = [{ object: "text", leaves: [{ text: initialText }] }]
const initialValue = Slate.Value.fromJSON({
	document: { nodes: [{ object: "block", type: "p", nodes: initialNodes }] },
})

const STORAGE_KEY = "--tabla-slate-value--"
const TAB_ID_KEY = "--tabla-tab-id--"

const headerTest = /^(#+)(?: |$)/

function normalizeNode(node, editor, next) {
	if (blockTypes.has(node.type)) {
		const match = headerTest.exec(node.text)
		if (match) {
			const [_, { length }] = match
			const type = "h" + length
			if (node.type !== type) {
				return () => editor.setNodeByKey(node.key, { type })
			}
		} else if (node.type !== "p") {
			return () => editor.setNodeByKey(node.key, { type: "p" })
		}
	}
	return next()
}

function renderNode(props, editor, next) {
	if (blockTypes.has(props.node.type)) {
		return React.createElement(props.node.type, props)
	} else {
		return next()
	}
}

class Tabla extends React.Component {
	constructor(props) {
		super(props)
		this.sync = true
		this.state = { value: null }
		this.document = initialValue.document
		this.onChange = this.onChange.bind(this)
		this.onKeyDown = this.onKeyDown.bind(this)
	}

	async componentDidMount() {
		// Get tab id
		const tab = await window.browser.tabs.getCurrent()
		this.id = tab.id

		// Get data browser storage
		const data = await window.browser.storage.sync.get(STORAGE_KEY)
		const { [STORAGE_KEY]: json } = data
		const value = json === undefined ? initialValue : Slate.Value.fromJSON(json)
		this.setState({ value })

		// Attach listener
		window.browser.storage.onChanged.addListener(
			({ [STORAGE_KEY]: storage, [TAB_ID_KEY]: tab }, areaName) => {
				if (areaName === "sync" && storage && tab) {
					if (tab.newValue === this.id) return
					const value = Slate.Value.fromJSON(storage.newValue)
					if (value.document !== this.state.value.document) {
						this.setState({ value })
					}
				}
			}
		)
	}

	async save(value) {
		this.sync = false
		this.value = null
		const json = value.toJSON()
		const data = { [STORAGE_KEY]: json, [TAB_ID_KEY]: this.id }
		await window.browser.storage.sync.set(data)
		if (this.value !== null) this.save(this.value)
		else this.sync = true
	}

	onChange({ value }) {
		if (value.document !== this.state.value.document) {
			if (this.sync) this.save(value)
			else this.value = value
		}
		this.setState({ value })
	}

	onKeyDown(event, editor, next) {
		const { metaKey, keyCode } = event
		if (metaKey && keyCode === 83) event.preventDefault()
		else return next()
	}

	render() {
		const { onChange, onKeyDown } = this
		const { value } = this.state
		if (value === null) return null
		return React.createElement(SlateReact.Editor, {
			value,
			plugins: [{ normalizeNode }],
			onChange,
			onKeyDown,
			renderNode,
		})
	}
}

const main = document.querySelector("main")
ReactDOM.render(React.createElement(Tabla, {}), main)
