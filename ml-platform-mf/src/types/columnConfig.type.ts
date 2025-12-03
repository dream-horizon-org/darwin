import {Padding} from '@material-ui/core'
import {ReactElement} from 'react'
import {alignSelf} from '../components/dataList/dataList.type'

export interface IColumnConfig<IProps = {}> {
  sticky?: boolean
  minColumnWidth?: string
  id: string
  numeric?: boolean
  disablePadding?: boolean
  label: string | ReactElement
  alignSelf?: alignSelf
  jsx?: (props: IProps, item, others, index?) => ReactElement
  wrapText?: boolean
  children?: Array<IColumnConfig>
  rowSpan?: number
  colSpan?: number
  headerCellClass?: string
  dataCellClass?: string
  padding?: Padding
  expandButton?: boolean
  headerJSX?: (props: IProps, item) => ReactElement
}
