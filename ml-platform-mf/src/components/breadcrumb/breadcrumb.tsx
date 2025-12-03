import config from 'config'
import React from 'react'
import Link from '../link/link'
import {IProps} from './breadcrumb.types'
import {breadcrumbJss} from './breadcrumbJss'

export const Breadcrumb = (props: IProps) => {
  const classes = breadcrumbJss()
  const onLinkClick = (link) => () => {
    props.onLinkClick(link)
  }
  return (
    <div className={classes.container} data-test={props.dataTest}>
      <div className={classes.linkContainer}>
        {props.linkList?.map((link) => {
          return (
            <Link
              onClick={onLinkClick(link)}
              font={'body2'}
              color={'highlight'}
              text={link.label}
              icon={
                <img
                  src={`${config.cfMsdAssetUrl}/icons/chevron_right.svg`}
                  loading='lazy'
                />
              }
            />
          )
        })}
      </div>
    </div>
  )
}
