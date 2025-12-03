import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableRow from '@mui/material/TableRow'
import {withStyles, WithStyles} from '@mui/styles'
import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {IFeatureGroupDetailsState} from '../../../modules/featureStoreV2/pages/featureStoreGroupDetails/reducer'
import {CommonState} from '../../../reducers/commonReducer'

import EnhancedTableHead from '../enhancedTableHead'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  featureGroupEntities: IFeatureGroupDetailsState['featureGroupEntities']['data']
}

const EntityTable = (props: IProps) => {
  const {classes, featureGroupEntities} = props

  return (
    <Box sx={{width: '100%'}}>
      <Paper sx={{width: '100%', mb: 2, overflow: 'hidden'}}>
        <TableContainer sx={{maxHeight: 'calc(100vh - 450px)'}}>
          <Table
            sx={{minWidth: 750}}
            aria-labelledby='tableTitle'
            size={'small'}
            stickyHeader
          >
            <EnhancedTableHead rowCount={10} />
            <TableBody>
              {featureGroupEntities.map((row, idx) => {
                const labelId = `enhanced-table-checkbox-${idx}`

                return (
                  <>
                    <TableRow
                      hover
                      role='checkbox'
                      tabIndex={-1}
                      key={row.entityName}
                      className={classes.tableRow}
                    >
                      <TableCell
                        component='th'
                        id={labelId}
                        scope='row'
                        padding='normal'
                      >
                        <div className={classes.customDataCell}>
                          {row.entityName}
                        </div>
                      </TableCell>
                      <TableCell padding='normal'>
                        <div className={classes.customDataCell}>
                          {row.joinKeys.join(', ')}
                        </div>
                      </TableCell>
                      <TableCell padding='normal'>
                        <div className={classes.customDataCell}>
                          {row.type.join(', ')}
                        </div>
                      </TableCell>
                      <TableCell padding='normal'>
                        <div className={classes.customDataCell}>
                          {row.description}
                        </div>
                      </TableCell>
                    </TableRow>
                  </>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  )
}

const mapStateToProps = (state: CommonState) => ({})

const mapDispatchToProps = (dispatch) => {
  return {}
}

const StyleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(EntityTable)

export default StyleComponent
