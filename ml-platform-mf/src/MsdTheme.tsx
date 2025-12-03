import {MuiPickersOverrides} from '@material-ui/pickers/typings/overrides'
import {adaptV4Theme, createTheme} from '@mui/material/styles'
import {tableComponentTokens} from './components/dataList/dataListJss'
import {aliasTokens} from './theme.contants'

type overridesNameToClassKey = {
  [P in keyof MuiPickersOverrides]: keyof MuiPickersOverrides[P]
}

declare module '@mui/material/styles/overrides' {
  export interface ComponentNameToClassKey extends overridesNameToClassKey {}
}
const paperComponentToken = {
  paper_border_color: aliasTokens.inactive_border_color,
  paper_text_color: aliasTokens.primary_text_color,
  paper_background_color: aliasTokens.secondary_background_color
}

export const ctaButtonComponentToken = {
  cta_button_background_color: aliasTokens.cta_primary_background_color,
  cta_button_secondary_background_color:
    aliasTokens.cta_secondary_background_color,
  cta_button_text_color: aliasTokens.cta_primary_text_color,
  cta_button_secondary_text_color: aliasTokens.secondary_text_color,
  cta_button_tertiary_color: aliasTokens.cta_tertiary_text_color,
  cta_button_disabled_text_color: aliasTokens.cta_disabled_primary_text_color,
  cta_button_bordered_color: aliasTokens.cta_primary_border_color,
  cta_button_disabled_background_color:
    aliasTokens.cta_disabled_primary_background_color,
  cta_button_secondary_disabled_background_color:
    aliasTokens.cta_disabled_secondary_background_color,
  cta_button_disabled_border_color:
    aliasTokens.cta_disabled_secondary_border_color,
  cta_button_secondary_disabled_text:
    aliasTokens.cta_disabled_secondary_text_color,
  cta_button_tertiary_disabled_background_border_color:
    aliasTokens.tertiary_text_color,
  cta_button_success_background_color: aliasTokens.success_background_color,
  cta_button_success_border_color: aliasTokens.success_border_color,
  cta_button_error_background_color: aliasTokens.cta_error_background_color,
  cta_button_error_border_color: aliasTokens.cta_error_border_color
}
export const textFieldComponentToken = {
  text_color: aliasTokens.primary_text_color,
  selected_text_color: aliasTokens.tertiary_text_color,
  default_border_color: aliasTokens.default_border_color,
  selected_border_color: aliasTokens.primary_border_color,
  disabled_label_text_color: aliasTokens.tertiary_text_color,
  default_background_color: aliasTokens.primary_background_color,
  selected_background_color: aliasTokens.secondary_background_color,
  hover_border_color: aliasTokens.hover_neutral_color
}
const selectComponentToken = {
  default_border_color: aliasTokens.default_border_color,
  default_text_color: aliasTokens.primary_text_color,
  disabled_label_text_color: aliasTokens.secondary_text_color,
  selected_border_color: aliasTokens.tertiary_text_color,
  popup_background_color: aliasTokens.primary_background_color,
  popup_border_color: aliasTokens.inactive_border_color,
  popup_text_color: aliasTokens.primary_text_color,
  menu_item_hover_background_color: aliasTokens.hover_primary_color,
  menu_item_selected_background_color: aliasTokens.cta_primary_background_color,
  selected_item_text_color: aliasTokens.primary_text_color
}
const checkboxComponentToken = {
  default_text_color: aliasTokens.tertiary_text_color,
  disabled_text_color: aliasTokens.secondary_text_color
}

const customDialogComponentTokens = {
  header_background_color: aliasTokens.surface_background_color,
  header_dark_background_color: aliasTokens.tertiary_background_color,
  background_color: aliasTokens.secondary_background_color,
  text_color: aliasTokens.primary_text_color
}

const checkableComponentTokens = {
  disabled_background_border_color: aliasTokens.surface_background_color,
  checked_background_border_color: aliasTokens.primary_border_color,
  checked_hover_background_color: aliasTokens.cta_primary_background_color,
  disabled_hover_background_color:
    aliasTokens.cta_disabled_secondary_background_color
}

const tabBarComponentTokens = {
  background_color: aliasTokens.secondary_background_color
}

