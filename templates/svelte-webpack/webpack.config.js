const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
   entry: './src/index.js',
   resolve: {
      alias: {
         svelte: path.resolve('node_modules', 'svelte')
      },
      extensions: ['.mjs', '.js', '.svelte'],
      mainFields: ['svelte', 'browser', 'module', 'main']
   },
   module: {
      rules: [
         {
            test: /\.svelte$/,
            exclude: /node_modules/,
            use: {
               loader: 'svelte-loader',
               options: {
                  emitCss: true
               }
            }
         },
         {
				test: /\.css$/,
				use: [
					MiniCssExtractPlugin.loader, 'css-loader'
				]
			}
      ]
   },
   plugins: [
      new HtmlWebpackPlugin({
         template: 'index.html',
         inject: false
      }),
      new MiniCssExtractPlugin({
			filename: '[name].css'
      })
   ],
   output: {
      filename: 'index.js',
      chunkFilename: '[name].[id].js',
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/dist/'
   }
}