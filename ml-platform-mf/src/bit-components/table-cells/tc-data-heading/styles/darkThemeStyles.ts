import {createUseStyles} from 'react-jss'
import {
  dropdown as dropdown_menuTheme,
  icon_button as icon_buttonTheme,
  table as tableTheme,
  typography as typographyTheme
} from '../../../design-tokens/index'

const table = tableTheme('dark')
const typography = typographyTheme('dark')
// eslint-disable-next-line @typescript-eslint/naming-convention
const dropdown_menu = dropdown_menuTheme('dark')
// eslint-disable-next-line @typescript-eslint/naming-convention
const icon_button = icon_buttonTheme('dark')
const darkThemeStyles = createUseStyles({
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: `${table.ds_table_cell_small_icon_size}px`,
    width: `${table.ds_table_cell_small_icon_size}px`,
    height: `${table.ds_table_cell_small_icon_size}px`,
    '&:before': {
      color: table.table.table_title.ds_table_title_default_text_color
    },
    '&.leading': {
      marginRight: `${table.ds_table_cell_small_icon_right_spacing}px`,
      fontSize: `${table.ds_table_cell_medium_icon_size}px`,
      width: `${table.ds_table_cell_medium_icon_size}px`,
      height: `${table.ds_table_cell_medium_icon_size}px`
    },
    '&.trailing': {
      marginLeft: `${table.ds_table_cell_small_icon_left_spacing}px`,
      '&::before': {
        color:
          icon_button.icon_button.primary.icon
            .ds_icon_button_primary_default_icon_color
      }
    }
  },
  modifiedSize: {
    width: `${table.ds_table_cell_banner_height}px`,
    height: `${table.ds_table_cell_banner_height}px`
  },
  iconImage: {
    width: '100%',
    height: '100%',
    marginRight: `${dropdown_menu.ds_dropdown_menu_horizontal_spacing}px`
  },
  container: {
    display: 'flex',
    alignItems: 'center'
  },
  spacedElements: {
    gap: `${table.ds_table_title_icon_left_spacing}px`
  },
  avatar: {
    marginRight: `${table.ds_table_cell_small_icon_right_spacing}px`,
    '&.small': {
      width: '32px',
      height: '32px'
    }
  },
  primaryText: {
    fontSize: `${typography.heading.ds_font_heading_5_bold.fontSize}px`,
    lineHeight: `${typography.heading.ds_font_heading_5_bold.lineHeight}px`,
    color: table.table.table_title.ds_table_title_default_text_color,
    fontWeight: typography.heading.ds_font_heading_5_bold.fontWeight
  },
  secondaryText: {
    fontSize: `${typography.body.ds_font_body_1_regular.fontSize}px`,
    lineHeight: `${typography.body.ds_font_body_1_regular.lineHeight}px`,
    color: table.table.table_title.ds_table_title_default_text_color
  }
})

export default darkThemeStyles
