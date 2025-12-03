import {createContext, useContext} from 'react'

export interface BitThemeType {
  theme: string
}

export const BitThemeContext = createContext<any>(null)

export const BitThemeProvider = BitThemeContext.Provider

export function useBitThemeContext(): BitThemeType {
  const context = useContext(BitThemeContext)
  if (!context) {
    // eslint-disable-next-line no-console
    // console.log('Bit theme wrapper is not found!')
    return {theme: 'dark'}
  }

  return context
}
