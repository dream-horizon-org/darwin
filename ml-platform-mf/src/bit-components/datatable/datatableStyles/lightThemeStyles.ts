import {SxProps} from '@mui/material'
import {createUseStyles} from 'react-jss'
import {
  surface as surfaceTheme,
  table as tableTheme
} from '../../design-tokens/index'

const surface = surfaceTheme('light')
const table = tableTheme('light')

export const tableRowLightThemeStyles: SxProps = {
  '&.MuiTable-root ': {
    width: '100%'
  }
}

export const tableContainerLightThemeStyle = {
  '&.MuiPaper-root': {
    width: '100%',
    background: surface.surface.ds_surface_tertiary_background_color
  }
}

export const paperContainerLightThemeStyle = {
  '&.MuiPaper-root': {
    width: '100%',
    background: surface.surface.ds_surface_tertiary_background_color,
    overflow: 'hidden',
    // TODO: token not available as of now
    border: `1px solid ${table.table.table_border.ds_table_border}`
  }
}

const datatableLightThemeStyles = createUseStyles({
  loaderStyle: {
    display: 'flex',
    justifyContent: 'center'
  }
})

export default datatableLightThemeStyles
