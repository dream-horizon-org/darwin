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
exports.TableCell = void 0;
var react_1 = __importDefault(require("react"));
var index_1 = require("../checkbox/index");
var index_2 = require("../table-cells/tc-avatars/index");
var index_3 = require("../table-cells/tc-banner-image/index");
var index_4 = require("../table-cells/tc-button/index");
var index_5 = require("../table-cells/tc-cell/index");
var index_6 = require("../table-cells/tc-data-heading/index");
var index_7 = require("../table-cells/tc-data/index");
var index_8 = require("../table-cells/tc-icon-button/index");
var index_9 = require("../table-cells/tc-icon-list/index");
var index_10 = require("../table-cells/tc-icon/index");
var index_11 = require("../table-cells/tc-input/index");
var index_12 = require("../table-cells/tc-progress-circle/index");
var index_13 = require("../table-cells/tc-radio/index");
var index_14 = require("../table-cells/tc-shell-loading/index");
var index_15 = require("../table-cells/tc-tags-counter/index");
var index_16 = require("../table-cells/tc-tags-status/index");
var index_17 = require("../table-cells/tc-tags/index");
var index_18 = require("../table-cells/tc-textlink/index");
var index_19 = require("../table-cells/tc-timer/index");
var index_20 = require("../table-cells/tc-toggle-button/index");
var constants_1 = require("./constants");
var TableCell = function (props) {
    var tableCell = props.tableCell, size = props.size, componentProps = props.componentProps, onIconListElementClick = props.onIconListElementClick, onIconButtonClick = props.onIconButtonClick, theme = props.theme;
    switch (tableCell) {
        case constants_1.TableCells.TcDataHeading: {
            var tcDataHeadingProps = componentProps;
            return react_1.default.createElement(index_6.TcDataHeading, __assign({ theme: theme, size: size }, tcDataHeadingProps));
        }
        case constants_1.TableCells.TcTags: {
            var tcTagsProps = componentProps;
            return react_1.default.createElement(index_17.TcTags, __assign({ theme: theme, size: size }, tcTagsProps));
        }
        case constants_1.TableCells.TcData: {
            var tcDataProps = componentProps;
            return react_1.default.createElement(index_7.TcData, __assign({ theme: theme, size: size }, tcDataProps));
        }
        case constants_1.TableCells.TcInput: {
            var tcInputProps = componentProps;
            return react_1.default.createElement(index_11.TcInput, __assign({ theme: theme, size: size }, tcInputProps));
        }
        case constants_1.TableCells.TcButton: {
            var tcButtonProps = componentProps;
            return react_1.default.createElement(index_4.TcButton, __assign({ theme: theme, size: size }, tcButtonProps));
        }
        case constants_1.TableCells.TcProgressCircle: {
            var tcProgressCircleProps = componentProps;
            return react_1.default.createElement(index_12.TcProgressCircle, __assign({ theme: theme }, tcProgressCircleProps));
        }
        case constants_1.TableCells.TcToggleButton: {
            var tcToggleButtonProps = componentProps;
            return (react_1.default.createElement(index_20.TcToggleButton, __assign({ theme: theme, size: size }, tcToggleButtonProps)));
        }
        case constants_1.TableCells.TcBannerImage: {
            var tcBannerImageProps = componentProps;
            return react_1.default.createElement(index_3.TcBannerImage, __assign({ theme: theme }, tcBannerImageProps));
        }
        case constants_1.TableCells.TcIcon: {
            var tcIconProps = componentProps;
            return react_1.default.createElement(index_10.TcIcon, __assign({ theme: theme }, tcIconProps));
        }
        case constants_1.TableCells.TcIconList: {
            var tcIconListProps = componentProps;
            return (react_1.default.createElement(index_9.TcIconList, __assign({ theme: theme, onClick: onIconListElementClick }, tcIconListProps)));
        }
        case constants_1.TableCells.TcAvatars: {
            var tcAvatarProps = componentProps;
            return react_1.default.createElement(index_2.TcAvatars, __assign({ theme: theme }, tcAvatarProps));
        }
        case constants_1.TableCells.TcTagsCounter: {
            var tcTagsCounterProps = componentProps;
            return react_1.default.createElement(index_15.TcTagsCounter, __assign({ theme: theme }, tcTagsCounterProps));
        }
        case constants_1.TableCells.TcTextlink: {
            var tcTextlinkProps = componentProps;
            return react_1.default.createElement(index_18.TcTextlink, __assign({ theme: theme }, tcTextlinkProps));
        }
        case constants_1.TableCells.TcTagsStatus: {
            var tcTagsStatusProps = componentProps;
            return react_1.default.createElement(index_16.TcTagsStatus, __assign({ theme: theme }, tcTagsStatusProps));
        }
        case constants_1.TableCells.TcIconButton: {
            var tcIconButtonProps = componentProps;
            return (react_1.default.createElement(index_8.TcIconButton, __assign({ theme: theme, onClick: onIconButtonClick }, tcIconButtonProps)));
        }
        case constants_1.TableCells.TcTimer: {
            var tcTimerProps = componentProps;
            return react_1.default.createElement(index_19.TcTimer, __assign({ theme: theme }, tcTimerProps));
        }
        case constants_1.TableCells.TcShellLoading: {
            var tcShellLoadingProps = componentProps;
            return react_1.default.createElement(index_14.TcShellLoading, __assign({ theme: theme }, tcShellLoadingProps));
        }
        case constants_1.TableCells.TcCheckbox: {
            var tcCheckboxProps = componentProps;
            return (react_1.default.createElement(index_5.TcCell, null,
                react_1.default.createElement(index_1.Checkbox, __assign({ theme: theme }, tcCheckboxProps))));
        }
        case constants_1.TableCells.TcRadio: {
            var tcRadioProps = componentProps;
            return react_1.default.createElement(index_13.TcRadio, __assign({ theme: theme }, tcRadioProps));
        }
        case constants_1.TableCells.TcCustomJSX: {
            var jsx = componentProps.jsx;
            return react_1.default.createElement(index_5.TcCell, null, jsx);
        }
        default:
            return react_1.default.createElement(react_1.default.Fragment, null);
    }
};
exports.TableCell = TableCell;
