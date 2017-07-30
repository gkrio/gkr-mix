module.exports = function(extractPlugins) {
	let styleLoaders = {
		css: {
			loader: 'css-loader',
			options: Object.assign(
				Config.singleExtract.options.css, {
					url: Config.processCssUrls,
					sourceMap: Mix.isUsing('sourcemaps'),
					importLoaders: 1
				}
			)
		},
		postcss: {
			loader: 'postcss-loader',
			options: {
				sourceMap: Mix.isUsing('sourcemaps'),
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
				Config.singleExtract.options.less, {
					sourceMap: Mix.isUsing('sourcemaps')
				}
			)
		},
		sassRewrite: {
			loader: 'resolve-url-loader',
			options: {
				sourceMap: true,
				root: Mix.paths.root('node_modules')
			}
		},
		sass: {
			loader: "sass-loader",
			options: Object.assign(
				Config.singleExtract.options.sass, {
					sourceMap: Config.processCssUrls ? true : Mix.isUsing('sourcemaps')
				}
			)
		}
	}


	let singleExtractPlugin = extractPlugins.length ? extractPlugins[0] : new ExtractTextPlugin({
		filename: 'css/all.css',
		allChunks: true,
		disable: Mix.isUsing('hmr')
	});
	rules.push({
		test: /\.css$/,
		exclude: Config.preprocessors.postCss ? Config.preprocessors.postCss.map(postCss => postCss.src.path()) : [],
		use: singleExtractPlugin.extract({
			fallback: "style-loader",
			use: [styleLoaders.css, styleLoaders.postcss]
		})
	});
	rules.push({
		test: /\.less$/,
		exclude: Config.preprocessors.less ? Config.preprocessors.less.map(less => less.src.path()) : [],
		use: singleExtractPlugin.extract({
			fallback: "style-loader",
			use: [styleLoaders.css, styleLoaders.postcss, styleLoaders.less]
		})
	});
	let sassPostLoader = styleLoaders.postcss;
	let sassLoaders = [styleLoaders.css];
	if (Config.processCssUrls) {
		sassPostLoader.options.sourceMap = true;
		sassLoaders.push(sassPostLoader, styleLoaders.sassRewrite, styleLoaders.sass);
	} else {
		sassLoaders.push(sassPostLoader, styleLoaders.sass);
	}
	rules.push({
		test: /\.s[ac]ss$/,
		exclude: Config.preprocessors.sass ? Config.preprocessors.sass.map(sass => sass.src.path()) : [],
		use: singleExtractPlugin.extract({
			fallback: "style-loader",
			use: sassLoaders
		})
	});

	return singleExtractPlugin;
}