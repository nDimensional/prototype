// Parse styles

export const tags = {
	_: ["em", "em_inline"],
	"*": ["strong", "strong_inline"],
	"`": ["code", "code_inline"],
	"[": ["ref", "ref_inline"],
	"![": ["ref_image", "ref_image_inline"],
}

const chars = new Set(["_", "*", "`"].map(tag => tag.charCodeAt(0)))

export default function styles(state, silent) {
	let pos = state.pos

	const ch = state.src.charCodeAt(pos)

	let length = 1
	let target
	if (chars.has(ch)) {
		target = String.fromCharCode(ch)
	} else if (ch === 91) {
		target = "]"
	} else if (ch === 33 && state.src.charCodeAt(pos + 1) === 91) {
		target = "]"
		length = 2
	} else {
		return false
	}

	if (pos > 0 && state.src.charCodeAt(pos - 1) !== 32) {
		return false
	} else if (
		pos < state.src.length - 1 &&
		state.src.charCodeAt(pos + 1) === 32
	) {
		return false
	}

	const end = pos + length
	const marker = state.src.slice(pos, end)

	const index = state.src.indexOf(target, end)

	if (index !== -1) {
		if (!silent) {
			const [tag, type] = tags[marker]
			const token = state.push(type, tag, 0)
			token.markup = marker
			token.content = state.src.slice(end, index)
		}
		state.pos = index + target.length
		return true
	}

	if (!silent) {
		state.pending += marker
	}

	state.pos += 1
	return true
}
