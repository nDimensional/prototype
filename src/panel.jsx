import React from "react"
import {
	defaultTheme,
	fonts,
	fontProperty,
	sizes,
	darkTheme,
	ctrlKey,
} from "./constants"

export default class Panel extends React.Component {
	constructor(props) {
		super(props)
		this.handleThemeChange = this.handleThemeChange.bind(this)
		this.handleFontChange = this.handleFontChange.bind(this)
		this.handleSizeChange = this.handleSizeChange.bind(this)
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
					<label className="noselect">
						Dark theme:{" "}
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
						<label key={key} className="noselect" name="font">
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
					{sizes.map(key => (
						<label key={key} className="noselect" name="size">
							<input
								className="capitalize"
								type="radio"
								id={key}
								name="size"
								value={key}
								checked={key === size}
								onChange={this.handleSizeChange}
							/>{" "}
							{key[0].toUpperCase() + key.slice(1)}
						</label>
					))}
				</p>
				<p>{`Close this panel with ${ctrlKey}-Period.`}</p>
			</React.Fragment>
		)
	}
}
