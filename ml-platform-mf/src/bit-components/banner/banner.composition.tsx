import config from 'config'
import React, {useState} from 'react'
import {CompositionWrapper} from '../composition-wrapper/index'
import {Icons} from '../icon/index'
import {Banner} from './banner'
import {BannerSeverityList, Severity} from './constants'

const bannerMockFunc = () => {
  const head = document.getElementsByTagName('HEAD')[0]
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `${config.cfBitComponentsUrl}/fontIcons/styles.css`
  head.appendChild(link)
}

export const DefaultBanner = () => {
  bannerMockFunc()
  const [open, setOpen] = useState(true)
  const handleClose = () => {
    setOpen(false)
  }

  return (
    <CompositionWrapper
      lists={{severity: BannerSeverityList}}
      component={(prop) => {
        return (
          <Banner
            open={open}
            message={`This is a ${prop.severity || 'success'} message!`}
            onClose={handleClose}
            showCloseButton={true}
            severity={Severity.Success}
            leadingIcon={Icons.ICON_CHECK_CIRCLE_OUTLINE}
            {...prop}
          />
        )
      }}
    />
  )
}
DefaultBanner.compositionName = 'Defailt'

export const ActionButton = () => {
  bannerMockFunc()
  const [open, setOpen] = useState(true)
  const handleClose = () => {
    setOpen(false)
  }
  return (
    <CompositionWrapper
      lists={{severity: BannerSeverityList}}
      component={(prop) => {
        return (
          <Banner
            open={open}
            message={`This is a ${prop.severity || 'success'} message!`}
            onClose={handleClose}
            severity={Severity.Success}
            leadingIcon={Icons.ICON_CHECK_CIRCLE_OUTLINE}
            showCloseButton={true}
            buttonParams={{
              buttonText: 'BUTTON',
              buttonHandler: () => {}
            }}
            {...prop}
          />
        )
      }}
    />
  )
}
