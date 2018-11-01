// Babel options
const options = {
	presets: ["@babel/preset-env", "@babel/preset-react"],
	plugins: ["@babel/plugin-proposal-class-properties"],
}

module.exports = {
	entry: ["@babel/polyfill", "./src/index.jsx"],
	output: {
		filename: "bundle.js",
		path: __dirname + "/dist",
	},

	resolve: { extensions: [".js", ".jsx", ".json"] },

	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				use: [{ loader: "babel-loader", options }],
			},
		],
	},
}
