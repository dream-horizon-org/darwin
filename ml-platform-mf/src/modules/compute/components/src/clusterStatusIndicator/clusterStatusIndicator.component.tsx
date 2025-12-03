import {WithStyles, withStyles} from '@mui/styles'
import React from 'react'
import {aliasTokens} from '../../../../../theme.contants'
import {formattedSnakeString} from '../../../../workflows/pages/workflows/utils'
import styles from './clusterStatusIndicatorJSS'

export enum ClusterStatus {
  CREATING = 'creating',
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

interface IProps extends WithStyles<typeof styles> {
  status: ClusterStatus
  simpleText: boolean
}

const ClusterStatusIndicator = (props: IProps) => {
  const {status, simpleText, classes} = props
  const getIndicatorColor = (status: ClusterStatus) => {
    switch (status) {
      case ClusterStatus.CREATING:
        return '#8F8F8F'
      case ClusterStatus.ACTIVE:
        return '#70D48C'
      case ClusterStatus.INACTIVE:
        return '#ff7070'
      default:
        return '#8F8F8F'
    }
  }

  return (
    <div className={classes.container}>
      <div
        className={classes.clusterStatusIndicator}
        style={{
          backgroundColor: getIndicatorColor(status)
        }}
      />
      <div
        className={classes.clusterStatusText}
        style={{
          color: aliasTokens.neutral_text_color
        }}
      >
        {formattedSnakeString(status)}
      </div>
    </div>
  )
}

const StyledComponent = withStyles(styles, {withTheme: true})(
  ClusterStatusIndicator
)

export default StyledComponent
