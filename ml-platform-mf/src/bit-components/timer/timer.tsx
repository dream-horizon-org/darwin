/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, {useEffect, useState} from 'react'
import {Typography, TypographyVariants} from '../typography/index'

import {useBitThemeContext} from '../bit-theme-wrapper/index'
import {stylesDarkTheme} from './styles/timerDarkThemeStyles'
import {stylesLightTheme} from './styles/timerLightThemeStyles'
export type TimerProps = {
  /**
   * Time to be give to start a counter (in sec)
   */
  time: number | null
  /**
   *
   */
  testIdentifier?: string
  /**
   * To change theme
   */
  theme?: string
}

const darkTheme = stylesDarkTheme()
const lightTheme = stylesLightTheme()

export function Timer({time, testIdentifier}: TimerProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(time || 0)
  const dark = darkTheme()
  const light = lightTheme()
  const {theme} = useBitThemeContext()
  const classes = theme === 'dark' ? dark : light

  let timerId: NodeJS.Timeout

  const secondsToDisplay = secondsRemaining % 60
  const minutesRemaining = (secondsRemaining - secondsToDisplay) / 60
  const minutesToDisplay = minutesRemaining % 60
  const hoursToDisplay = (minutesRemaining - minutesToDisplay) / 60

  const twoDigits = (num: number) => String(num).padStart(2, '0')
  const clearTimer = () => {
    if (timerId) {
      clearInterval(timerId)
    }
  }

  useEffect(() => {
    clearTimer()
    timerId = setInterval(() => {
      if (secondsRemaining === 0) {
        clearInterval(timerId)
        return
      }

      setSecondsRemaining((prevSecondsRemaining) => prevSecondsRemaining - 1)
    }, 1000)

    return () => clearInterval(timerId)
  }, [secondsRemaining])

  return (
    <Typography theme={theme} variant={TypographyVariants.BodyMedium}>
      <div
        data-testid={testIdentifier}
        className={
          hoursToDisplay || secondsToDisplay || minutesToDisplay
            ? classes.timer_running
            : classes.timer_stopped
        }
      >
        {time === null
          ? '--:--:--'
          : `${twoDigits(hoursToDisplay)}:${twoDigits(
              minutesToDisplay
            )}:${twoDigits(secondsToDisplay)}`}
      </div>
    </Typography>
  )
}
Timer.defaultProps = {
  theme: 'dark'
}
