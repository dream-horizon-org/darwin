import {createUseStyles} from 'react-jss'
import {table as tableTheme} from '../../../design-tokens/index'
const table = tableTheme('dark')

const darkThemeStyles = createUseStyles({
  container: {
    display: 'flex',
    alignItems: 'center'
  },
  icon: {
    marginRight: `${table.ds_table_cell_textlink_left_spacing}px`
  }
})

export default darkThemeStyles