const toggleSwitchTokens = {
  primary_checked_background_color: aliasTokens.cta_primary_background_color,
  hover_primary_checked_background_color:
    aliasTokens.cta_secondary_background_color,
  disabled_primary_color: aliasTokens.cta_disabled_primary_background_color,
  disabled_checked_primary_background_color:
    aliasTokens.cta_primary_background_color,
  track_background_unchecked_background_border_color:
    aliasTokens.cta_disabled_primary_background_color
}

const snackbarComponentToken = {
  snackbar_background_color: aliasTokens.warning_background_color,
  snackbar_border: aliasTokens.information_border_color,
  snackbar_text_color: aliasTokens.primary_text_color
}

const chipComponentTokens = {
  default_background_color: aliasTokens.tertiary_background_color,
  default_text_color: aliasTokens.primary_text_color,
  default_border_color: aliasTokens.default_border_color,
  selected_background_color: aliasTokens.hover_primary_color,
  select_border_color: aliasTokens.primary_border_color,
  disabled_border_color: aliasTokens.cta_disabled_secondary_border_color,
  disabled_text_color: aliasTokens.cta_disabled_primary_text_color,
  disabled_background_color: aliasTokens.cta_disabled_secondary_background_color
}
const stepperComponentToken = {
  default_label_text_color: aliasTokens.primary_text_color,
  selected_label_text_color: aliasTokens.primary_text_color,
  completed_label_text_color: aliasTokens.primary_text_color
}

export const loaderComponentTokens = {
  default_text_color: aliasTokens.primary_text_color,
  background_color: aliasTokens.surface_background_color
}

export const linkComponentTokens = {
  default_text_color: aliasTokens.secondary_link_text_color
}

export const typographyComponentTokens = {
  default_text_color: aliasTokens.primary_text_color,
  base_text_color: aliasTokens.base_text_color,
  secondary_text_color: aliasTokens.secondary_text_color,
  success_text_color: aliasTokens.success_text_color,
  error_text_color: aliasTokens.error_text_color,
  helper_text_color: aliasTokens.secondary_text_color,
  tertiary_text_color: aliasTokens.tertiary_text_color
}

export const iconComponentTokens = {
  default_color: aliasTokens.primary_text_color,
  disabled_icon_color: aliasTokens.cta_disabled_primary_background_color,
  secondary_icon_color: aliasTokens.cta_primary_background_color,
  error_color: aliasTokens.error_icon_color,
  success_color: aliasTokens.success_icon_color
}

export const listComponentTokens = {
  default_border_color: aliasTokens.default_border_color,
  hover_background_color: aliasTokens.hover_primary_color,
  hover_border_color: aliasTokens.primary_border_color,
  selected_background_color: aliasTokens.hover_primary_color,
  selected_border_color: aliasTokens.primary_border_color,
  default_text_color: aliasTokens.base_text_color
}

export const datepickerComponentTokens = {
  default_background_color: aliasTokens.tertiary_background_color,
  header_text_color: aliasTokens.primary_text_color,
  disabled_text_color: aliasTokens.tertiary_text_color,
  default_text_color: aliasTokens.base_text_color,
  highlight_text_color: aliasTokens.cta_primary_text_color,
  highlight_background_color: aliasTokens.cta_primary_background_color
}

