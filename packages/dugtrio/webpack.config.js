const webpack = require('webpack');
const R = require('ramda');
const TerserJSPlugin = require('terser-webpack-plugin');
const path = require('path');
const developmentMode = false;
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  devtool: developmentMode && 'source-map',
  mode: developmentMode ? 'development' : 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'publish', 'dist'),
    library: 'wallet-provider',
    libraryTarget: 'umd',
    filename: 'index.js',
    globalObject: 'this',
  },
  externals: {
    ramda: 'ramda',
  },
  plugins: [
    new webpack.NormalModuleReplacementPlugin(
      /\.\/genesisStates\/.*\.json/,
      path.resolve('./empty.json')
    ),
    new webpack.NormalModuleReplacementPlugin(
      /@walletconnect\/keyvaluestorage/,
      path.resolve('./src/SignClient/KeyValueStorage.js')
    ),
    new webpack.NormalModuleReplacementPlugin(
      /@walletconnect\/jsonrpc-ws-connection/,
      path.resolve('./src/SignClient/jsonrpc-ws-connection/index.js')
    ),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.IgnorePlugin({
      checkResource(resource, context) {
        return (
          R.includes('bip39', context) &&
          R.includes('./wordlists/', resource) &&
          R.includes('.json', resource) &&
          !R.includes('english', resource)
        );
      },
    }),
    // new BundleAnalyzerPlugin()
  ],
  resolve: {
    modules: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../../packages/tx/node_modules'),
      path.resolve(__dirname, '../../packages/wallet/node_modules'),
    ],
    fallback: {
      path: false,
      assert: require.resolve('assert/'),
      buffer: require.resolve('buffer/'),
      events: require.resolve('events/'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
    },
  },
  optimization: {
    minimizer: [developmentMode ? null : new TerserJSPlugin({})].filter(Boolean),
  },
  module: {
    rules: [
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
};
