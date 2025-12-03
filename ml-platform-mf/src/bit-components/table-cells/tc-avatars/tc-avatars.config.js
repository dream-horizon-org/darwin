"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockData = exports.TableCell = void 0;
var react_1 = __importDefault(require("react"));
var index_1 = require("../../avatar/index");
var index_2 = require("../../chip/index");
var index_3 = require("../../tags/tags/index");
var index_4 = require("../tc-cell/index");
var constants_1 = require("./constants");
function TableCell(_a) {
    var item = _a.item, size = _a.size, type = _a.type, variant = _a.variant, src = _a.src, componentProps = _a.componentProps, theme = _a.theme;
    var getTagSize = function () {
        switch (size) {
            case index_4.TableCellSize.Large:
                return index_3.TagsSizes.Medium;
            case index_4.TableCellSize.Medium:
                return index_3.TagsSizes.Medium;
            case index_4.TableCellSize.Small:
                return index_3.TagsSizes.Small;
            default:
                return index_3.TagsSizes.Medium;
        }
    };
    var getChipSize = function () {
        switch (size) {
            case index_4.TableCellSize.Large:
                return index_2.ChipSizes.Medium;
            case index_4.TableCellSize.Medium:
                return index_2.ChipSizes.Medium;
            case index_4.TableCellSize.Small:
                return index_2.ChipSizes.Small;
            default:
                return index_2.ChipSizes.Medium;
        }
    };
    var getAvatarSize = function () {
        switch (size) {
            case index_4.TableCellSize.Large:
                return index_1.AvatarSizes.LARGE;
            case index_4.TableCellSize.Medium:
                return index_1.AvatarSizes.MEDIUM;
            case index_4.TableCellSize.Small:
                return index_1.AvatarSizes.SMALL;
            default:
                return index_1.AvatarSizes.MEDIUM;
        }
    };
    switch (type) {
        case constants_1.TcAvatarsType.Chips: {
            var chipProps = componentProps;
            return (react_1.default.createElement(index_2.Chip, __assign({ theme: theme }, chipProps, { size: getChipSize(), label: item })));
        }
        case constants_1.TcAvatarsType.Avatars: {
            var avatarProps = componentProps;
            return (react_1.default.createElement(index_1.Avatar, __assign({}, avatarProps, { size: getAvatarSize(), text: item, variant: variant, src: src, theme: theme })));
        }
        default: {
            var tagsProps = componentProps;
            return react_1.default.createElement(index_3.Tags, __assign({}, tagsProps, { size: getTagSize(), label: item }));
        }
    }
}
exports.TableCell = TableCell;
TableCell.defaultProps = {
    theme: 'dark'
};
exports.mockData = [
    {
        id: 1,
        text: 'Harsh Shah',
        src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZXxlbnwwfHwwfHw%3D&w=1000&q=80'
    },
    {
        id: 2,
        text: 'Shah Harsh',
        src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZXxlbnwwfHwwfHw%3D&w=1000&q=80'
    },
    {
        id: 3,
        text: 'Aayush Bhargava',
        src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZXxlbnwwfHwwfHw%3D&w=1000&q=80'
    },
    {
        id: 4,
        text: 'Bhargava Aayush',
        src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZXxlbnwwfHwwfHw%3D&w=1000&q=80'
    },
    {
        id: 5,
        text: 'Kuldeep Singh',
        src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZXxlbnwwfHwwfHw%3D&w=1000&q=80'
    },
    {
        id: 6,
        text: 'Singh Kuldeep',
        src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZXxlbnwwfHwwfHw%3D&w=1000&q=80'
    }
];
