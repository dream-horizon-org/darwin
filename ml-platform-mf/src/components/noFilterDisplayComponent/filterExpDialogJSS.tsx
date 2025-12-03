import {createUseStyles} from 'react-jss'
import {aliasTokens} from '../../theme.contants'

export const FilterExpDialogStyles = createUseStyles(() => ({
  loaderContainer: {
    height: '240px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: aliasTokens.secondary_background_color,
    borderRadius: '0 0 8px 8px'
  },
  noFilterContainer: {
    display: 'flex',
    justifyContent: 'center'
  },
  noFilterEmoji: {
    fontSize: '100px'
  },
  noFilterText: {
    textAlign: 'center',
    margin: '0'
  }
}))
