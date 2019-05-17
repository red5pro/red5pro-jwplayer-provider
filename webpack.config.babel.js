import path from 'path'
export default {

  entry: path.join(__dirname, 'red5pro-jwplayer-provider.js'),
  output: {
    path: path.join(__dirname, 'demo', 'script'),
    filename: 'red5pro-jwplayer-provider.bundle.js'
  },
  module: {
    rules: [{
      test: /\.js/,
      exclude: /(node_modules|bower_components)/,
      use: [{
        loader: 'babel-loader'
      }]
    }]
  },
  stats: {
    colors: true
  },
  devtool: 'source-map',
  mode: 'development',
  devServer: {
    contentBase: './demo',
    inline: true,
    port: 3000
  }
}

