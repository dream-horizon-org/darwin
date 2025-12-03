import {
  dropdown_list as dropdown_listTheme,
  list_item as list_itemTheme,
  typography as typographyTheme
} from '../../../design-tokens/index'
// eslint-disable-next-line
const list_item = list_itemTheme('light')
const dropdownList = dropdown_listTheme('light')
const typography = typographyTheme('light')
export const listItemLightThemeStyle = {
  '&.MuiButtonBase-root': {
    '&.MuiListItemButton-root': {
      fontFamily: typography.button.ds_font_button_1_bold.fontFamily,
      gap: '12px',
      border: `${list_item.ds_list_item_border_weight}px ${list_item.border_style.ds_list_item_border_style} ${list_item.list_item.border.ds_list_item_default_border_color}`,
      borderRadius: `${list_item.ds_list_item_radius}px`,
      boxSizing: 'border-box',
      padding: `${list_item.ds_list_item_small_vertical_spacing}px ${list_item.ds_list_item_small_horizontal_spacing}px`,
      background: `${list_item.list_item.background.ds_list_item_default_background_color}`,
      '&.medium': {
        padding: `${list_item.ds_list_item_medium_vertical_spacing}px ${list_item.ds_list_item_medium_horizontal_spacing}px`
      },
      '&.selected': {
        border: `${list_item.ds_list_item_border_weight}px ${list_item.border_style.ds_list_item_border_style} ${list_item.list_item.border.ds_list_item_selected_border_color}`,
        background: `${list_item.list_item.background.ds_list_item_selected_background_color}`
      },
      '&.Mui-disabled': {
        border: `${list_item.ds_list_item_border_weight}px ${list_item.border_style.ds_list_item_border_style} ${list_item.list_item.border.ds_list_item_disable_border_color}`,
        background: `${list_item.list_item.background.ds_list_item_disable_background_color}`
      },
      minHeight: '48px',
      height: 'max-content',
      '&:hover': {
        backgroundColor:
          list_item.list_item.background.ds_list_item_hover_background_color
      }
    },
    '& .MuiListItemIcon-root': {
      maxWidth: '16px'
    },
    '& .icon': {
      '&:before': {
        width: `${dropdownList.ds_dropdown_list_item_small_icon_size}px`,
        height: `${dropdownList.ds_dropdown_list_item_small_icon_size}px`,
        fontSize: `${dropdownList.ds_dropdown_list_item_small_icon_size}px`,
        color:
          dropdownList.dropdown_list.default
            .ds_dropdown_list_item_default_leading_icon_color
      }
    },
    '& .MuiListItemText-root': {
      margin: '0px'
    },
    '& .primaryText': {
      flex: 1,
      '& span': {
        color: list_item.list_item.text.ds_list_item_title_text_color,
        fontWeight: 400,
        fontSize: `${typography.body.ds_font_body_2_regular.fontSize}px`,
        lineHeight: `${typography.body.ds_font_body_2_regular.lineHeight}px`
      },
      '&.bold > span': {
        fontWeight: 700
      }
    },
    '& .secondaryText > span': {
      marginTop: `${dropdownList.ds_dropdown_list_item_subtitle_top_spacing}px`,
      fontSize: `${typography.caption.ds_font_caption_2_regular.fontSize}px`,
      lineHeight: `${typography.caption.ds_font_caption_2_regular.lineHeight}px`,
      color: list_item.list_item.text.ds_list_item_subtitle_text_color
    },
    '& .hasPermission': {
      color: list_item.list_item.text.ds_list_item_subtitle_text_color,
      fontWeight: 400,
      fontSize: `${typography.body.ds_font_body_2_regular.fontSize}px`,
      lineHeight: `${typography.body.ds_font_body_2_regular.lineHeight}px`,
      fontStyle: 'italic',
      fontFamily: 'Roboto'
    },
    '& .MuiButton-text': {
      textTransform: 'none'
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
}
