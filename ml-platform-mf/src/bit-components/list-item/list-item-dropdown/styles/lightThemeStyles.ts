import {
  dropdown_list as dropdown_listTheme,
  typography as typographyTheme
} from '../../../design-tokens/index'
// eslint-disable-next-line
const dropdown_list = dropdown_listTheme('light')
const typography = typographyTheme('light')
export const listItemDropdownLightThemeStyle = {
  '&.MuiButtonBase-root': {
    '&.MuiListItemButton-root': {
      borderRadius: `${dropdown_list.ds_dropdown_list_item_radius}px`,
      boxSizing: 'border-box',
      padding: `${dropdown_list.ds_dropdown_list_item_vertical_spacing}px`,
      paddingRight: `16px`,
      height: 'max-content',
      wordWrap: 'break-word',
      width: 'inherit',
      '&.withRightIcon': {
        paddingRight: `${dropdown_list.ds_dropdown_list_item_vertical_spacing}px`
      },
      '&:hover': {
        backgroundColor:
          dropdown_list.dropdown_list.hover
            .ds_dropdown_list_item_hover_background_color
      },
      '&.selected': {
        backgroundColor:
          dropdown_list.dropdown_list.selected
            .ds_dropdown_list_item_selected_background_color
      }
    }
  },
  '& .MuiListItemIcon-root': {
    minWidth: '16px'
  },
  '& .MuiListItemText-root': {
    marginTop: '0px',
    marginBottom: '0px'
  },
  '& .primaryText': {
    flex: 1,
    '& span': {
      color:
        dropdown_list.dropdown_list.default.ds_dropdown_list_item_text_color,
      fontWeight: 400,
      fontSize: `${typography.body.ds_font_body_2_regular.fontSize}px`,
      lineHeight: `${typography.body.ds_font_body_2_regular.lineHeight}px`
    },
    '&.bold > span': {
      fontWeight: 700
    }
  },
  '& .secondaryText > span': {
    marginTop: `${dropdown_list.ds_dropdown_list_item_subtitle_top_spacing}px`,
    fontSize: `${typography.caption.ds_font_caption_2_regular.fontSize}px`,
    lineHeight: `${typography.caption.ds_font_caption_2_regular.lineHeight}px`,
    color:
      dropdown_list.dropdown_list.default
        .ds_dropdown_list_item_subtitle_text_color
  },
  '& .leftIcon': {
    marginRight: `${dropdown_list.ds_dropdown_list_item_leading_icon_right_spacing}px`
  },
  '& .rightIcon': {
    marginLeft: `${dropdown_list.ds_dropdown_list_item_trailing_icon_left_spacing}px`
  },
  '& .icon': {
    '&:before': {
      width: `${dropdown_list.ds_dropdown_list_item_small_icon_size}px`,
      height: `${dropdown_list.ds_dropdown_list_item_small_icon_size}px`,
      fontSize: `${dropdown_list.ds_dropdown_list_item_small_icon_size}px`,
      color:
        dropdown_list.dropdown_list.default
          .ds_dropdown_list_item_default_leading_icon_color
    }
  },
  '& .hasPermission': {
    color:
      dropdown_list.dropdown_list.default
        .ds_dropdown_list_item_subtitle_text_color,
    fontWeight: 400,
    fontSize: `${typography.body.ds_font_body_2_regular.fontSize}px`,
    lineHeight: `${typography.body.ds_font_body_2_regular.lineHeight}px`,
    fontStyle: 'italic',
    fontFamily: 'Roboto'
  },
  '& .primaryTextContainer': {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%'
  },
  '& .textDiv': {
    width: '100%'
  }
}
