let ExtractTextPlugin = require('extract-text-webpack-plugin');
module.exports = function(extractPlugins, rules) {
	let sourceMapStyle = !Mix.isUsing('hmr') && Mix.isUsing('sourcemaps');
	let styleLoaders = {
		css: {
			loader: 'css-loader',
			options: Object.assign(
				Config.inlineStyle.options.css, {
					url: Config.processCssUrls,
					sourceMap: sourceMapStyle,
					importLoaders: 1
				}
			)
		},
		postcss: {
			loader: 'postcss-loader',
			options: {
				sourceMap: sourceMapStyle,
				ident: 'postcss',
				plugins: [
					require('autoprefixer')
				].concat(
					Config.postCss
				)
			}
		},
		less: {
			loader: 'less-loader',
			options: Object.assign(
				Config.inlineStyle.options.less, {
					sourceMap: sourceMapStyle
				}
			)
		},
		sassRewrite: {
			loader: 'resolve-url-loader',
			options: {
				sourceMap: sourceMapStyle,
				root: Mix.paths.root('node_modules')
			}
		},
		sass: {
			loader: "sass-loader",
			options: Object.assign(
				Config.inlineStyle.options.sass, {
					sourceMap: Config.processCssUrls && !Mix.isUsing('hmr') ? true : sourceMapStyle
				}
			)
		}
	}


	let inlineExtractPlugin = extractPlugins.length ? extractPlugins[0] : new ExtractTextPlugin({
		filename: Config.inlineStyle.filename,
		allChunks: true,
		disable: Mix.isUsing('hmr')
	});
	rules.push({
		test: /\.css$/,
		exclude: Config.preprocessors.postCss ? Config.preprocessors.postCss.map(postCss => postCss.src.path()) : [],
		use: inlineExtractPlugin.extract({
			fallback: "style-loader",
			use: [styleLoaders.css, styleLoaders.postcss]
		})
	});
	rules.push({
		test: /\.less$/,
		exclude: Config.preprocessors.less ? Config.preprocessors.less.map(less => less.src.path()) : [],
		use: inlineExtractPlugin.extract({
			fallback: "style-loader",
			use: [styleLoaders.css, styleLoaders.postcss, styleLoaders.less]
		})
	});
	let sassLoaders = [styleLoaders.css, styleLoaders.postcss];
	if (Config.processCssUrls) {
		sassLoaders.push(styleLoaders.sassRewrite);
	}
	sassLoaders.push(styleLoaders.sass);
	rules.push({
		test: /\.s[ac]ss$/,
		exclude: Config.preprocessors.sass ? Config.preprocessors.sass.map(sass => sass.src.path()) : [],
		use: inlineExtractPlugin.extract({
			fallback: "style-loader",
			use: sassLoaders
		})
	});

	extractPlugins.push(inlineExtractPlugin);
	return {
		extractPlugins,
		rules
	};
}