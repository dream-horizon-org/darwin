import {createStyles} from '@material-ui/core'
import {useBitThemeContext} from '../../../bit-components/bit-theme-wrapper/index'
import {darkThemeTokens, lightThemeTokens} from '../../../newThemeConstants'
import {TypographyTokens} from '../../../typography'

const styles = () => {
  const {theme} = useBitThemeContext()
  const aliasTokens = theme === 'dark' ? darkThemeTokens : lightThemeTokens

  const baseTagStyle = {
    padding: '0px 8px',
    borderRadius: '4px'
  }

  const createTagStyle = (backgroundColor: string) => ({
    ...baseTagStyle,
    backgroundColor
  })

  return createStyles({
    container: {
      width: '416px',
      minWidth: '416px',
      padding: '24px 0'
    },
    assetTitleContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '16px'
    },
    assetTitle: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      flex: '1',
      minWidth: '0'
    },
    buttonContainer: {
      display: 'flex',
      alignItems: 'flex-start',
      flexShrink: 0,
      gap: '8px',
      '& .css-1wutot5-MuiButtonBase-root-MuiButton-root.primary': {
        '&.Mui-disabled': {
          backgroundColor: `${aliasTokens.bgDisabled} `
        }
      }
    },
    editAssetDetailsContainer: {
      display: 'flex',
      flexDirection: 'column',
      marginTop: '24px',
      border: `1px solid ${aliasTokens.border1}`,
      borderRadius: '8px',
      padding: '4px 12px 4px 12px',
      height: '140px',
      marginBottom: '28px',
      gap: '4px'
    },
    editDetailsItem: {
      display: 'grid',
      gridTemplateColumns: '100px 1fr 24px',
      alignItems: 'center',
      height: '44px',
      gap: '16px'
    },
    assetSource: {
      ...TypographyTokens.bodyUiLabelMedium_Regular,
      color: aliasTokens.textSecondary
    },
    tableName: {
      ...TypographyTokens.headingDisplayXS_SemiBold,
      color: aliasTokens.textPrimary
    },
    textLabel: {
      ...TypographyTokens.bodyUiLabelSmall_Medium,
      color: aliasTokens.textSecondary
    },
    textValue: {
      ...TypographyTokens.bodyUiLabelSmall_Regular,
      color: aliasTokens.textPrimary
    },
    overviewText: {
      ...TypographyTokens.bodyUiLabelMedium_Medium,
      color: aliasTokens.textSecondary
    },
    overviewHeaderContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0px'
    },
    pathCopyIcon: {
      cursor: 'pointer',
      transition: 'transform 0.1s ease-in-out',
      '&:active': {
        transform: 'scale(0.92)'
      },
      '&.icon-copy:before': {
        color: aliasTokens.iconBrand
      }
    },
    datatableContainer: {
      marginTop: '12px',
      '& > .MuiPaper-root > .MuiPaper-root': {
        border: 'none'
      },
      '& > .MuiPaper-root': {
        border: 'none'
      }
    },
    progressCircleContainer: {
      marginTop: '100px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    },
    bgTagGlobalBlue: createTagStyle(aliasTokens.bgTagGlobalBlue),
    bgTagSuccess: createTagStyle(aliasTokens.bgTagSuccess),
    bgTagWarning: createTagStyle(aliasTokens.bgTagWarning),
    bgTagInfo: createTagStyle(aliasTokens.bgTagInfo),
    bgTagNeutral2: createTagStyle(aliasTokens.bgNeutral2),
    bgTagAlert2: createTagStyle(aliasTokens.bgAlert2),
    bgTagError: createTagStyle(aliasTokens.bgError2),
    bgTagInfo2: createTagStyle(aliasTokens.bgInfo2),
    bgTagSuccess2: createTagStyle(aliasTokens.bgSuccess2),
    bgTagBrand: createTagStyle(aliasTokens.bgBrand)
  })
}

export default styles
