import AssetsPlugin from 'assets-webpack-plugin'
import config from 'config'
import fs from 'fs'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import path from 'path'
import {headTagHtml} from './src/head-tag'
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

fs.writeFileSync(
  path.resolve(__dirname, 'config/config.json'),
  JSON.stringify(config)
)

const getTimeStamp = () => {
  return Date.now()
}

const webpackConfig = {
  entry: './src/bootstrap.tsx',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: `[chunkhash].bundle.js`,
    chunkFilename: `[chunkhash].js`,
    publicPath: `/mlplatform/`
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.json', '.ts', '.tsx', '.jsx', '.js', '.wasm'],
    alias: {
      config: path.resolve(__dirname, 'config/config.json')
    }
  },
  stats: {
    colors: true,
    reasons: true,
    chunks: false
  },
  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true
        }
      },
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false
        }
      },
      {
        test: /\.css?$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'svg-url-loader',
            options: {
              limit: 10000
            }
          }
        ]
      },
      {
        test: /\.wasm$/,
        type: 'javascript/auto'
      }
    ]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          test(mod /* , chunk */) {
            // Only node_modules are needed
            if (!mod.context || !mod.context.includes('node_modules')) {
              return false
            }
            // But not node modules that contain these key words in the path
            return ![
              'react-select',
              'emoji-picker-react',
              'mobile-drag-drop',
              'pickers'
            ].some((str) => mod.context.includes(str))
          },
          name: 'vendors~main',
          chunks: 'all'
        }
      }
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Custom template',
      // Load a custom template (lodash by default)
      headTags: headTagHtml,
      template: 'src/template.html'
    }),
    new AssetsPlugin({
      filename: '/asset-manifest.json',
      path: path.join(__dirname, 'public')
    }),
    new NodePolyfillPlugin()
  ]
}

export default webpackConfig
