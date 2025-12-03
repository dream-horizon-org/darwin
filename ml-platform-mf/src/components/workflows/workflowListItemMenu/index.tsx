import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import {withStyles, WithStyles} from '@mui/styles'
import React from 'react'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  anchorEl: HTMLElement | SVGSVGElement
  open: boolean
  handleClose: () => void
  handleClick: (actionName: string) => void
  menuItems: Array<{
    actionIcon: JSX.Element
    actionName: string
    disabled?: boolean
  }>
}

const WorkflowListItemMenu = (props: IProps) => {
  const {classes, anchorEl, open, handleClose, handleClick, menuItems} = props

  return (
    <div>
      <Menu
        id='basic-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button'
        }}
      >
        {menuItems.length > 0 &&
          menuItems?.map(({actionIcon, actionName, disabled}) => (
            <MenuItem
              onClick={() => handleClick(actionName)}
              disabled={disabled}
              key={actionName}
              data-testid={`workflow-list-row-action-${actionName.replace(
                ' ',
                '-'
              )}`}
              data-cy={'workflow-list-row-action'}
            >
              {actionIcon}
              <span className={classes.actionName}>{actionName}</span>
            </MenuItem>
          ))}
      </Menu>
    </div>
  )
}

const StyleComponent = withStyles(styles, {withTheme: true})(
  WorkflowListItemMenu
)

export default StyleComponent
