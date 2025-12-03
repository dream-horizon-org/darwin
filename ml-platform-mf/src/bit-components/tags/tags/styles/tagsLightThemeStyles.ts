import {createUseStyles} from 'react-jss'
import {tag as tagTheme} from '../../../design-tokens/index'

export const stylesLightTheme = () => {
  const tag = tagTheme('light')

  return createUseStyles({
    tagsContainer: {
      display: 'inline-flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: `${tag.ds_tag_generic_radius}px `,

      '&.default': {
        background:
          tag.tag.generic.default.ds_tag_generic_default_background_color
      },
      '&.valid': {
        background:
          tag.tag.generic.success.ds_tag_generic_success_background_color
      },
      '&.invalid': {
        background: tag.tag.generic.error.ds_tag_generic_error_background_color
      },
      '&.neutral': {
        background:
          tag.tag.generic.information
            .ds_tag_generic_information_background_color
      },
      '&.header': {
        background:
          tag.tag.generic.warning.ds_tag_generic_warning_background_color
      },
      '&.large': {
        gap: '4px',
        padding: `${tag.ds_tag_generic_medium_vertical_spacing}px ${tag.ds_tag_generic_medium_horizontal_spacing}px`,
        '&.trail': {
          padding: `${tag.ds_tag_generic_medium_vertical_spacing}px ${tag.ds_tag_generic_medium_horizontal_spacing}px ${tag.ds_tag_generic_medium_vertical_spacing}px ${tag.ds_tag_generic_small_horizontal_spacing}px`
        },
        '&.lead': {
          padding: `${tag.ds_tag_generic_medium_vertical_spacing}px ${tag.ds_tag_generic_small_horizontal_spacing}px ${tag.ds_tag_generic_medium_vertical_spacing}px ${tag.ds_tag_generic_medium_horizontal_spacing}px`
        }
      },
      '&.medium': {
        gap: '4px',
        padding: `${tag.ds_tag_generic_medium_vertical_spacing}px ${tag.ds_tag_generic_medium_horizontal_spacing}px`,
        '&.trail': {
          padding: `${tag.ds_tag_generic_medium_vertical_spacing}px ${tag.ds_tag_generic_small_horizontal_spacing}px ${tag.ds_tag_generic_medium_vertical_spacing}px ${tag.ds_tag_generic_medium_vertical_spacing}px`
        },
        '&.lead': {
          padding: `${tag.ds_tag_generic_medium_vertical_spacing}px ${tag.ds_tag_generic_medium_vertical_spacing}px ${tag.ds_tag_generic_medium_vertical_spacing}px ${tag.ds_tag_generic_small_horizontal_spacing}px`
        }
      },
      '&.small': {
        gap: '2px',
        padding: `${tag.ds_tag_counter_vertical_spacing}px ${tag.ds_tag_generic_medium_vertical_spacing}px`,
        '&.trail': {
          padding: `${tag.ds_tag_counter_vertical_spacing}px ${tag.ds_tag_generic_medium_vertical_spacing}px ${tag.ds_tag_counter_vertical_spacing}px ${tag.ds_tag_counter_vertical_spacing}px`
        },
        '&.lead': {
          padding: `${tag.ds_tag_counter_vertical_spacing}px ${tag.ds_tag_counter_vertical_spacing}px ${tag.ds_tag_counter_vertical_spacing}px ${tag.ds_tag_generic_medium_vertical_spacing}px`
        }
      },
      '&.xs': {
        gap: '2px',
        padding: `${tag.ds_tag_counter_vertical_spacing}px ${tag.ds_tag_generic_medium_vertical_spacing}px`,
        '&.trail': {
          padding: `${tag.ds_tag_counter_vertical_spacing}px ${tag.ds_tag_generic_medium_vertical_spacing}px ${tag.ds_tag_counter_vertical_spacing}px ${tag.ds_tag_counter_vertical_spacing}px`
        },
        '&.lead': {
          padding: `${tag.ds_tag_counter_vertical_spacing}px ${tag.ds_tag_counter_vertical_spacing}px ${tag.ds_tag_counter_vertical_spacing}px ${tag.ds_tag_generic_medium_vertical_spacing}px`
        }
      }
    },

    trailingIcon: {
      display: 'flex',

      color: tag.tag.generic.default.ds_tag_generic_icon_color,
      '&.icon::before': {
        color: tag.tag.generic.default.ds_tag_generic_icon_color
      },

      '&.medium': {
        fontSize: `${tag.ds_tag_generic_icon_small_size}px`,
        height: `${tag.ds_tag_generic_icon_small_size}px`,
        width: `${tag.ds_tag_generic_icon_small_size}px`
      },

      '&.small': {
        fontSize: `${tag.ds_tag_generic_icon_small_size}px`,
        height: `${tag.ds_tag_generic_icon_small_size}px`,
        width: `${tag.ds_tag_generic_icon_small_size}px`
      },
      '&.large': {
        fontSize: `${tag.ds_tag_generic_icon_medium_size}px`,
        height: `${tag.ds_tag_generic_icon_medium_size}px`,
        width: `${tag.ds_tag_generic_icon_medium_size}px`
      },
      '&.xs': {
        fontSize: `${tag.ds_tag_generic_icon_xsmall_size}px`,
        height: `${tag.ds_tag_generic_icon_xsmall_size}px`,
        width: `${tag.ds_tag_generic_icon_xsmall_size}px`
      }
    },
    leadingIcon: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: tag.tag.generic.default.ds_tag_generic_icon_color,
      '&.icon::before': {
        color: tag.tag.generic.default.ds_tag_generic_icon_color
      },

      '&.medium': {
        fontSize: `${tag.ds_tag_generic_icon_small_size}px`,
        height: `${tag.ds_tag_generic_icon_small_size}px`,
        width: `${tag.ds_tag_generic_icon_small_size}px`
      },

      '&.small': {
        fontSize: `${tag.ds_tag_generic_icon_small_size}px`,
        height: `${tag.ds_tag_generic_icon_small_size}px`,
        width: `${tag.ds_tag_generic_icon_small_size}px`
      },
      '&.large': {
        fontSize: `${tag.ds_tag_generic_icon_medium_size}px`,
        height: `${tag.ds_tag_generic_icon_medium_size}px`,
        width: `${tag.ds_tag_generic_icon_medium_size}px`
      },
      '&.xs': {
        fontSize: `${tag.ds_tag_generic_icon_xsmall_size}px`,
        height: `${tag.ds_tag_generic_icon_xsmall_size}px`,
        width: `${tag.ds_tag_generic_icon_xsmall_size}px`
      }
    }
  })
}

export const typographyLightStyles = () => {
  const tag = tagTheme('light')
  return {
    '&.MuiTypography-root': {
      color: tag.tag.generic.default.ds_tag_generic_text_color,
      '&.labelSpacelarge': {
        fontSize: '14px'
      },
      '&.labelSpacemedium': {
        fontSize: '12px'
      },
      '&.labelSpacesmall': {
        fontSize: '10px'
      },
      '&.labelSpacexs': {
        fontSize: '10px'
      }
    }
  }
}
