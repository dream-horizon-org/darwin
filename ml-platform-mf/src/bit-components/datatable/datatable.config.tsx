import React from 'react'
import {Checkbox, CheckboxProps} from '../checkbox/index'
import {TcAvatars, TcAvatarsProps} from '../table-cells/tc-avatars/index'
import {
  TcBannerImage,
  TcBannerImageProps
} from '../table-cells/tc-banner-image/index'
import {TcButton, TcButtonProps} from '../table-cells/tc-button/index'
import {TableCellSize, TcCell} from '../table-cells/tc-cell/index'
import {
  TcDataHeading,
  TcDataHeadingProps
} from '../table-cells/tc-data-heading/index'
import {TcData, TcDataProps} from '../table-cells/tc-data/index'
import {
  TcIconButton,
  TcIconButtonProps
} from '../table-cells/tc-icon-button/index'
import {TcIconList, TcIconListProps} from '../table-cells/tc-icon-list/index'
import {TcIcon, TcIconProps} from '../table-cells/tc-icon/index'
import {TcInput, TcInputProps} from '../table-cells/tc-input/index'
import {
  TcProgressCircle,
  TcProgressCircleProps
} from '../table-cells/tc-progress-circle/index'
import {TcRadio, TcRadioProps} from '../table-cells/tc-radio/index'
import {
  TcShellLoading,
  TcShellLoadingProps
} from '../table-cells/tc-shell-loading/index'
import {
  TcTagsCounter,
  TcTagsCounterProps
} from '../table-cells/tc-tags-counter/index'
import {
  TcTagsStatus,
  TcTagsStatusProps
} from '../table-cells/tc-tags-status/index'
import {TcTags, TcTagsProps} from '../table-cells/tc-tags/index'
import {TcTextlink, TcTextlinkProps} from '../table-cells/tc-textlink/index'
import {TcTimer, TcTimerProps} from '../table-cells/tc-timer/index'
import {
  TcToggleButton,
  TcToggleButtonProps
} from '../table-cells/tc-toggle-button/index'
import {TableCells} from './constants'
import {TcCustomJSXProps} from './datatable.type'

export type TableCellProps = {
  tableCell: TableCells
  onIconListElementClick?: (event, elementIndex) => void
  onIconButtonClick?: (event) => void
  size: TableCellSize
  theme?: string
  componentProps:
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
    | TcTextlinkProps
    | TcIconListProps
    | TcAvatarsProps
    | TcIconButtonProps
    | TcTimerProps
    | TcShellLoadingProps
    | TcDataHeadingProps
    | CheckboxProps
    | TcCustomJSXProps
    | TcRadioProps
}

export const TableCell = (props: TableCellProps) => {
  const {
    tableCell,
    size,
    componentProps,
    onIconListElementClick,
    onIconButtonClick,
    theme
  } = props
  switch (tableCell) {
    case TableCells.TcDataHeading: {
      const tcDataHeadingProps = componentProps as TcDataHeadingProps
      return <TcDataHeading theme={theme} size={size} {...tcDataHeadingProps} />
    }
    case TableCells.TcTags: {
      const tcTagsProps = componentProps as TcTagsProps
      return <TcTags theme={theme} size={size} {...tcTagsProps} />
    }
    case TableCells.TcData: {
      const tcDataProps = componentProps as TcDataProps
      return <TcData theme={theme} size={size} {...tcDataProps} />
    }
    case TableCells.TcInput: {
      const tcInputProps = componentProps as TcInputProps
      return <TcInput theme={theme} size={size} {...tcInputProps} />
    }
    case TableCells.TcButton: {
      const tcButtonProps = componentProps as TcButtonProps
      return <TcButton theme={theme} size={size} {...tcButtonProps} />
    }
    case TableCells.TcProgressCircle: {
      const tcProgressCircleProps = componentProps as TcProgressCircleProps
      return <TcProgressCircle theme={theme} {...tcProgressCircleProps} />
    }
    case TableCells.TcToggleButton: {
      const tcToggleButtonProps = componentProps as TcToggleButtonProps
      return (
        <TcToggleButton theme={theme} size={size} {...tcToggleButtonProps} />
      )
    }
    case TableCells.TcBannerImage: {
      const tcBannerImageProps = componentProps as TcBannerImageProps
      return <TcBannerImage theme={theme} {...tcBannerImageProps} />
    }
    case TableCells.TcIcon: {
      const tcIconProps = componentProps as TcIconProps
      return <TcIcon theme={theme} {...tcIconProps} />
    }
    case TableCells.TcIconList: {
      const tcIconListProps = componentProps as TcIconListProps
      return (
        <TcIconList
          theme={theme}
          onClick={onIconListElementClick}
          {...tcIconListProps}
        />
      )
    }
    case TableCells.TcAvatars: {
      const tcAvatarProps = componentProps as TcAvatarsProps
      return <TcAvatars theme={theme} {...tcAvatarProps} />
    }
    case TableCells.TcTagsCounter: {
      const tcTagsCounterProps = componentProps as TcTagsCounterProps
      return <TcTagsCounter theme={theme} {...tcTagsCounterProps} />
    }
    case TableCells.TcTextlink: {
      const tcTextlinkProps = componentProps as TcTextlinkProps
      return <TcTextlink theme={theme} {...tcTextlinkProps} />
    }
    case TableCells.TcTagsStatus: {
      const tcTagsStatusProps = componentProps as TcTagsStatusProps
      return <TcTagsStatus theme={theme} {...tcTagsStatusProps} />
    }
    case TableCells.TcIconButton: {
      const tcIconButtonProps = componentProps as TcIconButtonProps
      return (
        <TcIconButton
          theme={theme}
          onClick={onIconButtonClick}
          {...tcIconButtonProps}
        />
      )
    }
    case TableCells.TcTimer: {
      const tcTimerProps = componentProps as TcTimerProps
      return <TcTimer theme={theme} {...tcTimerProps} />
    }
    case TableCells.TcShellLoading: {
      const tcShellLoadingProps = componentProps as TcShellLoadingProps
      return <TcShellLoading theme={theme} {...tcShellLoadingProps} />
    }
    case TableCells.TcCheckbox: {
      const tcCheckboxProps = componentProps as CheckboxProps
      return (
        <TcCell>
          <Checkbox theme={theme} {...tcCheckboxProps} />
        </TcCell>
      )
    }
    case TableCells.TcRadio: {
      const tcRadioProps = componentProps as TcRadioProps
      return <TcRadio theme={theme} {...tcRadioProps} />
    }
    case TableCells.TcCustomJSX: {
      const {jsx} = componentProps as TcCustomJSXProps
      return <TcCell>{jsx}</TcCell>
    }
    default:
      return <></>
  }
}
