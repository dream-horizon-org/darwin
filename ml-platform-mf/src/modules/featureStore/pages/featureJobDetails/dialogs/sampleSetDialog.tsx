import React, {useState} from 'react'
import CustomDialog from '../../../../../components/customDialog/customDialog'
import {DataList} from '../../../../../components/dataList/dataList'
import {columnConfig} from './sampletSetTableConfig'
import {useStyles} from './styles'

interface IProps {
  onClose: () => void
  isOpen: boolean
}

export const SampleSetDialog = (props: IProps) => {
  const {onClose, isOpen} = props
  const [offset, setOffset] = useState(0)
  const [limit, setLimit] = useState(10)
  const [totalRows, setTotalRows] = useState(0)
  const onPageChange = (page, rowsPerPage) => {
    setOffset(page * rowsPerPage)
  }

  const onPageSizeChange = (newPageSize) => {
    setLimit(newPageSize)
  }

  const handleShowSchemaClick = () => {}
  const classes = useStyles({})

  const renderDialogContent = () => {
    return (
      <div style={{height: '70vh'}}>
        <DataList
          data={[
            {
              id: 1,
              title: 'vendor_id',
              type: 'STRING',
              primaryKey: false
            },
            {
              id: 2,
              title: 'vendor_id',
              type: 'STRING',
              primaryKey: false
            },
            {
              id: 3,
              title: 'vendor_id',
              type: 'STRING',
              primaryKey: true
            }
          ]}
          stickyHeader={true}
          columnConfig={columnConfig(classes)}
          singleSelection={false}
          shouldEnableSelection={false}
          rowsPerPageOptions={[10, 50, 100]}
          rowsPerPage={10}
          showEmptyRows={false}
          totalCount={totalRows}
          loader={false}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    )
  }

  return (
    <CustomDialog
      header='Sample Set'
      visible={isOpen}
      fullWidthDialogContent
      dialogContent={renderDialogContent()}
      handleClose={onClose}
      centerAlign={true}
      maxWidth='lg'
    />
  )
}
