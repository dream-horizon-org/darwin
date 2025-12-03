import {withStyles, WithStyles} from '@mui/styles'
import React from 'react'
import CreateButtonDropdown from './CreateButtonDropdown'
import styles from './indexJSS'
interface IProps extends WithStyles<typeof styles> {}

const options = [
  {
    name: 'Edge',
    value: 'edge'
  },
  {
    name: 'Server side',
    value: 'server side'
  }
]

const ModelHeader = (props: IProps) => {
  const {classes} = props

  return (
    <div className={classes.container}>
      <div className={classes.left}>Serving</div>
      <div className={classes.right}>
        <CreateButtonDropdown buttonText='Create' dropDownItems={options} />
      </div>
    </div>
  )
}

export const ModelHeaderComponent = withStyles(styles, {withTheme: true})(
  ModelHeader
)
