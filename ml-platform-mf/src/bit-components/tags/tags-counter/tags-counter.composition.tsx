import config from 'config'
import React from 'react'
import {CompositionWrapper} from '../../composition-wrapper/composition-wrapper'
import {TagsCounter} from './tags-counter'
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

export const BasicTagsCounter = () => {
  tagsMockFunc()
  return (
    <CompositionWrapper>
      <TagsCounter counter={0} />
    </CompositionWrapper>
  )
}

export const ActiveTagsCounter = () => {
  tagsMockFunc()
  return (
    <CompositionWrapper>
      <TagsCounter active={true} counter={0} />
    </CompositionWrapper>
  )
}

export const DisabledTagsCounter = () => {
  tagsMockFunc()
  return (
    <CompositionWrapper>
      <TagsCounter disabled={true} counter={0} />
    </CompositionWrapper>
  )
}
