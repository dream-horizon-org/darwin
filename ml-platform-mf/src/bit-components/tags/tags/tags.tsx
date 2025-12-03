import React from 'react'
import {useBitThemeContext} from '../../bit-theme-wrapper/index'
import {Icons} from '../../icon/index'
import {Typography, TypographyVariants} from '../../typography/index'
import {TagsSizes, TagsType} from './constants'
import {
  stylesDarkTheme,
  typographyDarkStyles
} from './styles/tagsDarkThemeStyles'
import {
  stylesLightTheme,
  typographyLightStyles
} from './styles/tagsLightThemeStyles'

// TODO , move these props to types file once bit team resolves this issue
export type TagsProps = {
  /**
   * To set message inside the  tags
   */
  label: string
  /**
   * To set the size of tags. Options are : Small and Medium only
   */
  size?: TagsSizes
  /**
   * To set the types of tags. Options are : valid , invalid , default and neutral only
   */
  type?: TagsType
  /**
   * To set icon inside the tags.
   */
  trailingIcon?: Icons
  /**
   * To set icon inside the tags.
   */
  leadingIcon?: Icons
  /**
   * To change theme
   */
  theme?: string
}

const darkTheme = stylesDarkTheme()
const lightTheme = stylesLightTheme()

export function Tags(props: TagsProps) {
  const {label, size, type, trailingIcon, leadingIcon} = props

  const darkClasses = darkTheme()
  const lightClasses = lightTheme()
  const {theme} = useBitThemeContext()
  const classes = theme === 'dark' ? darkClasses : lightClasses

  const darkTypography = typographyDarkStyles()
  const lightTypography = typographyLightStyles()
  const typographyStyle = theme === 'dark' ? darkTypography : lightTypography

  const renderIcon = (position: Icons) => {
    return (
      <span
        className={`${
          position === trailingIcon ? classes.trailingIcon : classes.leadingIcon
        } ${position}  ${size} icon`}
      ></span>
    )
  }
  return (
    <div
      className={`${classes.tagsContainer} ${size} ${type} ${
        trailingIcon ? 'trail' : ''
      } ${leadingIcon ? 'lead' : ''}`}
    >
      {trailingIcon && renderIcon(trailingIcon)}
      {typographyStyle && (
        <Typography
          className={`${
            !(trailingIcon || leadingIcon) && 'withoutIcon'
          } labelSpace${size}`}
          sx={typographyStyle}
          variant={
            size === TagsSizes.Small
              ? TypographyVariants.BodySmall
              : TypographyVariants.BodyMedium
          }
        >
          {label}
        </Typography>
      )}

      {leadingIcon && renderIcon(leadingIcon)}
    </div>
  )
}

Tags.defaultProps = {
  size: TagsSizes.Medium,
  type: TagsType.Default,
  theme: 'dark'
}
