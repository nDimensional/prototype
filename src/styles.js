// Parse styles

"use strict"

const tags = {
	$: ["math", "math_inline"],
	_: ["em", "em_inline"],
	"*": ["strong", "strong_inline"],
	"`": ["code", "code_inline"],
}

module.exports = function styles(state, silent) {
	var start,
		max,
		marker,
		matchStart,
		matchEnd,
		token,
		pos = state.pos,
		ch = state.src.charCodeAt(pos)

	if (
		ch !== 0x60 /* ` */ &&
		ch !== 0x5f /* _ */ &&
		ch !== 0x2a /* * */ &&
		ch !== 0x24 /* $ */
	) {
		return false
	}

	if (pos > 0 && state.src[pos - 1] !== " ") {
		return false
	}

	start = pos
	pos++
	max = state.posMax

	marker = state.src[start]

	matchStart = matchEnd = pos

	while ((matchStart = state.src.indexOf(marker, matchEnd)) !== -1) {
		matchEnd = matchStart + 1

		while (
			matchEnd < max &&
			state.src.charCodeAt(matchEnd) === ch /* ` _ * $ */
		) {
			matchEnd++
		}

		if (matchEnd - matchStart === 1) {
			if (!silent) {
				const [tag, type] = tags[marker]
				token = state.push(type, tag, 0)
				token.markup = marker
				token.content = state.src.slice(pos, matchStart)
			}
			state.pos = matchEnd
			return true
		}
	}

	if (!silent) {
		state.pending += marker
	}
	state.pos += 1
	return true
}
