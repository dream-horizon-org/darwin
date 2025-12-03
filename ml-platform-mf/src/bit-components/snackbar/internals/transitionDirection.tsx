import Slide from '@mui/material/Slide'
import React from 'react'
import {SnackbarAlignment, VerticalAlignment} from '../constants'

export const TransitionUp = (props) => {
  return <Slide {...props} direction={SnackbarAlignment.Up} />
}

export const TransitionDown = (props) => {
  return <Slide {...props} direction={SnackbarAlignment.Down} />
}

export function TransitionDirection(vertical: VerticalAlignment) {
  return vertical === VerticalAlignment.Top ? TransitionDown : TransitionUp
}
