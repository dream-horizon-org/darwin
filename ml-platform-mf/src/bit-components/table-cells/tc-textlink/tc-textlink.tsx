import React from 'react'
import {useBitThemeContext} from '../../bit-theme-wrapper/index'
import {
  ActionableIconButtonSizes,
  ActionableIconButtonVariants,
  IconButton
} from '../../icon-button/index'
import {Icons} from '../../icon/index'
import {TextLink, TextLinkSizes, TextLinkVarinats} from '../../text-link/index'
import {
  TableCellAlignment,
  TableCellSeverity,
  TableCellSize,
  TcCell
} from '../tc-cell/index'
import darkThemeStyles from './styles/darkThemeStyles'
import lightThemeStyles from './styles/lightThemeStyles'
export type TcTextlinkProps = {
  /**
   * To set the size of TableCell.
   */
  size?: TableCellSize
  /**
   * To set the severity of TableCell.
   */
  severity?: TableCellSeverity
  /**
   * To render the text inside the tc-textlink.
   */
  text: string
  /**
   * Link address to be provided.
   */
  href?: string
  /**
   * Select children alingment
   */
  align?: TableCellAlignment
  /**
   * Need to be provied to render icon .
   */
  leadingIcon?: Icons
  /**
   * onClick function for actionable icon.
   */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
  /**
   * If true, the component is disabled.
   */
  disabled?: boolean
  /**
   *
   */
  variant?: TextLinkVarinats
  /**
   *
   */
  addCursor?: boolean
  /**
   *
   */
  removeHover?: boolean
  /**
   * Sticky position for the cell
   */
  stickyPosition?: 'left' | 'right'
  /**
   * To change theme
   */
  theme?: string
  /**
   * To remove minWidth
   */
  noMinWidth?: boolean
}
export const TcTextlink = (props: TcTextlinkProps) => {
  const {
    size,
    text,
    severity,
    align,
    onClick,
    leadingIcon,
    addCursor,
    removeHover,
    variant,
    stickyPosition,
    noMinWidth
  } = props

  const darkClasses = darkThemeStyles()
  const lightClasses = lightThemeStyles()
  const {theme} = useBitThemeContext()
  const classes = theme === 'dark' ? darkClasses : lightClasses

  return (
    <TcCell
      theme={theme}
      size={size}
      severity={severity}
      stickyPosition={stickyPosition}
      align={leadingIcon ? TableCellAlignment.Left : align}
      noMinWidth={noMinWidth}
    >
      <div className={classes.container} onClick={onClick}>
        {leadingIcon && (
          <div className={classes.icon}>
            <IconButton
              theme={theme}
              leadingIcon={leadingIcon}
              actionableVariants={
                ActionableIconButtonVariants.ACTIONABLE_PRIMARY
              }
              actionable={true}
              actionableSizes={ActionableIconButtonSizes.MEDIUM}
            />
          </div>
        )}
        <TextLink
          theme={theme}
          addCursor={addCursor}
          removeHover={removeHover}
          variant={variant}
          size={TextLinkSizes.Large}
          icon={false}
          text={text}
          href={props?.href}
          disabled={props?.disabled}
        />
      </div>
    </TcCell>
  )
}
TcTextlink.defaultProps = {
  align: TableCellAlignment.Left,
  theme: 'dark'
}
