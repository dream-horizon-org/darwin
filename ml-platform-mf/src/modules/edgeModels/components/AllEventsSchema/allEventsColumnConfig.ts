import {TableCells} from '../../../../bit-components/datatable/constants'
import {TableCellAlignment} from '../../../../bit-components/table-cells/tc-cell/index'
import {SelectionOnEvents} from '../../graphQL/queries/getEventSchema'
import {EventsListingHeader} from './constants'

export const allEventsColumnConfig = (styles, appVersion: string) => {
  return [
    {
      id: 1,
      columnType: TableCells.TcData,
      headerProps: {
        headerLabel: EventsListingHeader.EVENT_NAME,
        align: TableCellAlignment.Left
      },
      componentProps: (item: SelectionOnEvents) => {
        return {
          text: item.metadata.androidfull
            ? item.metadata.androidfull.eventName
            : item.metadata.ios.eventName
        }
      }
    },
    {
      id: 2,
      columnType: TableCells.TcData,
      headerProps: {
        headerLabel: EventsListingHeader.APP_VERSION,
        align: TableCellAlignment.Left
      },
      componentProps: (item: SelectionOnEvents) => {
        return {text: appVersion}
      }
    },
    {
      id: 3,
      columnType: TableCells.TcData,
      headerProps: {
        headerLabel: EventsListingHeader.PLATFORM,
        align: TableCellAlignment.Left
      },
      componentProps: (item: SelectionOnEvents) => {
        return {
          text: item.metadata.androidfull
            ? item.metadata.androidfull.platform
            : item.metadata.ios.platform
        }
      }
    }
  ]
}
