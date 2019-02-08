import * as MarkdownIt from "markdown-it"
// import * as URI from "uri-js"
import { Point, Decoration, Mark } from "slate"
// console.log(URI)

const md = new MarkdownIt()

const pairs = [
	["`", "`", "code", false],
	["[", "]", "a", false],
	["_", "_", "em", true],
	["*", "*", "strong", true],
]

export default function parse(key, text, decorations, environment) {
	const stack = {}
	const tokens = md.parseInline(text, environment)
	if (tokens.length > 0) {
		const [{ children }] = tokens
	}
	console.log("tokens", tokens)
	for (let i = 0; i < text.length; i++) {
		// Look for closing tags
		if (stack.hasOwnProperty(text[i])) {
			const [start, type] = stack[text[i]]
			// const result = [start, i + 1, type]
			// const children = results.splice(index, results.length - index, result)
			// result.push(children)
			// results.push(result)

			decorations.push(
				Decoration.create({
					anchor: Point.create({ key, offset: start }),
					focus: Point.create({ key, offset: i + 1 }),
					mark: Mark.create({ type }),
				})
			)

			delete stack[text[i]]
			continue
		}

		// Check for open tags
		const pair = pairs.find(([start]) => text[i] === start)
		if (pair !== undefined) {
			const [_, end, type, recurse] = pair
			if (recurse) {
				// hmm
				// stack[end] = [i, type, results.length]
				stack[end] = [i, type]
			} else {
				const j = text.indexOf(end, i + 1)
				if (j > 0) {
					if (type === "a") {
						decorations.push(
							Decoration.create({
								anchor: Point.create({ key, offset: i + 1 }),
								focus: Point.create({ key, offset: j }),
								mark: Mark.create({
									type,
									data: {
										href: text.slice(i + 1, j),
									},
								}),
							})
						)
					} else {
						decorations.push(
							Decoration.create({
								anchor: Point.create({ key, offset: i }),
								focus: Point.create({ key, offset: j + 1 }),
								mark: Mark.create({ type }),
							})
						)
					}

					// results.push([i, j + 1, type])
					i = j // since i will be incremented by the loop
				}
			}
		}
	}

	// const { length } = results
	// if (length === 0) {
	// 	results.push([0, text.length, "text", text])
	// } else {
	// 	const end = results[length - 1][1]
	// 	if (end < text.length) {
	// 		results.push([end, text.length, "text", text.slice(end, text.length)])
	// 	}
	// 	const start = results[0][0]
	// 	if (start > 0) {
	// 		results.splice(0, 0, [0, start, "text", text.slice(0, start)])
	// 	}
	// }

	// return results
}

window.parse = parse
