import React from 'react'
import {CompositionWrapper} from '../../composition-wrapper/composition-wrapper'
import {Icons} from '../../icon/index'
import {TagsSizeList, TagsTypeList} from './constants'
import {Tags} from './tags'

export const DefaultTags = () => {
  return (
    <div>
      <CompositionWrapper lists={{size: TagsSizeList, type: TagsTypeList}}>
        <Tags label={'Label'} />
      </CompositionWrapper>
    </div>
  )
}

export const TagsWithTrailingIcons = () => {
  return (
    <CompositionWrapper lists={{size: TagsSizeList, type: TagsTypeList}}>
      <Tags label={'Label'} trailingIcon={Icons.ICON_ARROW_RIGHT} />
    </CompositionWrapper>
  )
}

export const TagsWithLeadingIcons = () => {
  return (
    <CompositionWrapper lists={{size: TagsSizeList, type: TagsTypeList}}>
      <Tags label={'Label'} leadingIcon={Icons.ICON_ARROW_RIGHT} />
    </CompositionWrapper>
  )
}
