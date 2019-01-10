const path = require('path');

module.exports = [
   Object.assign({
      target: "electron-renderer",
      entry: {gui: './src/index.tsx'},
      devtool: 'inline-source-map',
      mode: 'development',
      node: {
         __dirname: false
      },
      module: {
         rules: [{
               test: /\.tsx?$/,
               use: 'ts-loader',
               exclude: /node_modules/
            },
            {
               test: /\.(s*)css$/,
               use: ['style-loader', 'css-loader', 'sass-loader']
            }
         ]
      },
      resolve: {
         extensions: ['.tsx', '.ts', '.js', '.scss', '.css']
      },
      output: {
         filename: 'bundle.js',
         path: path.resolve(__dirname, 'dist'),
         publicPath: '/dist/'
      }   
   }),
   Object.assign({
      target: "electron-main",
      entry: {main: './src/main.ts'},
      node: {
         __dirname: false
      },
   })
];