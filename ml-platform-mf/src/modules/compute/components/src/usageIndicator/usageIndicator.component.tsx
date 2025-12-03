import {WithStyles, withStyles} from '@mui/styles'
import React, {useMemo} from 'react'
import styles from './usageIndicatorJSS'

interface IProps extends WithStyles<typeof styles> {
  usage: number
  maxUsage: number
}

const UsageIndicator = (props: IProps) => {
  const {classes, usage, maxUsage} = props

  const capMaxUsage = useMemo(() => {
    return maxUsage > 100 ? 100 : maxUsage
  }, [maxUsage])

  const capUsage = useMemo(() => {
    return usage > 100 ? 100 : usage
  }, [usage])

  const usedWidth = capUsage
  const unusedWidth = 100 - usedWidth

  return (
    <div className={classes.container}>
      <div
        className={classes.usedSection}
        style={{
          width: `${usedWidth}%`
        }}
      ></div>
      <div
        className={classes.unusedSection}
        style={{
          width: `${unusedWidth}%`
        }}
      ></div>
    </div>
  )
}

const StyledComponent = withStyles(styles, {withTheme: true})(UsageIndicator)
export default StyledComponent
