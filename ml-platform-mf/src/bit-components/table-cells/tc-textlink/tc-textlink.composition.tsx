import React from 'react'
import {CompositionWrapper} from '../../composition-wrapper/index'
import {Icons} from '../../icon/index'
import {TableCellAlignmentList} from '../tc-cell/index'
import {TcTextlink} from './tc-textlink'

export const TcTextlinkAlign = () => {
  const handleClick = () => {
    alert('clicked')
  }
  return (
    <CompositionWrapper lists={{align: TableCellAlignmentList}}>
      <TcTextlink onClick={handleClick} text='TextLink'></TcTextlink>
    </CompositionWrapper>
  )
}

export const TcTextlinkWithIcon = () => {
  return (
    <CompositionWrapper lists={{align: TableCellAlignmentList}}>
      <TcTextlink
        href='#'
        text='TextLink'
        leadingIcon={Icons.ICON_HIGHLIGHT_OFF}
      ></TcTextlink>
    </CompositionWrapper>
  )
}
