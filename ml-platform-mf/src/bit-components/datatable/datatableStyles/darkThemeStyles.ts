import {SxProps} from '@mui/material'
import {createUseStyles} from 'react-jss'
import {
  surface as surfaceTheme,
  table as tableTheme
} from '../../design-tokens/index'

const surface = surfaceTheme('dark')
const table = tableTheme('dark')

export const tableRowDarkThemeStyles: SxProps = {
  '&.MuiTable-root ': {
    width: '100%'
  }
}

export const tableContainerDarkThemeStyle = {
  '&.MuiPaper-root': {
    width: '100%',
    background: surface.surface.ds_surface_tertiary_background_color
  }
}

export const paperContainerDarkThemeStyle = {
  '&.MuiPaper-root': {
    width: '100%',
    background: surface.surface.ds_surface_tertiary_background_color,
    overflow: 'hidden',
    // TODO: token not available as of now
    border: `1px solid ${table.table.table_border.ds_table_border}`
  }
}

const datatableDarkThemeStyles = createUseStyles({
  loaderStyle: {
    display: 'flex',
    justifyContent: 'center'
  }
})

export default datatableDarkThemeStyles
