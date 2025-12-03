import {Typography} from '@mui/material'
import * as React from 'react'
import {IProps} from './link.types'
import {linkJss} from './linkJss'

const Link = (props: IProps) => {
  const classes = linkJss()
  const {color} = props
  return (
    <div
      className={`${classes.link}  ${
        props.color === 'highlight' && classes.highlightColor
      } ${props.color === 'default' && classes.defaultColor}`}
      onClick={props.onClick}
    >
      <Typography
        className={`${color === 'highlight' && classes.highlightColor} ${
          color === 'default' && classes.defaultColor
        }`}
        variant={props.font}
      >
        {props.text}
      </Typography>
      {props.icon || ''}
    </div>
  )
}

export default Link
