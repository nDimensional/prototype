import React from "react"

const fontProperty = {
	book: "serif",
	quattro: "sans",
	fira: "mono",
}

interface CheckboxProps {
	name: string
	id: string
	checked: boolean
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

function Checkbox(props: CheckboxProps) {
	return (
		<label className="noselect checkbox">
			{props.name}:
			<input
				id={props.id}
				type="checkbox"
				checked={props.checked}
				onChange={props.onChange}
			/>
			<span className="close">]</span>
			<span className="open">[</span>
		</label>
	)
}

type Theme = "dark" | "light"
type Width = "narrow" | "wide" | "full"
type Font = "book" | "quattro" | "fira"
type Size = "small" | "medium" | "large"

export interface PanelProps {
	theme: Theme
	width: Width
	font: Font
	size: Size
	spellCheck: boolean
	onThemeChange: (theme: Theme) => void
	onWidthChange: (width: Width) => void
	onFontChange: (font: Font) => void
	onSizeChange: (size: Size) => void
	onSpellCheckChange: (spellCheck: boolean) => void
}

export function Panel(props: PanelProps) {
	return (
		<aside id="settings">
			<h1>Settings</h1>
			<section>
				<Checkbox
					name="Dark theme"
					id="theme"
					checked={props.theme !== DEFAULT_THEME}
					onChange={this.handleThemeChange}
				/>
				<Checkbox
					name="Spellcheck"
					id="spellcheck"
					checked={props.spellCheck}
					onChange={this.handleSpellCheckChange}
				/>
			</section>

			<section>
				<div className="heading">Font Family:</div>
				{Object.keys(FONTS).map((key) => (
					<label
						key={key}
						className="noselect radio"
						onMouseEnter={() => SET_FONT(key, true)}
						onMouseLeave={() => SET_FONT(null, true)}
					>
						<input
							type="radio"
							id={key}
							name="font"
							value={key}
							checked={key === props.font}
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
				{Object.keys(SIZES).map((key) => (
					<label
						key={key}
						className="noselect radio"
						onMouseEnter={() => SET_SIZE(key, true)}
						onMouseLeave={() => SET_SIZE(null, true)}
					>
						<input
							type="radio"
							id={key}
							name="size"
							value={key}
							checked={key === props.size}
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
				{Object.keys(WIDTHS).map((key) => (
					<label
						key={key}
						className="noselect radio"
						onMouseEnter={() => SET_WIDTH(key, true)}
						onMouseLeave={() => SET_WIDTH(null, true)}
					>
						<input
							type="radio"
							id={key}
							name="width"
							value={key}
							checked={key === props.width}
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
