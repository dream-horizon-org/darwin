import {
  Checkbox,
  CircularProgress,
  Radio,
  SortDirection,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel
} from '@mui/material'
import withStyles from '@mui/styles/withStyles'
import React, {Component, MouseEvent} from 'react'
import {NoFilterDisplayComponent} from '../noFilterDisplayComponent/noFilterDisplayComponent'
import {IDefaultProps, IPropsDataList} from './dataList.type'
import {styles, tableComponentTokens} from './dataListJss'
import {getDataListColumnLength, getExpansionList} from './utils'

import {IColumnConfig} from '../../types/columnConfig.type'

class DataListComp<T> extends Component<IPropsDataList<T>, any> {
  public static defaultProps: IDefaultProps = {
    data: [],
    rowsPerPage: 5,
    order: 'asc',
    orderBy: 'id',
    shouldEnableSelection: true,
    singleSelection: false,
    disableHeader: false,
    enablePagination: true,
    showEmptyRows: true,
    rowsPerPageOptions: [5, 10, 20],
    loader: false,
    expansionList: {},
    multipleExpansion: true,
    enableShortcuts: false,
    disabledHover: false,
    disableTableShadow: false,
    stickyHeader: false,
    noResultsFoundMessage: 'No results found',
    isNoResultDueToError: false
  }
  constructor(props) {
    super(props)
    this.state = {
      rowsPerPage: props.rowsPerPage,
      page: 0,
      currentHover: null,
      expansionList: getExpansionList(
        props.data,
        props.expandAll,
        this.props.expansionList,
        this.props.indexKeyName || 'id'
      )
    }
  }

  componentDidMount(): void {
    if (this.props.enableShortcuts) {
      window.addEventListener('keydown', this.onKeyPressed)
    }
  }

  public onKeyPressed = (e: WindowEventMap['keydown']) => {
    const {currentHover} = this.state
    const {data} = this.props
    switch (e.which) {
      case 38:
        // up arrow
        if (currentHover === null) {
          this.setCurrentHoverRow(0)
        } else if (currentHover !== 0) {
          this.setCurrentHoverRow(currentHover - 1)
        }
        break
      case 40:
        // down arrow
        if (currentHover === null) {
          this.setCurrentHoverRow(0)
        } else if (currentHover !== data.length - 1) {
          this.setCurrentHoverRow(currentHover + 1)
        }
        break
    }
  }

  setCurrentHoverRow = (index: number) => {
    this.setState(
      {currentHover: index},
      () =>
        this.props.onHoverRowChange &&
        this.props.onHoverRowChange(this.state.currentHover)
    )
  }

  public componentWillUnmount() {
    this.clearState()
    document.removeEventListener('keydown', this.onKeyPressed)
  }

  clearState = () => {
    this.setState({rowsPerPage: 5, page: 0})
  }

  public componentDidUpdate(prevProps, prevState) {
    if (
      this.props.enablePagination &&
      prevProps.offset !== this.props.offset &&
      this.props.offset === 0
    ) {
      this.setState({
        page: 0
      })
    }
    if (prevProps.expandAll !== this.props.expandAll) {
      this.setState({
        expansionList: getExpansionList(
          this.props.data,
          this.props.expandAll,
          {},
          this.props.indexKeyName || 'id'
        )
      })
    }
    if (prevProps.data !== this.props.data) {
      this.setState({
        expansionList: getExpansionList(
          this.props.data,
          this.props.expandAll,
          this.state.expansionList,
          this.props.indexKeyName || 'id'
        )
      })
    }
    if (prevProps.expansionList !== this.props.expansionList) {
      this.setState({expansionList: {...this.props.expansionList}})
    }
    if (
      prevState.expansionList !== this.state.expansionList &&
      this.props.onExpandAllChange &&
      this.props.data.length !== 0
    ) {
      const values = Object.values(this.state.expansionList)
      if (values.length === this.props.data.length) {
        if (values.every((i) => i === true)) {
          this.props.onExpandAllChange(true)
        } else if (values.every((i) => i === false)) {
          this.props.onExpandAllChange(false)
        }
      }
    }
    if (prevProps.enableShortcuts !== this.props.enableShortcuts) {
      if (this.props.enableShortcuts) {
        window.addEventListener('keydown', this.onKeyPressed)
      } else {
        window.removeEventListener('keydown', this.onKeyPressed)
      }
    }
  }

