import { Value } from "slate"
import { is } from "immutable"

const browser = (window.browser = window.browser || window.chrome)
const storageAreaName = "local"
const storageArea = browser.storage[storageAreaName]

const storageKeys = [
	FONT_KEY,
	SIZE_KEY,
	WIDTH_KEY,
	VALUE_KEY,
	SPELLCHECK_KEY,
	SETTINGS_KEY,
]

window.setProperty = (key, value) => {
	localStorage.setItem(key, value)
	if (browser === window.chrome) {
		return new Promise(resolve => storageArea.set({ [key]: value }, resolve))
	} else {
		return storageArea.set({ [key]: value })
	}
}

window.saveData = data => {
	if (browser === window.chrome) {
		return new Promise(resolve => storageArea.set(data, resolve))
	} else {
		return storageArea.set(data)
	}
}

window.initialize = Promise.all(
	window.chrome === browser
		? [
				new Promise(resolve => browser.tabs.getCurrent(resolve)),
				new Promise(resolve => storageArea.get(storageKeys, resolve)),
		  ]
		: [browser.tabs.getCurrent(), storageArea.get(storageKeys)]
).then(
	async ([
		{ id },
		{
			[FONT_KEY]: font,
			[SIZE_KEY]: size,
			[WIDTH_KEY]: width,
			[VALUE_KEY]: value,
			[SPELLCHECK_KEY]: spellCheck,
			[SETTINGS_KEY]: settings,
		},
	]) => {
		if (!FONTS.hasOwnProperty(font)) {
			window.setProperty(FONT_KEY, DEFAULT_FONT)
			font = DEFAULT_FONT
		}

		if (!SIZES.hasOwnProperty(size)) {
			window.setProperty(SIZE_KEY, DEFAULT_SIZE)
			size = DEFAULT_SIZE
		}

		if (!WIDTHS.hasOwnProperty(width)) {
			window.setProperty(WIDTH_KEY, DEFAULT_WIDTH)
			width = DEFAULT_WIDTH
		}

		if (spellCheck !== true && spellCheck !== false) {
			window.setProperty(SPELLCHECK_KEY, true)
			spellCheck = true
		}

		if (settings !== true && settings !== false) {
			window.setProperty(SETTINGS_KEY, true)
			settings = true
		}

		return { id, value, settings, spellCheck, font, size, width }
	}
)

window.attachChangeListener = (id, callback) =>
	browser.storage.onChanged.addListener(
		(
			{
				[ID_KEY]: tab,
				[VALUE_KEY]: json,
				[FONT_KEY]: fontValue,
				[SIZE_KEY]: sizeValue,
				[WIDTH_KEY]: widthValue,
				[SPELLCHECK_KEY]: spellCheckValue,
				[SETTINGS_KEY]: settingsValue,
			},
			areaName
		) => {
			if (areaName === storageAreaName) {
				callback(state => {
					const newState = {}

					let previousId = state.id
					if (tab) {
						previousId = tab.newValue
						newState.id = previousId
					}

					if (json && (!id || previousId !== id)) {
						const newValue = Value.fromJSON(json.newValue)
						if (!is(newValue.document, state.value.document)) {
							newState.value = newValue
						}
					}

					if (fontValue && FONTS.hasOwnProperty(fontValue.newValue)) {
						SET_FONT(fontValue.newValue, false)
						newState.font = fontValue.newValue
					}

					if (sizeValue && SIZES.hasOwnProperty(sizeValue.newValue)) {
						SET_SIZE(sizeValue.newValue, false)
						newState.size = sizeValue.newValue
					}

					if (widthValue && WIDTHS.hasOwnProperty(widthValue.newValue)) {
						SET_WIDTH(widthValue.newValue, false)
						newState.width = widthValue.newValue
					}

					if (spellCheckValue) {
						newState.spellCheck = spellCheckValue.newValue
					}

					if (settingsValue) {
						newState.settings = settingsValue.newValue
					}

					return Object.keys(newState).length > 0 ? newState : null
				})
			}
		}
	)
