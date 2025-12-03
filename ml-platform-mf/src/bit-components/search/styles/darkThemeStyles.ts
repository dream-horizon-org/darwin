import {createUseStyles} from 'react-jss'
import {
  divider as dividerTheme,
  dropdown as dropdown_menuTheme,
  dropdown_list as dropdown_listTheme,
  input_field as input_fieldTheme,
  search as searchTheme,
  typography as typographyTheme
} from '../../design-tokens/index'
const inputField = input_fieldTheme('dark')
const divider = dividerTheme('dark')
const search = searchTheme('dark')
const typography = typographyTheme('dark')
const dropdownMenu = dropdown_menuTheme('dark')
const dropdownList = dropdown_listTheme('dark')
export const stylesDarkThemeSearch = {
  '&.medium': {
    '& .MuiOutlinedInput-input': {
      padding: `${search.ds_search_by_vertical_spacing}px ${search.ds_search_by_right_spacing}px ${search.ds_search_by_vertical_spacing}px ${search.ds_search_by_left_spacing}px`,
      minHeight: '40px'
    },
    '&.MuiTextField-root': {
      height: 'max-content'
    }
  },
  '&.MuiTextField-root': {
    height: 'fit-content'
  },
  '& .MuiInputAdornment-root': {
    marginRight: '0px'
  },
  // TO Do ask design team to add tokens for input background autofill
  '& .MuiOutlinedInput-input': {
    boxSizing: 'border-box',
    '&:-webkit-autofill': {
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor:
        inputField.input_field.text.ds_input_field_default_lnput_text_color
    },
    '&.Mui-disabled': {
      WebkitTextFillColor:
        inputField.input_field.text.ds_input_field_default_label_text_color
    }
  },
  'input:-internal-autofill-selected ': {
    backgroundColor: 'transparent'
  },
  '& .MuiInputLabel-outlined': {
    left: '0px'
  },
  '& .MuiTextField-root': {
    height: 'max-content',
    '& .MuiOutlinedInput-notchedOutline': {
      left: '0px'
    }
  },
  '& .MuiOutlinedInput-root': {
    backgroundColor: search.search.ds_search_background_color,
    color: search.search.ds_search_input_text_color,
    fontSize: `${typography.body.ds_font_body_2_regular.fontSize}px`,
    lineHeight: `${typography.body.ds_font_body_2_regular.lineHeight}px`,
    border: '0px',
    borderRadius: `${search.ds_search_radius}px`,
    paddingRight: '4px',
    '& fieldset': {
      border: `1px solid ${search.search.ds_search_default_border_color}`
    },
    '&:hover fieldset': {
      border: `1px solid ${inputField.input_field.border.ds_input_field_default_border_color}`
    },
    '&.Mui-focused fieldset': {
      border: `1px solid ${search.search.ds_search_focus_border_color}`
    },
    '&.Mui-error fieldset': {
      border: `1px solid ${inputField.input_field.border.ds_input_field_error_border_color}`
    },
    '&.Mui-disabled fieldset': {
      border: `1px solid ${inputField.input_field.border.ds_input_field_disable_border_color}`
    },
    '& input': {
      '&::placeholder': {
        color: search.search.ds_search_label_text_color,
        opacity: 1
      }
    }
  },

  '& .divider': {
    height: `${search.ds_search_by_icon_size}px`,
    width: `${divider.ds_divider_vertical_border_weight}px`,
    margin: `${search.ds_search_vertical_spacing}px ${search.ds_search_primary_icon_left_spacing}px`,
    background: search.search_by.ds_search_by_background_color
  },
  '&.isSearchBy': {
    '& .MuiOutlinedInput-root': {
      paddingLeft: '0px',
      boxSizing: 'border-box'
    },
    '& .MuiOutlinedInput-input': {
      minWidth: 'max-content'
    }
  }
}

export const stylesDarkSearchInputStyle = {
  '& .MuiOutlinedInput-root': {
    background: search.search_by.ds_search_by_background_color,
    borderRadius: `${search.ds_search_by_top_left_radius}px ${search.ds_search_by_top_right_radius}px ${search.ds_search_by_bottom_right_radius}px ${search.ds_search_by_bottom_left_radius}px` // '4px 0px 0px 4px'
  },
  '& .MuiSelect-icon': {
    color: search.search_by.ds_search_by_icon_color,
    fontSize: `${search.ds_search_by_icon_size}px`,
    height: `${search.ds_search_by_icon_size}px`,
    width: `${search.ds_search_by_icon_size}px`
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: '0px !important'
  },
  // TO Do ask design team to add tokens for minWith of the select component
  '& .MuiFormControl-root': {
    minWidth: '108px'
  },
  '& .MuiSelect-select': {
    paddingRight: '0px'
  }
}
export const menuSx = {
  left: '0px'
}

const stylesDarkTheme = createUseStyles({
  menuBox: {
    minWidth: 'max-content',
    marginTop: `${dropdownMenu.ds_dropdown_menu_vertical_spacing}px`,
    background: search.search_by.ds_search_by_background_color,
    color: search.search_by.ds_search_by_text_color,
    '& .MuiMenu-list': {
      background: search.search_by.ds_search_by_background_color,
      padding: `${dropdownMenu.ds_dropdown_menu_horizontal_spacing}px`
    },
    '& .MuiPaper-root': {
      minWidth: 'max-content'
    }
  }
})

export const styleDarkThemeListItem = {
  borderRadius: `${dropdownList.ds_dropdown_list_item_radius}px`,
  boxSizing: 'border-box',
  padding: `${dropdownList.ds_dropdown_list_item_vertical_spacing}px`,
  paddingRight: `${dropdownList.ds_dropdown_list_item_right_spacing}px`,
  wordWrap: 'break-word',
  width: '100%',
  fontWeight: `${typography.body.ds_font_body_2_regular.fontWeight}px`,
  fontSize: `${typography.body.ds_font_body_2_regular.fontSize}px`,
  lineHeight: `${typography.body.ds_font_body_2_regular.lineHeight}px`,
  color: dropdownList.dropdown_list.default.ds_dropdown_list_item_text_color,
  '&:hover': {
    backgroundColor:
      dropdownList.dropdown_list.hover
        .ds_dropdown_list_item_hover_background_color
  },
  '&.selected': {
    backgroundColor:
      dropdownList.dropdown_list.selected
        .ds_dropdown_list_item_selected_background_color
  }
}

export const stylesDarkThemeSearchListStyle = {
  marginTop: `${dropdownMenu.ds_dropdown_menu_vertical_spacing}px`,
  padding: `${dropdownMenu.ds_dropdown_menu_vertical_spacing}px`,
  border: `1px solid ${dropdownMenu.dropdown_menu.ds_dropdown_menu_border_color} !important`,
  borderRadius: `${dropdownList.ds_dropdown_list_item_radius}px`,
  background: dropdownMenu.dropdown_menu.ds_dropdown_menu_background_color,
  boxShadow: '0px 4px 10px 0px #00000040',
  gap: '1px',
  display: 'flex',
  flexDirection: 'column'
}

export default stylesDarkTheme
