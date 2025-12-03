import React from 'react'
import {
  TextLinkSizesList,
  TextLinkStateList,
  TextLinkVariantsList,
  TextLinkVarinats
} from './constants'
import {TextLink} from './text-link'

import config from 'config'
import {CompositionWrapper} from '../composition-wrapper/index'

const addingRobotoFonts = () => {
  const head = document.getElementsByTagName('HEAD')[0]
  const link2 = document.createElement('link')
  link2.rel = 'stylesheet'
  link2.href =
    'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap'
  head.appendChild(link2)
}
const addingIcon = () => {
  const head = document.getElementsByTagName('HEAD')[0]
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `${config.cfBitComponentsUrl}/fontIcons/styles.css`
  head.appendChild(link)
}

export const BasicLink = () => {
  return (
    <CompositionWrapper
      lists={{
        variant: TextLinkVariantsList,
        disabled: TextLinkStateList,
        size: TextLinkSizesList
      }}
    >
      <TextLink text='Text link' href='#' />
    </CompositionWrapper>
  )
}
BasicLink.compositionName = 'Link'

export const WithIcon = () => {
  addingRobotoFonts()
  addingIcon()
  return (
    <CompositionWrapper
      lists={{
        variant: TextLinkVariantsList,
        disabled: TextLinkStateList,
        size: TextLinkSizesList
      }}
    >
      <TextLink icon={true} text='Text link' href='#' />
    </CompositionWrapper>
  )
}

export const WithHoverDisabled = () => {
  addingRobotoFonts()
  addingIcon()
  return (
    <CompositionWrapper
      lists={{
        variant: TextLinkVariantsList,
        disabled: TextLinkStateList,
        size: TextLinkSizesList
      }}
    >
      <TextLink
        theme={'light'}
        variant={TextLinkVarinats.Primary}
        text='Text link'
        icon={false}
        removeHover={true}
        addCursor={true}
      />
    </CompositionWrapper>
  )
}
