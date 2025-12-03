import {WithStyles, withStyles} from '@mui/styles'
import React from 'react'

import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {}

const HorizontalSeperator = (props: IProps) => {
  const {classes} = props

  return <div className={classes.container}></div>
}

const StyleComponent = withStyles(styles, {withTheme: true})(
  HorizontalSeperator
)

export default StyleComponent