  private getDefaultData() {
    // TODO: remove state. Instead use props to maintain data.
    if (this.props.defaultSelection) {
      if (Array.isArray(this.props.defaultSelection)) {
        return [...this.props.defaultSelection]
      } else {
        return [this.props.defaultSelection]
      }
    }
    return []
  }

  public rowsPerPageChangeHandler = (e) => {
    this.setState({rowsPerPage: e.target.value})
    this.props.onPageSizeChange(e.target.value)
  }
  handleChangePage = (event, page) => {
    // todo: refactor this logic
    if (event) {
      this.setState({page})
      this.props.onPageChange(page, this.state.rowsPerPage)
    }
  }

  public handleRadioSelect = (_, id) => {
    this.setState({selected: [id]}, () => this.props.onItemClick(id))
  }

  public createSortHandler = (property, order, onRequestSort) => (event) => {
    const {page} = this.state
    onRequestSort && onRequestSort(event, property, order, page)
  }

  getHeaderClass = (column: IColumnConfig, index) =>
    `${
      index === 0
        ? (column.sticky && this.props.classes.stickyLeftTableHeader) || ''
        : (column.sticky && this.props.classes.stickyRightTableHeader) || ''
    } ${this.props.classes.tableHeaderCell} ${
      (column.children &&
        column.children.length &&
        this.props.classes.rowSpanCell) ||
      ''
    } ${
      column.headerCellClass ? this.props.classes[column.headerCellClass] : ''
    }`
  public renderChildrenHeader = () => {
    const {
      order,
      orderBy,
      columnConfig,
      onRequestSort,
      classes,
      rowClass,
      stickyHeader
    } = this.props
    if (stickyHeader) {
      const firstRowHeight =
        document.querySelector('table thead tr')?.clientHeight
      const thArr = document.querySelectorAll<HTMLElement>(
        'table thead tr:nth-child(2) th'
      )
      thArr.forEach((ele) => (ele.style.top = firstRowHeight + 'px'))
    }
    return (
      <TableRow className={rowClass ? classes[rowClass] : ''}>
        {columnConfig
          .filter((item) => item.children !== undefined)
          .map(
            (column) =>
              column.children.map(
                (item) => (
                  <TableCell
                    style={{
                      minWidth: item.minColumnWidth,
                      color: tableComponentTokens.text_color
                    }}
                    key={item.id}
                    align={
                      item.numeric
                        ? 'right'
                        : item.alignSelf
                        ? item.alignSelf
                        : 'inherit'
                    }
                    sortDirection={orderBy === item.id ? order : false}
                    onClick={this.createSortHandler(
                      item.id,
                      order,
                      onRequestSort
                    )}
                    className={`${this.props.classes.tableHeaderCell} ${
                      item.headerCellClass ? classes[item.headerCellClass] : ''
                    }`}
                  >
                    {orderBy === item.id ? (
                      <TableSortLabel active direction={order}>
                        {item.headerJSX
                          ? item.headerJSX(this.props, item)
                          : item.label}
                      </TableSortLabel>
                    ) : item.headerJSX ? (
                      item.headerJSX(this.props, item)
                    ) : (
                      item.label
                    )}
                  </TableCell>
                ),
                this
              ),
            this
          )}
      </TableRow>
    )
  }
  public renderDataListHeader = () => {
    const {
      order,
      orderBy,
      columnConfig,
      shouldEnableSelection,
      singleSelection,
      onRequestSort,
      classes,
      rowClass,
      dataTest
    } = this.props
    const hasChildren = columnConfig.find((item) => item.children !== undefined)
    const multiSpanConfig = columnConfig.find((item) => item.rowSpan > 1)
    return (
      <TableHead>
        <TableRow className={rowClass ? classes[rowClass] : ''}>
          {shouldEnableSelection &&
            (singleSelection ? (
              <TableCell padding='checkbox'>Default</TableCell>
            ) : (
              <TableCell
                rowSpan={multiSpanConfig ? multiSpanConfig.rowSpan : 1}
                padding='checkbox'
                classes={{paddingCheckbox: classes.tableCellCheckboxPadding}}
              >
                {<Checkbox color='primary' data-test={`${dataTest}-header`} />}
              </TableCell>
            ))}
          {columnConfig.map(
            (column, index) => (
              <TableCell
                style={{
                  minWidth: column.minColumnWidth,
                  color: tableComponentTokens.text_color
                }}
                key={column.id}
                sortDirection={
                  (orderBy === column.id ? order : false) as SortDirection
                }
                onClick={this.createSortHandler(
                  column.id,
                  order,
                  onRequestSort
                )}
                rowSpan={column.rowSpan || 1}
                colSpan={(column.children && column.children.length) || 1}
                className={this.getHeaderClass(column, index)}
                align={
                  column.numeric
                    ? 'right'
                    : column.alignSelf
                    ? column.alignSelf
                    : 'inherit'
                }
              >
                {orderBy === column.id ? (
                  <TableSortLabel active direction={order}>
                    {column.headerJSX
                      ? column.headerJSX(this.props, column)
                      : column.label}
                  </TableSortLabel>
                ) : column.headerJSX ? (
                  column.headerJSX(this.props, column)
                ) : (
                  column.label
                )}
              </TableCell>
            ),
            this
          )}
        </TableRow>
        {hasChildren && this.renderChildrenHeader()}
      </TableHead>
    )
  }
  onItemClick = (item, column, index) => (e: React.MouseEvent) => {
    if (column.expandButton) {
      const previousExpansionList = this.props.multipleExpansion
        ? {...this.state.expansionList}
        : {}
      if (item[this.props.indexKeyName || 'id']) {
        this.setState({
          expansionList: {
            ...previousExpansionList,
            [item[this.props.indexKeyName || 'id']]:
              !this.state.expansionList[item[this.props.indexKeyName || 'id']]
          }
        })
        this.props.onClick &&
          this.props.onClick(e, {
            ...item,
            isExpanded:
              !this.state.expansionList[item[this.props.indexKeyName || 'id']]
          })
      }
    } else if (column.id === 'expandRows') {
      this.props.onExapndItem(index)
    } else {
      this.setState({currentHover: index})
      this.props.onClick &&
        this.props.onClick(e, item[this.props.indexKeyName || 'id'], item)
    }
  }
  addMouseEnterListener = () =>
    this.props.onBodyMouseEnter
      ? {onMouseEnter: this.props.onBodyMouseEnter}
      : {}
  getTableCellClassName = (
    item: T,
    index: number,
    idx = null,
    isChildRow = false,
    isSelected = false
  ) => {
    const {disabledHover} = this.props

    if (isChildRow) {
      return !disabledHover && index * 100 + idx === this.state.currentHover
        ? this.props.classes.rowSelected
        : ''
    }

    return `${
      !disabledHover && (index === this.state.currentHover || isSelected)
        ? this.props.classes.rowHighlighted
        : ''
    } ${item['disabled'] ? this.props.classes.disabled : ''} ${
      isSelected && this.props.classes.rowWithBoxShadow
    }`
  }
  renderTableCell = (item, index, isChild = false) => {
    const {columnConfig, classes, isFilteredResponse, onDoubleClick} =
      this.props
    return columnConfig.map((column, columnConfigInde) => {
      if (column.children) {
        return column.children.map((childColumn) => (
          <TableCell
            style={{minWidth: childColumn.minColumnWidth}}
            className={`${classes.tableDataCell} ${
              childColumn.wrapText ? classes.columnWrap : ''
            } ${
              childColumn.dataCellClass
                ? classes[childColumn.dataCellClass]
                : ''
            }`}
            align={
              childColumn.numeric
                ? 'right'
                : childColumn.alignSelf
                ? childColumn.alignSelf
                : 'inherit'
            }
            onClick={this.onItemClick(item, childColumn, index)}
            onDoubleClick={(e) => onDoubleClick(e, index, item)}
          >
            {childColumn.jsx
              ? childColumn.jsx(this.props, item, isChild)
              : item[childColumn.id]}
          </TableCell>
        ))
      }

      return (
        <TableCell
          style={{minWidth: column.minColumnWidth}}
          className={`${
            columnConfigInde === 0
              ? (column.sticky && this.props.classes.stickyLeftTableCell) || ''
              : (column.sticky && this.props.classes.stickyRightTableCell) || ''
          } ${classes.tableDataCell} ${
            column.wrapText ? classes.columnWrap : ''
          } ${
            column.dataCellClass ? classes[column.dataCellClass] : classes['']
          } `}
          align={
            column.numeric
              ? 'right'
              : column.alignSelf
              ? column.alignSelf
              : 'inherit'
          }
          onClick={this.onItemClick(item, column, index)}
          onDoubleClick={(e) => onDoubleClick(e, index, item)}
        >
          {column.jsx
            ? column.jsx(this.props, item, isChild, !isFilteredResponse)
            : item[column.id]}
        </TableCell>
      )
    }, this)
  }

