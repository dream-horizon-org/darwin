import {createStyles} from '@mui/material'
import {useBitThemeContext} from '../../../bit-components/bit-theme-wrapper/index'
import {darkThemeTokens, lightThemeTokens} from '../../../newThemeConstants'
import {TypographyTokens} from '../../../typography'

const styles = () => {
  const {theme} = useBitThemeContext()
  const aliasTokens = theme === 'dark' ? darkThemeTokens : lightThemeTokens
  return createStyles({
    querySearchTreeContainer: {
      height: '100%',
      overflowY: 'auto'
    },
    treeItemLabel: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      cursor: 'pointer',
      color: aliasTokens.textPrimary,
      gap: '8px',
      width: '100%',
      '& > span:first-child': {
        flex: '1 1 auto',
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
      // '&:hover > span:last-child': {
      //   opacity: 1
      // }
    },
    treeItemIcon: {
      cursor: 'pointer'
    },
    expandIcon: {
      cursor: 'pointer',
      paddingLeft: '4px',
      minWidth: '16px',
      '&:before': {
        color: `${aliasTokens.iconSecondary} !important`
      }
    },
    treeItem: {
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'row',
      gap: '8px',
      padding: '8px 0px',
      borderRadius: '4px',
      transition: 'background-color 0.2s ease-in-out',
      position: 'relative',
      '&:hover': {
        backgroundColor: aliasTokens.bgBrandFocusTint,
        '& $treeItemIcon .MuiSvgIcon-root': {
          color: `${aliasTokens.iconBrand} !important`
        },
        '& $treeItemIcon img': {
          filter:
            'brightness(0) saturate(100%) invert(41%) sepia(88%) saturate(1825%) hue-rotate(200deg) brightness(94%) contrast(91%)'
        },
        '& $treeItemLabelText': {
          color: `${aliasTokens.iconBrand} !important`
        },
        '& $copyIcon': {
          opacity: 1
        }
      },
      '& .MuiSvgIcon-root': {
        transition: 'color 0.2s ease-in-out'
      }
    },
    treeItemSelected: {
      backgroundColor: `${aliasTokens.bgBrandFocusTint} !important`,
      '& $treeItemIcon .MuiSvgIcon-root': {
        color: `${aliasTokens.iconBrand} !important`
      },
      '& $treeItemIcon img': {
        filter:
          'brightness(0) saturate(100%) invert(41%) sepia(88%) saturate(1825%) hue-rotate(200deg) brightness(94%) contrast(91%)'
      },
      '& $treeItemLabelText': {
        color: `${aliasTokens.iconBrand} !important`
      },
      '& $copyIcon': {
        opacity: 1
      }
    },
    treeItemLabelText: {
      transition: 'color 0.2s ease-in-out',
      '&:hover': {
        color: aliasTokens.iconBrand
      }
    },
    treeItemWithIndent: {
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'row',
      marginBottom: '8px',
      gap: '8px'
    },
    terminalNode: {
      color: ''
    },
    nonTerminalNode: {
      fontWeight: 'bold'
    },
    querySearchTree: {
      paddingLeft: '20px'
    },
    highlightSearchMatch: {
      fontWeight: 700,
      // background: aliasTokens.textBrand
      textDecoration: 'underline'
    },
    shellLoader: {
      height: '32px',
      marginBottom: '8px'
    },
    loadMoreButton: {
      marginTop: '8px',
      marginLeft: '16px',
      paddingBottom: '16px'
    }
  })
}

export default styles
