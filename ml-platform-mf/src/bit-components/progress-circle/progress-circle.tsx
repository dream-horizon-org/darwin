import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import React from 'react'
import {useBitThemeContext} from '../bit-theme-wrapper/index'
import {LoaderSize} from './constants'
import containerStyle from './progress-circle.style'
import {stylesDarkTheme} from './styles/darkThemeStyles'
import {stylesLightTheme} from './styles/lightThemeStyles'

export type ProgressCircleProps = {
  /**
   * To change the size of the component.
   */
  size: LoaderSize
  /**
   * To change theme
   */
  theme?: string
}
export function ProgressCircle(props: ProgressCircleProps) {
  const classes = containerStyle()
  const dark = stylesDarkTheme()
  const light = stylesLightTheme()
  const {theme} = useBitThemeContext()
  const style = theme === 'dark' ? dark : light
  return (
    <div className={classes.container}>
      <Box sx={style} className={'container'}>
        <CircularProgress
          variant='determinate'
          sx={style}
          className={'backgroundLoader'}
          size={props.size}
          thickness={style.loaderSize}
          value={100}
        />
        <CircularProgress
          sx={style}
          className={'activeLoader'}
          size={props.size}
          thickness={style.loaderSize}
        />
      </Box>
    </div>
  )
}
ProgressCircle.defaultProps = {
  theme: 'dark'
}
