import Add from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import React, {useState} from 'react'
import {IEdgeModelsState} from '../../data/reducer'
import {TEventData, TEventPropData} from '../../data/types'
import {Flow} from '../../data/types'
import {headCells} from '../../data/utils'
import {SelectionOnVersions} from '../../graphQL/queries/getAppVersions'
import CustomDeleteButton from './CustomDeleteButton'

export const EventTableDetailsSection = (props: {
  flow: Flow
  eventTablesDetails: IEdgeModelsState['eventTablesDetails']
  isEditable: IEdgeModelsState['isEditable']
  setShowEventSchemaDialog: (val: boolean) => void
  setTargetedEventData: (data: TEventData) => void
  compatibleAppVersionsResp: SelectionOnVersions[]
  handleEventTableRowDelete: (tableIndex: number, rowIndex: number) => void
  handleEventTableDelete: (tableIndex: number) => void
  classes
}) => {
  const {
    flow,
    isEditable,
    setShowEventSchemaDialog,
    eventTablesDetails,
    setTargetedEventData,
    compatibleAppVersionsResp,
    handleEventTableRowDelete,
    handleEventTableDelete,
    classes
  } = props
  const isCompatibleVersion =
    compatibleAppVersionsResp && compatibleAppVersionsResp.length > 0
  return (
    <div className={classes.section}>
      <div className={classes.eventTableSectionMargin}>
        <div className={classes.eventTableSectionHeader}>
          <h5 className={classes.eventTableHeading}>Events Table</h5>
        </div>
        <div className={classes.rowWrapper}>
          {eventTablesDetails.data?.map((eventTable, tableIndex) => {
            return (
              <Accordion style={{color: '#D9D9D9'}} key={tableIndex}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon style={{color: 'white'}} />}
                  aria-controls='panel1-content'
                  id='panel1-header'
                >
                  <div className={classes.accordianHeaderLeft}>
                    {eventTable.tableName}
                  </div>

                  <div className={classes.accordianHeaderRight}>
                    <div className={classes.accordianHeaderRightitem}>
                      <div>Expiry Time - {eventTable.expiryInSecs} sec</div>

                      {flow === Flow.CREATE && (
                        <div>App Version - {eventTable.appVersionSemver}</div>
                      )}
                    </div>
                    <div className={classes.accordianHeaderRightitem}>
                      <div
                        style={{
                          visibility: flow !== Flow.Edit ? 'hidden' : 'visible'
                        }}
                      >
                        <EditIcon
                          onClick={() => {
                            if (isCompatibleVersion && isEditable.eventTable) {
                              setTargetedEventData(eventTable)
                              setShowEventSchemaDialog(true)
                            }
                          }}
                          color={
                            isCompatibleVersion && isEditable.eventTable
                              ? 'inherit'
                              : 'disabled'
                          }
                        />
                      </div>
                      <div style={{marginRight: '16px'}}>
                        <CustomDeleteButton
                          flow={flow}
                          isEditable={isEditable}
                          tableIndex={tableIndex}
                          handleEventTableDelete={handleEventTableDelete}
                          dialogTitle='Delete Event Table'
                          dialogContent={
                            'Deleting the event table name. Are you sure you want to proceed?'
                          }
                        />
                      </div>
                    </div>
                  </div>
                </AccordionSummary>
                <AccordionDetails style={{padding: 0}}>
                  <div>
                    {eventTable?.eventData?.props?.length && (
                      <EventPropsTableDisplay
                        flow={flow}
                        eventProps={eventTable.eventData.props}
                        tableIndex={tableIndex}
                        handleEventTableRowDelete={handleEventTableRowDelete}
                        classes={classes}
                      />
                    )}
                  </div>
                </AccordionDetails>
              </Accordion>
            )
          })}
        </div>
      </div>

      {(flow === Flow.CREATE ||
        (flow === Flow.Edit && isEditable.eventTable)) && (
        <Button
          size='small'
          startIcon={<Add />}
          onClick={() => {
            if (flow === Flow.Edit) setTargetedEventData(undefined)
            setShowEventSchemaDialog(true)
          }}
          disabled={
            (compatibleAppVersionsResp &&
              compatibleAppVersionsResp.length === 0) ||
            (flow === Flow.Edit && !isEditable.eventTable)
          }
          className={classes.addButton}
        >
          Events table
        </Button>
      )}
    </div>
  )
}

function EventPropsTableDisplay(props: {
  flow: Flow
  eventProps: TEventPropData[]
  tableIndex: number
  handleEventTableRowDelete: (tableIndex: number, rowIndex: number) => void
  classes
}) {
  const {flow, eventProps, tableIndex, handleEventTableRowDelete, classes} =
    props
  return (
    <Box className={classes.propTableBox}>
      <Paper className={classes.propTablePaper} sx={{mb: 2}}>
        <TableContainer className={classes.propTableContainer}>
          <Table
            sx={{minWidth: 750}}
            aria-labelledby='tableTitle'
            size={'medium'}
            stickyHeader
          >
            <EnhancedTableHead classes={classes} />
            <TableBody>
              {eventProps.map((row, rowIndex) => {
                return (
                  <TableRow
                    hover
                    role='checkbox'
                    aria-checked={false}
                    tabIndex={-1}
                    key={rowIndex}
                    selected={false}
                    sx={{cursor: 'pointer'}}
                  >
                    <TableCell align='left' className={classes.tableCell}>
                      {row.propName}
                    </TableCell>
                    <TableCell align='left' className={classes.tableCell}>
                      {row.sqlDataType?.toUpperCase()}
                    </TableCell>
                    <TableCell align='left' className={classes.tableCell}>
                      {row.propNameMapping}
                    </TableCell>
                    <TableCell align='center' className={classes.tableCell}>
                      {row.defaultVal}
                    </TableCell>

                    <TableCell padding='checkbox' className={classes.tableCell}>
                      <DeleteIcon
                        style={{color: '#8F8F8F'}}
                        onClick={() => {
                          flow === Flow.CREATE
                            ? handleEventTableRowDelete(tableIndex, rowIndex)
                            : null
                        }}
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

function EnhancedTableHead(props) {
  const {classes} = props
  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell, index) => (
          <TableCell className={classes.tableCell} key={index}>
            {headCell.label}
          </TableCell>
        ))}
        <TableCell padding='checkbox' className={classes.tableCell}></TableCell>
      </TableRow>
    </TableHead>
  )
}
