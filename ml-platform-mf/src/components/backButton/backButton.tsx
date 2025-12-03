import {WithStyles, withStyles} from '@mui/styles'
import React, {useCallback} from 'react'
import {useHistory, useLocation} from 'react-router-dom'
import {
  ActionableIconButtonVariants,
  IconButton,
  IconButtonSizes
} from '../../bit-components/icon-button/index'
import {Icons} from '../../bit-components/icon/index'
import styles from './backButtonJSS'
interface RouteProps extends WithStyles<typeof styles> {
  mode: 'route'
  to: string
  routeState?: any
  size?: IconButtonSizes
  actionableVariants?: ActionableIconButtonVariants
  disabled?: boolean
  dataTestId?: string
}

interface ActionProps extends WithStyles<typeof styles> {
  mode: 'action'
  onClick?: () => void
  size?: IconButtonSizes
  actionableVariants?: ActionableIconButtonVariants
  disabled?: boolean
  dataTestId?: string
}

const BackButton = (props: RouteProps | ActionProps) => {
  const {classes, size, actionableVariants, disabled, mode, dataTestId} = props
  const history = useHistory()
  const location = useLocation()
  const handleOnClick = useCallback(() => {
    if (mode === 'route') {
      // This value will be undefined if the user directly lands on the page
      const previousPath = location?.key
      if (previousPath) {
        history.goBack()
      } else {
        history.push(props.to, props.routeState)
      }
    } else {
      props.onClick()
    }
  }, [history])
  return (
    <div data-testid={dataTestId}>
      <IconButton
        onClick={handleOnClick}
        leadingIcon={Icons.ICON_ARROW_BACK}
        actionableVariants={
          actionableVariants || ActionableIconButtonVariants.ACTIONABLE_PRIMARY
        }
        size={size || IconButtonSizes.LARGE}
        actionable={true}
        disabled={disabled}
      />
    </div>
  )
}
const StyledComponent = withStyles(styles, {withTheme: true})(BackButton)
export default StyledComponent