  onRowHover = (index: number) => (event: MouseEvent) => {
    if (!this.props.disabledHover && this.state.currentHover !== index) {
      this.setCurrentHoverRow(index)
    }
  }

  renderTableRow = (row, index) => {
    const {
      singleSelection,
      shouldEnableSelection,
      indexKeyName,
      defaultSelection,
      disableSelected,
      allMatchesSelected,
      dataTest,
      disableItems,
      classes,
      collapsable,
      collapsableColumn,
      selectedRows
    } = this.props
    const collapsableRows = []

    if (collapsable) {
      row[collapsableColumn].forEach((r, idx) => {
        if (idx === 0) {
          collapsableRows.push({
            ...row,
            ...r
          })
        } else {
          const rowObj = {}
          Object.keys(row).forEach((key) => {
            if (key !== 'loadingVersions' && key !== 'featureJobId') {
              rowObj[key] = ''
            } else {
              rowObj[key] = row[key]
            }
          })
          collapsableRows.push({
            ...rowObj,
            ...r
          })
        }
      })
    }

    if (collapsable) {
      return (
        <>
          <TableRow
            role='checkbox'
            tabIndex={-1}
            key={row[indexKeyName] || index}
            selected={false}
            hover={false}
            className={this.getTableCellClassName(row, index)}
            onMouseEnter={this.onRowHover(index)}
            onMouseLeave={this.onRowHover(null)}
            data-test={`${dataTest}-row-${index}`}
          >
            {shouldEnableSelection && (
              <TableCell
                padding='checkbox'
                classes={{
                  paddingCheckbox: classes.tableCellCheckboxPadding
                }}
              >
                {singleSelection ? (
                  <Radio
                    color='primary'
                    onChange={(e) =>
                      this.handleRadioSelect(e, row[indexKeyName])
                    }
                    data-test={`${dataTest}-value-${index}`}
                  />
                ) : (
                  <Checkbox
                    disabled={
                      (disableSelected &&
                        Array.isArray(defaultSelection) &&
                        defaultSelection.includes(
                          row['id'] || row[indexKeyName]
                        )) ||
                      allMatchesSelected ||
                      (disableItems &&
                        Array.isArray(disableItems) &&
                        disableItems.includes(row['id'] || row[indexKeyName]))
                    }
                    color='primary'
                    data-test={`${dataTest}-value-${index}`}
                  />
                )}
              </TableCell>
            )}
            {this.renderTableCell(collapsableRows[0], index)}
          </TableRow>
          {row.open
            ? collapsableRows.slice(1).map((r, idx) => (
                <TableRow
                  role='checkbox'
                  tabIndex={-1}
                  key={row[indexKeyName] || index}
                  selected={false}
                  hover={false}
                  className={this.getTableCellClassName(row, index, idx, true)}
                  onMouseEnter={this.onRowHover(index * 100 + idx)}
                >
                  {this.renderTableCell(r, index, true)}
                </TableRow>
              ))
            : null}
        </>
      )
    }

    let isSelected = false
    if (selectedRows && selectedRows.length > 0) {
      isSelected = selectedRows.some((selectedRow) => {
        if (selectedRow && row) {
          return selectedRow[indexKeyName] === row[indexKeyName]
        }
      })
    }

    return (
      <TableRow
        role='checkbox'
        tabIndex={-1}
        key={row[indexKeyName] || index}
        selected={false}
        hover={false}
        className={this.getTableCellClassName(
          row,
          index,
          row[indexKeyName],
          false,
          isSelected
        )}
        onMouseEnter={this.onRowHover(index)}
        onMouseLeave={this.onRowHover(null)}
        data-test={`${dataTest}-row-${index}`}
      >
        {shouldEnableSelection && (
          <TableCell
            padding='checkbox'
            classes={{
              paddingCheckbox: classes.tableCellCheckboxPadding
            }}
          >
            {singleSelection ? (
              <Radio
                color='primary'
                onChange={(e) => this.handleRadioSelect(e, row[indexKeyName])}
                data-test={`${dataTest}-value-${index}`}
              />
            ) : (
              <Checkbox
                disabled={
                  (disableSelected &&
                    Array.isArray(defaultSelection) &&
                    defaultSelection.includes(
                      row['id'] || row[indexKeyName]
                    )) ||
                  allMatchesSelected ||
                  (disableItems &&
                    Array.isArray(disableItems) &&
                    disableItems.includes(row['id'] || row[indexKeyName]))
                }
                color='primary'
                data-test={`${dataTest}-value-${index}`}
              />
            )}
          </TableCell>
        )}
        {this.renderTableCell(row, index)}
      </TableRow>
    )
  }
  public renderExpansionElement = (listItem: T) => {
    const {expansionElement, columnConfig, indexKeyName, classes} = this.props

    return (
      expansionElement &&
      expansionElement(this.props, listItem) &&
      this.state.expansionList[listItem[indexKeyName] || listItem['id']] && (
        <TableRow>
          <TableCell
            className={classes.tableCell}
            colSpan={getDataListColumnLength(columnConfig)}
          >
            {expansionElement(this.props, listItem)}
          </TableCell>
        </TableRow>
      )
    )
  }

