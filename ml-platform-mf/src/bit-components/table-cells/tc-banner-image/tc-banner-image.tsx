import React from 'react'
import {TableCellSeverity, TableCellSize, TcCell} from '../tc-cell/index'
import styles from './tc-banner-image.style'

export type TcBannerImageProps = {
  /**
   * To set the severity of TableCell.
   */
  severity?: TableCellSeverity
  /**
   * image url
   */
  bannerImage: string
  /**
   * Sticky position for the cell
   */
  stickyPosition?: 'left' | 'right'
  /**
   * To change theme
   */
  theme?: string
}

export function TcBannerImage(props: TcBannerImageProps) {
  const {severity, bannerImage, stickyPosition, theme} = props
  const classes = styles()
  return (
    <TcCell
      theme={theme}
      size={TableCellSize.Large}
      stickyPosition={stickyPosition}
      severity={severity}
    >
      <div className={classes.container}>
        <img src={bannerImage} alt='banner image' />
      </div>
    </TcCell>
  )
}
TcBannerImage.defaultProps = {
  theme: 'dark'
}
