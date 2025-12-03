import {createUseStyles} from 'react-jss'
import {table as tableTheme} from '../../../design-tokens/index'
const table = tableTheme('dark')

const tcTagsDarkThemeStyles = createUseStyles({
  tcTags: {
    margin: `0px ${table.ds_table_cell_large_horizontal_spacing}px` // "0px 16px"
  }
})

export default tcTagsDarkThemeStyles