const theme = createTheme(
  adaptV4Theme({
    typography: {
      fontFamily: ['Roboto', 'sans-serif'].join(',')
    },
    palette: {
      primary: {
        main: aliasTokens.primary_background_color
      },
      secondary: {
        main: aliasTokens.secondary_background_color
      },
      background: {
        default: aliasTokens.primary_background_color
      }
    },
    overrides: {
      MuiIconButton: {
        colorPrimary: {
          color: iconComponentTokens.default_color
        },
        root: {
          '&$disabled': {
            color: iconComponentTokens.disabled_icon_color
          }
        }
      },
      MuiSvgIcon: {
        colorPrimary: {
          color: iconComponentTokens.default_color
        },
        colorSecondary: {
          color: iconComponentTokens.secondary_icon_color
        },
        colorDisabled: {
          color: iconComponentTokens.disabled_icon_color
        }
      },
      MuiTableCell: {
        root: {
          borderBottom: `0.5px solid ${tableComponentTokens.default_border_color}`,
          '&:last-child': {
            paddingRight: 'none'
          },
          color: tableComponentTokens.text_color
        },
        body: {
          color: tableComponentTokens.text_color
        },
        head: {
          color: tableComponentTokens.text_color,
          backgroundColor: tableComponentTokens.table_header_color
        }
      },
      MuiSnackbarContent: {
        root: {
          color: snackbarComponentToken.snackbar_text_color,
          backgroundColor: snackbarComponentToken.snackbar_background_color,
          border: `1px solid ${snackbarComponentToken.snackbar_border}`
        }
      },
      MuiTableHead: {
        root: {
          minHeight: 56
        }
      },
      MuiTableRow: {
        root: {
          backgroundColor: tableComponentTokens.default_row_background_color
        }
      },
      MuiTablePagination: {
        root: {
          color: tableComponentTokens.pagination_text_color,
          '& .MuiIconButton-root.Mui-disabled': {
            color: tableComponentTokens.pagination_text_color
          }
        },
        actions: {
          color: tableComponentTokens.pagination_text_color
        }
      },
      MuiTableSortLabel: {
        root: {
          color: tableComponentTokens.text_color,
          '&.MuiTableSortLabel-active': {
            color: tableComponentTokens.text_color
          },
          '&:focus': {
            color: tableComponentTokens.text_color
          },
          '&:hover': {
            color: tableComponentTokens.text_color,
            '& $icon': {
              opacity: 0.5
            }
          },
          '&$active': {
            color: tableComponentTokens.text_color,
            '&& $icon': {
              opacity: 1,
              color: tableComponentTokens.sort_label_icon_color
            }
          }
        },
        icon: {
          // color: tableComponentTokens.sort_label_icon_color
        }
      },
      MuiButton: {
        root: {
          color: ctaButtonComponentToken.cta_button_text_color,
          '&.Mui-disabled': {
            backgroundColor:
              ctaButtonComponentToken.cta_button_disabled_background_color,
            color: ctaButtonComponentToken.cta_button_disabled_text_color
          }
        },
        outlinedPrimary: {
          color: ctaButtonComponentToken.cta_button_tertiary_color,
          border: `1px solid ${ctaButtonComponentToken.cta_button_bordered_color}`,
          backgroundColor:
            ctaButtonComponentToken.cta_button_secondary_background_color,
          '&.Mui-disabled': {
            color: ctaButtonComponentToken.cta_button_secondary_disabled_text,
            backgroundColor:
              ctaButtonComponentToken.cta_button_secondary_disabled_background_color,
            border: `1px solid ${ctaButtonComponentToken.cta_button_disabled_border_color}`
          },
          '&:hover': {
            backgroundColor:
              ctaButtonComponentToken.cta_button_secondary_background_color,
            border: `1px solid ${ctaButtonComponentToken.cta_button_bordered_color}`
          }
        },
        textPrimary: {
          background: 'none',
          color: ctaButtonComponentToken.cta_button_tertiary_color,
          '&.Mui-disabled': {
            color:
              ctaButtonComponentToken.cta_button_tertiary_disabled_background_border_color,
            background: 'none'
          }
        },
        textSecondary: {
          color: ctaButtonComponentToken.cta_button_secondary_text_color,
          '&.Mui-disabled': {
            color: ctaButtonComponentToken.cta_button_secondary_disabled_text,
            background: 'none'
          }
        },
        contained: {
          color: ctaButtonComponentToken.cta_button_text_color,
          backgroundColor:
            ctaButtonComponentToken.cta_button_secondary_background_color,
          '&.Mui-disabled': {
            color: ctaButtonComponentToken.cta_button_disabled_text_color,
            backgroundColor:
              ctaButtonComponentToken.cta_button_disabled_background_color
          },
          '&:hover': {
            backgroundColor:
              ctaButtonComponentToken.cta_button_secondary_background_color
          }
        },
        containedPrimary: {
          color: ctaButtonComponentToken.cta_button_text_color,
          backgroundColor: ctaButtonComponentToken.cta_button_background_color,
          '&:hover': {
            backgroundColor: ctaButtonComponentToken.cta_button_background_color
          }
        },
        fullWidth: {
          backgroundColor: ctaButtonComponentToken.cta_button_background_color,
          color: ctaButtonComponentToken.cta_button_text_color,
          borderRadius: 0,
          '&:hover': {
            backgroundColor: ctaButtonComponentToken.cta_button_background_color
          }
        }
      },
      MuiLinearProgress: {
        colorPrimary: {
          // backgroundColor:
          //   progressIndicatorComponentTokens.default_background_color
        },
        barColorPrimary: {
          // backgroundColor: progressIndicatorComponentTokens.default_bar_color
        }
      },
      MuiPaper: {
        root: {
          backgroundColor: paperComponentToken.paper_background_color,
          borderRadius: 8,
          color: paperComponentToken.paper_text_color,
          border: `1px solid ${paperComponentToken.paper_border_color}`
        },
        rounded: {
          borderRadius: 8
        }
      },
      MuiChip: {
        root: {
          color: chipComponentTokens.default_text_color,
          '&.Mui-disabled': {
            borderColor: chipComponentTokens.disabled_border_color,
            color: chipComponentTokens.disabled_text_color,
            backgroundColor: chipComponentTokens.disabled_background_color,
            opacity: 1
          }
        },
        outlined: {
          color: chipComponentTokens.default_text_color,
          backgroundColor: chipComponentTokens.default_background_color,
          borderColor: chipComponentTokens.default_border_color,
          '&&:hover': {
            backgroundColor: chipComponentTokens.selected_background_color,
            borderColor: chipComponentTokens.select_border_color
          },
          '&&:focus': {
            backgroundColor: chipComponentTokens.selected_background_color,
            borderColor: chipComponentTokens.select_border_color
          }
        },
        clickable: {
          '&&:hover': {
            backgroundColor: chipComponentTokens.selected_background_color,
            borderColor: chipComponentTokens.select_border_color
          },
          '&&:focus': {
            backgroundColor: chipComponentTokens.selected_background_color,
            borderColor: chipComponentTokens.select_border_color
          }
        },
        deleteIcon: {
          color: chipComponentTokens.default_text_color,
          '&&:hover': {
            backgroundColor: chipComponentTokens.selected_background_color,
            borderColor: chipComponentTokens.select_border_color
          },
          '&&:focus': {
            backgroundColor: chipComponentTokens.selected_background_color,
            borderColor: chipComponentTokens.select_border_color
          }
        }
      },
      MuiFormHelperText: {
        root: {
          // color: asyncAutosuggestComponentToken.auto_suggest_label_text_color
        }
      },
      MuiInputBase: {
        root: {
          color: textFieldComponentToken.text_color
        },
        input: {},
        disabled: {
          color: `${textFieldComponentToken.disabled_label_text_color}`
        }
      },
      MuiTextField: {
        root: {
          '& label.Mui-focused': {
            color: textFieldComponentToken.selected_text_color,
            borderBottomColor: textFieldComponentToken.selected_border_color
          },
          '& .MuiInput-underline:before': {
            borderBottomColor: textFieldComponentToken.default_border_color
          },
          color: textFieldComponentToken.text_color,
          '& .MuiInputBase-input': {
            color: textFieldComponentToken.text_color
          },
          '& .MuiInput-underline.MuiInput-focused:after': {
            borderBottomColor: textFieldComponentToken.selected_border_color
          },
          '& .MuiInputBase-input.Mui-disabled': {
            color: textFieldComponentToken.disabled_label_text_color,
            '-webkit-text-fill-color':
              textFieldComponentToken.disabled_label_text_color
          }
        }
      },
      MuiOutlinedInput: {
        root: {
          '& fieldset': {
            borderColor: textFieldComponentToken.default_border_color
          },
          '&.Mui-focused fieldset, &.Mui-focused .MuiOutlinedInput-notchedOutline':
            {
              borderColor: textFieldComponentToken.selected_border_color
            },
          '&:hover $notchedOutline': {
            borderColor: textFieldComponentToken.hover_border_color
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: aliasTokens.error_text_color
          },
          '& .Mui-disabled fieldset': {
            borderColor: aliasTokens.error_text_color
          },
          '& .Mui-disabled': {
            color: `${textFieldComponentToken.disabled_label_text_color}!important`,
            '-webkit-text-fill-color': `${textFieldComponentToken.disabled_label_text_color} !important`
          }
        }
      },
      MuiInputLabel: {
        root: {
          color: textFieldComponentToken.text_color,
          '&$focused': {
            color: textFieldComponentToken.selected_text_color
          }
        }
      },
      MuiFormControl: {
        root: {
          color: textFieldComponentToken.text_color,
          '& .MuiInput-underline:before': {
            borderColor: selectComponentToken.default_border_color
          },
          '&:focused': {
            borderColor: selectComponentToken.default_border_color
          },
          '& .MuiInput-underline:after': {
            borderBottomColor: selectComponentToken.selected_border_color
          },
          '& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline':
            {
              borderColor: selectComponentToken.default_border_color
            },
          '&.MuiInputBase-root-MuiOutlinedInput-root.Mui-hover .MuiOutlinedInput-notchedOutline':
            {
              borderColor: selectComponentToken.default_border_color
            }
        }
      },
      MuiInput: {
        underline: {
          '&:after': {
            borderBottomColor: textFieldComponentToken.default_border_color
          },
          '&$focused:after': {
            borderBottomColor: textFieldComponentToken.selected_border_color
          },
          '&:before': {
            borderBottomColor: textFieldComponentToken.default_border_color
          },
          '&:hover:not($disabled):not($focused):not($error):before': {
            borderBottomColor: textFieldComponentToken.default_border_color
          }
        }
      },
      MuiMenu: {
        paper: {
          backgroundColor: selectComponentToken.popup_background_color,
          color: selectComponentToken.popup_text_color,
          borderColor: selectComponentToken.popup_border_color
        }
      },
      MuiMenuItem: {
        root: {
          '&:hover': {
            backgroundColor:
              selectComponentToken.menu_item_hover_background_color
          }
        }
      },
      MuiListItem: {
        root: {
          '&$selected': {
            backgroundColor:
              selectComponentToken.menu_item_selected_background_color,
            '&:hover': {
              backgroundColor:
                selectComponentToken.menu_item_hover_background_color
            }
          }
        }
      },
      MuiSelect: {
        select: {
          color: selectComponentToken.selected_item_text_color
        },
        icon: {
          color: selectComponentToken.default_text_color
        }
      },
      MuiFormControlLabel: {
        label: {
          color: textFieldComponentToken.text_color,
          '&.Mui-disabled': {
            color: textFieldComponentToken.disabled_label_text_color
          }
        }
      },
      MuiFormLabel: {
        root: {
          color: textFieldComponentToken.text_color,
          '&.Mui-disabled': {
            color: textFieldComponentToken.disabled_label_text_color
          },
          MuiInputLabel: {
            root: {
              color: textFieldComponentToken.disabled_label_text_color
            },
            '& .Mui-disabled': {
              color: textFieldComponentToken.disabled_label_text_color
            }
          },
          '&.Mui-focused': {
            color: textFieldComponentToken.selected_text_color
          }
        }
      },
      MuiTypography: {
        root: {
          color: aliasTokens.primary_text_color
        },
        body2: {
          color: aliasTokens.primary_text_color
        },
        subtitle1: {
          color: aliasTokens.primary_text_color
        }
      },
      MuiCheckbox: {
        colorPrimary: {
          '&$checked': {
            '& .MuiSvgIcon-root': {
              color: checkableComponentTokens.checked_background_border_color,
              '&$checked': {
                color: checkableComponentTokens.checked_background_border_color,
                '&:hover': {
                  color: checkableComponentTokens.checked_hover_background_color
                }
              }
            }
          },
          '&$disabled': {
            '&$checked': {
              '& .MuiSvgIcon-root': {
                color: checkableComponentTokens.disabled_background_border_color
              }
            }
          }
        }
      },
      MuiAppBar: {
        root: {
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0
        },
        colorPrimary: {
          border: 'none',
          backgroundColor: customDialogComponentTokens.header_background_color
        },
        colorSecondary: {
          border: 'none',
          backgroundColor:
            customDialogComponentTokens.header_dark_background_color
        }
      },
      MuiDialog: {
        paper: {
          backgroundColor: customDialogComponentTokens.background_color,
          borderRadius: 8
        }
      },
      MuiTab: {
        textColorPrimary: {
          color: aliasTokens.cta_primary_text_color,
          '&$selected': {
            color: aliasTokens.secondary_link_text_color
          },
          '&$disabled': {
            color: aliasTokens.cta_disabled_primary_text_color
          }
        }
      },
      MuiTabs: {
        flexContainer: {
          backgroundColor: tabBarComponentTokens.background_color,
          border: 'none'
        },
        indicator: {
          borderBottom: `2px solid ${aliasTokens.primary_border_color}`
        }
      },
      MuiCircularProgress: {
        colorPrimary: {
          color: aliasTokens.loader_primary_color
        }
      },
      MuiSwitch: {
        colorPrimary: {
          '&$checked': {
            color: toggleSwitchTokens.primary_checked_background_color,
            '&:hover': {
              backgroundColor:
                toggleSwitchTokens.hover_primary_checked_background_color,
              '@media (hover: none)': {
                backgroundColor: 'transparent'
              }
            }
          },
          '&$disabled': {
            color: toggleSwitchTokens.disabled_primary_color
          },
          '&$checked + $track': {
            backgroundColor:
              toggleSwitchTokens.disabled_checked_primary_background_color
          }
        },
        track: {
          backgroundColor:
            toggleSwitchTokens.track_background_unchecked_background_border_color
        }
      },
      MuiDrawer: {
        paper: {
          border: 0
        }
      },
      MuiStepLabel: {
        root: {
          '& .MuiStepLabel-label.MuiStepLabel-active': {
            color: stepperComponentToken.default_label_text_color
          },
          '& .MuiStepLabel-label.MuiStepLabel-completed': {
            color: stepperComponentToken.default_label_text_color
          }
        },
        label: {
          color: stepperComponentToken.default_label_text_color,
          '& .MuiStepLabel-active': {
            color: stepperComponentToken.selected_label_text_color
          }
        }
      },
      MuiStepIcon: {
        root: {
          '&.MuiStepIcon-completed': {
            color: stepperComponentToken.selected_label_text_color
          }
        }
      },
      MuiListSubheader: {
        root: {
          color: aliasTokens.primary_text_color
        }
      },
      MuiRadio: {
        colorPrimary: {
          '&$checked': {
            '& .MuiSvgIcon-root': {
              color: checkableComponentTokens.checked_background_border_color,
              '&$checked': {
                color: checkableComponentTokens.checked_background_border_color,
                '&:hover': {
                  color: checkableComponentTokens.checked_hover_background_color
                }
              }
            }
          },
          '&$disabled': {
            '&$checked': {
              '& .MuiSvgIcon-root': {
                color: checkableComponentTokens.disabled_background_border_color
              }
            }
          }
        }
      },
      MuiTouchRipple: {
        root: {
          color: aliasTokens.cta_primary_border_color
        }
      },
      MuiListItemText: {
        root: {
          color: listComponentTokens.default_text_color
        },
        secondary: {
          color: listComponentTokens.default_text_color
        }
      },
      MuiPickersModal: {
        dialogRoot: {
          backgroundColor: datepickerComponentTokens.default_background_color
        }
      },
      MuiPickersCalendarHeader: {
        iconButton: {
          backgroundColor: 'transparent'
        },
        dayLabel: {
          color: datepickerComponentTokens.header_text_color
        }
      },
      MuiPickersDay: {
        dayDisabled: {
          color: datepickerComponentTokens.disabled_text_color
        },
        day: {
          color: datepickerComponentTokens.default_text_color
        },
        daySelected: {
          backgroundColor: datepickerComponentTokens.highlight_background_color,
          color: datepickerComponentTokens.highlight_text_color
        }
      },
      MuiPickersClockNumber: {
        clockNumber: {
          color: datepickerComponentTokens.default_text_color
        },
        clockNumberSelected: {
          backgroundColor: datepickerComponentTokens.highlight_background_color,
          color: datepickerComponentTokens.highlight_text_color
        }
      },
      MuiPickersClockPointer: {
        pointer: {
          backgroundColor: datepickerComponentTokens.highlight_background_color
        },
        thumb: {
          backgroundColor: datepickerComponentTokens.default_text_color,
          border: `14px solid ${datepickerComponentTokens.highlight_background_color}`
        }
      },
      MuiPickersClock: {
        pin: {
          backgroundColor: datepickerComponentTokens.highlight_background_color
        }
      }
    }
  })
)

export default theme
