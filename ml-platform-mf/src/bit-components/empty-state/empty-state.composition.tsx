import config from 'config'
import React from 'react'
import {CompositionWrapper} from '../composition-wrapper/index'
import {Icons} from '../icon/index'
import {EmptySateSizesList, EmptyStateSizes} from './constants'
import {EmptyState} from './empty-state'

export const EmptyStateWithSubtitle = () => {
  return (
    <CompositionWrapper lists={{size: EmptySateSizesList}}>
      <EmptyState
        imageUrl={`${config.cfBitComponentsUrl}/images/User-Search-Large.svg`}
        subTitle='Lorem Ipsum is simply dummy text.'
      />
    </CompositionWrapper>
  )
}
EmptyStateWithSubtitle.compositionName = 'Subtitle + deafult Size'

export const TitleAndSubtitle = () => {
  return (
    <CompositionWrapper lists={{size: EmptySateSizesList}}>
      <EmptyState
        imageUrl={`${config.cfBitComponentsUrl}/images/User-Search-Large.svg`}
        title='Heading'
        subTitle='Lorem Ipsum is simply dummy text.'
        size={EmptyStateSizes.LARGE}
      />
    </CompositionWrapper>
  )
}

export const SubtitleAndButton = () => {
  return (
    <CompositionWrapper lists={{size: EmptySateSizesList}}>
      <EmptyState
        imageUrl={`${config.cfBitComponentsUrl}/images/User-Search-Large.svg`}
        subTitle='Lorem Ipsum is simply dummy text.'
        size={EmptyStateSizes.LARGE}
        leadingIcon={Icons.ICON_ADD_OUTLINED}
        buttonText='Button'
        handleButtonClick={() => alert('button clicked')}
      />
    </CompositionWrapper>
  )
}

export const TitleSubtitleAndButton = () => {
  return (
    <CompositionWrapper lists={{size: EmptySateSizesList}}>
      <EmptyState
        imageUrl={`${config.cfBitComponentsUrl}/images/User-Search-Large.svg`}
        title='Heading'
        subTitle='Lorem Ipsum is simply dummy text.'
        leadingIcon={Icons.ICON_ADD_OUTLINED}
        buttonText='Button'
        handleButtonClick={() => alert('button clicked')}
        size={EmptyStateSizes.LARGE}
      />
    </CompositionWrapper>
  )
}

export const EmptyStateWithImageSizes = () => {
  return (
    <CompositionWrapper>
      <EmptyState
        imageUrl={`${config.cfBitComponentsUrl}/images/User-Search-Large.svg`}
        subTitle='Lorem Ipsum is simply dummy text.'
        imageSizes={{width: '250px', height: '250px'}}
      />
    </CompositionWrapper>
  )
}

EmptyStateWithImageSizes.compositionName = 'Subtitle + Image Sizes'
