import {createUseStyles} from 'react-jss'
import {aliasTokens} from '../../../config/index'
import {table as tableTheme} from '../../../design-tokens/index'
const table = tableTheme('dark')

export const IconListDarkThemeStyles = createUseStyles({
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: table.ds_table_cell_medium_icon_inline_spacing
  },
  disabledIcon: {
    pointerEvent: 'none',
    '& .icon:before': {
      color: aliasTokens.cta_disabled_primary_background_color
    }
  },
  iconListElement: {
    cursor: 'pointer'
  }
})
