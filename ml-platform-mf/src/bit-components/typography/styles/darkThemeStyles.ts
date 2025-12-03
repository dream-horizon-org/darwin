import {createUseStyles} from 'react-jss'
import {typography as typographyTheme} from '../../design-tokens/index'
const aliasTokens = typographyTheme('dark')

export const typographyDarkThemeVariant = {
  typography: {
    body1: {
      fontSize: aliasTokens.body.ds_font_body_2_regular.fontSize,
      lineHeight: `${aliasTokens.body.ds_font_body_2_regular.lineHeight}px`,
      fontWeight: aliasTokens.body.ds_font_body_2_regular.fontWeight,
      fontFamily: aliasTokens.body.ds_font_body_2_regular.fontFamily,
      color: aliasTokens.typography.ds_typography_primary_text_color
    },
    heading1: {
      fontFamily: aliasTokens.heading.ds_font_heading_1_bold.fontFamily,
      fontSize: aliasTokens.heading.ds_font_heading_1_bold.fontSize,
      color: aliasTokens.typography.ds_typography_primary_text_color,
      fontWeight: aliasTokens.heading.ds_font_heading_1_bold.fontWeight,
      lineHeight: `${aliasTokens.heading.ds_font_heading_1_bold.lineHeight}px`
    },
    heading2: {
      fontFamily: aliasTokens.heading.ds_font_heading_2_bold.fontFamily,
      fontSize: aliasTokens.heading.ds_font_heading_2_bold.fontSize,
      color: aliasTokens.typography.ds_typography_primary_text_color,
      fontWeight: aliasTokens.heading.ds_font_heading_2_bold.fontWeight,
      lineHeight: `${aliasTokens.heading.ds_font_heading_2_bold.lineHeight}px`
    },
    heading3: {
      fontFamily: aliasTokens.heading.ds_font_heading_3_bold.fontFamily,
      fontSize: aliasTokens.heading.ds_font_heading_3_bold.fontSize,
      color: aliasTokens.typography.ds_typography_primary_text_color,
      fontWeight: aliasTokens.heading.ds_font_heading_3_bold.fontWeight,
      lineHeight: `${aliasTokens.heading.ds_font_heading_3_bold.lineHeight}px`
    },
    heading4: {
      fontFamily: aliasTokens.heading.ds_font_heading_4_bold.fontFamily,
      fontSize: aliasTokens.heading.ds_font_heading_4_bold.fontSize,
      color: aliasTokens.typography.ds_typography_primary_text_color,
      fontWeight: aliasTokens.heading.ds_font_heading_4_bold.fontWeight,
      lineHeight: `${aliasTokens.heading.ds_font_heading_4_bold.lineHeight}px`
    },
    heading5: {
      fontFamily: aliasTokens.heading.ds_font_heading_5_bold.fontFamily,
      fontSize: aliasTokens.heading.ds_font_heading_5_bold.fontSize,
      color: aliasTokens.typography.ds_typography_primary_text_color,
      fontWeight: aliasTokens.heading.ds_font_heading_5_bold.fontWeight,
      lineHeight: `${aliasTokens.heading.ds_font_heading_5_bold.lineHeight}px`
    },
    bodyMedium: {
      fontSize: aliasTokens.body.ds_font_body_2_regular.fontSize,
      lineHeight: `${aliasTokens.body.ds_font_body_2_regular.lineHeight}px`,
      fontWeight: aliasTokens.body.ds_font_body_2_regular.fontWeight,
      fontFamily: aliasTokens.body.ds_font_body_2_regular.fontFamily,
      color: aliasTokens.typography.ds_typography_primary_text_color
    },
    bodyMediumBold: {
      fontSize: aliasTokens.body.ds_font_body_2_bold.fontSize,
      lineHeight: `${aliasTokens.body.ds_font_body_2_bold.lineHeight}px`,
      fontWeight: aliasTokens.body.ds_font_body_2_bold.fontWeight,
      fontFamily: aliasTokens.body.ds_font_body_2_bold.fontFamily,
      color: aliasTokens.typography.ds_typography_primary_text_color
    },
    bodySmall: {
      fontSize: aliasTokens.body.ds_font_body_1_regular.fontSize,
      lineHeight: `${aliasTokens.body.ds_font_body_1_regular.lineHeight}px`,
      fontWeight: aliasTokens.body.ds_font_body_1_regular.fontWeight,
      fontFamily: aliasTokens.body.ds_font_body_1_regular.fontFamily,
      color: aliasTokens.typography.ds_typography_primary_text_color
    },
    bodySmallBold: {
      fontSize: aliasTokens.body.ds_font_body_1_bold.fontSize,
      lineHeight: `${aliasTokens.body.ds_font_body_1_bold.lineHeight}px`,
      fontWeight: aliasTokens.body.ds_font_body_1_bold.fontWeight,
      fontFamily: aliasTokens.body.ds_font_body_1_bold.fontFamily,
      color: aliasTokens.typography.ds_typography_primary_text_color
    },
    bodyLarge: {
      fontSize: aliasTokens.body.ds_font_body_3_regular.fontSize,
      lineHeight: `${aliasTokens.body.ds_font_body_3_regular.lineHeight}px`,
      fontWeight: aliasTokens.body.ds_font_body_3_regular.fontWeight,
      fontFamily: aliasTokens.body.ds_font_body_3_regular.fontFamily,
      color: aliasTokens.typography.ds_typography_primary_text_color
    },
    bodyLargeBold: {
      fontSize: aliasTokens.body.ds_font_body_3_bold.fontSize,
      lineHeight: `${aliasTokens.body.ds_font_body_3_bold.lineHeight}px`,
      fontWeight: aliasTokens.body.ds_font_body_3_bold.fontWeight,
      fontFamily: aliasTokens.body.ds_font_body_3_bold.fontFamily,
      color: aliasTokens.typography.ds_typography_primary_text_color
    },
    code: {
      fontSize: aliasTokens.code.ds_font_code_regular.fontSize,
      lineHeight: `${aliasTokens.code.ds_font_code_regular.lineHeight}px`,
      fontWeight: aliasTokens.code.ds_font_code_regular.fontWeight,
      fontFamily: aliasTokens.code.ds_font_code_regular.fontFamily,
      color: aliasTokens.typography.ds_typography_primary_text_color
    },
    caption: {
      fontSize: aliasTokens.caption.ds_font_caption_1_regular.fontSize,
      lineHeight: `${aliasTokens.caption.ds_font_caption_1_regular.lineHeight}px`,
      fontWeight: aliasTokens.caption.ds_font_caption_1_regular.fontWeight,
      fontFamily: aliasTokens.caption.ds_font_caption_1_regular.fontFamily,
      color: aliasTokens.typography.ds_typography_primary_text_color
    },
    captionSmall: {
      fontSize: aliasTokens.caption.ds_font_caption_2_regular.fontSize,
      lineHeight: `${aliasTokens.caption.ds_font_caption_2_regular.lineHeight}px`,
      fontWeight: aliasTokens.caption.ds_font_caption_2_regular.fontWeight,
      fontFamily: aliasTokens.caption.ds_font_caption_2_regular.fontFamily,
      color: aliasTokens.typography.ds_typography_primary_text_color
    },
    buttonLarge: {
      fontSize: aliasTokens.button.ds_font_button_1_bold.fontSize,
      lineHeight: `${aliasTokens.button.ds_font_button_1_bold.lineHeight}px`,
      fontWeight: aliasTokens.button.ds_font_button_1_bold.fontWeight,
      fontFamily: aliasTokens.button.ds_font_button_1_bold.fontFamily,
      color: aliasTokens.typography.ds_typography_primary_text_color
    },
    button: {
      fontSize: aliasTokens.button.ds_font_button_2_bold.fontSize,
      lineHeight: `${aliasTokens.button.ds_font_button_2_bold.lineHeight}px`,
      fontWeight: aliasTokens.button.ds_font_button_2_bold.fontWeight,
      fontFamily: aliasTokens.button.ds_font_button_2_bold.fontFamily,
      color: aliasTokens.typography.ds_typography_primary_text_color
    },
    buttonSmall: {
      fontSize: aliasTokens.button.ds_font_button_3_bold.fontSize,
      lineHeight: `${aliasTokens.button.ds_font_button_3_bold.lineHeight}px`,
      fontWeight: aliasTokens.button.ds_font_button_3_bold.fontWeight,
      fontFamily: aliasTokens.button.ds_font_button_3_bold.fontFamily,
      color: aliasTokens.typography.ds_typography_primary_text_color
    },
    display1: {
      fontSize: aliasTokens.display.ds_font_display_1_regular.fontSize,
      lineHeight: `${aliasTokens.display.ds_font_display_1_regular.lineHeight}px`,
      fontWeight: aliasTokens.display.ds_font_display_1_regular.fontWeight,
      fontFamily: aliasTokens.display.ds_font_display_1_regular.fontFamily,
      color: aliasTokens.typography.ds_typography_primary_text_color
    },
    display2: {
      fontSize: aliasTokens.display.ds_font_display_2_regular.fontSize,
      lineHeight: `${aliasTokens.display.ds_font_display_2_regular.lineHeight}px`,
      fontWeight: aliasTokens.display.ds_font_display_2_regular.fontWeight,
      fontFamily: aliasTokens.display.ds_font_display_2_regular.fontFamily,
      color: aliasTokens.typography.ds_typography_primary_text_color
    }
  }
}

export const TypographyDarkThemeStyles = createUseStyles({
  cellWithOverflow: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'block'
  }
})
