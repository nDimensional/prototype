import React from "react"

const fontProperty = {
	book: "serif",
	quattro: "sans",
	fira: "mono",
}

export default class Panel extends React.Component {
	constructor(props) {
		super(props)
		this.handleThemeChange = this.handleThemeChange.bind(this)
		this.handleFontChange = this.handleFontChange.bind(this)
		this.handleSizeChange = this.handleSizeChange.bind(this)
	}
	componentDidMount() {
		this.editor = document.getElementById("editor")
	}
	handleThemeChange({ target: { checked } }) {
		this.props.onThemeChange(checked ? DARK_THEME : DEFAULT_THEME)
	}
	handleFontChange({ target: { value } }) {
		this.props.onFontChange(value)
	}
	handleSizeChange({ target: { value } }) {
		this.props.onSizeChange(value)
	}
	render() {
		const { theme, font, size } = this.props
		return (
			<React.Fragment>
				<h1>Settings</h1>
				<p>
					<label className="noselect checkbox">
						Dark theme:
						<input
							id="theme"
							type="checkbox"
							checked={theme !== DEFAULT_THEME}
							onChange={this.handleThemeChange}
						/>
						<span className="open">[</span>
						<span className="close">]</span>
					</label>
				</p>

				<p>
					<label className="heading">Font Family:</label>
					{Object.keys(FONTS).map(key => (
						<label
							key={key}
							className="noselect radio"
							name="font"
							onMouseEnter={() => SET_FONT(key, true)}
							onMouseLeave={() => SET_FONT(null, true)}
						>
							<input
								type="radio"
								id={key}
								name="font"
								value={key}
								checked={key === font}
								onChange={this.handleFontChange}
							/>
							<span className="open">(</span>
							<span className="close">)</span>
							{FONTS[key]["font-family"]}
							<span className="label">{fontProperty[key]}</span>
						</label>
					))}
				</p>
				<p>
					<label className="heading">Font Size:</label>
					{Object.keys(SIZES).map(key => (
						<label
							key={key}
							className="noselect radio"
							name="size"
							onMouseEnter={() => SET_SIZE(key, true)}
							onMouseLeave={() => SET_SIZE(null, true)}
						>
							<input
								className="capitalize"
								type="radio"
								id={key}
								name="size"
								value={key}
								checked={key === size}
								onChange={this.handleSizeChange}
							/>
							<span className="open">(</span>
							<span className="close">)</span>
							{SIZES[key]}
						</label>
					))}
				</p>
				<p>
					Complain &#38; contribute on{" "}
					<a href="http://github.com/nDimensional/prototype">GitHub</a>.
				</p>
				<p>Close this panel with {CTRL_KEY}-Period.</p>
			</React.Fragment>
		)
	}
}