  public renderTableBody = () => {
    const {
      data,
      rowsPerPage,
      indexKeyName,
      showEmptyRows,
      expansionElement,
      loader,
      classes,
      columnConfig
    } = this.props
    const emptyRows = data.length ? rowsPerPage - data.length : 0
    const isSubHeaderPresent = Array.isArray(data[0])

    return !loader ? (
      <TableBody {...this.addMouseEnterListener()}>
        {data.map((item, index) => {
          return (
            <>
              {isSubHeaderPresent && item[1] && (
                <TableRow>
                  <TableCell
                    colSpan={getDataListColumnLength(columnConfig)}
                    className={classes.separator}
                  >
                    <span className={classes.separatorText}>{item[1]}</span>
                  </TableCell>
                </TableRow>
              )}
              {isSubHeaderPresent
                ? item[0].map((listItem, index) => (
                    <>
                      {this.renderTableRow(listItem, index)}
                      {this.renderExpansionElement(listItem)}
                    </>
                  ))
                : this.renderTableRow(item, index)}

              {this.renderExpansionElement(item)}
            </>
          )
        })}
        {emptyRows > 0 && showEmptyRows && (
          <TableRow style={{height: 49 * emptyRows}}>
            <TableCell colSpan={getDataListColumnLength(columnConfig)} />
          </TableRow>
        )}
      </TableBody>
    ) : (
      ''
    )
  }

