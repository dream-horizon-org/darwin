import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton' // Import Skeleton
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import {withStyles, WithStyles} from '@mui/styles'
import React, {useEffect} from 'react'
import {compose} from 'redux'
import {FeatureToSqlTypeMapping} from '../../data/constants'
import {Flow, SelectedData, TFeatureGroupData} from '../../data/types'
import {FeatureDataType} from '../../data/types'
import {
  featureHeadCells,
  getDefaultValueBasedOnFeatureType
} from '../../data/utils'
import styles from '../AllEventsSchema/EventPropSelectionJSS'
import {defaultFeature} from './constants'

interface IProps extends WithStyles<typeof styles> {
  flow: Flow
  featureGroupTableDetails: TFeatureGroupData
  featureProps: FeatureDataType
  handlePropSelection: (selectedData: SelectedData) => void
}

interface EnhancedTableProps extends WithStyles<typeof styles> {
  numSelected: number
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void
  rowCount: number
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const {onSelectAllClick, numSelected, rowCount, classes} = props
  return (
    <TableHead>
      <TableRow sx={{height: '48px'}}>
        <TableCell padding='checkbox'>
          <Checkbox
            className={`${classes.customCheckBox} ${
              rowCount > 0 && numSelected === rowCount ? 'selectedCheckBox' : ''
            }`}
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all rows'
            }}
          />
        </TableCell>
        {featureHeadCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            className={classes.propTableHeadCells}
          >
            <div style={{height: '20px'}}>{headCell.label}</div>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  )
}

