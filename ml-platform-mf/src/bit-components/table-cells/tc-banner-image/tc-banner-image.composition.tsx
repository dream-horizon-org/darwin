import config from 'config'
import React from 'react'
import {CompositionWrapper} from '../../composition-wrapper/index'
import {TcBannerImage} from './tc-banner-image'

export const BasicTcBannerImage = () => {
  return (
    <CompositionWrapper>
      <TcBannerImage
        bannerImage={`${config.cfBitComponentsUrl}/common-component-icons/testBanner.png`}
      />
    </CompositionWrapper>
  )
}
