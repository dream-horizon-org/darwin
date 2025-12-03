import CloseIcon from '@mui/icons-material/Close'
import {WithStyles, withStyles} from '@mui/styles'
import React from 'react'

import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  onCloseTaskDrawer: () => void
}

const TaskCreateHeader = (props: IProps) => {
  const {classes, onCloseTaskDrawer} = props

  return (
    <div className={classes.headerContainer}>
      <CloseIcon onClick={onCloseTaskDrawer} className={classes.closeIcon} />
      <div className={classes.taskDetailsHeader}>Task Details</div>
    </div>
  )
}

const StyleComponent = withStyles(styles, {withTheme: true})(TaskCreateHeader)

export default StyleComponent
