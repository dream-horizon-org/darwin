import {Close} from '@mui/icons-material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred'
import {withStyles, WithStyles} from '@mui/styles'
import React from 'react'

import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  msg: string
  showLearnMore: boolean
  learnMoreText?: string
  closeInfoBar: () => void
  learnMoreClickHandler?: () => void
  type: 'info' | 'error'
}

const InfoBarMessage = (props: IProps): JSX.Element => {
  const {
    classes,
    msg,
    showLearnMore,
    closeInfoBar,
    learnMoreClickHandler,
    type
  } = props

  const getContainerClass = () => {
    if (type === 'info') {
      return classes.infoContainer
    } else {
      return classes.errorContainer
    }
  }

  return (
    <div className={`${classes.container} ${getContainerClass()}`}>
      <div className={classes.info}>
        {type === 'info' && <InfoOutlinedIcon className={classes.infoIcon} />}
        {type === 'error' && (
          <ReportGmailerrorredIcon className={classes.reportIcon} />
        )}
        <span className={classes.infoText}>{msg}</span>
      </div>
      <div className={classes.closeContainer}>
        {showLearnMore && (
          <span
            className={classes.learnMoreText}
            onClick={learnMoreClickHandler}
          >
            Learn more
          </span>
        )}
        <Close className={classes.closeButton} onClick={closeInfoBar} />
      </div>
    </div>
  )
}

const StyleComponent = withStyles(styles, {withTheme: true})(InfoBarMessage)

export default StyleComponent
