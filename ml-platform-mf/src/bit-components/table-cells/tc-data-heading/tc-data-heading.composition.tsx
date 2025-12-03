import config from 'config'
import React from 'react'
import {CompositionWrapper} from '../../composition-wrapper/index'
import {Icons} from '../../icon/index'
import {TcDataHeading} from './tc-data-heading'

export const BasicTcDataHeading = () => {
  return (
    <CompositionWrapper>
      <TcDataHeading
        primaryText='Heading'
        primaryTrailingIcon={Icons.ICON_HIGHLIGHT_OFF}
        avatarLink='s'
      />
    </CompositionWrapper>
  )
}
BasicTcDataHeading.compositionName = 'Tc Data Heading'

export const BasicTcDataHeadingWithSecondaryText = () => {
  return (
    <CompositionWrapper>
      <TcDataHeading
        primaryText='Heading'
        secondaryText='secondary text'
        secondaryTrailingIcon={Icons.ICON_HIGHLIGHT_OFF}
        avatarLink='s'
      />
    </CompositionWrapper>
  )
}
BasicTcDataHeadingWithSecondaryText.compositionName =
  'Tc Data Heading + Secondary Text'

export const BasicTcDataHeadingWithLeadingIcon = () => {
  return (
    <CompositionWrapper>
      <TcDataHeading
        primaryText='Heading'
        secondaryText='secondary text'
        secondaryTrailingIcon={Icons.ICON_HIGHLIGHT_OFF}
        leadingIcon={Icons.ICON_ACTIVE}
      />
    </CompositionWrapper>
  )
}
BasicTcDataHeadingWithLeadingIcon.compositionName =
  'Tc Data Heading + Leading Icon'

export const BasicTcDataHeadingWithImgLink = () => {
  return (
    <CompositionWrapper>
      <TcDataHeading
        primaryText='Heading'
        secondaryText='secondary text'
        secondaryTrailingIcon={Icons.ICON_HIGHLIGHT_OFF}
        imgLink={`${config.cfBitComponentsUrl}/common-component-icons/testBanner.png`}
      />
    </CompositionWrapper>
  )
}
BasicTcDataHeadingWithImgLink.compositionName = 'Tc Data Heading + Img Link'