  public renderDataListFooter = () => {
    return (
      <TablePagination
        component='div'
        count={this.props.totalCount || 0}
        labelRowsPerPage={null}
        rowsPerPage={this.state.rowsPerPage}
        rowsPerPageOptions={this.props.rowsPerPageOptions}
        page={this.state.page}
        backIconButtonProps={{
          'aria-label': 'Previous Page',
          className: this.props.classes.backButtonClass
        }}
        nextIconButtonProps={{
          'aria-label': 'Next Page',
          className: this.props.classes.backButtonClass
        }}
        onPageChange={this.handleChangePage}
        onRowsPerPageChange={this.rowsPerPageChangeHandler}
      />
    )
  }

  public render() {
    const {
      enablePagination,
      classes,
      loader,
      disableTableShadow,
      columnConfig
    } = this.props
    return (
      <div className={classes.datalistContainer}>
        <div
          className={`${classes.tableContainer} ${
            disableTableShadow ? classes.noShadow : ''
          }`}
          ref={this.props.tableRef}
        >
          <Table stickyHeader={this.props.stickyHeader}>
            {!this.props.disableHeader && this.renderDataListHeader()}
            {this.props.noResultsFound ? (
              <TableBody>
                <TableCell colSpan={getDataListColumnLength(columnConfig)}>
                  <NoFilterDisplayComponent
                    secondaryString={this.props.noResultsFoundMessage}
                    isNoResultDueToError={this.props.isNoResultDueToError}
                  />
                </TableCell>
              </TableBody>
            ) : (
              this.renderTableBody()
            )}
          </Table>
          {loader && (
            <div className={classes.loaderContainer}>
              <CircularProgress className={classes.loader} size={30} />
            </div>
          )}
        </div>
        {enablePagination &&
          !this.props.noResultsFound &&
          this.renderDataListFooter()}
      </div>
    )
  }
}

export const DataList = withStyles(styles)(DataListComp)
