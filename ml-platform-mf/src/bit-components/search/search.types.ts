import {MenuProps} from '@mui/material'
import {Classes} from 'jss'

const menuSx = {
  left: '0px'
}

export const menuProps = (classes: Classes<'menuBox'>): Partial<MenuProps> => {
  return {
    anchorOrigin: {
      vertical: 'bottom',
      horizontal: 'left'
    },
    transformOrigin: {
      vertical: 'top',
      horizontal: 'left'
    },
    style: menuSx,
    classes: {paper: classes.menuBox},
    variant: 'menu'
  }
}
