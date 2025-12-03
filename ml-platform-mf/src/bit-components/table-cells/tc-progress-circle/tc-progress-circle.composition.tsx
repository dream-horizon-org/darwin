import React from 'react'
import {CompositionWrapper} from '../../composition-wrapper/index'
import {LoaderSizeList} from '../../progress-circle/index'
import {TableCellSize} from '../tc-cell/index'
import {TcProgressCircle} from './tc-progress-circle'

export const LargeTcProgressCircle = () => {
  return (
    <CompositionWrapper
      lists={{loaderSize: LoaderSizeList}}
      component={(props) => {
        return <TcProgressCircle {...props} cellSize={TableCellSize.Large} />
      }}
    />
  )
}

export const MediumTcProgressCircle = () => {
  return (
    <CompositionWrapper
      lists={{loaderSize: LoaderSizeList}}
      component={(props) => {
        return <TcProgressCircle {...props} cellSize={TableCellSize.Medium} />
      }}
    />
  )
}

export const SmallTcProgressCircle = () => {
  return (
    <CompositionWrapper
      lists={{loaderSize: LoaderSizeList}}
      component={(props) => {
        return <TcProgressCircle {...props} cellSize={TableCellSize.Small} />
      }}
    />
  )
}
