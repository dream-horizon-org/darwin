import {ButtonSizes} from '../../button/index'
import {TableCellSize} from '../tc-cell/index'
export const getInputSize = (size: TableCellSize = TableCellSize.Large) => {
  return size === TableCellSize.Large ? ButtonSizes.MEDIUM : ButtonSizes.SMALL
}
