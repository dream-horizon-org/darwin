import React from 'react'
import {
  ActionableIconButtonSizes,
  ActionableIconButtonVariants
} from '../../icon-button/index'
import {Icons} from '../../icon/index'
import {
  TableCellAlignment,
  TableCellAlignmentList,
  TableCellSize,
  TableCellSizeList
} from '../tc-cell/index'
import {TcData} from './tc-data'

import {CompositionWrapper} from '../../composition-wrapper/index'

export const DataCell = () => {
  return (
    <CompositionWrapper
      lists={{size: TableCellSizeList, align: TableCellAlignmentList}}
    >
      <TcData
        size={TableCellSize.Large}
        align={TableCellAlignment.Left}
        text={'1500s'}
        trailingIcon={Icons.ICON_HIGHLIGHT_OFF}
      />
    </CompositionWrapper>
  )
}
DataCell.compositionName = 'Tc Data'

export const TcDataWithAvatar = () => {
  return (
    <CompositionWrapper lists={{size: TableCellSizeList}}>
      <TcData
        size={TableCellSize.Large}
        text={'Cell'}
        trailingIcon={Icons.ICON_HIGHLIGHT_OFF}
        avatarLink={'avatar'}
      />
    </CompositionWrapper>
  )
}

export const TcDataDataTable = () => {
  return (
    <CompositionWrapper lists={{size: TableCellSizeList}}>
      <TcData
        size={TableCellSize.Large}
        showToolTip={true}
        text={
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum has been the industry's standard dummy text ever since the 1500s"
        }
      />
    </CompositionWrapper>
  )
}

export const TcDataWithOnclickIcon = () => {
  return (
    <CompositionWrapper
      lists={{size: TableCellSizeList, align: TableCellAlignmentList}}
    >
      <TcData
        size={TableCellSize.Large}
        align={TableCellAlignment.Left}
        text={'Cell'}
        onClick={() => {
          alert('Hello')
        }}
        actionableVariants={ActionableIconButtonVariants.ACTIONABLE_PRIMARY}
        actionableSizes={ActionableIconButtonSizes.LARGE}
        onClickIcon={Icons.ICON_HIGHLIGHT_OFF}
      />
    </CompositionWrapper>
  )
}

export const TcDataTrailingTooltip = () => {
  return (
    <CompositionWrapper lists={{size: TableCellSizeList}}>
      <TcData
        size={TableCellSize.Large}
        align={TableCellAlignment.Left}
        text={'Cell'}
        avatarLink={'avatar'}
        trailingTooltipItems={['test1', 'test2', 'test3']}
      />
    </CompositionWrapper>
  )
}

export const TcDataWithSecondaryHighLightedText = () => {
  const styleCss = {
    color: 'white',
    background: 'rgb(214,180,252)',
    fontSize: '16px'
  }
  return (
    <CompositionWrapper lists={{size: TableCellSizeList}}>
      <TcData
        size={TableCellSize.Large}
        leadingIcon={Icons.ICON_CLEAR}
        text={
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum has been the industry's standard dummy text ever since the 1500s"
        }
        highLightStyle={styleCss}
        highlightText='text'
        secondaryText={'Secondary Text'}
      />
    </CompositionWrapper>
  )
}
