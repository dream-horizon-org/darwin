import React from 'react'
import {Datatable} from '../../../../bit-components/datatable/index'
import {TableCellSize} from '../../../../bit-components/table-cells/tc-cell/index'
import type {
  SelectionOnCompatibleAppVersions,
  SelectionOnData
} from '../../graphQL/queries/getModelDeploymentForId'
import {getColumnConfig} from './columnsConfig'

const DeploymentsTab = (props: {
  deploymentsData: SelectionOnData
  loading: boolean
  refresh: () => void
  deploymentId: string
}) => {
  const {deploymentsData, loading, refresh, deploymentId} = props

  return (
    <Datatable<SelectionOnCompatibleAppVersions>
      enableSelection={false}
      singleSelection={false}
      size={TableCellSize.Medium}
      columnConfig={getColumnConfig()}
      data={(deploymentsData.compatibleAppVersions || []).map((item) => ({
        ...item,
        deploymentId: deploymentId,
        refresh: refresh
      }))}
      indexKeyName={'id'}
      onSelectAllClick={() => {}}
      enableSelectionColumn={false}
      loading={loading}
      totalRow={deploymentsData.compatibleAppVersions.length}
    />
  )
}

export default DeploymentsTab
