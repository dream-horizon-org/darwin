import {tab as tabTheme} from '../../design-tokens/index'

export const stylesDarkTheme = () => {
  const tab = tabTheme('dark')
  return {
    '& .MuiTabs-indicator': {
      backgroundColor: tab.tab.text.ds_tab_active_text_color,
      borderRadius: `${tab.ds_tab_border_weight}px`
    },
    '& .muiSelectedTab': {
      '&.Mui-selected': {
        color: tab.tab.text.ds_tab_active_text_color
      }
    },
    '& .muiConsoleTab': {
      '&.Mui-selected': {
        color: `${tab.minitab.text.ds_minitab_default_text_color}`,
        backgroundColor: `${tab.minitab.background.ds_minitab_selected_background_color}`
      }
    },
    '& .MuiButtonBase-root': {
      minHeight: '40px',
      maxHeight: '40px'
    },
    '&.MuiTab-root': {
      padding: `${tab.ds_tab_vertical_spacing}px ${tab.ds_tab_horizontal_spacing}px`
    },
    '&.MuiTabs-root': {
      minHeight: '40px'
    },
    '.tab': {
      fontSize: 14,
      color: tab.tab.text.ds_tab_default_text_color,
      fontWeight: '700',
      lineHeight: '20px',
      textTransform: 'capitalize'
    },
    '.leftIcon': {
      paddingLeft: '4px'
    },

    '.selectedTab': {
      color: tab.tab.text.ds_tab_active_text_color
    },
    '.disableTab': {
      color: tab.tab.text.ds_tab_disable_text_color
    },
    '.consoleTab': {
      color: `${tab.minitab.text.ds_minitab_default_text_color}`
    },
    '.icon:before': {
      color: tab.tab.icon.ds_tab_default_icon_color,
      fontSize: `${tab.ds_tab_icon_size}px`,
      position: 'relative'
    },
    '.selectedTabIcon:before': {
      color: tab.tab.icon.ds_tab_active_icon_color
    },
    '.disabledTabIcon:before': {
      color: tab.tab.icon.ds_tab_disabled_icon_color
    }
  }
}
