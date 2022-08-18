const TerserJSPlugin = require('terser-webpack-plugin');
const path = require('path');
const developmentMode = false;
const webpack = require('webpack');

module.exports = {
  devtool: developmentMode && 'source-map',
  mode: developmentMode ? 'development' : 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'publish', 'dist'),
    library: 'walletconnect-connector',
    libraryTarget: 'umd',
    filename: 'index.js',
    globalObject: 'this',
  },
  optimization: {
    minimizer: [developmentMode ? null : new TerserJSPlugin({})].filter(Boolean),
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'string-replace-loader',
        options: {
          search: 'WalletConnect-compatible',
          replace: 'Astra',
          flags: 'g'
        }
      },
      {
        test: /\.m?js$/,
        exclude: /node_modules\/(?!(@walletconnect)\/).*/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-proposal-optional-chaining'],
          },
        },
      },
    ],
  },
  resolve: {
    fallback: {
      path: false,
      assert: require.resolve('assert/'),
      buffer: require.resolve('buffer/'),
      events: require.resolve('events/'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
    }
  }
};
