import React from 'react'
import {useBitThemeContext} from '../../bit-theme-wrapper/index'
import stylesDarkTheme from './styles/tagsCounterDarkThemeStyles'
import stylesLightTheme from './styles/tagsCounterLightThemeStyles'

export type TagsCounterProps = {
  /**
   * To set count inside the counter. Only numbers
   */
  counter: number
  /**
   * To disable the number.
   */
  disabled?: boolean
  /**
   * To show the active state inside the counter
   */
  active?: boolean
  /**
   * To change theme
   */
  theme?: string
}

const darkTheme = stylesDarkTheme()
const lightTheme = stylesLightTheme()

export function TagsCounter(props: TagsCounterProps) {
  const {counter, active, disabled} = props

  const darkClasses = darkTheme()
  const lightClasses = lightTheme()
  const {theme} = useBitThemeContext()

  const classes = theme === 'dark' ? darkClasses : lightClasses
  return (
    <div
      className={`${classes.tagsCounter} ${active && 'activeBg'} ${
        disabled && 'disabledBg'
      }`}
    >
      <div
        className={`${classes.tagsCounterNumber} ${disabled && 'disabledBg'}  ${
          active && 'activeBg'
        }`}
      >
        {counter}
      </div>
    </div>
  )
}
TagsCounter.defaultProps = {
  theme: 'dark'
}
