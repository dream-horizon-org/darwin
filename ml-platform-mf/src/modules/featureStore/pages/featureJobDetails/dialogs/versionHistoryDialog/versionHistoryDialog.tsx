import React, {useEffect} from 'react'
import CustomDialog from '../../../../../../components/customDialog/customDialog'
import {DataList} from '../../../../../../components/dataList/dataList'
import {useGQL} from '../../../../../../utils/useGqlRequest'
import {useStyles} from '../styles'
import {FetchFeatureGroupVersions} from './fetchFeatureGroupVersions'
import {FetchFeatureGroupVersionsSchema} from './fetchFeatureGroupVersions.gqlTypes'
import {GQL as fetchFeatureGroupVersionsGql} from './fetchFeatureGroupVersionsGql'
import {columnConfig} from './versionHistoryTableConfig'

interface IProps {
  featureGroupName: string
  onClose: () => void
  isOpen: boolean
}

export const VersionHistoryDialog = (props: IProps) => {
  const {onClose, isOpen, featureGroupName} = props

  const {
    output: {
      response: fetchFeatureGroupVersionsResponse,
      loading: fetchFeatureGroupVersionsLoading
    },
    triggerGQLCall: triggerFetchFeatureGroupVersionsGQLCall
  } = useGQL<null, FetchFeatureGroupVersions>()

  useEffect(() => {
    triggerFetchFeatureGroupVersionsGQLCall(
      {
        ...fetchFeatureGroupVersionsGql,
        variables: {featureGroupName}
      },
      FetchFeatureGroupVersionsSchema
    )
  }, [])

  const classes = useStyles({})

  const renderDialogContent = () => {
    return (
      <div style={{height: '70vh'}}>
        <DataList
          data={
            fetchFeatureGroupVersionsResponse?.fetchFeatureGroupVersions?.data
              .featureGroups
          }
          stickyHeader={true}
          enablePagination={false}
          columnConfig={columnConfig(classes)}
          singleSelection={false}
          shouldEnableSelection={false}
          rowsPerPage={10}
          showEmptyRows={false}
          loader={fetchFeatureGroupVersionsLoading}
        />
      </div>
    )
  }

  return (
    <CustomDialog
      header='Version History'
      visible={isOpen}
      fullWidthDialogContent
      dialogContent={renderDialogContent()}
      handleClose={onClose}
      centerAlign={true}
      maxWidth='lg'
    />
  )
}
