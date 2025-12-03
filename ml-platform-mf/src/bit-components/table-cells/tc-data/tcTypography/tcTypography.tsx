import {createTheme, ThemeProvider} from '@mui/material/styles'
import MUITypography from '@mui/material/Typography'
import React from 'react'
import {typographyDarkThemeVariant} from './styles/darkThemeStyles'
import {typographyLightThemeVariant} from './styles/lightThemeStyles'
import {TypographyProps} from './tcTypography.type'
import {typographyFunc} from './utils'

export const TcTypography = React.forwardRef(function Typography(
  props: TypographyProps,
  ref: React.Ref<HTMLInputElement>
) {
  typographyFunc()

  const {variant, sx, className, children, setHover, themes} = props
  const theme = createTheme(
    themes === 'dark'
      ? typographyDarkThemeVariant
      : themes === 'light'
      ? typographyLightThemeVariant
      : typographyDarkThemeVariant
  )
  const showTooltip = ({currentTarget}: React.MouseEvent<HTMLInputElement>) => {
    const {scrollHeight, clientHeight} = currentTarget
    if (scrollHeight > clientHeight) {
      if (setHover) {
        setHover(true)
      }
    }
  }

  const hideTooltip = () => {
    if (setHover) {
      setHover(false)
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <MUITypography
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        {...props}
        ref={ref}
        sx={sx}
        className={className}
        variant={variant}
      >
        {children}
      </MUITypography>
    </ThemeProvider>
  )
})
