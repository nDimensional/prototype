// Babel options
const options = { presets: ["@babel/preset-env", "@babel/preset-react"] }

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

	externals: {
		immutable: "Immutable",
		slate: "Slate",
		react: "React",
		"react-dom": "ReactDOM",
	},
}
