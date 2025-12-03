import {
  breadcrumbs as breadcrumbsTheme,
  typography as typographyTheme
} from '../../design-tokens/index'

export const stylesLightTheme = () => {
  const breadcrumbs = breadcrumbsTheme('light')
  const typography = typographyTheme('light')
  return {
    fontSize: `${typography.body.ds_font_body_1_regular.fontSize}px`,
    lineHeight: `${typography.body.ds_font_body_1_regular.lineHeight}px`,
    color: breadcrumbs.breadcrumbs.text.ds_breadcrumbs_active_text_color,
    '&.link:hover': {
      borderBottom: `${breadcrumbs.ds_breadcrumbs_border_weight}px ${breadcrumbs.border_style.ds_breadcrumbs_border_style} ${breadcrumbs.breadcrumbs.text.ds_breadcrumbs_hover_text_color}`,
      color: breadcrumbs.breadcrumbs.text.ds_breadcrumbs_hover_text_color
    },
    '&.disable': {
      color: breadcrumbs.breadcrumbs.text.ds_breadcrumbs_default_text_color,
      letterSpacing: 'none'
    },
    '&.disable:hover': {
      color: breadcrumbs.breadcrumbs.text.ds_breadcrumbs_default_text_color,
      border: 'none',
      cursor: 'auto'
    }
  }
}