function FeatureSelection(props: IProps) {
  const [selected, setSelected] = React.useState<SelectedData>(new Map())
  const {
    featureProps,
    featureGroupTableDetails,
    flow,
    handlePropSelection,
    classes
  } = props

  useEffect(() => {
    if (flow === Flow.Edit && featureProps.data && featureGroupTableDetails) {
      setSelected((previousSelected) => {
        const newSelected = new Map(previousSelected)
        featureProps.data.forEach((row) => {
          const matchingProp =
            featureGroupTableDetails.featureGroupData?.features?.find(
              (prop) => prop.featureName === row.title
            )
          if (matchingProp) {
            newSelected.set(row.title, {
              columnName: matchingProp.featureName,
              defaultVal: matchingProp.defaultVal,
              sqlDataType: matchingProp.sqlDataType
            })
          }
        })
        handlePropSelection(newSelected)
        return newSelected
      })
    }
  }, [featureGroupTableDetails, flow, featureProps])

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = new Map(selected)
      featureProps.data.forEach((row) => {
        newSelected.set(row.title, {
          columnName: row.title,
          defaultVal: getDefaultValueBasedOnFeatureType(row.type),
          sqlDataType: FeatureToSqlTypeMapping[row.type]
            ? FeatureToSqlTypeMapping[row.type].toUpperCase()
            : ''
        })
      })
      setSelected(newSelected)
      handlePropSelection(newSelected)
      return
    }
    setSelected(new Map())
    handlePropSelection(new Map())
  }

  const handleClick = (index: number) => {
    const rowData = featureProps.data[index]
    const newSelected = new Map(selected)
    if (newSelected.has(rowData.title)) {
      newSelected.delete(rowData.title)
      setSelected(newSelected)
      handlePropSelection(newSelected)
    } else {
      newSelected.set(rowData.title, {
        columnName: rowData.title,
        defaultVal: getDefaultValueBasedOnFeatureType(rowData.type),
        sqlDataType: FeatureToSqlTypeMapping[rowData.type]
          ? FeatureToSqlTypeMapping[rowData.type].toUpperCase()
          : ''
      })
      setSelected(newSelected)
      handlePropSelection(newSelected)
    }
  }

  const handleDefaultChanges = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
    type: string
  ) => {
    const rowData = featureProps.data[index]
    const newSelected = new Map(selected)
    newSelected.set(rowData.title, {
      columnName: type === 'defaultName' ? event.target.value : rowData.title,
      defaultVal:
        type === 'defaultValue'
          ? event.target.value
          : getDefaultValueBasedOnFeatureType(rowData.type),
      sqlDataType: FeatureToSqlTypeMapping[rowData.type]
        ? FeatureToSqlTypeMapping[rowData.type].toUpperCase()
        : ''
    })
    setSelected(newSelected)
    handlePropSelection(newSelected)
  }

  const isSelected = (index: number) => {
    return selected.has(featureProps.data[index].title)
  }

  useEffect(() => {
    if (
      selected.size === 0 &&
      !(flow === Flow.Edit && featureGroupTableDetails) &&
      featureProps.data
    ) {
      const expiryTimeIndex = featureProps.data.findIndex(
        (row) => row.title === defaultFeature
      )
      if (expiryTimeIndex !== -1) {
        handleClick(expiryTimeIndex)
      }
    }
  }, [selected, featureProps])

  const getTableRowValues = (row) => {
    const columnType = row.type
    const isDisabled = row.title === defaultFeature
    const selectedRow = selected.get(row.title)
    const defaultVal = selectedRow
      ? selectedRow.defaultVal
      : getDefaultValueBasedOnFeatureType(row.type)
    return {columnType, isDisabled, defaultVal}
  }

  return (
    <Box className={classes.propTableBox}>
      <Paper className={classes.propTablePaper} sx={{mb: 2}}>
        <TableContainer sx={{maxHeight: 600}}>
          {featureProps.loading ? (
            <Table
              sx={{minWidth: 750}}
              aria-labelledby='tableTitle'
              size={'medium'}
              stickyHeader
            >
              <EnhancedTableHead
                numSelected={selected.size}
                onSelectAllClick={handleSelectAllClick}
                rowCount={featureProps.data?.length}
                classes={classes}
              />
              <TableBody>
                {Array.from({length: 10}).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell padding='checkbox'>
                      <Skeleton variant='rectangular' width={24} height={24} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant='text' width={150} height={20} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant='text' width={100} height={20} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant='text' width={200} height={20} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Table
              sx={{minWidth: 750}}
              aria-labelledby='tableTitle'
              size={'medium'}
              stickyHeader
            >
              <EnhancedTableHead
                numSelected={selected.size}
                onSelectAllClick={handleSelectAllClick}
                rowCount={featureProps.data?.length}
                classes={classes}
              />
              <TableBody>
                {featureProps.data?.map((row, index) => {
                  const isItemSelected = isSelected(index)
                  const labelId = `enhanced-table-checkbox-${index}`
                  const {columnType, isDisabled, defaultVal} =
                    getTableRowValues(row)
                  return (
                    <TableRow
                      hover
                      onClick={isDisabled ? void 0 : () => handleClick(index)}
                      role='checkbox'
                      aria-checked={false}
                      tabIndex={-1}
                      key={index}
                      selected={isItemSelected}
                      className={classes.propTableRow}
                    >
                      <TableCell
                        padding='checkbox'
                        className={classes.propTableCell}
                      >
                        <Checkbox
                          checked={isItemSelected}
                          inputProps={{
                            'aria-labelledby': labelId
                          }}
                          disabled={isDisabled}
                          className={`${classes.customCheckBox} ${
                            isItemSelected ? 'selectedCheckBox' : ''
                          }${isDisabled ? 'disabledCheckBox' : ''}`}
                        />
                      </TableCell>
                      <TableCell
                        component='th'
                        id={labelId}
                        scope='row'
                        padding='none'
                        className={classes.nameTableCell}
                      >
                        <div style={{height: '20px'}}>{row.title}</div>
                      </TableCell>
                      <TableCell align='left' className={classes.sqlTableCell}>
                        <div style={{height: '20px'}}>
                          {FeatureToSqlTypeMapping[row.type]
                            ? FeatureToSqlTypeMapping[row.type].toUpperCase()
                            : ''}
                        </div>
                      </TableCell>
                      <TableCell
                        align='left'
                        className={classes.defaultTableCell}
                      >
                        <TextField
                          value={defaultVal}
                          size='small'
                          className={classes.textField}
                          onChange={(e) =>
                            handleDefaultChanges(e, index, 'defaultValue')
                          }
                          onClick={(event) => {
                            event.stopPropagation()
                          }}
                          type={
                            columnType === 'string' || columnType === 'boolean'
                              ? 'text'
                              : 'number'
                          }
                          disabled={isDisabled}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Paper>
    </Box>
  )
}

const StyleComponent = compose<any>(withStyles(styles, {withTheme: true}))(
  FeatureSelection
)

export default StyleComponent
