const blockTypes = new Set(["p", "h1", "h2", "h3", "h4", "blockquote"])

const key = navigator.platform === "MacIntel" ? "⌘" : "Ctrl"

const initialText = [
	"# Welcome to Tad!",
	"Use this space for scratch notes, reminders, and whatever else you want to keep around. A few markdown elements are supported (just h1-h4 and block quotes for now) but you're welcome to contribute over at https://github.com/joeltg/tad!",
	`Use ${key}-Period to toggle between light and dark themes.`,
]

const initialValue = Slate.Value.fromJSON({
	document: {
		nodes: initialText.map(text => ({
			object: "block",
			type: "p",
			nodes: [{ object: "text", leaves: [{ text }] }],
		})),
	},
})

const ID_KEY = "--tad-id--"
const THEME_KEY = "--tad-theme--"
const STORAGE_KEY = "--tad-storage--"

const headerTest = /^(#+)(?: |$)/
const blockQuoteTest = /^> /

class Tad extends React.Component {
	constructor(props) {
		super(props)
		this.sync = true
		this.state = { value: this.props.value }
		this.handleChange = this.handleChange.bind(this)
		this.handleKeyDown = this.handleKeyDown.bind(this)

		// Attach listener
		window.browser.storage.onChanged.addListener(
			({ [STORAGE_KEY]: storage, [ID_KEY]: tab }, areaName) => {
				if (areaName === "sync" && storage && tab) {
					if (tab.newValue === this.props.id) return
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
		const data = { [STORAGE_KEY]: json, [ID_KEY]: this.props.id }
		await window.browser.storage.sync.set(data)
		if (this.value !== null) this.save(this.value)
		else this.sync = true
	}

	handleChange({ value }) {
		if (value.document !== this.state.value.document) {
			if (this.sync) this.save(value)
			else this.value = value
		}
		this.setState({ value })
	}

	handleKeyDown(event, editor, next) {
		const { metaKey, keyCode } = event
		if (metaKey && keyCode === 83) event.preventDefault()
		else return next()
	}

	render() {
		// normalizeNode & renderNode are static functions
		const { normalizeNode, renderNode } = Tad
		return React.createElement(SlateReact.Editor, {
			value: this.state.value,
			plugins: [{ normalizeNode }],
			onChange: this.handleChange,
			onKeyDown: this.handleKeyDown,
			renderNode,
			autoFocus: true,
		})
	}

	static renderNode(props, editor, next) {
		if (blockTypes.has(props.node.type)) {
			return React.createElement(props.node.type, props)
		} else {
			return next()
		}
	}

	static normalizeNode(node, editor, next) {
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
}

let isDark
function setTheme(theme) {
	if ((isDark = theme)) document.body.classList.add("dark")
	else document.body.classList.remove("dark")
}

// Get tab id & data from browser storage
Promise.all([
	window.browser.tabs.getCurrent(),
	window.browser.storage.sync.get([STORAGE_KEY, THEME_KEY]),
]).then(([{ id }, { [STORAGE_KEY]: json, [THEME_KEY]: theme }]) => {
	// `theme` is undefined if not set previously
	setTheme(!!theme)

	// Attach theme listeners
	window.browser.commands.onCommand.addListener(command => {
		if (command === "toggle-theme") {
			// Don't call setTheme() here.
			// Let the storage listener do the actual theme changing.
			window.browser.storage.sync.set({ [THEME_KEY]: !isDark })
		}
	})

	window.browser.storage.onChanged.addListener(
		({ [THEME_KEY]: value }, areaName) => {
			if (value && areaName === "sync") {
				setTheme(value.newValue)
			}
		}
	)

	const value = json ? Slate.Value.fromJSON(json) : initialValue
	ReactDOM.render(
		React.createElement(Tad, { id, value }),
		document.querySelector("main")
	)
})
