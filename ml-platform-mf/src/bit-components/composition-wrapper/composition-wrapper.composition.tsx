import config from 'config'
import React from 'react'
import {Tags} from '../tags/tags/index'
import {Typography} from '../typography/typography'
import {CompositionWrapper} from './composition-wrapper'
import {TagsSizeList, TagsTypeList} from './utils'

const typographyMockFunc = () => {
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

export const BasicCompositionWrapper = () => {
  typographyMockFunc()
  return (
    <CompositionWrapper>
      <Typography>Hello world!</Typography>
    </CompositionWrapper>
  )
}

export const DefaultTags = () => {
  return (
    <div>
      <CompositionWrapper lists={{size: TagsSizeList, type: TagsTypeList}}>
        <Tags label={'Label'} />
      </CompositionWrapper>
    </div>
  )
}
