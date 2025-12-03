import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {},
    tableRow: {
      '&.Mui-selected, &.Mui-selected:hover, &.MuiTableRow-hover:hover': {
        cursor: 'pointer',
        backgroundColor: aliasTokens.cta_hover_secondary_background_color
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
    },
    customCheckBox: {
      color: aliasTokens.neutral_text_color,
      '& svg': {
        color: aliasTokens.neutral_text_color
      },
      '&.selectedCheckBox': {
        color: aliasTokens.cta_secondary_text_color,
        '& svg': {
          color: aliasTokens.cta_secondary_text_color
        }
      }
    },
    tagContainer: {
      maxWidth: '120px',
      height: '24px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      marginRight: '8px',
      fontWeight: 400,
      fontSize: '12px',
      lineHeight: '16px',
      color: aliasTokens.neutral_text_color,
      padding: '4px 8px',
      backgroundColor: aliasTokens.cta_disabled_secondary_background_color,
      borderRadius: '4px'
    },
    expandTags: {
      color: aliasTokens.cta_secondary_text_color,
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px',
      cursor: 'pointer'
    },
    expandedTags: {
      maxWidth: '80px',
      height: '24px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      marginRight: '8px',
      fontWeight: 400,
      fontSize: '12px',
      lineHeight: '16px',
      color: aliasTokens.primary_text_color,
      padding: '4px 12px',
      backgroundColor: aliasTokens.cta_disabled_secondary_background_color,
      borderRadius: '100px',
      margin: '2px 0px'
    }
  })

export default styles
