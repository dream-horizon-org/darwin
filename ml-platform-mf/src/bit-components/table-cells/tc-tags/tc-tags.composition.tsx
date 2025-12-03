import React from 'react'
import {CompositionWrapper} from '../../composition-wrapper/index'
import {Icons} from '../../icon/index'
import {TableCellSizeList} from '../tc-cell/index'
import {TcTags} from './tc-tags'

export const LargeTableCellTags = () => {
  return (
    <CompositionWrapper lists={{size: TableCellSizeList}}>
      <TcTags label={'label'} />
    </CompositionWrapper>
  )
}
LargeTableCellTags.compositionName = 'Table Cell Tags'

export const TableCellTagsWithIcon = () => {
  return (
    <CompositionWrapper lists={{size: TableCellSizeList}}>
      <TcTags label={'label'} trailingIcon={Icons.ICON_AIRPLANEMODE_ACTIVE} />
    </CompositionWrapper>
  )
}
