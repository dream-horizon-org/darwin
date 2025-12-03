import {withStyles, WithStyles} from '@mui/styles'
import React from 'react'

import {Dialog} from '../../../bit-components/dialog/index'
import styles from './indexJSS'

const shortcuts = [
  {
    shortcut: 'shift + N',
    description: 'Create new task'
  },
  {
    shortcut: 'shift + delete',
    description: 'Delete a task'
  },
  {
    shortcut: 'shift + S',
    description: 'Add Schedule'
  }
]

interface IProps extends WithStyles<typeof styles> {
  open: boolean
  handleClose: () => void
}

const ShortcutDialog = (props: IProps) => {
  const {classes, open, handleClose} = props

  return (
    <Dialog
      testIdentifier='dialogBox'
      handleClose={handleClose}
      title='Shortcuts'
      open={open}
      dialogContent={
        <div className={classes.container}>
          {shortcuts.map((shortcut, index) => (
            <div className={classes.shortcutContainer} key={index}>
              <div className={classes.shortcut}>{shortcut.shortcut}</div>
              <div className={classes.shortcutDescription}>
                {shortcut.description}
              </div>
            </div>
          ))}
        </div>
      }
    />
  )
}

const StyleComponent = withStyles(styles, {withTheme: true})(ShortcutDialog)

export default StyleComponent
