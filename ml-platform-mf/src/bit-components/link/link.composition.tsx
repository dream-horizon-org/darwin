import React from 'react'
import {CompositionWrapper} from '../composition-wrapper/index'
import {UnderlineProps} from './constants'
import {Link, LinkProps} from './link'

export const BasicLink = (props: LinkProps) => {
  return (
    <CompositionWrapper>
      <Link href={props.href || '#'} underline={UnderlineProps.None}>
        {props.children || 'Click me!'}
      </Link>
    </CompositionWrapper>
  )
}
BasicLink.composition = 'Link'

export const UnderlineLink = (props: LinkProps) => {
  return (
    <CompositionWrapper>
      <Link href={props.href || '#'} underline={UnderlineProps.Always}>
        {props.children || 'Click me!'}
      </Link>
    </CompositionWrapper>
  )
}

export const UnderlineOnHoverLink = (props: LinkProps) => {
  return (
    <CompositionWrapper>
      <Link href={props.href || '#'} underline={UnderlineProps.Hover}>
        {props.children || 'Click me!'}
      </Link>
    </CompositionWrapper>
  )
}
