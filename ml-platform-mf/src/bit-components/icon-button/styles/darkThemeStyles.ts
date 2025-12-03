import {
  actionable_icon_button as actionable_icon_buttonTheme,
  icon_button as icon_buttonTheme
} from '../../design-tokens/index'

// eslint-disable-next-line
const actionable_icon_button = actionable_icon_buttonTheme('dark')
// eslint-disable-next-line
const icon_button = icon_buttonTheme('dark')
export const iconButtonDarkThemeStyles = {
  textTransform: 'uppercase',
  fontWeight: '700',
  minWidth: 'unset',
  '& .MuiButton-startIcon': {
    margin: '0px'
  },
  '&.large': {
    padding: `${icon_button.ds_icon_button_large_spacing}px`,
    lineHeight: '24px',
    fontSize: '16px',
    width: '40px',
    height: '40px'
  },
  '&.medium': {
    lineHeight: '20px',
    fontSize: '14px',
    padding: `${icon_button.ds_icon_button_medium_spacing}px`,
    width: '28px',
    height: '28px'
  },
  '&.small': {
    fontSize: '12px',
    lineHeight: '16px',
    padding: `${icon_button.ds_icon_button_small_spacing}px`,
    width: '24px',
    height: '24px'
  },
  '&.extraSmall': {
    fontSize: '12px',
    lineHeight: '16px',
    padding: `${actionable_icon_button.ds_actionable_icon_extra_small_spacing}`,
    width: '24px',
    height: '24px'
  },

  '&.primary': {
    backgroundColor:
      icon_button.icon_button.primary.background
        .ds_icon_button_primary_default_background_color,
    '& .icon:before': {
      color:
        icon_button.icon_button.primary.icon
          .ds_icon_button_primary_default_icon_color
    },
    '&:hover': {
      backgroundColor:
        icon_button.icon_button.primary.background
          .ds_icon_button_primary_hover_background_color
    },
    '&.disabled': {
      color:
        icon_button.icon_button.primary.icon
          .ds_icon_button_primary_disabled_icon_color,
      backgroundColor:
        icon_button.icon_button.primary.background
          .ds_icon_button_primary_disabled_background_color,
      '& .icon:before': {
        color:
          icon_button.icon_button.primary.icon
            .ds_icon_button_primary_disabled_icon_color
      }
    },
    '&:active': {
      backgroundColor:
        icon_button.icon_button.primary.background
          .ds_icon_button_primary_clicked_background_color,
      color:
        icon_button.icon_button.primary.icon
          .ds_icon_button_primary_clicked_icon_color,
      '& .icon:before': {
        color:
          icon_button.icon_button.primary.icon
            .ds_icon_button_primary_clicked_icon_color
      }
    }
  },
  '&.secondary': {
    border: `1px solid ${icon_button.icon_button.secondary.border.ds_icon_button_secondary_default_border_color}`,
    '& .icon:before': {
      color: `${icon_button.icon_button.secondary.icon.ds_icon_button_secondary_default_icon_color}`
    },
    '&:hover': {
      backgroundColor: `${icon_button.icon_button.secondary.background.ds_icon_button_secondary_hover_background_color}`,
      border: `1px solid ${icon_button.icon_button.secondary.background.ds_icon_button_secondary_hover_background_color}`,
      '& .icon:before': {
        color:
          icon_button.icon_button.secondary.icon
            .ds_icon_button_secondary_clicked_icon_color
      }
    },
    '&.disabled': {
      border: `1px solid ${icon_button.icon_button.secondary.border.ds_icon_button_secondary_disabled_border_color}`,
      '& .icon:before': {
        color: `${icon_button.icon_button.secondary.icon.ds_icon_button_secondary_disabled_icon_color}`
      }
    },
    '&:active': {
      backgroundColor: `${icon_button.icon_button.secondary.background.ds_icon_button_secondary_clicked_background_color}`,
      border: `1px solid ${icon_button.icon_button.secondary.background.ds_icon_button_secondary_clicked_background_color}`,
      '& .icon:before': {
        color:
          icon_button.icon_button.secondary.icon
            .ds_icon_button_secondary_clicked_icon_color
      }
    }
  },
  '&.actionable': {
    '&.medium': {
      padding: `${actionable_icon_button.ds_actionable_icon_medium_spacing}px`,
      width: '32px',
      height: '32px'
    },
    '&.small': {
      padding: `${actionable_icon_button.ds_actionable_icon_small_spacing}px`,
      width: '24px',
      height: '24px'
    },
    '&.extraSmall': {
      padding: `${actionable_icon_button.ds_actionable_icon_extra_small_spacing}px`,
      width: '16px',
      height: '16px'
    },
    borderRadius: '50%',
    '&.actionablePrimary': {
      color: `${actionable_icon_button.actionable_icon_button.primary.icon.ds_actionable_icon_primary_default_icon_color}`,
      '& .icon:before': {
        color: `${actionable_icon_button.actionable_icon_button.primary.icon.ds_actionable_icon_primary_default_icon_color}`
      },
      '&:hover': {
        backgroundColor: `${actionable_icon_button.actionable_icon_button.primary.background.ds_actionable_icon_primary_hover_background_color}33`
      },
      '&.selected': {
        backgroundColor: `${actionable_icon_button.actionable_icon_button.primary.background.ds_actionable_icon_primary_active_background_color}`
      },
      '&.selected:hover': {
        backgroundColor: `${actionable_icon_button.actionable_icon_button.primary.background.ds_actionable_icon_primary_active_hover_background_color}73`
      },
      '&.disabled': {
        '& .icon:before': {
          color: `${actionable_icon_button.actionable_icon_button.primary.icon.ds_actionable_icon_primary_disable_icon_color}`
        }
      },
      '&:active': {
        backgroundColor: `${actionable_icon_button.actionable_icon_button.primary.background.ds_actionable_icon_primary_clicked_background_color}4D`
      },
      '&.activebutton': {
        backgroundColor: `${actionable_icon_button.actionable_icon_button.primary.background.ds_actionable_icon_primary_active_background_color}33`,
        '& .icon:before': {
          color: `${actionable_icon_button.actionable_icon_button.primary.icon.ds_actionable_icon_primary_active_icon_color}`
        },
        '&:hover': {
          backgroundColor: `${actionable_icon_button.actionable_icon_button.primary.background.ds_actionable_icon_primary_hover_background_color}73`,
          '& .icon:before': {
            color: `${actionable_icon_button.actionable_icon_button.primary.icon.ds_actionable_icon_primary_active_hover_icon_color}`
          }
        }
      }
    },
    '&.actionableSecondary': {
      color: `${actionable_icon_button.actionable_icon_button.secondary.icon.ds_actionable_icon_secondary_default_icon_color}`,
      '& .icon:before': {
        color: `${actionable_icon_button.actionable_icon_button.secondary.icon.ds_actionable_icon_secondary_default_icon_color}`
      },
      '&:hover': {
        backgroundColor: `${actionable_icon_button.actionable_icon_button.secondary.background.ds_actionable_icon_secondary_hover_background_color}`
      },
      '&.selected': {
        backgroundColor: `${actionable_icon_button.actionable_icon_button.secondary.background.ds_actionable_icon_secondary_active_background_color}33`,
        '& .icon:before': {
          color: `${actionable_icon_button.actionable_icon_button.secondary.icon.ds_actionable_icon_secondary_active_icon_color}`
        }
      },
      '&.selected:hover': {
        backgroundColor: `${actionable_icon_button.actionable_icon_button.secondary.background.ds_actionable_icon_secondary_active_hover_background_color}73`,
        '& .icon:before': {
          color: `${actionable_icon_button.actionable_icon_button.secondary.icon.ds_actionable_icon_secondary_active_hover_icon_color}`
        }
      },
      '&.disabled': {
        '& .icon:before': {
          color: `${actionable_icon_button.actionable_icon_button.secondary.icon.ds_actionable_icon_secondary_disable_icon_color}`
        }
      },
      '&:active': {
        backgroundColor: `${actionable_icon_button.actionable_icon_button.secondary.background.ds_actionable_icon_secondary_clicked_background_color}80`
      },
      '&.activebutton': {
        backgroundColor: `${actionable_icon_button.actionable_icon_button.secondary.background.ds_actionable_icon_secondary_active_background_color}33`,
        '& .icon:before': {
          color: `${actionable_icon_button.actionable_icon_button.secondary.icon.ds_actionable_icon_secondary_active_icon_color}`
        },
        '&:hover': {
          backgroundColor: `${actionable_icon_button.actionable_icon_button.secondary.background.ds_actionable_icon_secondary_active_hover_background_color}73`,
          '& .icon:before': {
            color: `${actionable_icon_button.actionable_icon_button.secondary.icon.ds_actionable_icon_secondary_active_hover_icon_color}`
          }
        }
      }
    },
    '&.actionableTertiary': {
      color: `${actionable_icon_button.actionable_icon_button.tertiary.icon.ds_actionable_icon_tertiary_default_icon_color}`,
      '& .icon:before': {
        color: `${actionable_icon_button.actionable_icon_button.tertiary.icon.ds_actionable_icon_tertiary_default_icon_color}`
      },
      '&:hover': {
        backgroundColor: `${actionable_icon_button.actionable_icon_button.tertiary.background.ds_actionable_icon_tertiary_hover_background_color}`
      },
      '&.selected': {
        backgroundColor: `${actionable_icon_button.actionable_icon_button.tertiary.background.ds_actionable_icon_tertiary_active_background_color}33`,
        '& .icon:before': {
          color: `${actionable_icon_button.actionable_icon_button.tertiary.icon.ds_actionable_icon_tertiary_active_icon_color}`
        }
      },
      '&.selected:hover': {
        backgroundColor: `${actionable_icon_button.actionable_icon_button.tertiary.background.ds_actionable_icon_tertiary_active_hover_background_color}73`,
        '& .icon:before': {
          color: `${actionable_icon_button.actionable_icon_button.tertiary.icon.ds_actionable_icon_tertiary_active_hover_icon_color}`
        }
      },
      '&.disabled': {
        color: `${actionable_icon_button.actionable_icon_button.tertiary.icon.ds_actionable_icon_tertiary_disable_icon_color}`,
        '& .icon:before': {
          color: `${actionable_icon_button.actionable_icon_button.tertiary.icon.ds_actionable_icon_tertiary_disable_icon_color}`
        }
      },
      '&:active': {
        backgroundColor: `${actionable_icon_button.actionable_icon_button.tertiary.background.ds_actionable_icon_tertiary_clicked_background_color}80`
      },
      '&.activebutton': {
        backgroundColor: `${actionable_icon_button.actionable_icon_button.tertiary.background.ds_actionable_icon_tertiary_active_background_color}33`,
        '& .icon:before': {
          color: `${actionable_icon_button.actionable_icon_button.tertiary.icon.ds_actionable_icon_tertiary_active_icon_color}`
        },
        '&:hover': {
          backgroundColor: `${actionable_icon_button.actionable_icon_button.tertiary.background.ds_actionable_icon_tertiary_active_hover_background_color}73`,
          '& .icon:before': {
            color: `${actionable_icon_button.actionable_icon_button.tertiary.icon.ds_actionable_icon_tertiary_active_hover_icon_color}`
          }
        }
      }
    }
  },
  '& .trail::before': {
    color:
      icon_button.icon_button.primary.icon
        .ds_icon_button_primary_default_icon_color
  },

  '& .icon': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&.large': {
      fontSize: '24px',
      width: '24px',
      height: '24px'
    },
    '&.medium': {
      fontSize: '20px',
      width: '20px',
      height: '20px'
    },
    '&.small': {
      fontSize: '16px',
      width: '16px',
      height: '16px'
    },
    '&.extraSmall': {
      fontSize: '12px',
      width: '12px',
      height: '12px'
    }
  }
}
