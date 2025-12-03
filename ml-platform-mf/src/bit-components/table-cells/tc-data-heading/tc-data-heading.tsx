import Avatar from '@mui/material/Avatar'
import React from 'react'
import {useBitThemeContext} from '../../bit-theme-wrapper/index'
import {Icons} from '../../icon/index'
import {
  TableCellAlignment,
  TableCellSeverity,
  TableCellSize,
  TcCell,
  TcCellProps
} from '../tc-cell/index'
import darkThemeStyles from './styles/darkThemeStyles'
import lightThemeStyles from './styles/lightThemeStyles'

export type TcDataHeadingProps = TcCellProps & {
  /**
   * To render the primaryText inside the TableCell.
   */
  primaryText: string
  /**
   * To render the secondary inside the TableCell.
   */
  secondaryText?: string
  /**
   * To set the severity of TableCell.
   */
  severity?: TableCellSeverity
  /**
   * Icon placed after the text primaryText.
   */
  primaryTrailingIcon?: Icons
  /**
   * Icon placed after the text secondaryText.
   */
  secondaryTrailingIcon?: Icons
  /**
   * Leading Icon placed before texts.
   */
  leadingIcon?: Icons
  /**
   * Avatar url
   */
  avatarLink?: string
  /**
   * Img url
   */
  imgLink?: string
  /**
   * to change theme
   */
  theme?: string
}

export function TcDataHeading(props: TcDataHeadingProps) {
  const {
    primaryText,
    severity,
    primaryTrailingIcon,
    secondaryTrailingIcon,
    secondaryText,
    avatarLink,
    stickyPosition,
    leadingIcon,
    imgLink
  } = props
  const darkClasses = darkThemeStyles()
  const lightClasses = lightThemeStyles()
  const {theme} = useBitThemeContext()
  const classes = theme === 'dark' ? darkClasses : lightClasses

  return (
    <TcCell
      size={TableCellSize.Large}
      severity={severity}
      align={TableCellAlignment.Left}
      stickyPosition={stickyPosition}
      theme={theme}
    >
      <div
        className={`${classes.container} ${
          imgLink ? classes.spacedElements : ''
        }`}
      >
        {imgLink && (
          <div className={`${classes.icon} ${classes.modifiedSize}`}>
            <img
              className={classes.iconImage}
              src={imgLink}
              alt={primaryText}
            />
          </div>
        )}
        {avatarLink && (
          <Avatar src={avatarLink} className={`${classes.avatar} `} />
        )}
        {leadingIcon && (
          <span className={`${classes.icon} ${leadingIcon} leading`}></span>
        )}
        <div>
          <div className={classes.container}>
            <div className={classes.primaryText}>{primaryText}</div>
            {primaryTrailingIcon && (
              <span
                className={`${classes.icon} ${primaryTrailingIcon} trailing`}
              ></span>
            )}
          </div>
          {secondaryText && (
            <div className={classes.container}>
              <div className={classes.secondaryText}>{secondaryText}</div>
              {secondaryTrailingIcon && (
                <span
                  className={`${classes.icon} ${secondaryTrailingIcon} trailing`}
                ></span>
              )}
            </div>
          )}
        </div>
      </div>
    </TcCell>
  )
}
