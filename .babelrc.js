module.exports = {
  ignore: [
    "./packages/dugtrio/**/src",
    "./packages/walletconnect-connector/**/src",
  ],
  presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
  plugins: ['@babel/plugin-proposal-class-properties'],
};
