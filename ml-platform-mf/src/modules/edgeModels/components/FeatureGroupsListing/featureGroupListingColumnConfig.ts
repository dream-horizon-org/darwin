import {TableCells} from '../../../../bit-components/datatable/constants'
import {TableCellAlignment} from '../../../../bit-components/table-cells/tc-cell/index'
import {SelectionOnEvents} from '../../graphQL/queries/getEventSchema'
import {FeatureGroupsListingHeader} from './constants'
export const featureGroupsListingColumnConfig = () => {
  return [
    {
      id: 1,
      columnType: TableCells.TcData,
      headerProps: {
        headerLabel: FeatureGroupsListingHeader.FEATURE_GROUP_NAME,
        align: TableCellAlignment.Left
      },
      componentProps: (item: any) => {
        return {
          text: item.title
        }
      }
    }
  ]
}
