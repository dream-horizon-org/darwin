import {TableCell} from '@mui/material'
import React, {ReactNode} from 'react'
import {useBitThemeContext} from '../../bit-theme-wrapper/index'
import {
  TableCellAlignment,
  TableCellSeverity,
  TableCellSize,
  TableCellType
} from './constants'
import darkThemeStyles, {
  tableCellDarkThemeStyle
} from './styles/darkThemeStyles'
import lightThemeStyles, {
  tableCellLightThemeStyle
} from './styles/lightThemeStyles'
export type TcCellProps = {
  /**
   * a node to be rendered in the special component.
   */
  children?: ReactNode
  /**
   * Select size of data-cell
   */
  size?: TableCellSize
  /**
   * Select severity of data-cell
   */
  severity?: TableCellSeverity
  /**
   * Select type of data-cell
   */
  type?: TableCellType
  /**
   * Select children alingment
   */
  align?: TableCellAlignment
  /**
   * Sticky position for the cell
   */
  stickyPosition?: 'left' | 'right'
  /**
   * To check if it is loading
   */
  loading?: boolean
  /**
   * To change theme
   */
  theme?: string
  /**
   * To remove minWidth
   */
  noMinWidth?: boolean
  /**
   * On mouse out event
   */
  onMouseLeave?: (e) => void
  /**
   *  On mouse enter event
   */
  onMouseOver?: (e) => void
}

export function TcCell({
  children,
  size,
  severity,
  type,
  align,
  stickyPosition,
  loading,
  noMinWidth,
  onMouseLeave,
  onMouseOver
}: TcCellProps) {
  const darkClasses = darkThemeStyles()
  const lightClasses = lightThemeStyles()
  const {theme} = useBitThemeContext()
  const classes = theme === 'dark' ? darkClasses : lightClasses
  const getStickyClassName = () => {
    if (!!stickyPosition) {
      if (stickyPosition === 'left') return classes.stickyLeftTableCell
      else return classes.stickyRightTableCell
    }
    return ''
  }
  return (
    <TableCell
      onMouseLeave={(e) => {
        if (onMouseLeave) onMouseLeave(e)
      }}
      onMouseOver={(e) => {
        if (onMouseOver) onMouseOver(e)
      }}
      sx={theme === 'dark' ? tableCellDarkThemeStyle : tableCellLightThemeStyle}
      data-testid='data-cell'
      className={`${getStickyClassName()} ${
        classes.tcCells
      } ${size} ${severity} ${type} ${align} ${noMinWidth ? 'noMinWidth' : ''}`}
    >
      <div
        className={`${
          loading ? classes.loadingContainer : classes.container
        } ${align}`}
      >
        {children}
      </div>
    </TableCell>
  )
}
TcCell.defaultProps = {
  size: TableCellSize.Small,
  severity: TableCellSeverity.Default,
  loading: false,
  theme: 'dark'
}
