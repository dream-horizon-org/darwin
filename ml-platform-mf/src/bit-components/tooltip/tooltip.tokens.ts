import {
  aliasTokensColor,
  aliasTokensDimension,
  aliasTokensRadius
} from '../config/index'

export const tooltipTokens = {
  msd_tooltip_background_color:
    aliasTokensColor.msd_alias_surface_tertiary_background_color,
  msd_tooltip_text_color:
    aliasTokensColor.msd_alias_feedback_primary_text_color,
  msd_tooltip_spacing_horizontal:
    aliasTokensDimension.msd_alias_static_dimension_12,
  msd_tooltip_spacing_verticle:
    aliasTokensDimension.msd_alias_static_dimension_8,
  msd_tooltip_radius: aliasTokensRadius.msd_alias_feedback_radius
}
