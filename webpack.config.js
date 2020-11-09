const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  entry: `${__dirname}/src/index.jsx`,
  mode: process.env.NODE_ENV,
  output: {
    path: `${__dirname}/public`,
    filename: 'bundle.js',
  },
  devtool: 'source-map',
  devServer: {
    contentBase: './',
    disableHostCheck: true,
    public: 'https://datocms-plugin-check-links-v2.tunnel.datahub.at',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: `${__dirname}/src`,
        loader: 'eslint-loader',
        enforce: 'pre',
      },
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        use: { loader: 'babel-loader' },
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.svg/,
        use: {
          loader: 'svg-url-loader',
          options: {},
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'DatoCMS plugin',
      minify: isProduction,
    }),
    new HtmlWebpackTagsPlugin({
      tags: [
        'https://unpkg.com/datocms-plugins-sdk/dist/sdk.js',
        'https://unpkg.com/datocms-plugins-sdk/dist/sdk.css',
      ],
      append: false,
    }),
  ].filter(Boolean),
};
