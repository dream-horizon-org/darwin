import {textlink as textlinkTheme} from '../../design-tokens/index'
export const stylesLightTheme = () => {
  const textlink = textlinkTheme('light')
  return {
    '&.wrapper': {
      width: 'max-content',
      cursor: 'pointer',
      height: 'max-content',
      fontFamily: 'Roboto',
      flexWrap: 'nowrap',
      whiteSpace: 'nowrap',
      '& .icon': {
        width: `${textlink.ds_textlink_icon_size}px`,
        height: `${textlink.ds_textlink_icon_size}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      '&.primary': {
        '& .icon:before': {
          color: `${textlink.textlink.icon.ds_textlink_primary_active_icon_color}`
        },
        '& .MuiLink-root': {
          color: `${textlink.textlink.text.ds_textlink_primary_active_text_color}`
        },
        '&:hover': {
          '& .MuiLink-root': {
            color: `${textlink.textlink.text.ds_textlink_primary_hover_text_color}`,
            textDecoration: 'underline',
            textDecorationStyle: textlink.border_style.ds_textlink_border_style
          },
          '& .icon:before': {
            color: `${textlink.textlink.icon.ds_textlink_primary_hover_icon_color}`
          }
        },
        '&.removeHover': {
          cursor: 'unset',
          '&:hover': {
            '& .MuiLink-root': {
              color: `${textlink.textlink.icon.ds_textlink_primary_active_icon_color}`,
              textDecoration: 'none',
              textDecorationStyle: 'none'
            }
          }
        },
        '&.addCursor': {
          '&:hover': {
            cursor: 'pointer'
          }
        },
        '&.disabled': {
          cursor: 'unset',
          textDecoration: 'none',
          '& .MuiLink-root': {
            color: `${textlink.textlink.text.ds_textlink_disable_text_color}`,
            textDecoration: 'none'
          },
          '& .icon:before': {
            color: `${textlink.textlink.icon.ds_textlink_disable_icon_color}`
          }
        }
      },
      '&.secondary': {
        '& .icon:before': {
          color: `${textlink.textlink.icon.ds_textlink_secondary_active_icon_color}`
        },
        '& .MuiLink-root': {
          color: `${textlink.textlink.text.ds_textlink_secondary_active_text_color}`
        },
        '&:hover': {
          '& .MuiLink-root': {
            color: `${textlink.textlink.text.ds_textlink_secondary_hover_text_color}`,
            textDecoration: 'underline',
            textDecorationStyle: textlink.border_style.ds_textlink_border_style
          },
          '& .icon:before': {
            color: `${textlink.textlink.icon.ds_textlink_secondary_hover_icon_color}`
          }
        },
        '&.removeHover': {
          cursor: 'unset',
          '&:hover': {
            '& .MuiLink-root': {
              color: `${textlink.textlink.text.ds_textlink_secondary_active_text_color}`,
              textDecoration: 'none',
              textDecorationStyle: 'none'
            }
          }
        },
        '&.disabled': {
          cursor: 'unset',
          textDecoration: 'none',
          '& .MuiLink-root': {
            color: `${textlink.textlink.text.ds_textlink_disable_text_color}`,
            textDecoration: 'none'
          },
          '& .icon:before': {
            color: `${textlink.textlink.icon.ds_textlink_disable_icon_color}`
          }
        }
      },
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',

      '&.small': {
        height: '16px',
        fontSize: '12px',
        lineHeight: '16px',
        textUnderlineOffset: '3px',
        '& .icon': {
          width: `${textlink.ds_textlink_icon_size}px`,
          height: `${textlink.ds_textlink_icon_size}px`,
          fontSize: '16px',
          marginLeft: `${textlink.ds_textlink_icon_left_spacing}px`
        }
      },
      '&.large': {
        height: '20px',
        fontSize: '14px',
        lineHeight: '20px',
        textUnderlineOffset: '4px',
        '& .icon': {
          width: `${textlink.ds_textlink_icon_size}px`,
          height: `${textlink.ds_textlink_icon_size}px`,
          fontSize: '16px',
          marginLeft: `${textlink.ds_textlink_icon_left_spacing}px`
        }
      }
    }
  }
}
