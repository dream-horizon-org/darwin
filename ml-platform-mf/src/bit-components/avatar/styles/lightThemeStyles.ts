import {
  avatar as avatarTheme,
  avatar_profile as avatarProfileTheme,
  surface as surfaceTheme,
  typography as typographyTheme
} from '../../design-tokens/index'

const avatar = avatarTheme('light')
const typography = typographyTheme('light')
const surface = surfaceTheme('light')
const avatarProfileThemeDesignSet = avatarProfileTheme('light')
export const stylesLightThemeAvatar = {
  '.icon_large': {
    fontSize: `${avatar.ds_team_image_large_size}px`
  },

  '.icon_medium': {
    fontSize: `${avatar.ds_team_image_medium_size}px`
  },
  '.icon_small': {
    fontSize: `${avatar.ds_team_image_small_size}px`
  },
  '.icon_extra_small': {
    fontSize: `${avatar.ds_team_image_extra_small_size}px`
  },
  '&.mini': {
    width: `${avatar.ds_player_image_mini_size}px`,
    height: `${avatar.ds_player_image_mini_size}px`,
    fontSize: `${typography.caption.ds_font_caption_2_regular.fontSize}px`
  },

  '&.background': {
    backgroundColor: surface.surface.ds_surface_tertiary_background_color,
    color: typography.typography.ds_typography_primary_text_color,
    border: `1px solid ${typography.typography.ds_typography_disabled_text_color}`,
    boxSizing: 'border-box'
  },
  '&.large': {
    width: `${avatar.ds_team_image_large_size}px`,
    height: `${avatar.ds_team_image_large_size}px`,
    fontSize: `${typography.body.ds_font_body_3_regular.fontSize}px`
  },

  '&.medium': {
    width: `${avatar.ds_team_image_medium_size}px`,
    height: `${avatar.ds_team_image_medium_size}px`,
    fontSize: `${typography.body.ds_font_body_3_regular.fontSize}px`
  },

  '&.small': {
    width: `${avatar.ds_team_image_small_size}px`,
    height: `${avatar.ds_team_image_small_size}px`,
    fontSize: `${typography.body.ds_font_body_3_regular.fontSize}px`
  },

  '&.extrasmall': {
    width: `${avatar.ds_team_image_extra_small_size}px`,
    height: `${avatar.ds_team_image_extra_small_size}px`,
    fontSize: `${typography.body.ds_font_body_1_regular.fontSize}px`
  },

  '&.tag_large': {
    width: `${avatar.ds_team_image_extra_small_size}px`,
    height: `${avatar.ds_team_image_extra_small_size}px`,
    border: `1px solid ${avatarProfileThemeDesignSet.avatar_profile.border.ds_avatar_profile_border_color}`
  },

  '&.tag_medium': {
    width: `${avatar.ds_player_image_mini_size}px`,
    height: `${avatar.ds_player_image_mini_size}px`,
    border: `1px solid ${avatarProfileThemeDesignSet.avatar_profile.border.ds_avatar_profile_border_color}`
  },

  '&.tag_small': {
    width: `${typography.heading.ds_font_heading_4_bold.fontSize}px`,
    height: `${typography.heading.ds_font_heading_4_bold.fontSize}px`,
    border: `1px solid ${avatarProfileThemeDesignSet.avatar_profile.border.ds_avatar_profile_border_color}`
  },

  '&.tag_extrasmall': {
    width: `${typography.body.ds_font_body_1_bold.fontSize}px`,
    height: `${typography.body.ds_font_body_1_bold.fontSize}px`,
    border: `1px solid ${avatarProfileThemeDesignSet.avatar_profile.border.ds_avatar_profile_border_color}`
  },

  '& .icon': {
    '&.tag_icon_large': {
      fontSize: `${avatar.ds_player_image_large_size}px`
    },

    '.icon_medium': {
      fontSize: `${avatar.ds_team_image_medium_size}px`
    },
    '.icon_small': {
      fontSize: `${avatar.ds_team_image_small_size}px`
    },
    '.icon_extra_small': {
      fontSize: `${avatar.ds_team_image_extra_small_size}px`
    },
    '&.mini': {
      width: `${avatar.ds_player_image_mini_size}px`,
      height: `${avatar.ds_player_image_mini_size}px`,
      fontSize: `${typography.code.ds_font_code_regular.fontSize}px`
    },

    '&.large': {
      width: `${avatar.ds_team_image_large_size}px`,
      height: `${avatar.ds_team_image_large_size}px`
    },

    '&.medium': {
      width: `${avatar.ds_team_image_medium_size}px`,
      height: `${avatar.ds_team_image_medium_size}px`
    },

    '&.small': {
      width: `${avatar.ds_team_image_small_size}px`,
      height: `${avatar.ds_team_image_small_size}px`
    },

    '&.extrasmall': {
      width: `${avatar.ds_team_image_extra_small_size}px`,
      height: `${avatar.ds_team_image_extra_small_size}px`
    },

    '&.tag_large': {
      width: `${avatar.ds_player_image_large_size}px`,
      height: `${avatar.ds_player_image_large_size}px`
    },

    '&.tag_medium': {
      width: `${avatar.ds_player_image_medium_size}px`,
      height: `${avatar.ds_player_image_medium_size}px`
    },

    '&.tag_small': {
      width: `${avatar.ds_player_image_small_size}px`,
      height: `${avatar.ds_player_image_small_size}px`
    },

    '&.tag_extrasmall': {
      width: `${avatar.ds_player_image_extra_small_size}px`,
      height: `${avatar.ds_player_image_extra_small_size}px`
    },

    '&.icon': {
      '&.tag_icon_large': {
        fontSize: `${avatar.ds_team_image_extra_small_size}px`
      },

      '&.tag_icon_medium': {
        fontSize: `${avatar.ds_player_image_mini_size}px`
      },

      '&.tag_icon_small': {
        fontSize: `${typography.heading.ds_font_heading_4_bold.fontSize}px`
      },

      '&.tag_icon_extrasmall': {
        fontSize: `${typography.body.ds_font_body_1_bold.fontSize}px`
      }
    }
  }
}
