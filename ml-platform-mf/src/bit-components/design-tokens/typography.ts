import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const typography = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    code: {
      ds_font_code_regular: {
        fontFamily: aliasToken.font.family.ds_alias_font_family_code,
        fontWeight: aliasToken.font.weight.ds_alias_font_weight_regular_2,
        lineHeight: aliasToken.font.line_height.ds_alias_font_line_height_20,
        fontSize: aliasToken.font.size.ds_alias_font_size_14,
        letterSpacing:
          aliasToken.font.letter_spacing.ds_alias_font_letter_spacing_none,
        paragraphSpacing:
          aliasToken.font.paragraph_spacing
            .ds_alias_font_paragraph_spacing_none,
        textCase: aliasToken.font.transform.ds_alias_font_transform_none,
        textDecoration: aliasToken.font.decoration.ds_alias_font_decoration_none
      }
    },
    button: {
      ds_font_button_1_bold: {
        fontFamily: aliasToken.font.family.ds_alias_font_family_base,
        fontWeight: aliasToken.font.weight.ds_alias_font_weight_bold,
        lineHeight: aliasToken.font.line_height.ds_alias_font_line_height_24,
        fontSize: aliasToken.font.size.ds_alias_font_size_16,
        letterSpacing:
          aliasToken.font.letter_spacing.ds_alias_font_letter_spacing_none,
        paragraphSpacing:
          aliasToken.font.paragraph_spacing
            .ds_alias_font_paragraph_spacing_none,
        textCase: aliasToken.font.transform.ds_alias_font_transform_uppercase,
        textDecoration: aliasToken.font.decoration.ds_alias_font_decoration_none
      },
      ds_font_button_2_bold: {
        fontFamily: aliasToken.font.family.ds_alias_font_family_base,
        fontWeight: aliasToken.font.weight.ds_alias_font_weight_bold,
        lineHeight: aliasToken.font.line_height.ds_alias_font_line_height_20,
        fontSize: aliasToken.font.size.ds_alias_font_size_14,
        letterSpacing:
          aliasToken.font.letter_spacing.ds_alias_font_letter_spacing_none,
        paragraphSpacing:
          aliasToken.font.paragraph_spacing
            .ds_alias_font_paragraph_spacing_none,
        textCase: aliasToken.font.transform.ds_alias_font_transform_uppercase,
        textDecoration: aliasToken.font.decoration.ds_alias_font_decoration_none
      },
      ds_font_button_3_bold: {
        fontFamily: aliasToken.font.family.ds_alias_font_family_base,
        fontWeight: aliasToken.font.weight.ds_alias_font_weight_bold,
        lineHeight: aliasToken.font.line_height.ds_alias_font_line_height_16,
        fontSize: aliasToken.font.size.ds_alias_font_size_12,
        letterSpacing:
          aliasToken.font.letter_spacing.ds_alias_font_letter_spacing_none,
        paragraphSpacing:
          aliasToken.font.paragraph_spacing
            .ds_alias_font_paragraph_spacing_none,
        textCase: aliasToken.font.transform.ds_alias_font_transform_uppercase,
        textDecoration: aliasToken.font.decoration.ds_alias_font_decoration_none
      }
    },
    caption: {
      ds_font_caption_1_regular: {
        fontFamily: aliasToken.font.family.ds_alias_font_family_base,
        fontWeight: aliasToken.font.weight.ds_alias_font_weight_regular,
        lineHeight: aliasToken.font.line_height.ds_alias_font_line_height_16,
        fontSize: aliasToken.font.size.ds_alias_font_size_12,
        letterSpacing:
          aliasToken.font.letter_spacing.ds_alias_font_letter_spacing_none,
        paragraphSpacing:
          aliasToken.font.paragraph_spacing
            .ds_alias_font_paragraph_spacing_none,
        textCase: aliasToken.font.transform.ds_alias_font_transform_none,
        textDecoration: aliasToken.font.decoration.ds_alias_font_decoration_none
      },
      ds_font_caption_2_regular: {
        fontFamily: aliasToken.font.family.ds_alias_font_family_base,
        fontWeight: aliasToken.font.weight.ds_alias_font_weight_regular,
        lineHeight: aliasToken.font.line_height.ds_alias_font_line_height_14,
        fontSize: aliasToken.font.size.ds_alias_font_size_10,
        letterSpacing:
          aliasToken.font.letter_spacing.ds_alias_font_letter_spacing_none,
        paragraphSpacing:
          aliasToken.font.paragraph_spacing
            .ds_alias_font_paragraph_spacing_none,
        textCase: aliasToken.font.transform.ds_alias_font_transform_none,
        textDecoration: aliasToken.font.decoration.ds_alias_font_decoration_none
      }
    },
    body: {
      ds_font_body_1_regular: {
        fontFamily: aliasToken.font.family.ds_alias_font_family_base,
        fontWeight: aliasToken.font.weight.ds_alias_font_weight_regular,
        lineHeight: aliasToken.font.line_height.ds_alias_font_line_height_16,
        fontSize: aliasToken.font.size.ds_alias_font_size_12,
        letterSpacing:
          aliasToken.font.letter_spacing.ds_alias_font_letter_spacing_none,
        paragraphSpacing:
          aliasToken.font.paragraph_spacing
            .ds_alias_font_paragraph_spacing_none,
        textCase: aliasToken.font.transform.ds_alias_font_transform_none,
        textDecoration: aliasToken.font.decoration.ds_alias_font_decoration_none
      },
      ds_font_body_1_bold: {
        fontFamily: aliasToken.font.family.ds_alias_font_family_base,
        fontWeight: aliasToken.font.weight.ds_alias_font_weight_bold,
        lineHeight: aliasToken.font.line_height.ds_alias_font_line_height_16,
        fontSize: aliasToken.font.size.ds_alias_font_size_12,
        letterSpacing:
          aliasToken.font.letter_spacing.ds_alias_font_letter_spacing_none,
        paragraphSpacing:
          aliasToken.font.paragraph_spacing
            .ds_alias_font_paragraph_spacing_none,
        textCase: aliasToken.font.transform.ds_alias_font_transform_none,
        textDecoration: aliasToken.font.decoration.ds_alias_font_decoration_none
      },
      ds_font_body_2_regular: {
        fontFamily: aliasToken.font.family.ds_alias_font_family_base,
        fontWeight: aliasToken.font.weight.ds_alias_font_weight_regular,
        lineHeight: aliasToken.font.line_height.ds_alias_font_line_height_20,
        fontSize: aliasToken.font.size.ds_alias_font_size_14,
        letterSpacing:
          aliasToken.font.letter_spacing.ds_alias_font_letter_spacing_none,
        paragraphSpacing:
          aliasToken.font.paragraph_spacing
            .ds_alias_font_paragraph_spacing_none,
        textCase: aliasToken.font.transform.ds_alias_font_transform_none,
        textDecoration: aliasToken.font.decoration.ds_alias_font_decoration_none
      },
      ds_font_body_2_bold: {
        fontFamily: aliasToken.font.family.ds_alias_font_family_base,
        fontWeight: aliasToken.font.weight.ds_alias_font_weight_bold,
        lineHeight: aliasToken.font.line_height.ds_alias_font_line_height_20,
        fontSize: aliasToken.font.size.ds_alias_font_size_14,
        letterSpacing:
          aliasToken.font.letter_spacing.ds_alias_font_letter_spacing_none,
        paragraphSpacing:
          aliasToken.font.paragraph_spacing
            .ds_alias_font_paragraph_spacing_none,
        textCase: aliasToken.font.transform.ds_alias_font_transform_none,
        textDecoration: aliasToken.font.decoration.ds_alias_font_decoration_none
      },
      ds_font_body_3_regular: {
        fontFamily: aliasToken.font.family.ds_alias_font_family_base,
        fontWeight: aliasToken.font.weight.ds_alias_font_weight_regular,
        lineHeight: aliasToken.font.line_height.ds_alias_font_line_height_20,
        fontSize: aliasToken.font.size.ds_alias_font_size_16,
        letterSpacing:
          aliasToken.font.letter_spacing.ds_alias_font_letter_spacing_none,
        paragraphSpacing:
          aliasToken.font.paragraph_spacing
            .ds_alias_font_paragraph_spacing_none,
        textCase: aliasToken.font.transform.ds_alias_font_transform_none,
        textDecoration: aliasToken.font.decoration.ds_alias_font_decoration_none
      },
      ds_font_body_3_bold: {
        fontFamily: aliasToken.font.family.ds_alias_font_family_base,
        fontWeight: aliasToken.font.weight.ds_alias_font_weight_bold,
        lineHeight: aliasToken.font.line_height.ds_alias_font_line_height_20,
        fontSize: aliasToken.font.size.ds_alias_font_size_16,
        letterSpacing:
          aliasToken.font.letter_spacing.ds_alias_font_letter_spacing_none,
        paragraphSpacing:
          aliasToken.font.paragraph_spacing
            .ds_alias_font_paragraph_spacing_none,
        textCase: aliasToken.font.transform.ds_alias_font_transform_none,
        textDecoration: aliasToken.font.decoration.ds_alias_font_decoration_none
      }
    },
    heading: {
      ds_font_heading_1_bold: {
        fontFamily: aliasToken.font.family.ds_alias_font_family_base,
        fontWeight: aliasToken.font.weight.ds_alias_font_weight_bold,
        lineHeight: aliasToken.font.line_height.ds_alias_font_line_height_32,
        fontSize: aliasToken.font.size.ds_alias_font_size_24,
        letterSpacing:
          aliasToken.font.letter_spacing.ds_alias_font_letter_spacing_none,
        paragraphSpacing:
          aliasToken.font.paragraph_spacing
            .ds_alias_font_paragraph_spacing_none,
        textCase: aliasToken.font.transform.ds_alias_font_transform_none,
        textDecoration: aliasToken.font.decoration.ds_alias_font_decoration_none
      },
      ds_font_heading_2_bold: {
        fontFamily: aliasToken.font.family.ds_alias_font_family_base,
        fontWeight: aliasToken.font.weight.ds_alias_font_weight_bold,
        lineHeight: aliasToken.font.line_height.ds_alias_font_line_height_28,
        fontSize: aliasToken.font.size.ds_alias_font_size_20,
        letterSpacing:
          aliasToken.font.letter_spacing.ds_alias_font_letter_spacing_none,
        paragraphSpacing:
          aliasToken.font.paragraph_spacing
            .ds_alias_font_paragraph_spacing_none,
        textCase: aliasToken.font.transform.ds_alias_font_transform_none,
        textDecoration: aliasToken.font.decoration.ds_alias_font_decoration_none
      },
      ds_font_heading_3_bold: {
        fontFamily: aliasToken.font.family.ds_alias_font_family_base,
        fontWeight: aliasToken.font.weight.ds_alias_font_weight_bold,
        lineHeight: aliasToken.font.line_height.ds_alias_font_line_height_24,
        fontSize: aliasToken.font.size.ds_alias_font_size_18,
        letterSpacing:
          aliasToken.font.letter_spacing.ds_alias_font_letter_spacing_none,
        paragraphSpacing:
          aliasToken.font.paragraph_spacing
            .ds_alias_font_paragraph_spacing_none,
        textCase: aliasToken.font.transform.ds_alias_font_transform_none,
        textDecoration: aliasToken.font.decoration.ds_alias_font_decoration_none
      },
      ds_font_heading_4_bold: {
        fontFamily: aliasToken.font.family.ds_alias_font_family_base,
        fontWeight: aliasToken.font.weight.ds_alias_font_weight_bold,
        lineHeight: aliasToken.font.line_height.ds_alias_font_line_height_24,
        fontSize: aliasToken.font.size.ds_alias_font_size_16,
        letterSpacing:
          aliasToken.font.letter_spacing.ds_alias_font_letter_spacing_none,
        paragraphSpacing:
          aliasToken.font.paragraph_spacing
            .ds_alias_font_paragraph_spacing_none,
        textCase: aliasToken.font.transform.ds_alias_font_transform_none,
        textDecoration: aliasToken.font.decoration.ds_alias_font_decoration_none
      },
      ds_font_heading_5_bold: {
        fontFamily: aliasToken.font.family.ds_alias_font_family_base,
        fontWeight: aliasToken.font.weight.ds_alias_font_weight_bold,
        lineHeight: aliasToken.font.line_height.ds_alias_font_line_height_20,
        fontSize: aliasToken.font.size.ds_alias_font_size_14,
        letterSpacing:
          aliasToken.font.letter_spacing.ds_alias_font_letter_spacing_none,
        paragraphSpacing:
          aliasToken.font.paragraph_spacing
            .ds_alias_font_paragraph_spacing_none,
        textCase: aliasToken.font.transform.ds_alias_font_transform_none,
        textDecoration: aliasToken.font.decoration.ds_alias_font_decoration_none
      }
    },
    typography: {
      ds_typography_primary_text_color:
        aliasToken.text.onsurface.ds_alias_onsurface_default1_text_color,
      ds_typography_secondary_text_color:
        aliasToken.text.onsurface.ds_alias_onsurface_default2_text_color,
      ds_typography_disabled_text_color:
        aliasToken.text.onsurface.ds_alias_onsurface_disabled_text_color
    },
    display: {
      ds_font_display_1_regular: {
        fontFamily: aliasToken.font.family.ds_alias_font_family_base,
        fontWeight: aliasToken.font.weight.ds_alias_font_weight_regular,
        lineHeight: aliasToken.font.line_height.ds_alias_font_line_height_64,
        fontSize: aliasToken.font.size.ds_alias_font_size_56,
        letterSpacing:
          aliasToken.font.letter_spacing.ds_alias_font_letter_spacing_none,
        paragraphSpacing:
          aliasToken.font.paragraph_spacing
            .ds_alias_font_paragraph_spacing_none,
        textCase: aliasToken.font.transform.ds_alias_font_transform_none,
        textDecoration: aliasToken.font.decoration.ds_alias_font_decoration_none
      },
      ds_font_display_2_regular: {
        fontFamily: aliasToken.font.family.ds_alias_font_family_base,
        fontWeight: aliasToken.font.weight.ds_alias_font_weight_regular,
        lineHeight: aliasToken.font.line_height.ds_alias_font_line_height_56,
        fontSize: aliasToken.font.size.ds_alias_font_size_44,
        letterSpacing:
          aliasToken.font.letter_spacing.ds_alias_font_letter_spacing_none,
        paragraphSpacing:
          aliasToken.font.paragraph_spacing
            .ds_alias_font_paragraph_spacing_none,
        textCase: aliasToken.font.transform.ds_alias_font_transform_none,
        textDecoration: aliasToken.font.decoration.ds_alias_font_decoration_none
      }
    }
  }
}
