import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import {withStyles, WithStyles} from '@mui/styles'
import React, {useEffect, useRef} from 'react'
import {compose} from 'redux'
import {sqlDataTypeMapping} from '../../data/constants'
import {Flow, SelectedData, TEventData} from '../../data/types'
import {getDefaultValueBasedOnDataType, headCells} from '../../data/utils'
import type {SelectionOnPropertyMetadata} from '../../graphQL/queries/getEventSchema/index'
import styles from './EventPropSelectionJSS'

interface IProps extends WithStyles<typeof styles> {
  flow: Flow
  eventTableDetails: TEventData
  eventProps: SelectionOnPropertyMetadata[]
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
              'aria-label': 'select all desserts'
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
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

function EventPropSelection(props: IProps) {
  const [selected, setSelected] = React.useState<SelectedData>(new Map())
  const {eventProps, flow, eventTableDetails, handlePropSelection, classes} =
    props

  useEffect(() => {
    if (flow === Flow.Edit && eventProps && eventTableDetails) {
      setSelected((previousSelected) => {
        const newSelected = new Map(previousSelected)
        eventProps.forEach((row) => {
          const matchingProp = eventTableDetails.eventData?.props?.find(
            (prop) => prop.propName === row.name
          )
          if (matchingProp) {
            newSelected.set(row.name, {
              columnName: matchingProp.propNameMapping,
              defaultVal: matchingProp.defaultVal,
              sqlDataType: matchingProp.sqlDataType
            })
          }
        })
        handlePropSelection(newSelected)
        return newSelected
      })
    }
  }, [eventTableDetails, flow])

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = new Map(selected)
      eventProps.forEach((row) => {
        newSelected.set(row.name, {
          columnName: row.name,
          defaultVal: getDefaultValueBasedOnDataType(row.rawDataType),
          sqlDataType: sqlDataTypeMapping[row.rawDataType]
            ? sqlDataTypeMapping[row.rawDataType].toUpperCase()
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
    const rowData = eventProps[index]
    const newSelected = new Map(selected)
    if (newSelected.has(rowData.name)) {
      newSelected.delete(rowData.name)
      setSelected(newSelected)
      handlePropSelection(newSelected)
    } else {
      newSelected.set(rowData.name, {
        columnName: rowData.name,
        defaultVal: getDefaultValueBasedOnDataType(rowData.rawDataType),
        sqlDataType: sqlDataTypeMapping[rowData.rawDataType]
          ? sqlDataTypeMapping[rowData.rawDataType].toUpperCase()
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
    const rowData = eventProps[index]
    const newSelected = new Map(selected)
    newSelected.set(rowData.name, {
      columnName: type === 'defaultName' ? event.target.value : rowData.name,
      defaultVal:
        type === 'defaultValue'
          ? event.target.value
          : getDefaultValueBasedOnDataType(rowData.rawDataType),
      sqlDataType: sqlDataTypeMapping[rowData.rawDataType]
        ? sqlDataTypeMapping[rowData.rawDataType].toUpperCase()
        : ''
    })
    setSelected(newSelected)
    handlePropSelection(newSelected)
  }

  const isSelected = (index: number) => {
    return selected.has(eventProps[index].name)
  }

  useEffect(() => {
    if (selected.size === 0 && !(flow === Flow.Edit && eventTableDetails))
      handleClick(0)
  }, [selected])

  const getTableRowValues = (row) => {
    const columnType = row.rawDataType
    const isDisabled = row.name === 'created_at'
    const selectedRow = selected.get(row.name)

    const defaultVal = selectedRow
      ? selectedRow.defaultVal
      : getDefaultValueBasedOnDataType(row.rawDataType)

    const defaultColName = selectedRow ? selectedRow.columnName : row.name

    return {columnType, isDisabled, defaultVal, defaultColName}
  }

  return (
    <Box className={classes.propTableBox}>
      <Paper className={classes.propTablePaper} sx={{mb: 2}}>
        <TableContainer sx={{maxHeight: 600}}>
          <Table
            sx={{minWidth: 750}}
            aria-labelledby='tableTitle'
            size={'medium'}
            stickyHeader
          >
            <EnhancedTableHead
              numSelected={selected.size}
              onSelectAllClick={handleSelectAllClick}
              rowCount={eventProps.length}
              classes={classes}
            />
            <TableBody>
              {eventProps.map((row, index) => {
                const isItemSelected = isSelected(index)
                const labelId = `enhanced-table-checkbox-${index}`
                const {columnType, isDisabled, defaultVal, defaultColName} =
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
                      <div style={{height: '20px'}}>{row.name}</div>
                    </TableCell>
                    <TableCell align='left' className={classes.sqlTableCell}>
                      <div style={{height: '20px'}}>
                        {sqlDataTypeMapping[row.rawDataType]
                          ? sqlDataTypeMapping[row.rawDataType].toUpperCase()
                          : ''}
                      </div>
                    </TableCell>
                    <TableCell
                      align='left'
                      className={classes.colNameTableCell}
                    >
                      <TextField
                        placeholder='Event Table Col. Name'
                        value={defaultColName}
                        size='small'
                        className={classes.textField}
                        onChange={(e) =>
                          handleDefaultChanges(e, index, 'defaultName')
                        }
                        onClick={(event) => {
                          event.stopPropagation()
                        }}
                        disabled={isDisabled}
                      />
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
        </TableContainer>
      </Paper>
    </Box>
  )
}

const StyleComponent = compose<any>(withStyles(styles, {withTheme: true}))(
  EventPropSelection
)

export default StyleComponent
