import React from 'react'
import {useBitThemeContext} from '../../bit-theme-wrapper/index'
import {Icons} from '../../icon/index'
import {Tooltip, TooltipProp} from '../../tooltip/index'
import {Typography, TypographyVariants} from '../../typography/index'
import {TagsStatusTypes} from './constants'
import {
  stylesDarkTheme,
  typographyDarkStyles
} from './styles/tagStatusDarkThemeStyles'
import {
  stylesLightTheme,
  typographyLightStyles
} from './styles/tagStatusLightThemeStyles'

interface ToolProp extends Omit<TooltipProp, 'children'> {
  children?: React.ReactNode
}
export type TagsStatusProps = {
  /**
   * To set the status along with message. Options are : information , active , default and Paused only
   */
  status: TagsStatusTypes
  /**
   * To render the text
   */
  text?: String
  /**
   * To render text
   */
  hasTooltipWrapper?: boolean
  /**
   * To render text
   */
  tooltipProps?: ToolProp
  /**
   * To change theme
   */
  theme?: string
}

const darkTheme = stylesDarkTheme()
const lightTheme = stylesLightTheme()

export function TagsStatus({
  status,
  text,
  tooltipProps,
  hasTooltipWrapper
}: TagsStatusProps) {
  const darkClasses = darkTheme()
  const lightClasses = lightTheme()
  const {theme} = useBitThemeContext()
  const classes = theme === 'dark' ? darkClasses : lightClasses
  const typographyStyles =
    theme === 'dark' ? typographyDarkStyles() : typographyLightStyles()
  const defaultProps: ToolProp = {
    title: '',
    children: <></>
  }
  let toolProps = defaultProps
  if (hasTooltipWrapper && tooltipProps) toolProps = tooltipProps
  const tagStatus = (
    <div className={`${classes.tagsStatus} ${status}`}>
      <span
        className={`${classes.icons} ${Icons.ICON_ACTIVE} ${status}`}
      ></span>
      {typographyStyles && (
        <Typography
          theme={theme}
          className={`${status}`}
          sx={typographyStyles}
          variant={TypographyVariants.BodyMedium}
        >
          {text ? text : status}
        </Typography>
      )}
    </div>
  )
  return hasTooltipWrapper ? (
    <Tooltip theme={theme} {...toolProps}>
      {tagStatus}
    </Tooltip>
  ) : (
    tagStatus
  )
}
TagsStatus.defaultProps = {
  theme: 'dark'
}
