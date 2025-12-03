import {createUseStyles} from 'react-jss'
import {
  chip as chipTheme,
  popout as popoutTheme
} from '../../design-tokens/index'
const PopoutDesignSet = popoutTheme('light')

const ChipDesignSet = chipTheme('light')
export const PopoutLightThemeStyle = createUseStyles({
  popOver: {
    '& .MuiPopover-paper': {
      background: PopoutDesignSet.popout.background.ds_popout_background_color,
      boxShadow: PopoutDesignSet.ds_popout_shadow,
      backdropFilter: `blur(${PopoutDesignSet.blur.ds_popout_background_blur}px)`,
      borderRadius: PopoutDesignSet.ds_popout_radius,
      border: ` 1px solid ${PopoutDesignSet.popout.border.ds_popout_border_color}`
    },
    '& .MuiChip-root': {
      background:
        ChipDesignSet.chip.background.ds_chip_default_background_color,
      color: ChipDesignSet.chip.text.ds_chip_default_text_color
    }
  },
  popOverContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    maxWidth: `${PopoutDesignSet.ds_popout_max_width}px`,
    maxHeight: `${PopoutDesignSet.ds_popout_max_height}px`,
    height: 'max-content',
    gap: '12px',
    padding: `${PopoutDesignSet.ds_popout_chip_vertical_inline_spacing}px`,
    margin: `0 ${PopoutDesignSet.ds_popout_content_container_vertical_spacing}px`
  },
  groupsSurface: {
    maxWidth: `${PopoutDesignSet.ds_popout_content_container_width}px`,

    display: 'flex',
    flexFlow: 'row wrap',
    rowGap: PopoutDesignSet.ds_popout_chip_horizontal_inline_spacing,
    columnGap: PopoutDesignSet.ds_popout_chip_vertical_inline_spacing,
    padding: `8px 0px`
  },
  closeButton: {
    padding: `${PopoutDesignSet.ds_popout_close_icon_top_spacing}px 0px`
  }
})
