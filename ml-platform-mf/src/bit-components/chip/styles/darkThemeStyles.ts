import {
  avatar as avatarTheme,
  chip as chipTheme
} from '../../design-tokens/index'
const avatar = avatarTheme('dark')
const chip = chipTheme('dark')
export const stylesDarkTheme = {
  '&.chip': {
    fontSize: '14px',
    fontWeight: 'normal',
    height: '28px',
    lineHeight: '20px',
    background: chip.chip.background.ds_chip_default_background_color,
    color: chip.chip.text.ds_chip_default_text_color,
    '&:hover': {
      color: chip.chip.text.ds_chip_active_text_color,
      backgroundColor:
        chip.chip.background.ds_chip_active_hover_background_color
    },
    '&.leadingAndTrailingIcon': {
      '& .MuiChip-label': {
        padding: '0px',
        margin: '4px 8px 4px 4px'
      }
    },
    '&.leadingIcon': {
      cursor: 'pointer',
      '& .MuiChip-label': {
        padding: '0px',
        margin: '4px 12px 4px 4px'
      }
    },
    '&.trailingIcon': {
      '& .MuiChip-label': {
        padding: '0px',
        margin: '4px 8px 4px 12px'
      }
    },
    '&.withoutIcon': {
      '&.small': {
        '& .MuiChip-label': {
          padding: '4px 12px'
        }
      }
    },
    '&.selectedFill': {
      background: '#0057AF'
    },
    '&.small': {
      fontSize: '12px',
      lineHeight: '16px',
      height: '24px'
    }
  },
  '& .avatar': {
    width: `${avatar.ds_player_image_extra_small_size}px`,
    height: `${avatar.ds_player_image_extra_small_size}px`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  '& .icon': {
    cursor: 'default',
    '&.medium': {
      fontSize: '20px',
      height: '20px',
      width: '20px',
      margin: '4px 0px 4px 4px'
    },
    '&.small': {
      fontSize: '16px',
      height: '16px',
      width: '16px',
      margin: '4px 0px 4px 4px'
    }
  },
  '& .deleteIcon': {
    '&.medium': {
      fontSize: '20px',
      height: '20px',
      width: '20px',
      margin: '4px 4px 4px 0px'
    },
    '&.small': {
      fontSize: '16px',
      height: '16px',
      width: '16px',
      margin: '4px 4px 4px 0px'
    }
  },
  '& .trailIcon': {
    '&.medium': {
      fontSize: '20px',
      height: '20px',
      width: '20px',
      margin: '4px 4px 4px 0px'
    },
    '&.small': {
      fontSize: '16px',
      height: '16px',
      width: '16px',
      margin: '4px 4px 4px 0px'
    }
  },
  '& .deleteIcon:hover': {
    '&:before': {
      color: chip.chip.icon.ds_chip_default_icon_color
    }
  }
}
