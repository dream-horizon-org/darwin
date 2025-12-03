import React, {useState} from 'react'
import {CompositionWrapper} from '../composition-wrapper/index'
import {Icons} from '../icon/index'
import {HorizontalAlignment, Severity, VerticalAlignment} from './constants'
import {Snackbar} from './snackbar'

export const SuccessSnackbar = () => {
  const [open, setOpen] = useState(true)
  const handleClose = () => {
    setOpen(false)
  }

  return (
    <CompositionWrapper
      component={(prop) => (
        <Snackbar
          open={open}
          autoHideDuration={5000}
          message={`This is a success message!`}
          onClose={handleClose}
          severity={Severity.Success}
          horizontal={HorizontalAlignment.Center}
          vertical={VerticalAlignment.Bottom}
          leadingIcon={Icons.ICON_CHECK_CIRCLE_OUTLINE}
          {...prop}
        />
      )}
    />
  )
}

export const SuccessSnackbarWithActionButton = () => {
  const [open, setOpen] = useState(true)
  const handleClose = () => {
    setOpen(false)
  }
  return (
    <CompositionWrapper>
      <Snackbar
        open={open}
        autoHideDuration={100000}
        message={'This is a success message!'}
        onClose={handleClose}
        severity={Severity.Success}
        horizontal={HorizontalAlignment.Center}
        vertical={VerticalAlignment.Bottom}
        leadingIcon={Icons.ICON_CHECK_CIRCLE_OUTLINE}
        buttonParams={{
          buttonText: 'BUTTON',
          buttonHandler: () => {}
        }}
      />
    </CompositionWrapper>
  )
}

export const FailureSnackbar = () => {
  const [open, setOpen] = useState(true)
  const handleClose = () => {
    setOpen(false)
  }

  return (
    <CompositionWrapper>
      <Snackbar
        open={open}
        autoHideDuration={5000}
        message={'This is a failure message!'}
        onClose={handleClose}
        severity={Severity.Failure}
        horizontal={HorizontalAlignment.Center}
        vertical={VerticalAlignment.Bottom}
        leadingIcon={Icons.ICON_ERRORRED_INFO}
      />
    </CompositionWrapper>
  )
}

export const FailureSnackbarWithActionButton = () => {
  const [open, setOpen] = useState(true)
  const handleClose = () => {
    setOpen(false)
  }
  return (
    <CompositionWrapper>
      <Snackbar
        open={open}
        autoHideDuration={100000}
        message={'This is a failure message!'}
        onClose={handleClose}
        severity={Severity.Failure}
        horizontal={HorizontalAlignment.Center}
        vertical={VerticalAlignment.Bottom}
        leadingIcon={Icons.ICON_ERRORRED_INFO}
        buttonParams={{
          buttonText: 'BUTTON',
          buttonHandler: () => {}
        }}
      />
    </CompositionWrapper>
  )
}

export const InformationSnackbar = () => {
  const [open, setOpen] = useState(true)
  const handleClose = () => {
    setOpen(false)
  }

  return (
    <CompositionWrapper>
      <Snackbar
        open={open}
        autoHideDuration={5000}
        message={'This is a information message!'}
        onClose={handleClose}
        severity={Severity.Information}
        horizontal={HorizontalAlignment.Center}
        vertical={VerticalAlignment.Bottom}
        leadingIcon={Icons.ICON_INFO}
      />
    </CompositionWrapper>
  )
}

export const InformationSnackbarWithActionButton = () => {
  const [open, setOpen] = useState(true)
  const handleClose = () => {
    setOpen(false)
  }
  return (
    <CompositionWrapper>
      <Snackbar
        open={open}
        autoHideDuration={100000}
        message={'This is a information message!'}
        onClose={handleClose}
        severity={Severity.Information}
        horizontal={HorizontalAlignment.Center}
        vertical={VerticalAlignment.Bottom}
        leadingIcon={Icons.ICON_INFO}
        buttonParams={{
          buttonText: 'BUTTON',
          buttonHandler: () => {}
        }}
      />
    </CompositionWrapper>
  )
}

export const WarningSnackbar = () => {
  const [open, setOpen] = useState(true)
  const handleClose = () => {
    setOpen(false)
  }

  return (
    <CompositionWrapper>
      <Snackbar
        open={open}
        autoHideDuration={5000}
        message={'This is a warning message!'}
        onClose={handleClose}
        severity={Severity.Warning}
        horizontal={HorizontalAlignment.Center}
        vertical={VerticalAlignment.Bottom}
        leadingIcon={Icons.ICON_WARNING_AMBER}
      />
    </CompositionWrapper>
  )
}

export const WarningSnackbarWithActionButton = () => {
  const [open, setOpen] = useState(true)
  const handleClose = () => {
    setOpen(false)
  }
  return (
    <CompositionWrapper>
      <Snackbar
        open={open}
        autoHideDuration={100000}
        message={'This is a warning message!'}
        onClose={handleClose}
        severity={Severity.Warning}
        horizontal={HorizontalAlignment.Center}
        vertical={VerticalAlignment.Bottom}
        leadingIcon={Icons.ICON_WARNING_AMBER}
        buttonParams={{
          buttonText: 'BUTTON',
          buttonHandler: () => {}
        }}
      />
    </CompositionWrapper>
  )
}
