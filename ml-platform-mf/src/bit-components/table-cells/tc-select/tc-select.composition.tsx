import React from 'react'
import {CompositionWrapper} from '../../composition-wrapper/index'
import {TcSelect} from './tc-select'

export type Data = {
  id: number
  name: string
  calories: string
  fat: number
  carbs: number
  protein: number
  type: string
}

export const BasicTcSelect = () => {
  const [selectedRow, setSelectedRow] = React.useState<Array<number>>([])
  return (
    <CompositionWrapper>
      <TcSelect<Data>
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
        defaultSelection={[]}
        enableSelection={false}
        indexKeyName={'id'}
        row={{
          id: 1,
          name: 'Frozen yoghurt',
          calories: 'dummy',
          fat: 6.0,
          carbs: 24,
          protein: 4.0,
          type: 'success'
        }}
      />
    </CompositionWrapper>
  )
}
BasicTcSelect.compositionName = 'Tc Select'
