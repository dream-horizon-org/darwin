import {TcBannerImageProps} from '../table-cells/tc-banner-image/index'
import {TcButtonProps} from '../table-cells/tc-button/index'
import {TcDataProps} from '../table-cells/tc-data/index'
import {TcIconProps} from '../table-cells/tc-icon/index'
import {TcInputProps} from '../table-cells/tc-input/index'
import {TcProgressCircleProps} from '../table-cells/tc-progress-circle/index'
import {TcTagsCounterProps} from '../table-cells/tc-tags-counter/index'
import {TcTagsStatusProps} from '../table-cells/tc-tags-status/index'
import {TcTagsProps} from '../table-cells/tc-tags/index'
import {TcTextlinkProps} from '../table-cells/tc-textlink/index'
import {TcToggleButtonProps} from '../table-cells/tc-toggle-button/index'

import {CheckboxProps} from '../checkbox/index'
import {Icons} from '../icon/index'
import {TcAvatarsProps} from '../table-cells/tc-avatars/index'
import {TableCellAlignment} from '../table-cells/tc-cell/index'
import {TcDataHeadingProps} from '../table-cells/tc-data-heading/index'
import {TcIconButtonProps} from '../table-cells/tc-icon-button/index'
import {TcIconListProps} from '../table-cells/tc-icon-list/index'
import {TcShellLoadingProps} from '../table-cells/tc-shell-loading/index'
import {TcTimerProps} from '../table-cells/tc-timer/index'
import {TagsType} from '../tags/tags/index'
import {TableCells} from './constants'

export type TcCustomJSXProps = {
  jsx: JSX.Element
}
export type ColumnConfig<T> = {
  id: number
  columnType: TableCells
  componentProps: (
    item: T
  ) =>
    | TcTagsProps
    | TcDataProps
    | TcButtonProps
    | TcToggleButtonProps
    | TcBannerImageProps
    | TcProgressCircleProps
    | TcTagsCounterProps
    | TcTagsStatusProps
    | TcInputProps
    | TcIconProps
    | TcIconListProps
    | TcAvatarsProps
    | TcTextlinkProps
    | TcIconButtonProps
    | TcTimerProps
    | TcShellLoadingProps
    | TcDataHeadingProps
    | CheckboxProps
    | TcCustomJSXProps
  headerProps?: {
    headerTag?: string | number
    headerLabel?: string | number
    headerTagType?: TagsType
    align?: TableCellAlignment
    trailingToolTipIcon?: Icons
    trailingToolTipText?: string
    colSpan?: number
  }
  parentHeaderProps?: {
    headerLabel?: string | number
    align?: TableCellAlignment
    trailingIcon?: Icons
    colSpan?: number
    headerTag?: string | number
  }
  stickyPosition?: 'left' | 'right'
}
