import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    tableRow: {
      '&.Mui-selected, &.Mui-selected:hover, &.MuiTableRow-hover:hover': {
        backgroundColor: aliasTokens.cta_hover_secondary_background_color,
        cursor: 'pointer'
      }
    },
    tableSortedHeadCell: {
      '& .Mui-active': {
        color: aliasTokens.neutral_text_color
      },
      '& .MuiTableSortLabel-icon': {
        color: `${aliasTokens.neutral_text_color} !important`
      }
    },
    headRow: {
      height: '42px'
    },
    customCell: {
      fontWeight: 600,
      fontSize: '14px',
      lineHeight: '20px',
      color: aliasTokens.neutral_text_color
    }
  })

export default styles
