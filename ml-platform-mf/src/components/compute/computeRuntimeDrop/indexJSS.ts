import {SxProps} from '@mui/material'
import {createStyles} from '@mui/material'
import {aliasTokens} from '../../../theme.contants'

import {
  divider,
  dropdown_list,
  input_field,
  typography
} from '../../../bit-components/design-tokens/index'
import {Typography} from '../../../themes'

export const inputStyles: SxProps = {
  '& .MuiAutocomplete-popper': {
    background: 'rgba(51, 51, 51, 0.9)',
    '& >div': {
      background: 'rgba(51, 51, 51, 0.9)'
    }
  },
  '& .MuiAutocomplete-clearIndicator': {
    borderRight: `${divider('dark').ds_divider_vertical_border_weight}px ${
      divider('dark').border_style.ds_divider_vertical_border_solid
    }  ${divider('dark').divider.ds_divider_border_generic_color}`,
    borderRadius: '0px',
    marginRight: `${
      dropdown_list('dark').ds_dropdown_list_item_leading_icon_right_spacing
    }px`,
    paddingRight: `${
      dropdown_list('dark').ds_dropdown_list_item_leading_icon_right_spacing
    }px`
  },

  '&.MuiTextField-root': {
    height: 'fit-content'
  },
  '& .MuiSvgIcon-root': {
    color: '#8F8F8F'
  },

  '& .MuiInputLabel': {
    '&-root': {
      color:
        input_field('dark').input_field.text
          .ds_input_field_default_label_text_color,
      fontSize: `${typography('dark').body.ds_font_body_2_regular.fontSize}px`,
      lineHeight: `${
        typography('dark').body.ds_font_body_2_regular.lineHeight
      }px`,
      transform: 'translate(12px,9px) scale(1)',

      '&.Mui-focused': {
        color:
          input_field('dark').input_field.text
            .ds_input_field_focus_label_text_color
      },
      '&.Mui-error': {
        color:
          input_field('dark').input_field.text
            .ds_input_field_error_label_text_color
      },
      '&.Mui-disabled': {
        color:
          input_field('dark').input_field.text
            .ds_input_field_disable_label_text_color
      }
    },
    '&-shrink': {
      top: '0px',
      transform: 'translate(8px,-8px) scale(.8)',
      paddingLeft: `${
        input_field('dark').ds_input_field_label_background_horizontal_spacing
      }px`,
      paddingRight: `${
        input_field('dark').ds_input_field_label_background_horizontal_spacing
      }px`
    }
  },

  '& .MuiOutlinedInput-input': {
    boxSizing: 'border-box',
    '&:WebkitAutofill': {
      WebkitBoxShadow: '0 0 0 100px #121212 inset',
      WebkitTextFillColor:
        input_field('dark').input_field.text
          .ds_input_field_default_lnput_text_color
    },
    '&.Mui-disabled': {
      WebkitTextFillColor:
        input_field('dark').input_field.text
          .ds_input_field_default_label_text_color
    }
  },

  'input:-internal-autofill-selected ': {
    backgroundColor: 'transparent'
  },
  '&.iconRightPadding': {
    '& .MuiOutlinedInput-root': {
      paddingRight: `${
        input_field('dark').ds_input_field_large_horizontal_spacing
      }px`
    }
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
    color:
      input_field('dark').input_field.text
        .ds_input_field_default_lnput_text_color,
    fontSize: `${typography('dark').body.ds_font_body_2_regular.fontSize}px`,
    lineHeight: `${
      typography('dark').body.ds_font_body_2_regular.lineHeight
    }px`,
    border: '0px',
    borderRadius: `${input_field('dark').ds_input_field_radius}px`,
    '& fieldset': {
      border: `1px solid ${
        input_field('dark').input_field.border
          .ds_input_field_default_border_color
      }`
    },
    '&:hover fieldset': {
      border: `1px solid ${
        input_field('dark').input_field.border
          .ds_input_field_default_border_color
      }`
    },
    '&.Mui-focused fieldset': {
      border: `1px solid ${
        input_field('dark').input_field.border.ds_input_field_focus_border_color
      }`
    },
    '&.Mui-error fieldset': {
      border: `1px solid ${
        input_field('dark').input_field.border.ds_input_field_error_border_color
      }`
    },
    '&.Mui-disabled fieldset': {
      border: `1px solid ${
        input_field('dark').input_field.border
          .ds_input_field_disable_border_color
      }`
    }
  },
  '& .MuiFormHelperText-root': {
    color:
      input_field('dark').input_field.text
        .ds_input_field_default_assistive_text_color,
    fontSize: `${typography('dark').body.ds_font_body_1_regular.fontSize}px`,
    lineHeight: `${
      typography('dark').body.ds_font_body_1_regular.lineHeight
    }px`,
    '&.Mui-error': {
      color:
        input_field('dark').input_field.text
          .ds_input_field_error_assistive_text_color
    },
    '&.Mui-disabled': {
      color:
        input_field('dark').input_field.text
          .ds_input_field_disable_assistive_text_color
    }
  },

  '& .helperText': {
    display: 'flex',
    justifyContent: 'space-between'
  }
}

