import {Box, Typography} from '@mui/material'
import React, {ReactNode} from 'react'
import {useBitThemeContext} from '../bit-theme-wrapper/index'
import {Button, ButtonVariants} from '../button/index'
import {Icons} from '../icon/index'
import {EmptyStateSizes} from './constants'
import stylesDarkTheme from './styles/emptyStateDarkThemeStyles'
import stylesLightTheme from './styles/emptyStateLightThemeStyles'

export type EmptyStateProps = {
  /**
   * a node to be rendered in the special component.
   */
  children?: ReactNode
  /**
   * image path.
   */
  imageUrl: string
  /**
   * define title.
   */
  title?: string
  /**
   * define sub-title.
   */
  subTitle?: string
  /**
   * enable footer to see.
   */
  footer?: boolean
  /**
   * callback function for button click.
   */
  handleButtonClick?: (val: any) => void
  /**
   * Icon placed before the text.
   */
  leadingIcon?: Icons
  /**
   * footer button text.
   */
  buttonText?: string
  /**
   * To change the size of the component.
   */
  size?: string
  /**
   * To define size of the image
   */
  imageSizes?: {width: string | number; height: string | number}
  /**
   * To change theme
   */
  theme?: string
}

const darkTheme = stylesDarkTheme()
const lightTheme = stylesLightTheme()

export function EmptyState({
  imageUrl,
  title,
  subTitle,
  handleButtonClick,
  leadingIcon,
  buttonText,
  size,
  imageSizes
}: EmptyStateProps) {
  const dark = darkTheme()
  const light = lightTheme()
  const {theme} = useBitThemeContext()
  const classes = theme === 'dark' ? dark : light
  const hasImageSizes = imageSizes && Object.keys(imageSizes).length > 0
  return (
    <Box className={classes.container}>
      {imageUrl && (
        <img
          src={imageUrl}
          alt={'Img'}
          className={`${size}`}
          style={hasImageSizes ? imageSizes : {}}
        />
      )}
      <Box>
        {title && (
          <Typography variant='body1' className={classes.title}>
            {title}
          </Typography>
        )}
        {subTitle && (
          <Typography variant='body1' className={classes.subTitle}>
            {subTitle}
          </Typography>
        )}
      </Box>
      {(leadingIcon || buttonText) && (
        <Box>
          <Button
            buttonText={buttonText ?? ''}
            onClick={(e) =>
              handleButtonClick && handleButtonClick(e.currentTarget.value)
            }
            leadingIcon={leadingIcon}
            variant={ButtonVariants.TERTIARY}
          />
        </Box>
      )}
    </Box>
  )
}

EmptyState.defaultProps = {
  theme: 'dark',
  size: EmptyStateSizes.LARGE
}
