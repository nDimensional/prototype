const options = {
	presets: ["@babel/preset-env", "@babel/preset-react"],
	plugins: ["@babel/plugin-proposal-class-properties"],
}

module.exports = {
	entry: ["@babel/polyfill", "./src/index.jsx"],
	output: {
		filename: "bundle.min.js",
		path: __dirname + "/dist",
	},

	resolve: {
		extensions: [".js", ".jsx"],
	},

	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /(?:node_modules|\.min\.js$|dist\/)/,
				use: [{ loader: "babel-loader", options }],
			},
		],
	},

	optimization: {
		usedExports: true,

		// splitChunks: {
		// 	chunks: "async",
		// 	minSize: 30000,
		// 	maxSize: 0,
		// 	minChunks: 1,
		// 	maxAsyncRequests: 5,
		// 	maxInitialRequests: 3,
		// 	automaticNameDelimiter: "~",
		// 	name: true,
		// 	cacheGroups: {
		// 		vendors: {
		// 			test: /[\\/]node_modules[\\/]/,
		// 			priority: -10,
		// 		},
		// 		default: {
		// 			minChunks: 2,
		// 			priority: -20,
		// 			reuseExistingChunk: true,
		// 		},
		// 	},
		// },
	},
}
