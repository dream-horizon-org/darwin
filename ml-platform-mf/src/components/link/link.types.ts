import {ReactElement} from 'react'

export interface IProps {
  onClick: (param?: unknown) => void
  font: 'overline' | 'body2'
  color: 'highlight' | 'default'
  text: string
  icon?: ReactElement
}
