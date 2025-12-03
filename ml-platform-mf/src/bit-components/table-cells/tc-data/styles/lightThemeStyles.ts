import {createUseStyles} from 'react-jss'
import {
  icon_button as icon_buttonTheme,
  table as tableTheme,
  textlink as textlinkTheme,
  typography as typographyTheme
} from '../../../design-tokens/index'

const table = tableTheme('light')
const typography = typographyTheme('light')
const textlink = textlinkTheme('light')
// eslint-disable-next-line @typescript-eslint/naming-convention
const icon_button = icon_buttonTheme('light')
const lightThemeStyles = createUseStyles({
  textBox: {
    width: '100%',
    maxWidth: table.ds_table_cell_container_maxwidth,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    lineHeight: `${typography.body.ds_font_body_1_regular.lineHeight}px`,

    WebkitTextFillColor: `${table.table.table_title.ds_table_title_default_text_color}`,
    // ToDo handle webkit for other browsers
    '&.large': {
      WebkitLineClamp: 2
    },
    '&.medium': {
      WebkitLineClamp: 2
    },
    '&.small': {
      WebkitLineClamp: 1
    }
  },
  textBoxPrimary: {
    fontWeight: 700
  },
  textBoxSecondary: {
    width: '100%',
    maxWidth: table.ds_table_cell_container_maxwidth,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitTextFillColor: `${table.table.table_title.ds_table_subtext_default_text_color}`,
    // ToDo handle webkit for other browsers
    '&.large': {
      WebkitLineClamp: 2
    },
    '&.medium': {
      WebkitLineClamp: 2
    },
    '&.small': {
      WebkitLineClamp: 1
    }
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    width: '16px',
    height: '16px',
    '&:before': {
      color: table.table.table_title.ds_table_title_default_text_color
    },
    '&.leading': {
      marginRight: '8px',
      '&::before': {
        color:
          icon_button.icon_button.primary.icon
            .ds_icon_button_primary_default_icon_color
      }
    },
    '&.trailing': {
      marginLeft: '8px',
      '&::before': {
        color:
          icon_button.icon_button.primary.icon
            .ds_icon_button_primary_default_icon_color
      }
    }
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: table.ds_table_cell_tag_inline_spacing
  },
  avatar: {
    marginRight: '8px',
    '&.small': {
      width: '32px',
      height: '32px'
    }
  },
  extras: {
    color: textlink.textlink.text.ds_textlink_primary_active_text_color,
    fontSize: typography.caption.ds_font_caption_1_regular.fontSize,
    lineHeight: `${typography.caption.ds_font_caption_1_regular.lineHeight}px`
  }
})

export default lightThemeStyles
