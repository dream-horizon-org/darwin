import React, {useEffect, useRef} from 'react'
import {useSideDrawerStyles} from './sideDrawerJSS'

export const HEADER_BUTTON_IDENTIFIER = 'headerMenuButton'

interface ISideDrawerProps {
  isClosed?: boolean
  children: React.ReactElement
  closeSideDrawer?: () => void
  isMobile?: boolean
  openSidenav?: () => void
  sideNavLocalStorage: boolean
}

const SideDrawer = (props: ISideDrawerProps) => {
  const node = useRef<HTMLDivElement>()
  const {isClosed, isMobile} = props
  const classes = useSideDrawerStyles()

  const handleClickOutside = (e) => {
    if (
      (node && node.current && node.current.contains(e.target)) ||
      e.target.id === HEADER_BUTTON_IDENTIFIER
    ) {
      return
    }
    // outside click
    props.closeSideDrawer()
  }

  useEffect(() => {
    if (!isClosed) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isClosed])

  return (
    <div
      ref={node}
      className={`${classes.container} ${
        props.isClosed ? classes.isClosed : ''
      } ${props.sideNavLocalStorage && classes.hoverShadow}`}
    >
      {props.children}
    </div>
  )
}

export default SideDrawer
