import BrotliGzipPlugin from 'brotli-webpack-plugin'
import webpackConfig from './webpack.config'
const prodConfig = {
  devtool: false,
  plugins: [
    ...webpackConfig.plugins,
    new BrotliGzipPlugin({
      asset: '[file]',
      algorithm: 'brotli',
      test: /\.(js|css|svg|html)$/,
      minRatio: 0.8,
      deleteOriginalAssets: true
    })
  ]
}
const webpackProdConfig = Object.assign({}, webpackConfig, prodConfig)
export default webpackProdConfig
