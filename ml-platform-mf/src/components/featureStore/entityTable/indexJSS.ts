import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    tableRow: {
      '&.Mui-selected, &.Mui-selected:hover, &.MuiTableRow-hover:hover': {}
    },
    customDataCell: {
      minHeight: '56px',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      '& .MuiTooltip-tooltip': {
        background: 'rgba(51, 51, 51, 0.5)',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)',
        backdropFilter: 'blur(12px)',
        borderRadius: '8px',
        display: 'flex',
        padding: '10px 12px',
        maxWidth: '288px',
        flexWrap: 'wrap'
      },
      '&.prodUsage': {
        color: aliasTokens.cta_secondary_text_color,
        cursor: 'pointer',
        display: 'inline'
      },
      '&.devUsage': {
        display: 'inline'
      }
    }
  })

export default styles
