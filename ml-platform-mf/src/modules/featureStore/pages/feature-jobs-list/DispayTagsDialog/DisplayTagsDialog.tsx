import CloseIcon from '@mui/icons-material/Close'
import {
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material'
import {WithStyles} from '@mui/styles'
import withStyles from '@mui/styles/withStyles'
import React from 'react'
import {compose} from 'redux'
import {Tags, TagsType} from '../../../../../bit-components/tags/tags/index'

import styles from './DisplayTagsDialogJSS'

interface IProps extends WithStyles<typeof styles> {
  item: any
  openTagsDialog: boolean
  onOpenTagsDialogChange: (value: boolean) => void
}

const DisplayTagsDialog = (props: IProps) => {
  const {classes} = props
  const onDialogClose = () => {
    props.onOpenTagsDialogChange(false)
  }

  return (
    <Dialog
      open={props.openTagsDialog}
      onClose={onDialogClose}
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
      fullWidth
      maxWidth='sm'
    >
      <div className={classes.tagHeader}>
        <DialogTitle
          id='alert-dialog-slide-title'
          className={classes.dialogTitle}
        >
          <div className={classes.tagsHeaderContent}>
            <h4 className={classes.tagTitleHeading}>TAGS</h4>
            <CloseIcon
              onClick={onDialogClose}
              className={classes.tagDialogCloseIcon}
            />
          </div>
        </DialogTitle>
      </div>
      <DialogContent className={classes.tagsContent}>
        {props.item.tags.map((tag) => (
          <div className={classes.tag}>
            <Tags label={tag} type={TagsType?.Default} />
          </div>
        ))}
      </DialogContent>
    </Dialog>
  )
}

const styleComponent = compose(withStyles(styles, {withTheme: true}))(
  DisplayTagsDialog
)

export default styleComponent
