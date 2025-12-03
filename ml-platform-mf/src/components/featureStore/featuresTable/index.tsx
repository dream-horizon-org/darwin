import {ClickAwayListener, Tooltip, Zoom} from '@mui/material'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import {withStyles, WithStyles} from '@mui/styles'
import * as React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {SelectionOnData as IFeature} from '../../../modules/featureStoreV2/graphqlAPIs/getFeatures'
import {setSelectedFeatures} from '../../../modules/featureStoreV2/pages/featureStoreGroupDetails/actions'
import {featureGroupTypes} from '../../../modules/featureStoreV2/pages/featureStoreGroupDetails/constants'
import {IFeatureGroupDetailsState} from '../../../modules/featureStoreV2/pages/featureStoreGroupDetails/reducer'
import {CommonState} from '../../../reducers/commonReducer'
import {API_STATUS} from '../../../utils/apiUtils'
import {featureFlags} from '../../../utils/featureFlags'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  featureGroupDetails: IFeatureGroupDetailsState['featureGroupDetails']
  features: IFeatureGroupDetailsState['features']
  setFeatureListPageNumber: (no: any) => void
  featureListPageNumber: number
  pageResultCount: number
  setSelectedFeature: (data: IFeature) => void
  setSelectedFeaturesFunc: (
    data: IFeatureGroupDetailsState['selectedFeatures']
  ) => any
  selectedFeatures: IFeature[]
}

export interface IRowData {
  title: string
  type: string
  description: string
  tags: Array<string> | null
  prod: number
  dev: number
}

type Order = 'asc' | 'desc'

interface HeadCell {
  disablePadding: boolean
  id: keyof IRowData
  label: string
  numeric: boolean
}

const headCells: readonly HeadCell[] = [
  {
    id: 'title',
    numeric: false,
    disablePadding: false,
    label: 'Feature Name'
  },
  {
    id: 'type',
    numeric: false,
    disablePadding: false,
    label: 'Type'
  },
  {
    id: 'description',
    numeric: false,
    disablePadding: false,
    label: 'Description'
  },
  {
    id: 'tags',
    numeric: false,
    disablePadding: false,
    label: 'Tags'
  }
  // {
  //   id: 'prod',
  //   numeric: true,
  //   disablePadding: false,
  //   label: 'Prod'
  // },
  // {
  //   id: 'dev',
  //   numeric: true,
  //   disablePadding: false,
  //   label: 'Dev'
  // }
]

interface EnhancedTableProps extends WithStyles<typeof styles> {
  numSelected: number
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof IRowData
  ) => void
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void
  order: Order
  orderBy: string
  rowCount: number
  featureGroupType: string
}

const EnhancedTableHead = (props: EnhancedTableProps) => {
  const {
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
    featureGroupType,
    classes
  } = props
  const createSortHandler =
    (property: keyof IRowData) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property)
    }

  return (
    <TableHead
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1
      }}
    >
      <TableRow className={classes.headRow}>
        {featureGroupType === featureGroupTypes.online && (
          <TableCell
            rowSpan={2}
            padding='checkbox'
            className={classes.customCell}
          >
            <Checkbox
              className={classes.customCheckBox}
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{
                'aria-label': 'select all desserts'
              }}
            />
          </TableCell>
        )}
        {headCells
          .filter((headCell) => !headCell.numeric)
          .map((headCell) => (
            <TableCell
              key={headCell.id}
              align={headCell.numeric ? 'center' : 'left'}
              padding={headCell.disablePadding ? 'none' : 'normal'}
              sortDirection={orderBy === headCell.id ? order : false}
              rowSpan={2}
              className={classes.customCell}
              style={{minWidth: headCell.id === 'tags' ? 200 : 100}}
            >
              {headCell.label}
            </TableCell>
          ))}
        {featureFlags.FEATURE_STORE.DETAILS_PAGE.USAGE && (
          <TableCell
            align='center'
            padding='none'
            colSpan={2}
            className={classes.customCell}
            style={{minWidth: 200}}
          >
            Usage
          </TableCell>
        )}
      </TableRow>
      <TableRow className={classes.headRow}>
        {headCells
          .filter((headCell) => headCell.numeric)
          .map((headCell) => (
            <TableCell
              key={headCell.id}
              align={headCell.numeric ? 'center' : 'left'}
              padding={headCell.disablePadding ? 'none' : 'normal'}
              sortDirection={orderBy === headCell.id ? order : false}
              className={classes.customCell}
            >
              {headCell.label}
            </TableCell>
          ))}
      </TableRow>
    </TableHead>
  )
}

