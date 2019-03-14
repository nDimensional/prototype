import React from "react"
import {
	defaultTheme,
	fonts,
	fontProperty,
	sizes,
	darkTheme,
	ctrlKey,
	properties,
	computedStyle,
	setTheme,
	setFont,
	setSize,
} from "./constants"

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
		this.props.onThemeChange(checked ? darkTheme : defaultTheme)
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
					<label
						className="noselect"
						// onMouseEnter={() =>
						// 	setTheme(
						// 		this.props.theme === defaultTheme ? darkTheme : defaultTheme,
						// 		true
						// 	)
						// }
						// onMouseLeave={() => setTheme(null, true)}
					>
						Dark theme:
						<input
							id="theme"
							type="checkbox"
							checked={theme !== defaultTheme}
							onChange={this.handleThemeChange}
						/>
					</label>
				</p>

				<p>
					<label className="heading">Font Family:</label>
					{Object.keys(fonts).map(key => (
						<label
							key={key}
							className="noselect"
							name="font"
							onMouseEnter={() => setFont(key, true)}
							onMouseLeave={() => setFont(null, true)}
						>
							<input
								type="radio"
								id={key}
								name="font"
								value={key}
								checked={key === font}
								onChange={this.handleFontChange}
							/>
							{fonts[key]}
							<span className="label">{fontProperty[key]}</span>
						</label>
					))}
				</p>
				<p>
					<label className="heading">Font Size:</label>
					{Object.keys(sizes).map(key => (
						<label
							key={key}
							className="noselect"
							name="size"
							onMouseEnter={() => setSize(key, true)}
							onMouseLeave={() => setSize(null, true)}
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
							{sizes[key]}
						</label>
					))}
				</p>
				<p>
					Complain &#38; contribute on{" "}
					<a href="http://github.com/joeltg/tad">GitHub</a>.
				</p>
				<p>Close this panel with {ctrlKey}-Period.</p>
			</React.Fragment>
		)
	}
}
