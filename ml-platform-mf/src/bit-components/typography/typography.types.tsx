import {TypographyVariants} from './constants'
declare module '@mui/material/styles' {
  interface TypographyVariants {
    bodyMedium: React.CSSProperties
    bodySmall: React.CSSProperties
  }
  interface TypographyVariantsOptions {
    bodyMedium?: React.CSSProperties
    bodySmall?: React.CSSProperties
  }
}
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    bodyMedium: true
    bodySmall: true
  }
}

export type TypographyProps = {
  children: React.ReactNode
  variant?: TypographyVariants
  sx?: object
  className?: string
  maxContentWidth?: number
  theme?: string
}