const styles = () =>
  createStyles({
    container: {
      '& .MuiOutlinedInput-root': {
        height: '40px'
      },
      '& .MuiAutocomplete-popper': {
        marginTop: '2px !important',
        // background: 'rgba(51, 51, 51, 0.9)',
        '& >div': {
          background: 'rgba(51, 51, 51, 0.9)'
        },
        '& ul': {
          padding: '0px',
          background: 'rgba(51, 51, 51, 0.9)'
        },
        '& li': {
          padding: '0px'
        },
        '& .MuiPaper-rounded': {
          border: 'none'
        }
      }
    },
    noOptionBox: {
      height: '50px',
      color: aliasTokens.primary_text_color
    },
    customAutocomplete: {
      width: '360px'
    },
    customSelect: {
      width: '312px',
      margin: '0 auto'
    },
    createClusterWrapper: {
      borderTop: `1px solid ${aliasTokens.secondary_background_color}`,
      width: '100%',
      display: 'flex',
      height: '44px',
      alignItems: 'center',
      padding: '12px 16px 12px 12px'
    },
    createClusterItem: {
      color: aliasTokens.cta_secondary_text_color,
      fontWeight: '400',
      fontSize: '14px',
      lineHeight: '20px',
      flex: '1',
      marginLeft: '12px'
    },
    openCreateClusterBtn: {
      color: aliasTokens.cta_secondary_text_color
    },
    listItemWrapper: {
      display: 'flex',
      width: '100%',
      alignItems: 'center',
      margin: '4px',
      borderRadius: '4px',
      height: '54px',
      padding: '8px 12px 8px 8px',
      '&:hover': {
        background: aliasTokens.secondary_background_color
      },
      '&.active': {
        background: aliasTokens.cta_disabled_secondary_background_color
      }
    },
    listItem1: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1
    },
    listItem11: {
      fontWeight: '400',
      fontSize: '14px',
      lineHeight: '20px',
      color: aliasTokens.neutral_text_color
    },
    listItem12: {
      fontWeight: '400',
      fontSize: '12px',
      lineHeight: '16px',
      color: aliasTokens.tertiary_text_color
    },
    listItem2: {
      marginLeft: 'auto'
    },
    listItem3: {
      marginLeft: '14px'
    },
    runtimeTabs: {
      margin: '-6px -16px',
      background: 'none',
      width: 'calc(100% + 32px)',
      height: '44px',
      display: 'flex',
      alignItems: 'center',
      borderBottom: '1px solid #d9d9d933',
      cursor: 'auto',
      overflowX: 'auto'
    },
    runtimeTabDiv: {
      fontWeight: 700,
      fontSize: '14px',
      lineHeight: '20px',
      display: 'flex',
      alignItems: 'center',
      color: '#D9D9D9',
      justifyContent: 'center',
      flex: '0 0 33%',
      height: '100%',
      borderBottom: '1px solid transparent',
      cursor: 'pointer'
    },
    runtimeTabDivActive: {
      borderBottom: '1px solid #57ABFF',
      color: '#57ABFF'
    },
    runtimeTabSpan: {
      padding: '2px 8px',
      background: '#4D4D4D',
      borderRadius: '4px',
      marginLeft: '8px',
      color: '#D9D9D9'
    },
    runtimeTabSpanActive: {
      background: 'rgba(87, 171, 255, 0.2)'
    },
    dropdownLiItemContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      padding: '8px',
      borderRadius: '4px',
      width: '100%',
      height: '100%',
      '&:hover': {
        background: 'rgba(51, 51, 51, 0.9)'
      },
      rowGap: '4px'
    },
    dropdownLiName: Typography.is('body2')
      .with({
        fontWeight: 400,
        fontSize: '14px',
        lineHeight: '20px',
        marginLeft: '24px'
      })
      .toCSS(),
    dropdownNameAlignment: {
      display: 'flex',
      justifyContent: 'space-between',
      width: '100%'
    },
    dropdownLiCreatedBy: Typography.is('caption2')
      .with({
        fontStyle: 'italic',
        color: aliasTokens.tertiary_text_color,
        marginLeft: '24px',
        fontSize: '12px'
      })
      .toCSS(),
    dropdownLiItemPlaceHolder: {
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px',
      color: aliasTokens.tertiary_text_color,
      padding: '8px',
      borderRadius: '4px',
      width: '100%',
      cursor: 'auto'
    },
    moreButton: {
      marginLeft: '16px'
    },
    dropDownLinkIcon: {
      color: aliasTokens.dropdown_link_icon_color
    },
    selectedRuntime: {
      background: aliasTokens.tertiary_background_color
    }
  })

export default styles
