import config from 'config'
import React from 'react'
import {CompositionWrapper} from '../../composition-wrapper/composition-wrapper'
import {TagsStatusList} from './constants'
import {TagsStatus} from './tags-status'

const tagsMockFunc = () => {
  const head = document.getElementsByTagName('HEAD')[0]
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `${config.cfBitComponentsUrl}/fontIcons/styles.css`
  head.appendChild(link)
  const link2 = document.createElement('link')
  link2.rel = 'stylesheet'
  link2.href =
    'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap'
  head.appendChild(link2)
}

export const TagsStatusActive = () => {
  tagsMockFunc()
  return (
    <CompositionWrapper lists={{status: TagsStatusList}}>
      <TagsStatus status={TagsStatusList[0].value} />
    </CompositionWrapper>
  )
}
