import {createUseStyles} from 'react-jss'
import {tag as tagTheme} from '../../../design-tokens/index'

export const stylesLightTheme = () => {
  const tag = tagTheme('light')

  return createUseStyles({
    tagsStatus: {
      display: 'flex',
      alignItems: 'center'
    },
    icons: {
      marginRight: tag.ds_tag_status_icon_right_spacing,
      fontSize: tag.ds_tag_generic_icon_medium_size,
      '&.Active': {
        '&:before': {
          color: tag.tag.generic.success.ds_tag_generic_success_background_color
        }
      },
      '&.Paused': {
        '&:before': {
          color: tag.tag.generic.warning.ds_tag_generic_warning_background_color
        }
      },
      '&.Draft': {
        '&:before': {
          color: tag.tag.generic.default.ds_tag_generic_default_background_color
        }
      },
      '&.Information': {
        '&:before': {
          color:
            tag.tag.generic.information
              .ds_tag_generic_information_background_color
        }
      },
      '&.Error': {
        '&:before': {
          color: tag.tag.generic.error.ds_tag_generic_error_background_color
        }
      }
    }
  })
}

export const typographyLightStyles = () => {
  const tag = tagTheme('light')
  return {
    '&.MuiTypography-root': {
      color: tag.tag.status.text.ds_tag_status_default_text_color
    }
  }
}
