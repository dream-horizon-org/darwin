import React, {useState} from 'react'
import {Datatable} from '../../../../bit-components/datatable/index'
import {TableCellSize} from '../../../../bit-components/table-cells/tc-cell/index'
import NoResultsFound from '../../../../components/workflows/noResultsFound/index'
import type {SelectionOnEvents} from '../../graphQL/queries/getEventSchema/index'
import {allEventsColumnConfig} from './allEventsColumnConfig'

import {withStyles} from '@mui/styles'
import styles from './AllEventsListingJSS'

function AllEventsListingImpl(props) {
  const {classes} = props
  const [currentPage, setCurrentPage] = useState<number>(0)
  const {allEventsSchema, appVersionSemver, eventRowClickHandler} = props
  const columnConfig = allEventsColumnConfig(styles, appVersionSemver)

  const pageChangeHandler = (page: number) => {
    if (page - 1 === currentPage) {
      return
    }
    setCurrentPage(page - 1)
  }

  const allEvents =
    allEventsSchema?.data?.slice(currentPage, 10 + currentPage) || []

  const totalRows = allEventsSchema?.data?.length

  return (
    <>
      {
        <div className={classes.dataList}>
          <Datatable<SelectionOnEvents>
            enablePagination={totalRows ? true : false}
            enableSelection={false}
            singleSelection={false}
            size={TableCellSize.Medium}
            columnConfig={columnConfig}
            data={allEvents || []}
            indexKeyName={'id'}
            onSelectAllClick={() => {}}
            enableSelectionColumn={false}
            loading={allEventsSchema.loading}
            totalRow={totalRows}
            pageHandler={(page) => pageChangeHandler(page)}
            page={currentPage + 1}
            onRowClick={
              !allEventsSchema.loading ? eventRowClickHandler : undefined
            }
          />
          {!allEventsSchema.loading && !totalRows && <NoResultsFound />}
        </div>
      }
    </>
  )
}

export const AllEventsListing = withStyles(styles, {withTheme: true})(
  AllEventsListingImpl
)
