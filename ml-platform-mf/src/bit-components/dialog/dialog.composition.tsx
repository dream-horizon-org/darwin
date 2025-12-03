import React, {useState} from 'react'
import {CompositionWrapper} from '../composition-wrapper/index'
import {DialogBoxWithSecondaryButtonProp} from './constants'
import {Dialog} from './dialog'

import {TextButton} from '../text-button/index'

export const BasicDialog = () => {
  const [open, setOpen] = useState(false)

  const handleClose = () => {
    setOpen(false)
  }
  const handleOpen = () => {
    setOpen(true)
  }
  return (
    <CompositionWrapper>
      <TextButton onClick={handleOpen} buttonText='Click me' />
      <Dialog
        testIdentifier='dialogBox'
        handleClose={handleClose}
        title='
      Dialog'
        open={open}
        dialogContent={
          <div>
            Are you sure that the experiment has been running long enough to
            receive sufficient data? Please confirm.
          </div>
        }
      />
    </CompositionWrapper>
  )
}
BasicDialog.compositionName = 'Dialog'

export const FooterPrimaryButton = () => {
  const [open, setOpen] = useState(false)
  const handleClose = () => {
    setOpen(false)
  }
  const handleOpen = () => {
    setOpen(true)
  }
  return (
    <CompositionWrapper>
      <TextButton onClick={handleOpen} buttonText='Click me' />
      <Dialog
        hideCloseButton={true}
        handleClose={handleClose}
        title='
      Dialog'
        open={open}
        dialogContent={
          <div>
            Are you sure that the experiment has been running long enough to
            receive sufficient data? Please confirm.
          </div>
        }
        dialogFooter={{
          primaryButton: {
            text: 'Accept',
            onClick: handleClose
          }
        }}
      />
    </CompositionWrapper>
  )
}

export const FooterSecondaryButton = ({
  primaryMockFun,
  secondaryMockFun
}: DialogBoxWithSecondaryButtonProp) => {
  const [open, setOpen] = useState(false)
  const handleClose = () => {
    setOpen(false)
  }
  const handleOpen = () => {
    setOpen(true)
  }
  return (
    <CompositionWrapper>
      <TextButton onClick={handleOpen} buttonText='Click me' />
      <Dialog
        handleClose={handleClose}
        testIdentifier='dialogBox'
        title='
        Dialog'
        open={open}
        dialogContent={
          <div>
            Are you sure that the experiment has been running long enough to
            receive sufficient data? Please confirm.
          </div>
        }
        dialogFooter={{
          primaryButton: {
            text: 'Button',
            onClick: primaryMockFun,
            testIdentifier: 'primaryButton'
          },
          secondaryButton: {
            text: 'Button',
            onClick: secondaryMockFun,
            testIdentifier: 'secondaryButton'
          }
        }}
      />
    </CompositionWrapper>
  )
}

export const FooterSecondaryButtonWithReactNode = ({
  primaryMockFun,
  secondaryMockFun
}: DialogBoxWithSecondaryButtonProp) => {
  const [open, setOpen] = useState(false)
  const handleClose = () => {
    setOpen(false)
  }
  const handleOpen = () => {
    setOpen(true)
  }
  return (
    <CompositionWrapper>
      <TextButton onClick={handleOpen} buttonText='Click me' />
      <Dialog
        handleClose={handleClose}
        testIdentifier='dialogBox'
        title='
        Dialog'
        open={open}
        dialogContent={
          <div>
            Are you sure that the experiment has been running long enough to
            receive sufficient data? Please confirm.
          </div>
        }
        dialogFooter={{
          children: (
            <div
              style={{
                color: '#D9D9D9',
                fontFamily: 'Roboto',
                fontSize: '16px',
                fontStyle: 'normal',
                fontWeight: '400',
                lineHeight: '20px',
                width: '100%'
              }}
            >
              1/3
            </div>
          ),
          primaryButton: {
            text: 'Button',
            onClick: primaryMockFun,
            testIdentifier: 'primaryButton'
          },
          secondaryButton: {
            text: 'Button',
            onClick: secondaryMockFun,
            testIdentifier: 'secondaryButton'
          }
        }}
      />
    </CompositionWrapper>
  )
}
