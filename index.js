const blockTypes = new Set(["p", "h1", "h2", "h3", "h4", "blockquote"])
const initialText =
	"Welcome to Tad! Use this space for scratch notes, reminders, and whatever else you want to keep around. A few markdown elements are supported (just h1-h4 and blockquotes for now) but you're welcome to contribute over at https://github.com/joeltg/tad"
const initialNodes = [{ object: "text", leaves: [{ text: initialText }] }]
const initialValue = Slate.Value.fromJSON({
	document: { nodes: [{ object: "block", type: "p", nodes: initialNodes }] },
})

const STORAGE_KEY = "--tad-storage--"
const ID_KEY = "--tad-id--"

const headerTest = /^(#+)(?: |$)/
const blockQuoteTest = /^> /

function normalizeNode(node, editor, next) {
	if (blockTypes.has(node.type)) {
		const { text } = node.getFirstText()
		const match = headerTest.exec(text)
		if (match && match[1].length < 5) {
			const type = "h" + match[1].length
			if (node.type !== type) {
				return () => editor.setNodeByKey(node.key, { type })
			}
		} else if (blockQuoteTest.test(text)) {
			if (node.type !== "blockquote") {
				return () => editor.setNodeByKey(node.key, { type: "blockquote" })
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

class Tad extends React.Component {
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
			({ [STORAGE_KEY]: storage, [ID_KEY]: tab }, areaName) => {
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
		const data = { [STORAGE_KEY]: json, [ID_KEY]: this.id }
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
ReactDOM.render(React.createElement(Tad, {}), main)
