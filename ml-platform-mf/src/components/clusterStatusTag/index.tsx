import {WithStyles, withStyles} from '@mui/styles'
import React, {useMemo} from 'react'
import styles from './indexJSS'
interface IProps extends WithStyles<typeof styles> {
  status: string
}
const ClusterStatusTag = (props: IProps) => {
  const {classes, status} = props
  const statusIndicatorColor = useMemo(() => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#11A93C'
      case 'inactive':
        return '#FF7070'
      default:
        return '#57ABFF'
    }
  }, [status])

  return (
    <div className={classes.statusContainer}>
      <div
        className={classes.statusIndicator}
        style={{background: statusIndicatorColor}}
      />
      <div className={classes.status}>{status}</div>
    </div>
  )
}

const StyleComponent = withStyles(styles, {withTheme: true})(ClusterStatusTag)

export default StyleComponent
