import {createStyles} from '@mui/material'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    projectListingContainer: {
      display: 'flex',
      flexDirection: 'column'
    },
    searchContainer: {
      width: '314px'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 12px'
    },
    listings: {
      display: 'flex',
      borderTop: `1px solid ${aliasTokens.cta_disabled_secondary_background_color}`
    },
    projectsList: {
      display: 'flex',
      width: '100%'
    },
    codespacesList: {
      display: 'flex',
      width: '100%'
    },
    spinner: {
      height: '200px'
    }
  })

export default styles
