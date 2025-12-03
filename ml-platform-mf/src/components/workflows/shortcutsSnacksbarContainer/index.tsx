import React, {useEffect} from 'react'

import ShortcutsSnackBar from '../shortcutsSnackbar'

const snackbars = [
  {
    text: 'Press shift + N to create new task.',
    btnText: 'View All Shortcuts'
  },
  {
    text: 'Select a task and press shift + delete to delete it.',
    btnText: 'View All Shortcuts'
  },
  {
    text: 'Press shift + S to add a schedule.',
    btnText: 'View All Shortcuts'
  }
]

interface IProps {
  openSnackbar: boolean
  onBtnClicked: () => void
}

const ShortcutsSnacksbarContainer = (props: IProps) => {
  const {openSnackbar, onBtnClicked} = props
  const [open, setOpen] = React.useState(openSnackbar)

  const onClose = () => {
    setOpen(false)
  }

  useEffect(() => {
    setOpen(openSnackbar)
  }, [openSnackbar])

  return (
    <div>
      {snackbars.map((snackbar, idx) => (
        <ShortcutsSnackBar
          open={open}
          onClose={onClose}
          text={snackbar.text}
          btnText={snackbar.btnText}
          marginBottom={idx * 80}
          onBtnClicked={onBtnClicked}
        />
      ))}
    </div>
  )
}

export default ShortcutsSnacksbarContainer
