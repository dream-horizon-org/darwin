"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var assets_webpack_plugin_1 = __importDefault(require("assets-webpack-plugin"));
var config_1 = __importDefault(require("config"));
var fs_1 = __importDefault(require("fs"));
var html_webpack_plugin_1 = __importDefault(require("html-webpack-plugin"));
var path_1 = __importDefault(require("path"));
var head_tag_1 = require("./src/head-tag");
var NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
fs_1.default.writeFileSync(path_1.default.resolve(__dirname, 'config/config.json'), JSON.stringify(config_1.default));
var getTimeStamp = function () {
    return Date.now();
};
var webpackConfig = {
    entry: './src/bootstrap.tsx',
    output: {
        path: path_1.default.resolve(__dirname, 'public'),
        filename: "[chunkhash].bundle.js",
        chunkFilename: "[chunkhash].js",
        publicPath: "/mlplatform/"
    },
    devtool: 'source-map',
    resolve: {
        extensions: ['.json', '.ts', '.tsx', '.jsx', '.js', '.wasm'],
        alias: {
            config: path_1.default.resolve(__dirname, 'config/config.json')
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
                    test: function (mod /* , chunk */) {
                        // Only node_modules are needed
                        if (!mod.context || !mod.context.includes('node_modules')) {
                            return false;
                        }
                        // But not node modules that contain these key words in the path
                        return ![
                            'react-select',
                            'emoji-picker-react',
                            'mobile-drag-drop',
                            'pickers'
                        ].some(function (str) { return mod.context.includes(str); });
                    },
                    name: 'vendors~main',
                    chunks: 'all'
                }
            }
        }
    },
    plugins: [
        new html_webpack_plugin_1.default({
            title: 'Custom template',
            // Load a custom template (lodash by default)
            headTags: head_tag_1.headTagHtml,
            template: 'src/template.html'
        }),
        new assets_webpack_plugin_1.default({
            filename: '/asset-manifest.json',
            path: path_1.default.join(__dirname, 'public')
        }),
        new NodePolyfillPlugin()
    ]
};
exports.default = webpackConfig;
