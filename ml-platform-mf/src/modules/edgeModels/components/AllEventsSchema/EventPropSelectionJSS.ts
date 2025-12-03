import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../../theme.contants'

const styles = () =>
  createStyles({
    customCheckBox: {
      color: 'red',
      '& svg': {
        color: aliasTokens.neutral_text_color
      },
      '&.selectedCheckBox': {
        color: aliasTokens.cta_secondary_text_color,
        '& svg': {
          color: aliasTokens.cta_secondary_text_color
        }
      },
      '&.disabledCheckBox': {
        color: aliasTokens.cta_disabled_primary_text_color,
        '& svg': {
          color: aliasTokens.cta_disabled_primary_text_color
        }
      }
    },

    textField: {
      height: '28px',
      '& .MuiOutlinedInput-input': {
        height: '20px',
        padding: '4px 8px',
        fontSize: '14px'
      }
    },
    nameTableCell: {
      width: '22%',
      height: '48px',
      padding: '14px 16px',
      fontSize: '14px'
    },
    sqlTableCell: {
      width: '16%',
      height: '48px',
      padding: '14px 16px',
      fontSize: '14px'
    },
    colNameTableCell: {
      width: '24%',
      height: '48px',
      padding: '10px 16px'
    },
    defaultTableCell: {
      width: '20%',
      height: '48px',
      padding: '10px 16px'
    },
    propTableBox: {
      width: '100%'
    },
    propTablePaper: {
      width: '100%',
      overflow: 'hidden'
    },
    propTableRow: {
      cursor: 'pointer',
      height: '48px'
    },
    propTableCell: {
      width: '5%',
      height: '48px'
    },
    propTableHeadCells: {
      height: '48px',
      padding: '14px 16px',
      fontSize: '14px'
    }
  })

export default styles
