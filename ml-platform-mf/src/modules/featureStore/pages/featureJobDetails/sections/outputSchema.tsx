import SearchIcon from '@mui/icons-material/Search'
import {Card} from '@mui/material'
import {FormControl, OutlinedInput} from '@mui/material'
import React, {useEffect, useState} from 'react'
import {DataList} from '../../../../../components/dataList/dataList'
import {SelectionOnFeatures} from '../fetchFeatureGroup'
import {columnConfig} from './outputSchemaConfig'
import {useStyles} from './styles'

interface IProps {
  outputSchemaList: Array<SelectionOnFeatures>
}

export const OutputSchema = (props: IProps) => {
  const [offset, setOffset] = useState(0)
  const [limit, setLimit] = useState(10)
  const [filteredList, setFilteredList] = useState([])
  const [paginatedList, setPaginatedList] = useState([])
  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    if (props.outputSchemaList) {
      let schemaList = props.outputSchemaList

      if (searchInput) {
        schemaList = schemaList.filter((feature) =>
          feature?.name?.includes(searchInput)
        )
      }
      setFilteredList(schemaList)
      setPaginatedList(schemaList.slice(offset, offset + limit))
    }
  }, [offset, limit, searchInput])

  const onPageChange = (page, rowsPerPage) => {
    setOffset(page * rowsPerPage)
  }
  const onPageSizeChange = (newPageSize) => {
    setLimit(newPageSize)
  }
  const classes = useStyles({})

  const onSearchInputChange = (value) => {
    setSearchInput(value)
  }

  return (
    <Card className={classes.section}>
      <div className={classes.headerWrapper}>
        <div>Features</div>
        <div>
          <FormControl fullWidth variant='outlined' size='small'>
            <OutlinedInput
              id='outlined-adornment-amount'
              endAdornment={<SearchIcon />}
              placeholder='Search By Title...'
              value={searchInput}
              onChange={(e) => onSearchInputChange(e.target.value)}
            />
          </FormControl>
        </div>
      </div>
      <DataList
        data={paginatedList}
        stickyHeader={true}
        columnConfig={columnConfig()}
        singleSelection={false}
        shouldEnableSelection={false}
        rowsPerPageOptions={[10, 50, 100]}
        rowsPerPage={10}
        showEmptyRows={false}
        totalCount={filteredList.length}
        loader={false}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        noResultsFound={paginatedList.length === 0}
      />
    </Card>
  )
}
