import {TableCell, TableSortLabel} from '@mui/material'
import React from 'react'
import {createSortHandler, SortOrder} from '../../datatable/index'
import {Icons} from '../../icon/index'

export type TcHeaderProps = {
  orderBy?: (string | number)[] | string
  order?: SortOrder
  activeSortColId?: string | number
  headerProps?: {
    headerLabel?: string | number
    headerTag?: string | number
    headerTagType?: TagsType
    align?: TableCellAlignment
    trailingToolTipIcon?: Icons
    colSpan?: number
    trailingToolTipText?: string
  }
  stickyPosition?: 'left' | 'right'
  onRequestSort?: (id: unknown, columnName: string, order: string) => void
  isParentHeader?: boolean
  isChildHeader?: boolean
  theme?: string
}
import {useBitThemeContext} from '../../bit-theme-wrapper/index'
import {Tags, TagsSizes, TagsType} from '../../tags/tags/index'
import {Tooltip, ToolTipPlacement} from '../../tooltip/index'
import {Typography, TypographyVariants} from '../../typography/index'
import {TableCellAlignment} from '../tc-cell/index'
import darkThemeStyles, {
  tableCellDarkThemeStyle
} from './styles/darkThemeStyles'
import lightThemeStyles, {
  tableCellLightThemeStyle
} from './styles/lightThemeStyles'
export function TcHeader({
  headerProps,
  onRequestSort,
  order,
  orderBy,
  activeSortColId,
  stickyPosition,
  isParentHeader,
  isChildHeader
}: TcHeaderProps) {
  const darkClasses = darkThemeStyles()
  const lightClasses = lightThemeStyles()
  const {theme} = useBitThemeContext()
  const classes = theme === 'dark' ? darkClasses : lightClasses
  const headerLabel = headerProps?.headerLabel ?? ''
  const align = headerProps?.align ?? TableCellAlignment.Left
  const trailingToolTipIcon = headerProps?.trailingToolTipIcon ?? ''
  const trailingToolTipText = headerProps?.trailingToolTipText ?? ''
  const columnId = headerLabel ?? ''
  const colSpan = headerProps?.colSpan ?? 1
  const headerTag = headerProps?.headerTag ?? ''
  const headerTagType = headerProps?.headerTagType ?? TagsType.Header

  const getSortDirection = () => {
    if (Array.isArray(orderBy)) {
      return orderBy?.includes(columnId) ? order : false
    } else {
      return orderBy === columnId ? order : false
    }
  }
  return (
    <TableCell
      sx={theme === 'dark' ? tableCellDarkThemeStyle : tableCellLightThemeStyle}
      className={`${classes.tcHeader} ${
        isParentHeader ? classes.tcParentHeader : ''
      } ${
        !!stickyPosition
          ? stickyPosition === 'left'
            ? classes.stickyLeftTableHeader
            : classes.stickyRightTableHeader
          : ''
      } ${isChildHeader ? classes.tcChildHeader : ''}`}
      sortDirection={getSortDirection()}
      align={align}
      colSpan={colSpan}
    >
      {(
        Array.isArray(orderBy)
          ? orderBy?.includes(columnId)
          : orderBy === columnId
      ) ? (
        <TableSortLabel
          active={
            Array.isArray(orderBy)
              ? activeSortColId === columnId
              : orderBy === columnId
          }
          direction={
            Array.isArray(orderBy)
              ? activeSortColId === columnId
                ? order
                : SortOrder.ASC
              : orderBy === columnId
              ? order
              : SortOrder.ASC
          }
          onClick={createSortHandler(columnId, order, onRequestSort)}
        >
          <Typography
            theme={theme}
            className={`${classes.headerText}`}
            variant={TypographyVariants.BodyMedium}
          >
            {headerLabel}
          </Typography>
        </TableSortLabel>
      ) : (
        <>
          <Typography
            theme={theme}
            className={`${headerTag !== '' ? classes.tcHeaderTag : ''} ${
              classes.trailingToolTip
            } ${classes.headerText}`}
            variant={TypographyVariants.BodyMedium}
          >
            {headerLabel}
            {trailingToolTipIcon && (
              <Tooltip
                theme={theme}
                title={trailingToolTipText}
                placement={ToolTipPlacement.Bottom}
              >
                <span
                  className={`${classes.icon} ${trailingToolTipIcon} trailing`}
                ></span>
              </Tooltip>
            )}
            {headerTag && (
              <Tags
                theme={theme}
                size={TagsSizes.Medium}
                type={headerTagType}
                label={'' + headerTag}
              />
            )}
          </Typography>
        </>
      )}
    </TableCell>
  )
}
TcHeader.defaultProps = {
  isParentHeader: false,
  isChildHeader: false,
  theme: 'dark'
}
