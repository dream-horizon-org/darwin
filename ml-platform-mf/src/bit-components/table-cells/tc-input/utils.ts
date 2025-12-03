import {InputSizes} from '../../input/index'
import {TableCellSize} from '../tc-cell/index'
export const getInputSize = (size: TableCellSize = TableCellSize.Large) => {
  return size === TableCellSize.Large ? InputSizes.MEDIUM : InputSizes.SMALL
}
