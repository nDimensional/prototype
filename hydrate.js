const html = localStorage.getItem(SNAPSHOT_KEY)
if (html) {
	window.hydrated = true
	document.open()
	document.write(`<main>${html}</main>`)
	document.close()
}
