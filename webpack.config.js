const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

const keys = require('./secret/keys.json')

const NODE_ENV = process.env.NODE_ENV;

const MainHtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: './src/index.html',
  filename: 'index.html',
  inject: 'body',
  chunks: NODE_ENV === 'development' ? ['main'] : ['main']
});

const OptionsHtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: './src/options.html',
  filename: 'options.html',
  inject: 'body',
  chunks: NODE_ENV === 'development' ? [ 'options'] : ['options']
});

module.exports = {
  entry: {
    // fakeDom: path.resolve(__dirname, './src/fake-chrome.ts'),
    main: path.resolve(__dirname, './src/main.tsx'),
    options: path.resolve(__dirname, './src/options.tsx'),
    // analytics: path.resolve(__dirname, './src/analytics.js')
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[hash].js'
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
    publicPath: '/',
    inline: true,
    port: process.env.PORT || 3000,
    historyApiFallback: true,
    hot: true
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" }
        ]
      },
      {
        test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: 'url-loader?limit=10000',
      },
      {
        test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
        use: 'file-loader',
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          'file-loader?name=images/[name].[ext]',
          'image-webpack-loader?bypassOnDebug'
        ]
      },
      { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.tsx', '.ts', '.css'],
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new CopyWebpackPlugin([
      {
        from: NODE_ENV === 'development' ? 'secret/manifest-dev.json' : 'secret/manifest-prod.json',
        to: 'manifest.json'
      },
      { from: 'src/assets/favicon.ico', to: 'favicon.ico' },
      { from: 'src/assets/icon.png', to: 'icon.png' },
      { from: 'secret/analytics.js', to: 'analytics.js' }
    ]),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.EnvironmentPlugin({
      GOOGLE_API_KEY: keys.GOOGLE_API_KEY
    }),
    MainHtmlWebpackPluginConfig,
    OptionsHtmlWebpackPluginConfig
  ]
};

// TODO: prod build -> version increment -> zip
