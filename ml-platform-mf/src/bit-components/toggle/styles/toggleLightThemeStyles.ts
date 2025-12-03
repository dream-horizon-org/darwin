import {toggle_switch as toggleSwitchTheme} from '../../design-tokens/index'

export const stylesLightTheme = () => {
  const toggleSwitchDesignSet = toggleSwitchTheme('light')
  return {
    marginLeft: '0px',
    marginRight: '0px',
    height: 'max-content',

    '& .MuiFormControlLabel-root': {
      width: 'fit-content',
      display: 'flex',
      gap: `${toggleSwitchDesignSet.ds_toggle_switch_vertical_spacing}px`
    },
    '& .MuiSwitch-switchBase': {
      color:
        toggleSwitchDesignSet.toggle_switch.default
          .ds_toggle_switch_default_control_background_color,
      '&:hover': {
        backgroundColor: `${toggleSwitchDesignSet.toggle_switch.default_hover.ds_toggle_switch_default_control_hover_background_color}66`
      }
    },
    '& .MuiSwitch-track': {
      backgroundColor:
        toggleSwitchDesignSet.toggle_switch.default
          .ds_toggle_switch_default_base_background_color
    },
    '&.checked': {
      '& .Mui-checked': {
        color:
          toggleSwitchDesignSet.toggle_switch.active
            .ds_toggle_switch_active_control_background_color,
        '&:hover': {
          backgroundColor: `${toggleSwitchDesignSet.toggle_switch.active_hover.ds_toggle_switch_active_control_hover_background_color}33`
        },
        '& +.MuiSwitch-track': {
          backgroundColor:
            toggleSwitchDesignSet.toggle_switch.active
              .ds_toggle_switch_active_base_background_color
        }
      }
    },
    '&.disabled': {
      '& .Mui-disabled': {
        color:
          toggleSwitchDesignSet.toggle_switch.disable
            .ds_toggle_switch_disable_control_background_color,

        '& +.MuiSwitch-track': {
          backgroundColor:
            toggleSwitchDesignSet.toggle_switch.disable
              .ds_toggle_switch_disable_base_background_color
        }
      }
    }
  }
}
