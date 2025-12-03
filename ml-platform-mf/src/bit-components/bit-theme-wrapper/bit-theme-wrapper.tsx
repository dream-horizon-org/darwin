import React, {useEffect, useState} from 'react'
import {BitThemeProvider, BitThemeType} from './bit-theme-wrapper.context'
export type BitThemeWrapperProps = {
  children: React.ReactNode
  theme: 'dark' | 'light'
}

export const BitThemeWrapper = ({theme, children}: BitThemeWrapperProps) => {
  const [BitThemeContext, setThemeContext] = useState<BitThemeType>({theme})

  const switchTheme = (newTheme: 'dark' | 'light') => {
    setThemeContext({theme: newTheme})
  }
  useEffect(() => {
    if (theme === BitThemeContext.theme) return
    switchTheme(theme)
  }, [theme])

  return (
    <BitThemeProvider value={{...BitThemeContext}}>{children}</BitThemeProvider>
  )
}
BitThemeWrapper.defaultProps = {
  theme: 'dark'
}
