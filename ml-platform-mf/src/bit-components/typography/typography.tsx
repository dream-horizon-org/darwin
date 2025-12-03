import {createTheme, ThemeProvider} from '@mui/material/styles'
import MUITypography from '@mui/material/Typography'
import React from 'react'
import {useBitThemeContext} from '../bit-theme-wrapper/index'
import {
  TypographyDarkThemeStyles,
  typographyDarkThemeVariant
} from './styles/darkThemeStyles'
import {
  TypographyLightThemeStyles,
  typographyLightThemeVariant
} from './styles/lightThemeStyles'
import {TypographyProps} from './typography.types'
import {typographyFunc} from './utils'

export function Typography(props: TypographyProps) {
  React.useEffect(() => {
    typographyFunc()
  }, [])
  const {variant, sx, className, children, maxContentWidth} = props

  const darkClasses = TypographyDarkThemeStyles()
  const lightClasses = TypographyLightThemeStyles()
  const {theme} = useBitThemeContext()
  const classes = theme === 'dark' ? darkClasses : lightClasses

  const themeObj = createTheme(
    theme === 'dark' ? typographyDarkThemeVariant : typographyLightThemeVariant
  )
  return (
    <>
      <ThemeProvider theme={themeObj}>
        <MUITypography
          sx={{...sx, maxWidth: maxContentWidth}}
          className={`${className}  ${classes.cellWithOverflow}`}
          variant={variant}
        >
          {children}
        </MUITypography>
      </ThemeProvider>
    </>
  )
}
