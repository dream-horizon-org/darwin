import {
  table as tableTheme,
  typography as typographyTheme
} from '../../../../design-tokens/index'
const typography = typographyTheme('light')
const table = tableTheme('light')

export const typographyLightThemeVariant = {
  typography: {
    bodyMedium: {
      fontSize: typography.body.ds_font_body_2_regular.fontSize,
      lineHeight: `${typography.body.ds_font_body_2_regular.lineHeight}px`,
      fontWeight: typography.body.ds_font_body_2_regular.fontWeight,
      fontFamily: typography.body.ds_font_body_2_regular.fontFamily,
      color: table.table.table_title.ds_table_title_default_text_color
    }
  }
}
