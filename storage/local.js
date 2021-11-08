window.setProperty = async (key, value) => {
	localStorage.setItem(key, value)
}

window.saveData = async (data) => {
	Object.keys(data).forEach((key) =>
		localStorage.setItem(key, JSON.stringify(data[key]))
	)
}

window.initialize = async () => {
	const font = localStorage.getItem(FONT_KEY)
	const size = localStorage.getItem(SIZE_KEY)
	const theme = localStorage.getItem(THEME_KEY)
	const width = localStorage.getItem(WIDTH_KEY)
	const value = JSON.parse(localStorage.getItem(VALUE_KEY))
	const spellCheck = JSON.parse(localStorage.getItem(SPELLCHECK_KEY))
	const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY))

	const props = { font, size, theme, width, value, spellCheck, settings }

	if (!FONTS.hasOwnProperty(font)) {
		localStorage.setItem(FONT_KEY, DEFAULT_FONT)
		props.font = DEFAULT_FONT
	}

	if (!SIZES.hasOwnProperty(size)) {
		localStorage.setItem(SIZE_KEY, DEFAULT_SIZE)
		props.size = DEFAULT_SIZE
	}

	if (!THEMES.hasOwnProperty(theme)) {
		localStorage.setItem(THEME_KEY, DEFAULT_THEME)
		props.theme = DEFAULT_THEME
	}

	if (!WIDTHS.hasOwnProperty(width)) {
		localStorage.setItem(WIDTH_KEY, DEFAULT_WIDTH)
		props.width = DEFAULT_WIDTH
	}

	if (spellCheck !== true && spellCheck !== false) {
		window.setProperty(SPELLCHECK_KEY, true)
		props.spellCheck = true
	}

	if (settings !== true && settings !== false) {
		window.setProperty(SETTINGS_KEY, true)
		props.settings = true
	}

	return props
}

window.attachChangeListener = (id, callback) => {}
