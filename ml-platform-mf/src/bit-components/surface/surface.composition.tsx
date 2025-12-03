import React from 'react'
import {CompositionWrapper} from '../composition-wrapper/composition-wrapper'
import {Typography} from '../typography/index'
import {SurfaceTypesList} from './constants'
import {Surface} from './surface'

const children = (theme: string) => {
  return (
    <Typography sx={{color: theme === 'light' ? 'black' : 'white'}}>
      Hello world
    </Typography>
  )
}
export const BasicSurface = () => {
  return (
    <CompositionWrapper
      lists={{type: SurfaceTypesList}}
      component={(prop) => (
        <Surface type={'primary'} {...prop}>
          {children(prop.theme)}
        </Surface>
      )}
    />
  )
}
BasicSurface.compositionName = 'Surface'
