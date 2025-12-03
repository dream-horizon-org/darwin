import {createStyles} from '@mui/styles'
import {aliasTokens} from '../../../../../theme.contants'
import {Typography} from '../../../../../themes'

const styles = createStyles({
  container: {
    width: '100%',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    position: 'relative',
    cursor: 'pointer'
  },
  fileInputContainer: {
    width: '100%',
    height: 'fit-content',
    borderRadius: '8px',
    border: `1px dashed ${aliasTokens.default_border_color}`,
    padding: '12px',
    position: 'relative'
  },
  fileInput: {
    width: '100%',
    height: '100%',
    display: 'block',
    position: 'absolute',
    top: '0',
    left: '0',
    opacity: '0',
    cursor: 'pointer'
  },
  fileInputEmptyContainer: {
    width: '100%',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  fileInputEmptyIcon: {
    height: '24px',
    width: '24px',
    marginBottom: '4px',
    color: aliasTokens.tertiary_text_color
  },
  fileInputEmptyInstruction: Typography.is('body1')
    .with({
      color: aliasTokens.tertiary_text_color,
      marginBottom: '8px'
    })
    .toCSS(),
  fileInputEmptyButton: Typography.is('button2')
    .with({
      color: aliasTokens.cta_secondary_text_color,
      fontWeight: 700
    })
    .toCSS(),
  fileInputNonEmptyContainer: {
    width: '100%',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  },
  imageContainer: {
    height: '80px',
    width: '80px',
    backgroundColor: aliasTokens.tertiary_background_color,
    borderRadius: '4px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  image: {
    height: '32px',
    width: '32px',
    color: aliasTokens.neutral_text_color
  },
  fileInputNonEmptyContentContainer: {
    width: '100%',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginLeft: '12px'
  },
  fileInputNonEmptyFileName: Typography.is('body1')
    .with({
      color: aliasTokens.tertiary_text_color,
      marginBottom: '4px'
    })
    .toCSS(),
  fileInputNonEmptyFileSize: Typography.is('body2')
    .with({
      color: aliasTokens.label_text_color_new
    })
    .toCSS(),
  fileInputNonEmptyDeleteIcon: {
    width: '20px',
    height: '20px',
    color: aliasTokens.tertiary_text_color,
    marginLeft: 'auto',
    cursor: 'pointer',
    position: 'absolute',
    top: '12px',
    right: '12px'
  },
  errorMessage: Typography.is('body1')
    .with({
      color: aliasTokens.error_text_color,
      marginTop: '4px'
    })
    .toCSS()
})

export default styles
