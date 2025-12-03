import React from 'react'
import {
  Dialog,
  DialogFooterProps
} from '../../../../bit-components/dialog/index'

interface IProps {
  open: boolean
  onClose: () => void
  title: string
  content: string
  onConfirm: () => void
}

const ConfirmationDialog = (props: IProps) => {
  const {open, onClose, title, content, onConfirm} = props

  const dialogFooter: DialogFooterProps = {
    primaryButton: {
      onClick: onConfirm,
      text: 'Confirm',
      testIdentifier: 'confirm-button'
    },
    secondaryButton: {
      onClick: onClose,
      text: 'Cancel',
      testIdentifier: 'cancel-button'
    }
  }

  return (
    <Dialog
      handleClose={onClose}
      open={open}
      title={title}
      dialogContent={<p>{content}</p>}
      noPadding={false}
      dialogFooter={dialogFooter}
      testIdentifier='confirmation-dialog'
    />
  )
}

export default ConfirmationDialog
