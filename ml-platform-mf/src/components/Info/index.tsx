import withStyles, {WithStyles} from '@mui/styles/withStyles'
import React from 'react'
import {Icons} from '../../bit-components/icon/index'
import {Tooltip, ToolTipPlacement} from '../../bit-components/tooltip/index'
import styles from './indexJss'

interface IProps extends WithStyles<typeof styles> {
  msg: string | JSX.Element
  placement: ToolTipPlacement
  children?: JSX.Element
  options?: object
}

const Info = (props: IProps): JSX.Element => {
  const {
    msg,
    placement,
    classes,
    options,
    children = (
      <span className={`${classes.iconContainer} ${Icons.ICON_INFO_2}`}></span>
    )
  } = props

  const title = typeof msg === 'string' ? <div>{msg}</div> : msg
  return (
    <Tooltip title={title} placement={placement} options={options}>
      {children}
    </Tooltip>
  )
}

const styleComponent = withStyles(styles, {withTheme: true})(Info)

export default styleComponent
