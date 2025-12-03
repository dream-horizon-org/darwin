import DeleteIcon from '@mui/icons-material/Delete'
import * as React from 'react'
import {Flow} from '../../data/types'
import ConfirmationDialog from './ConfirmationDialog'

export default function CustomDeleteButton({
  flow,
  isEditable,
  tableIndex,
  handleEventTableDelete,
  dialogTitle,
  dialogContent
}) {
  const [open, setOpen] = React.useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleDelete = () => {
    handleEventTableDelete(tableIndex)
    handleClose()
  }

  const isButtonDisabled =
    flow === Flow.CREATE || (flow === Flow.Edit && isEditable.eventTable)

  return (
    <React.Fragment>
      <DeleteIcon
        style={{color: '#8F8F8F', cursor: 'pointer'}}
        onClick={isButtonDisabled ? handleClickOpen : undefined}
        color={isButtonDisabled ? 'inherit' : 'disabled'}
      />
      <ConfirmationDialog
        open={open}
        onClose={handleClose}
        title={dialogTitle}
        content={dialogContent}
        onConfirm={handleDelete}
      />
    </React.Fragment>
  )
}
