const html = localStorage.getItem(SNAPSHOT_KEY)
if (html) {
	window.hydrate = true
	document.open()
	document.write(`<main>${html}</main>`)
	document.close()
} else {
	window.hydrate = false
}
