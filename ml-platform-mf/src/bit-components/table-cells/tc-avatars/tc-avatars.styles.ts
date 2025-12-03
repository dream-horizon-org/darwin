import {createUseStyles} from 'react-jss'
import {
  table as tableTheme,
  textlink as textlinkTheme,
  typography as typographyTheme
} from '../../design-tokens/index'

const styles = (theme) => {
  const table = tableTheme(theme)
  const textlink = textlinkTheme(theme)
  const typography = typographyTheme(theme)
  return createUseStyles({
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: table.ds_table_cell_small_icon_right_spacing
    },
    extras: {
      color: textlink.textlink.text.ds_textlink_primary_active_text_color,
      fontSize: typography.caption.ds_font_caption_1_regular.fontSize,
      lineHeight: `${typography.caption.ds_font_caption_1_regular.lineHeight}px`,
      display: 'inline-block'
    },
    add: {
      display: 'inline-block',
      verticalAlign: 'text-bottom'
    }
  })
}
export default styles
