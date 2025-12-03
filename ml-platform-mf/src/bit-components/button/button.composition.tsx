import React, {useState} from 'react'
import {CompositionWrapper} from '../composition-wrapper/index'
import {Icons} from '../icon/index'
import {Button, ButtonProps} from './button'
import {
  ButtonSizetsList,
  ButtonStateList,
  ButtonVariantsList
} from './constants'

/* All primary dark compositions are below */
export const PrimaryButton = ({onClick}: ButtonProps) => {
  const [theme, setTheme] = useState('dark')
  return (
    <CompositionWrapper
      lists={{
        disabled: ButtonStateList,
        variant: ButtonVariantsList,
        size: ButtonSizetsList
      }}
    >
      <Button
        onClick={(e) => {
          const temp = theme === 'dark' ? 'light' : 'dark'
          setTheme(temp)
          onClick(e)
        }}
        buttonText={'basic'}
        theme={theme}
        testIdentifier={'test-identifier'}
      />
    </CompositionWrapper>
  )
}
PrimaryButton.compositionName = 'Button'

export const ButtonWithLeftIcon = ({onClick}: ButtonProps) => {
  return (
    <CompositionWrapper
      lists={{
        disabled: ButtonStateList,
        variant: ButtonVariantsList,
        size: ButtonSizetsList
      }}
    >
      <Button
        buttonText={'button'}
        onClick={onClick}
        leadingIcon={Icons.ICON_HIGHLIGHT_OFF}
      />
    </CompositionWrapper>
  )
}
ButtonWithLeftIcon.compositionName = 'Button + Left Icon'
export const ButtonWithRightIcon = ({onClick}: ButtonProps) => {
  return (
    <CompositionWrapper
      lists={{
        disabled: ButtonStateList,
        variant: ButtonVariantsList,
        size: ButtonSizetsList
      }}
    >
      <Button
        buttonText={'button'}
        onClick={onClick}
        trailingIcon={Icons.ICON_HIGHLIGHT_OFF}
      />
    </CompositionWrapper>
  )
}
ButtonWithRightIcon.compositionName = 'Button + Right Icon'
/* All primary Loading compositions are below */
export const ButtonInLoadingState = () => {
  return (
    <CompositionWrapper>
      <Button
        buttonText={'button'}
        onClick={() => alert('button clicked')}
        trailingIcon={Icons.ICON_HIGHLIGHT_OFF}
        isLoading={true}
      />
    </CompositionWrapper>
  )
}
