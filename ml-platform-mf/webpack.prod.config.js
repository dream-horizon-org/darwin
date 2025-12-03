"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var brotli_webpack_plugin_1 = __importDefault(require("brotli-webpack-plugin"));
var webpack_config_1 = __importDefault(require("./webpack.config"));
var prodConfig = {
    devtool: false,
    plugins: __spreadArray(__spreadArray([], __read(webpack_config_1.default.plugins), false), [
        new brotli_webpack_plugin_1.default({
            asset: '[file]',
            algorithm: 'brotli',
            test: /\.(js|css|svg|html)$/,
            minRatio: 0.8,
            deleteOriginalAssets: true
        })
    ], false)
};
var webpackProdConfig = Object.assign({}, webpack_config_1.default, prodConfig);
exports.default = webpackProdConfig;
