import config from 'config'
import React from 'react'
import {CompositionWrapper} from '../../composition-wrapper/index'
import {TableCellSize} from '../tc-cell/index'
import {TcIconList} from './tc-icon-list'
import {iconListMockData} from './tc-icon-list.mockData'

const iconMockFunc = () => {
  const head = document.getElementsByTagName('HEAD')[0]
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `${config.cfBitComponentsUrl}/fontIcons/styles.css`
  head.appendChild(link)
}

export const BasicTcIconList = () => {
  const handleOnClick = () => {
    alert('Icon-Button is clicked')
  }
  iconMockFunc()

  return (
    <CompositionWrapper>
      <TcIconList
        size={TableCellSize.Large}
        onClick={handleOnClick}
        iconList={iconListMockData}
      />
    </CompositionWrapper>
  )
}
