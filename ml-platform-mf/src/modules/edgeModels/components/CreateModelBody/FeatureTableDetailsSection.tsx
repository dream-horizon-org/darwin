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
import React from 'react'
import {IEdgeModelsState} from '../../data/reducer'
import {TFeatureData, TFeatureGroupData} from '../../data/types'
import {Flow} from '../../data/types'
import {featureHeadCells} from '../../data/utils'
import CustomDeleteButton from './CustomDeleteButton'

export const FeatureTableDetailsSection = (props: {
  flow: Flow
  featureGroupTablesDetails: IEdgeModelsState['featureGroupTablesDetails']
  isEditable: IEdgeModelsState['isEditable']
  setShowFeatureGroupsDialog: (val: boolean) => void
  setTargetedFeatureData: (data: TFeatureGroupData) => void // yet to handle
  handleFeatureTableRowDelete: (tableIndex: number, rowIndex: number) => void
  handleFeatureTableDelete: (tableIndex: number) => void
  classes
}) => {
  const {
    flow,
    isEditable,
    setShowFeatureGroupsDialog,
    featureGroupTablesDetails,
    setTargetedFeatureData,
    handleFeatureTableRowDelete,
    handleFeatureTableDelete,
    classes
  } = props

  const isEditFlow = flow === Flow.Edit
  const isCreateFlow = flow === Flow.CREATE
  const isEditableFlow = isEditable.eventTable && isEditFlow

  return (
    <div className={classes.section}>
      <div className={classes.eventTableSectionMargin}>
        <div className={classes.eventTableSectionHeader}>
          <h5 className={classes.eventTableHeading}>Features Table</h5>
        </div>
        <div className={classes.rowWrapper}>
          {featureGroupTablesDetails?.data?.map(
            (featureGroupTable, tableIndex) => {
              return (
                <Accordion style={{color: '#D9D9D9'}} key={tableIndex}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon style={{color: 'white'}} />}
                    aria-controls='panel1-content'
                    id='panel1-header'
                  >
                    <div className={classes.accordianHeaderLeft}>
                      {featureGroupTable.tableName}
                    </div>

                    <div className={classes.accordianHeaderRight}>
                      <div className={classes.accordianHeaderRightitem}>
                        <div
                          style={{
                            visibility: !isEditFlow ? 'hidden' : 'visible'
                          }}
                        >
                          <EditIcon
                            onClick={() => {
                              if (isEditable.eventTable) {
                                setTargetedFeatureData(featureGroupTable)
                                setShowFeatureGroupsDialog(true)
                              }
                            }}
                            color={
                              isEditable.eventTable ? 'inherit' : 'disabled'
                            }
                          />
                        </div>
                        <div style={{marginRight: '16px'}}>
                          <CustomDeleteButton
                            flow={flow}
                            isEditable={isEditable}
                            tableIndex={tableIndex}
                            handleEventTableDelete={handleFeatureTableDelete}
                            dialogTitle='Delete Feature Group Table'
                            dialogContent={
                              'Deleting the feature table name. Are you sure you want to proceed?'
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails style={{padding: 0}}>
                    <div>
                      {featureGroupTable?.featureGroupData?.features
                        ?.length && (
                        <FeaturePropsTableDisplay
                          flow={flow}
                          featureProps={
                            featureGroupTable.featureGroupData.features
                          }
                          tableIndex={tableIndex}
                          handleFeatureTableRowDelete={
                            handleFeatureTableRowDelete
                          }
                          classes={classes}
                        />
                      )}
                    </div>
                  </AccordionDetails>
                </Accordion>
              )
            }
          )}
        </div>
      </div>

      {(isCreateFlow || isEditableFlow) && (
        <Button
          size='small'
          startIcon={<Add />}
          onClick={() => {
            if (isEditFlow) setTargetedFeatureData(undefined)
            setShowFeatureGroupsDialog(true)
          }}
          disabled={isEditFlow && !isEditable.eventTable}
          className={classes.addButton}
        >
          Feature Groups table
        </Button>
      )}
    </div>
  )
}

function FeaturePropsTableDisplay(props: {
  flow: Flow
  featureProps: TFeatureData[]
  tableIndex: number
  handleFeatureTableRowDelete: (tableIndex: number, rowIndex: number) => void
  classes
}) {
  const {flow, featureProps, tableIndex, handleFeatureTableRowDelete, classes} =
    props

  const isCreateFlow = flow === Flow.CREATE
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
              {featureProps.map((row, rowIndex) => {
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
                      {row.featureName}
                    </TableCell>
                    <TableCell align='left' className={classes.tableCell}>
                      {row.sqlDataType?.toUpperCase()}
                    </TableCell>
                    <TableCell align='center' className={classes.tableCell}>
                      {row.defaultVal}
                    </TableCell>

                    <TableCell padding='checkbox' className={classes.tableCell}>
                      <DeleteIcon
                        style={{color: '#8F8F8F'}}
                        onClick={() => {
                          isCreateFlow
                            ? handleFeatureTableRowDelete(tableIndex, rowIndex)
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
        {featureHeadCells.map((headCell, index) => (
          <TableCell className={classes.tableCell} key={index}>
            {headCell.label}
          </TableCell>
        ))}
        <TableCell padding='checkbox' className={classes.tableCell}></TableCell>
      </TableRow>
    </TableHead>
  )
}
