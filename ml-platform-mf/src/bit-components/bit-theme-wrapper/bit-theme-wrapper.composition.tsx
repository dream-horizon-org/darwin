import React from 'react'
import {Accordion} from '../accordion/index'
import {Chip, ChipSizes} from '../chip/index'
import {Typography} from '../typography/index'
import {BitThemeWrapper} from './bit-theme-wrapper'

export const LightBitThemeWrapper = () => {
  return (
    <BitThemeWrapper theme='light'>
      <Accordion
        body={<Typography>Accordion Data in Light Theme</Typography>}
        title='Light theme accordion'
      />
      <br />
      <Chip label='Light Chip' size={ChipSizes.Medium} />
    </BitThemeWrapper>
  )
}

export const DarkBitThemeWrapper = () => {
  return (
    <BitThemeWrapper theme='dark'>
      <Accordion
        body={<Typography>Accordion Data in Dark Theme</Typography>}
        title='Dark theme accordion'
      />
      <br />
      <Chip label='Dark Chip' size={ChipSizes.Medium} selected />
    </BitThemeWrapper>
  )
}

export const BasicBitThemeWrapper = () => {
  return <p>hello world!</p>
}
