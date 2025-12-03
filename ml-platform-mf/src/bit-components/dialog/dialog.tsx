import React, {ReactNode} from 'react'

import {Dialog as MaterialDialog} from '@mui/material'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import {useBitThemeContext} from '../bit-theme-wrapper/index'
import {Button, ButtonVariants} from '../button/index'
import {Icons} from '../icon/index'
import {DialogFooterProps} from './constants'
import {stylesDarkTheme} from './styles/dialogDarkThemeStyles'
import {stylesLightTheme} from './styles/dialogLightThemeStyles'

export type DialogProps = {
  /**
   * A function for closing the dialog box.
   */
  handleClose: (event: React.MouseEvent<HTMLButtonElement>) => void
  /**
   * Boolean value for the state of dialog box.
   */
  open: boolean
  /**
   * String to be passed as a header.
   */
  title: NonNullable<ReactNode>
  /**
   * a node to be rendered in the component.
   */
  dialogContent: ReactNode
  /**
   * If false , then no padding will be applied in the dialogCotent.
   */
  noPadding?: boolean
  /**
   * For passing actionalbe buttons as ->
   *  {
        primaryButton: {
            onClick: (e) => void,
            text: string,
            testIdentifier?: string
        }


        secondaryButton?: {
          onClick: (e) => void,
          text: string,
          testIdentifier?: string
        }
    }.
   */
  dialogFooter?: DialogFooterProps
  /**
   * For passing test indentifier to the dialog component.
   */
  testIdentifier?: string
  /**
   * To change theme
   */
  theme?: string
  /**
   * size of dialog
   */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false
  /**
   * enable maxWidth of dialog
   */
  enableWidth
  /**
   * To hide close button
   */
  hideCloseButton?: boolean
}

export function Dialog({
  handleClose,
  open,
  title,
  dialogContent,
  noPadding,
  dialogFooter,
  testIdentifier,
  enableWidth,
  maxWidth,
  hideCloseButton
}: DialogProps) {
  const {theme} = useBitThemeContext()
  const dark = stylesDarkTheme()
  const light = stylesLightTheme()
  const dialogStyles = () => {
    const styles = theme === 'dark' ? dark : light
    return styles
  }

  return (
    <MaterialDialog
      maxWidth={maxWidth}
      open={open}
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
      sx={dialogStyles()}
      className={'container'}
      data-testid={testIdentifier}
      data-test={testIdentifier}
    >
      <DialogTitle id='alert-dialog-title' className='header'>
        <div className='title'>{title}</div>
        {hideCloseButton ? (
          <></>
        ) : (
          <div className='closeIconDiv'>
            <span
              className={`closeIcon ${Icons.ICON_CLOSE}`}
              onClick={handleClose}
            ></span>
          </div>
        )}
      </DialogTitle>
      <DialogContent
        className={`${
          enableWidth ? 'dialogContentWithoutFixedWidth' : 'dialogContent'
        } ${noPadding ? 'noPadding' : ''}`}
      >
        {dialogContent}
      </DialogContent>
      {dialogFooter && (
        <div className='footerContainer'>
          <div className='divider'></div>
          <DialogActions className='dialogFooter'>
            {dialogFooter?.children && <>{dialogFooter.children}</>}
            {dialogFooter?.secondaryButton && (
              <Button
                smallFont={dialogFooter?.secondaryButton?.smallFont}
                buttonText={dialogFooter?.secondaryButton?.text}
                onClick={dialogFooter?.secondaryButton?.onClick}
                testIdentifier={dialogFooter?.secondaryButton?.testIdentifier}
                variant={ButtonVariants.TERTIARY}
                isLoading={dialogFooter?.secondaryButton?.isLoading}
                disabled={dialogFooter?.secondaryButton?.disabled}
              />
            )}
            <Button
              smallFont={dialogFooter?.primaryButton?.smallFont}
              buttonText={dialogFooter?.primaryButton?.text}
              onClick={dialogFooter?.primaryButton?.onClick}
              testIdentifier={dialogFooter?.primaryButton?.testIdentifier}
              isLoading={dialogFooter?.primaryButton?.isLoading}
              disabled={dialogFooter?.primaryButton?.disabled}
            />
          </DialogActions>
        </div>
      )}
    </MaterialDialog>
  )
}
Dialog.defaultProps = {
  theme: 'dark',
  enableWidth: false,
  maxWidth: false
}
