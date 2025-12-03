import {AvatarVariants} from '../../avatar/index'

import React from 'react'
import {useBitThemeContext} from '../../bit-theme-wrapper/index'
import {Tooltip, ToolTipPlacement} from '../../tooltip/index'
import {TableCellSize, TcCell} from '../tc-cell/index'
import {TcAvatarsType} from './constants'
import tcAvatarDarkThemeStyles from './styles/darkThemeStyles'
import tcAvatarLightThemeStyles from './styles/lightThemeStyles'
import {AvatarProps, ChipProps, TableCell, TagsProps} from './tc-avatars.config'

export type TcAvatarsProps = {
  /**
   * whether a chip | tag | avatar
   */
  type: TcAvatarsType
  /**
   * Data to be shown
   */
  data: Array<object>
  /**
   * Object keyName if T is an object
   */
  displayKey?: string
  /**
   * Object srcKeyName if T is an object
   */
  srcKey?: string
  /**
   * Size of the cell
   */
  size?: TableCellSize
  /**
   * Tooltip Placement
   */
  placement?: ToolTipPlacement
  /**
   * Total elements to show before the extras
   */
  totalElements?: number
  /**
   * Component Props for inner elements
   */
  variant?: AvatarVariants
  /**
   * Component Props for inner elements (optional)
   */
  componentProps?: AvatarProps | TagsProps | ChipProps
  /**
   * To change theme
   */
  theme?: string
}

export const TcAvatars = ({
  size,
  type,
  data,
  displayKey,
  placement,
  totalElements,
  srcKey,
  variant,
  componentProps
}: TcAvatarsProps) => {
  const darkClasses = tcAvatarDarkThemeStyles()
  const lightClasses = tcAvatarLightThemeStyles()
  const {theme} = useBitThemeContext()
  const classes = theme === 'dark' ? darkClasses : lightClasses

  const displayData = displayKey ? data.map((item) => item[displayKey]) : data
  const disData = data.slice(totalElements)
  const getTitle = () => {
    return (
      !!displayKey ? disData.map((item) => item[displayKey]) : disData
    ).join(', ')
  }
  return (
    <TcCell theme={theme} size={size}>
      <div className={classes.container}>
        {displayData.slice(0, totalElements).map((item, index) => (
          <TableCell
            theme={theme}
            item={item}
            key={item}
            size={size ?? TableCellSize.Medium}
            type={type}
            src={srcKey ? data[index][srcKey] : ''}
            variant={variant}
            componentProps={componentProps}
          />
        ))}
        {totalElements && displayData.length > totalElements && (
          <Tooltip title={getTitle()} placement={placement}>
            <div data-testid='extras' className={classes.extras}>
              <span className={classes.add}>+</span>
              <span>{disData.length}</span>
            </div>
          </Tooltip>
        )}
      </div>
    </TcCell>
  )
}
TcAvatars.defaultProps = {
  size: TableCellSize.Medium,
  placement: ToolTipPlacement.Top,
  totalElements: 3,
  theme: 'dark'
}
