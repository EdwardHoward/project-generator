const { merge } = require('webpack-merge');
const NodemonPlugin = require('nodemon-webpack-plugin');
const config = require('./webpack.config.js');

module.exports = merge(config, {
    mode: 'development',
    watch: true,
    devtool: 'source-map',
    plugins: [
        new NodemonPlugin(),
    ]
});