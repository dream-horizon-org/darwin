import {WithStyles, withStyles} from '@mui/styles'
import {Datatable} from '../../../../../bit-components/datatable/index'

import config from 'config'
import React, {useEffect, useState} from 'react'
import {useHistory} from 'react-router-dom'
import {
  TableCellAlignment,
  TableCellSize
} from '../../../../../bit-components/table-cells/tc-cell/index'
import {useGQL} from '../../../../../utils/useGqlRequest'
import {
  GetAllCodespaces,
  GetAllCodespacesInput,
  SelectionOnGetAllCodespaces
} from '../../../graphQL/queries/getAllCodespaces'
import {GetAllCodespacesSchema} from '../../../graphQL/queries/getAllCodespaces/index.gqlTypes'
import {GQL as GetAllCodespacesGQL} from '../../../graphQL/queries/getAllCodespaces/indexGql'
import {getColumnConfig, TableData} from './codespacesList.helper'
import styles from './codespacesListJSS'

interface IProps extends WithStyles<typeof styles> {
  clusterId: string
}

const codespacesList = (props: IProps) => {
  const history = useHistory()
  const {classes, clusterId} = props
  const [pageSize, setPageSize] = useState<number>(20)
  const [query, setQuery] = useState<string>('')
  const [offset, setOffset] = useState<number>(0)
  const [data, setData] = useState<TableData[]>([])
  const {
    output: {
      response: getAllCodespacesResponse,
      loading: getAllCodespacesLoading,
      errors: getAllCodespacesError
    },
    triggerGQLCall: getAllCodespaces
  } = useGQL<GetAllCodespacesInput, GetAllCodespaces>()

  useEffect(() => {
    getAllCodespaces(
      {
        ...GetAllCodespacesGQL,
        variables: {
          clusterId: clusterId,
          pageSize: pageSize,
          query: query,
          offset: offset,
          sortBy: 'attached_since',
          sortOrder: 'desc'
        }
      },
      GetAllCodespacesSchema
    )
  }, [clusterId, pageSize, query, offset])

  useEffect(() => {
    if (getAllCodespacesResponse) {
      setData([...data, ...getAllCodespacesResponse.getAllCodespaces.data])
    }
    return () => {
      setData([])
    }
  }, [getAllCodespacesResponse])

  const handleRowClick = (item: TableData) => {
    history.push(`/workspace/${item.project.id}/${item.codespace.id}`)
  }

  if (!getAllCodespacesLoading && data.length === 0) {
    return (
      <div className={classes.emptyStateContainer}>
        <img src={`${config.cfMsdAssetUrl}/icons/no-projects-found.svg`} />
        <h1 className={classes.emptyStateTitle}>Nothing to show here!</h1>
      </div>
    )
  }
  if (!getAllCodespacesLoading && getAllCodespacesError) {
    return (
      <div className={classes.emptyStateContainer}>
        <img src={`${config.cfMsdAssetUrl}/icons/no-projects-found.svg`} />
        <h1 className={classes.emptyStateTitle}>Opps! Something went wrong.</h1>
      </div>
    )
  }
  return (
    <div className={classes.container}>
      <Datatable<TableData>
        loading={getAllCodespacesLoading}
        indexKeyName={'id'}
        data={data}
        size={TableCellSize.Large}
        columnConfig={getColumnConfig(classes)}
        enableHeader={true}
        enableStickyHeader={true}
        enableInfiniteScroll={true}
        totalRow={getAllCodespacesResponse?.getAllCodespaces?.result_size || 0}
        onScrollToPageEnd={() => {
          if (
            offset < getAllCodespacesResponse?.getAllCodespaces?.result_size
          ) {
            setOffset(offset + pageSize)
          }
        }}
        onRowClick={handleRowClick}
      />
    </div>
  )
}

const StyledComponent = withStyles(styles, {withTheme: true})(codespacesList)
export default StyledComponent
