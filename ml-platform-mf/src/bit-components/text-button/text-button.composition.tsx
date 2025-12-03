import config from 'config'
import React from 'react'
import {CompositionWrapper} from '../composition-wrapper/index'
import {ButtonSizes} from './constants'
import {TextButton, TextButtonProps} from './text-button'

const iconMockFunc = () => {
  const head = document.getElementsByTagName('HEAD')[0]
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `${config.cfBitComponentsUrl}/fontIcons/styles.css`
  head.appendChild(link)
}

export const SmallTextButton = ({onClick}: TextButtonProps) => {
  iconMockFunc()
  return (
    <CompositionWrapper>
      <TextButton
        onClick={onClick}
        size={ButtonSizes.SMALL}
        buttonText={'BUTTON'}
      />
    </CompositionWrapper>
  )
}
