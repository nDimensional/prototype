import React from "react"

const fontProperty = {
	book: "serif",
	quattro: "sans",
	fira: "mono",
}

function Checkbox({ name, id, checked, onChange }) {
	return (
		<label className="noselect checkbox">
			{name}:
			<input id={id} type="checkbox" checked={checked} onChange={onChange} />
			<span className="close">]</span>
			<span className="open">[</span>
		</label>
	)
}

export default class Panel extends React.Component {
	handleWidthChange = ({ target: { value } }) => {
		this.props.onWidthChange(value)
	}
	handleFontChange = ({ target: { value } }) => {
		this.props.onFontChange(value)
	}
	handleSizeChange = ({ target: { value } }) => {
		this.props.onSizeChange(value)
	}
	handleSpellCheckChange = ({ target: { checked } }) => {
		this.props.onSpellCheckChange(checked)
	}
	render() {
		const { spellCheck, width, font, size } = this.props
		return (
			<aside id="settings">
				<h1>Settings</h1>
				<section>
					<Checkbox
						name="Spellcheck"
						id="spellcheck"
						checked={spellCheck}
						onChange={this.handleSpellCheckChange}
					/>
				</section>

				<section>
					<div className="heading">Font Family:</div>
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
				</section>
				<section>
					<div className="heading">Font Size:</div>
					{Object.keys(SIZES).map(key => (
						<label
							key={key}
							className="noselect radio"
							name="size"
							onMouseEnter={() => SET_SIZE(key, true)}
							onMouseLeave={() => SET_SIZE(null, true)}
						>
							<input
								type="radio"
								id={key}
								name="size"
								value={key}
								checked={key === size}
								onChange={this.handleSizeChange}
							/>
							<span className="open">(</span>
							<span className="close">)</span>
							<span className="capitalize">{key}</span>
						</label>
					))}
				</section>

				<section>
					<div className="heading">Width:</div>
					{Object.keys(WIDTHS).map(key => (
						<label
							key={key}
							className="noselect radio"
							name="width"
							onMouseEnter={() => SET_WIDTH(key, true)}
							onMouseLeave={() => SET_WIDTH(null, true)}
						>
							<input
								type="radio"
								id={key}
								name="width"
								value={key}
								checked={key === width}
								onChange={this.handleWidthChange}
							/>
							<span className="open">(</span>
							<span className="close">)</span>
							<span className="capitalize">{key}</span>
						</label>
					))}
				</section>

				<p>
					Complain &#38; contribute on{" "}
					<a href="http://github.com/nDimensional/prototype">GitHub</a>.
				</p>
				<p>Close this panel with {CTRL_KEY}-Period.</p>
			</aside>
		)
	}
}
