import {Menu, MenuItem, Tooltip} from '@mui/material'
import {WithStyles, withStyles} from '@mui/styles'
import React, {useState} from 'react'
import {Button} from '../../../bit-components/button/index'
import {
  ActionableIconButtonVariants,
  IconButton,
  IconButtonSizes,
  IconButtonVariants
} from '../../../bit-components/icon-button/index'
import {Icons} from '../../../bit-components/icon/index'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  onRunNow: () => void
  onRunWithParameters: () => void
  isDisabled: boolean
  tooltipMessage: string
}

const SplitButton = (props: IProps) => {
  const {classes, onRunNow, onRunWithParameters, isDisabled, tooltipMessage} =
    props
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleRunWithParametersClick = () => {
    setAnchorEl(null)
    onRunWithParameters()
  }

  return (
    <Tooltip title={tooltipMessage}>
      <div>
        <span className={classes.primaryButtonContainer}>
          <Button
            buttonText={'Run Now'}
            onClick={onRunNow}
            disabled={isDisabled}
          />
        </span>
        <span className={classes.secondaryButtonContainer}>
          <IconButton
            onClick={handleMenuOpen}
            leadingIcon={Icons.ICON_KEYBOARD_ARROW_DOWN}
            disabled={isDisabled}
          />
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleRunWithParametersClick}>
              Run now with different parameters
            </MenuItem>
          </Menu>
        </span>
      </div>
    </Tooltip>
  )
}

export default withStyles(styles)(SplitButton)