const FeaturesTable = (props: IProps) => {
  const {
    features,
    classes,
    setFeatureListPageNumber,
    featureListPageNumber,
    pageResultCount,
    setSelectedFeature,
    setSelectedFeaturesFunc,
    selectedFeatures,
    featureGroupDetails
  } = props
  const [rows, setRows] = React.useState<IFeature[]>([])
  const [order, setOrder] = React.useState<Order>('asc')
  const [orderBy, setOrderBy] = React.useState<keyof IRowData>('title')
  const [lastElement, setLastElement] = React.useState(null)
  const [selectedFeatureTags, setSelectedFeatureTags] = React.useState(null)
  const lastPageNumber =
    Number(features.totalRecordsCount / pageResultCount) - 1

  React.useEffect(() => {
    if (features.status === API_STATUS.SUCCESS) {
      setRows(features.data)
    }
  }, [features])

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof IRowData
  ) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = [...rows]
      setSelectedFeaturesFunc([...newSelected])
      return
    }
    setSelectedFeaturesFunc([])
  }

  const handleClick = (
    event: React.MouseEvent<unknown>,
    featureRow: IFeature
  ) => {
    if (featureGroupDetails?.data?.type === featureGroupTypes.online) {
      const selectedIndex = selectedFeatures.findIndex(
        (f) => f.title === featureRow.title
      )
      let newSelected: readonly IFeature[] = []

      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selectedFeatures, featureRow)
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selectedFeatures.slice(1))
      } else if (selectedIndex === selectedFeatures.length - 1) {
        newSelected = newSelected.concat(selectedFeatures.slice(0, -1))
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
          selectedFeatures.slice(0, selectedIndex),
          selectedFeatures.slice(selectedIndex + 1)
        )
      }

      setSelectedFeaturesFunc([...newSelected])
    }
  }

  const isSelected = (name: string) =>
    selectedFeatures.findIndex((f) => f.title === name) !== -1

  const observer = React.useRef(
    new IntersectionObserver((entries) => {
      const first = entries[0]
      if (first.isIntersecting) {
        setFeatureListPageNumber((no) => no + 1)
      }
    })
  )

  React.useEffect(() => {
    const currentElement = lastElement
    const currentObserver = observer.current

    if (currentElement) {
      currentObserver.observe(currentElement)
    }

    return () => {
      if (currentElement) {
        currentObserver.unobserve(currentElement)
      }
    }
  }, [lastElement])
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
            <EnhancedTableHead
              numSelected={selectedFeatures.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={features.data?.length}
              featureGroupType={featureGroupDetails?.data?.type}
              classes={classes}
            />
            <TableBody>
              {features.data?.map((row, idx) => {
                const isItemSelected = isSelected(row.title)
                const labelId = `enhanced-table-checkbox-${idx}`
                const tagsSnippet = row.tags.slice(0, 2)
                const tagsRest = row.tags.slice(2)
                return (
                  <>
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row)}
                      role='checkbox'
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.title}
                      selected={isItemSelected}
                      className={
                        featureGroupDetails?.data?.type ===
                          featureGroupTypes.online && classes.tableRow
                      }
                    >
                      {featureGroupDetails?.data?.type ===
                        featureGroupTypes.online && (
                        <TableCell padding='checkbox'>
                          <Checkbox
                            checked={isItemSelected}
                            inputProps={{
                              'aria-labelledby': labelId
                            }}
                            className={`${classes.customCheckBox} ${
                              isItemSelected ? 'selectedCheckBox' : ''
                            }`}
                          />
                        </TableCell>
                      )}
                      <TableCell
                        component='th'
                        id={labelId}
                        scope='row'
                        padding='normal'
                      >
                        <div className={classes.customDataCell}>
                          {row.title}
                        </div>
                      </TableCell>
                      <TableCell padding='normal'>
                        <div className={classes.customDataCell}>{row.type}</div>
                      </TableCell>
                      <TableCell padding='normal'>
                        <div className={classes.customDataCell}>
                          {row.description}
                        </div>
                      </TableCell>
                      <TableCell padding='normal' style={{maxWidth: '150px'}}>
                        <div className={classes.customDataCell}>
                          {tagsSnippet.map((tag) => (
                            <Tooltip title={tag}>
                              <div className={classes.tagContainer} key={tag}>
                                {tag}
                              </div>
                            </Tooltip>
                          ))}
                          {tagsRest.length > 0 ? (
                            <ClickAwayListener
                              onClickAway={() => setSelectedFeatureTags(null)}
                            >
                              <Tooltip
                                PopperProps={{
                                  disablePortal: true
                                }}
                                sx={{
                                  background: 'red',
                                  backgroundColor: 'red'
                                }}
                                TransitionComponent={Zoom}
                                onClose={() => setSelectedFeatureTags(null)}
                                open={idx === selectedFeatureTags}
                                disableFocusListener
                                disableHoverListener
                                disableTouchListener
                                title={
                                  <>
                                    {tagsRest.map((tag) => (
                                      <div
                                        className={classes.expandedTags}
                                        key={tag}
                                      >
                                        {tag}
                                      </div>
                                    ))}
                                  </>
                                }
                              >
                                <span
                                  className={classes.expandTags}
                                  onClick={(ev) => {
                                    setSelectedFeatureTags(idx)
                                    ev.stopPropagation()
                                  }}
                                >
                                  + {tagsRest.length}
                                </span>
                              </Tooltip>
                            </ClickAwayListener>
                          ) : null}
                          {tagsSnippet.length === 0 &&
                            tagsRest.length === 0 &&
                            '-'}
                        </div>
                      </TableCell>
                      {featureFlags.FEATURE_STORE.LIST_PAGE.USAGE && (
                        <TableCell align='center' padding='normal'>
                          <div
                            className={`${classes.customDataCell} prodUsage`}
                            onClick={(ev) => {
                              setSelectedFeature(row)
                              ev.stopPropagation()
                            }}
                          >
                            {row.usage?.prodCount}
                          </div>
                        </TableCell>
                      )}
                      {featureFlags.FEATURE_STORE.LIST_PAGE.USAGE && (
                        <TableCell align='center' padding='normal'>
                          <div className={`${classes.customDataCell} devUsage`}>
                            {row.usage?.devCount}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>

                    {idx === (features.data || []).length - 1 &&
                      featureListPageNumber < lastPageNumber && (
                        <div ref={setLastElement}>
                          {' '}
                          <TableRow
                            style={{
                              height: 33
                            }}
                          >
                            <TableCell colSpan={7} />
                          </TableRow>
                        </div>
                      )}
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

const mapStateToProps = (state: CommonState) => ({
  featureGroupDetails: state.featureGroupDetailsReducer.featureGroupDetails,
  features: state.featureGroupDetailsReducer.features,
  selectedFeatures: state.featureGroupDetailsReducer.selectedFeatures
})

const mapDispatchToProps = (dispatch) => {
  return {
    setSelectedFeaturesFunc: (
      data: IFeatureGroupDetailsState['selectedFeatures']
    ) => dispatch(setSelectedFeatures(data))
  }
}

const StyleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(FeaturesTable)

export default StyleComponent
