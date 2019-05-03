const options = {
	presets: ["@babel/preset-env", "@babel/preset-react"],
	plugins: ["@babel/plugin-proposal-class-properties"],
}

module.exports = env => {
	const hydrate =
		__dirname + "/hydrate/" + (env && env.hydrate ? "hydrate.js" : "null.js")
	return {
		entry: {
			bundle: ["@babel/polyfill", "./src/index.jsx"],
			hydrate,
		},

		output: {
			filename: "[name].min.js",
			path: __dirname + "/dist",
		},

		resolve: {
			extensions: [".js", ".jsx"],
		},

		devtool: false,

		module: {
			rules: [
				{
					test: /src\/.+\.jsx?$/,
					exclude: /(?:node_modules|\.min\.js$|dist\/)/,
					use: { loader: "babel-loader", options },
				},
			],
		},
	}
}
