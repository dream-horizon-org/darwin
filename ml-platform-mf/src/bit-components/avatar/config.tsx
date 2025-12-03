import React from 'react'
import {TagType} from './constants'
import Captain from './iconComponents/Captain'
import ViceCaptain from './iconComponents/ViceCaptain'

type ConfigProps = {
  tagType?: string
}

function Config({tagType}: ConfigProps) {
  switch (tagType) {
    case TagType.CAPTAIN:
      return <Captain></Captain>

    case TagType.VICECAPTAIN:
      return <ViceCaptain></ViceCaptain>

    default:
      return <Captain></Captain>
  }
}

export default Config
