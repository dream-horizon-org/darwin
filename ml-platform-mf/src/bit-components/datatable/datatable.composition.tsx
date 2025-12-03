import config from 'config'
import React, {useState} from 'react'
import {CompositionWrapper} from '../composition-wrapper/index'
import {
  ActionableIconButtonSizes,
  ActionableIconButtonVariants,
  IconButtonSizes
} from '../icon-button/index'
import {Icons} from '../icon/index'
import {TcAvatarsType} from '../table-cells/tc-avatars/index'
import {TableCellAlignment, TableCellSize} from '../table-cells/tc-cell/index'
import {TagsType} from '../tags/tags/index'
import {ToolTipPlacement} from '../tooltip/index'
import {SortOrder, TableCells} from './constants'
import {Datatable} from './datatable'
import {mockData} from './datatable.mockData'
import {ColumnConfig} from './datatable.type'

const dataTableMockFunc = () => {
  const head = document.getElementsByTagName('HEAD')[0]
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `${config.cfBitComponentsUrl}/fontIcons/styles.css`
  head.appendChild(link)
}
export type ChildTableType = {
  id: number
  name: string
  calories: string
  fat: number
  carbs: number
  protein: number
  type: string
}

type IconListInput = {
  leadingIcon: Icons
  isLoading: boolean
  disabled: boolean
  tooltipContent: string
  iconSeverity: string
}

export type Data = {
  id: number
  name: string
  calories: string
  fat: number
  carbs: number
  protein: number
  type: string
  history: Array<ChildTableType>
  iconList: Array<IconListInput>
}

const findType = (type) => {
  if (type === 'success') {
    return TagsType.Valid
  } else return TagsType.Invalid
}

const stickyColumnConfig: Array<ColumnConfig<Data>> = [
  {
    id: 1,
    columnType: TableCells.TcTags,
    componentProps: (item) => {
      return {
        type: findType(item.type),
        label: item.name,
        stickyPosition: 'left'
      }
    },
    headerProps: {headerLabel: 'column 1', align: TableCellAlignment.Center},
    parentHeaderProps: {
      headerLabel: 'column 1',
      align: TableCellAlignment.Center,
      headerTag: 1000
    },
    stickyPosition: 'left'
  },
  {
    id: 2,
    columnType: TableCells.TcData,
    componentProps: (item: Data) => {
      return {
        text: item.calories,
        secondaryText: 'secondary text',
        highLightStyle: {
          background: '#b77a03',
          fontSize: '16px'
        },
        highlightText: 'DuMMy'
      }
    },
    headerProps: {headerLabel: 'column 2', align: TableCellAlignment.Center},
    parentHeaderProps: {
      headerLabel: 'column 2',
      align: TableCellAlignment.Center,
      colSpan: 2
    }
  },
  {
    id: 3,
    columnType: TableCells.TcData,
    componentProps: (item: Data) => {
      return {text: item.protein}
    },
    headerProps: {headerLabel: 'column 3', align: TableCellAlignment.Center}
  },
  {
    id: 4,
    columnType: TableCells.TcData,
    componentProps: (item: Data) => {
      return {text: item.fat}
    },
    headerProps: {
      headerLabel: 'column 4',
      headerTag: '1000',
      headerTagType: TagsType.Default
    },
    parentHeaderProps: {
      headerLabel: 'column 4',
      align: TableCellAlignment.Center,
      colSpan: 2
    }
  },
  {
    id: 5,
    columnType: TableCells.TcData,
    componentProps: (item: Data) => {
      return {text: item.carbs}
    },
    headerProps: {headerLabel: 'column 5', align: TableCellAlignment.Center}
  },
  {
    id: 6,
    columnType: TableCells.TcData,
    componentProps: (item: Data) => {
      return {text: item.carbs}
    },
    headerProps: {headerLabel: 'column 6', align: TableCellAlignment.Center},
    parentHeaderProps: {
      headerLabel: 'column 6',
      align: TableCellAlignment.Center,
      colSpan: 2
    }
  },
  {
    id: 7,
    columnType: TableCells.TcData,
    componentProps: (item: Data) => {
      return {text: item.carbs}
    },
    headerProps: {headerLabel: 'column 7', align: TableCellAlignment.Center}
  },
  {
    id: 8,
    columnType: TableCells.TcData,
    componentProps: (item: Data) => {
      return {text: item.carbs}
    },
    headerProps: {headerLabel: 'column 8', align: TableCellAlignment.Center},
    parentHeaderProps: {
      headerLabel: 'column 8',
      align: TableCellAlignment.Center,
      colSpan: 2
    }
  },
  {
    id: 9,
    columnType: TableCells.TcData,
    componentProps: (item: Data) => {
      return {text: item.carbs}
    },
    headerProps: {headerLabel: 'column 9', align: TableCellAlignment.Center}
  },
  {
    id: 10,
    columnType: TableCells.TcData,
    componentProps: (item: Data) => {
      return {text: item.carbs}
    },
    headerProps: {headerLabel: 'column 10', align: TableCellAlignment.Center},
    parentHeaderProps: {
      headerLabel: 'column 10',
      align: TableCellAlignment.Center,
      colSpan: 1
    }
  },
  {
    id: 11,
    columnType: TableCells.TcData,
    componentProps: (item: Data) => {
      return {text: item.carbs}
    },
    headerProps: {headerLabel: 'column 11', align: TableCellAlignment.Center},
    parentHeaderProps: {
      headerLabel: 'column 11',
      align: TableCellAlignment.Center,
      colSpan: 1
    }
  },
  {
    id: 12,
    columnType: TableCells.TcData,
    componentProps: (item: Data) => {
      return {text: item.carbs}
    },
    headerProps: {headerLabel: 'column 12', align: TableCellAlignment.Center},
    parentHeaderProps: {
      headerLabel: 'column 12',
      align: TableCellAlignment.Center,
      colSpan: 2
    }
  },
  {
    id: 13,
    columnType: TableCells.TcData,
    componentProps: (item: Data) => {
      return {text: item.carbs}
    },
    headerProps: {headerLabel: 'column 13', align: TableCellAlignment.Center}
  },
  {
    id: 14,
    columnType: TableCells.TcIconList,
    componentProps: (item: Data) => {
      return {iconList: item.iconList}
    },
    headerProps: {headerLabel: 'column 14', align: TableCellAlignment.Center},
    parentHeaderProps: {
      headerLabel: 'column 14',
      align: TableCellAlignment.Center,
      colSpan: 2
    }
  },
  {
    id: 15,
    columnType: TableCells.TcIconButton,
    componentProps: () => {
      return {
        leadingIcon: Icons.ICON_3D_ROTATION,
        onClick: () => alert('hi'),
        actionableVariants: ActionableIconButtonVariants.ACTIONABLE_TERTIARY,
        actionableSizes: ActionableIconButtonSizes.LARGE,
        buttonSize: IconButtonSizes.LARGE,
        actionable: true,
        isSelected: true,
        toolTipText: 'Trail',
        showToolTip: true,
        toolTipPlacement: ToolTipPlacement.Bottom
      }
    },
    headerProps: {headerLabel: 'column 15', align: TableCellAlignment.Center}
  }
]

const columnConfig: Array<ColumnConfig<Data>> = [
  {
    id: 1,
    columnType: TableCells.TcTags,
    componentProps: (item) => {
      return {
        type: findType(item.type),
        label: item.name
      }
    },
    headerProps: {
      headerLabel: 'column 1',
      align: TableCellAlignment.Center,
      headerTag: '1000'
    },
    parentHeaderProps: {
      headerLabel: 'column 1',
      align: TableCellAlignment.Center
    },
    stickyPosition: 'left'
  },
  {
    id: 2,
    columnType: TableCells.TcData,
    componentProps: (item: Data) => {
      return {
        text: item.calories,
        leadingIcon: Icons.ICON_ERROR_OUTLINE,
        showToolTipIcon: true,
        tooltipText: item.calories
      }
    },
    headerProps: {
      headerLabel: 'column 2',
      align: TableCellAlignment.Center
    },
    parentHeaderProps: {
      headerLabel: 'column 2',
      align: TableCellAlignment.Center,
      colSpan: 2
    }
  },
  {
    id: 3,
    columnType: TableCells.TcData,
    componentProps: (item: Data) => {
      return {text: item.protein}
    },
    headerProps: {
      headerLabel: 'column 3',
      align: TableCellAlignment.Center,
      trailingToolTipIcon: Icons.ICON_ERROR_OUTLINE,
      trailingToolTipText: 'ToolTip Text'
    }
  },
  {
    id: 4,
    columnType: TableCells.TcData,
    componentProps: (item: Data) => {
      return {text: item.fat}
    },
    headerProps: {headerLabel: 'column 4'},
    parentHeaderProps: {
      headerLabel: 'column 4',
      align: TableCellAlignment.Center,
      colSpan: 2
    }
  },
  {
    id: 5,
    columnType: TableCells.TcData,
    componentProps: (item: Data) => {
      return {text: item.carbs}
    },
    headerProps: {headerLabel: 'column 5', align: TableCellAlignment.Center}
  }
]
const avatarsColumnConfig: Array<ColumnConfig<Data>> = [
  {
    id: 1,
    columnType: TableCells.TcAvatars,
    componentProps: (item) => {
      return {
        type: TcAvatarsType.Tags,
        displayKey: 'name',
        data: item.history,
        totalElements: 3
      }
    },
    headerProps: {headerLabel: 'column 1', align: TableCellAlignment.Center},
    parentHeaderProps: {
      headerLabel: 'column 1',
      align: TableCellAlignment.Center
    }
  },
  {
    id: 2,
    columnType: TableCells.TcData,
    componentProps: (item: Data) => {
      return {
        text: item.calories
      }
    },
    headerProps: {headerLabel: 'column 2', align: TableCellAlignment.Center},
    parentHeaderProps: {
      headerLabel: 'column 2',
      align: TableCellAlignment.Center,
      colSpan: 2
    }
  },
  {
    id: 3,
    columnType: TableCells.TcData,
    componentProps: (item: Data) => {
      return {text: item.protein}
    },
    headerProps: {headerLabel: 'column 3', align: TableCellAlignment.Center}
  },
  {
    id: 4,
    columnType: TableCells.TcData,
    componentProps: (item: Data) => {
      return {text: item.fat}
    },
    headerProps: {headerLabel: 'column 4'},
    parentHeaderProps: {
      headerLabel: 'column 4',
      align: TableCellAlignment.Center,
      colSpan: 2
    }
  },
  {
    id: 5,
    columnType: TableCells.TcData,
    componentProps: (item: Data) => {
      return {text: item.carbs}
    },
    headerProps: {headerLabel: 'column 5', align: TableCellAlignment.Center}
  }
]

const childColumnConfig: Array<ColumnConfig<ChildTableType>> = [
  {
    id: 1,
    columnType: TableCells.TcTags,
    componentProps: (item) => {
      return {
        type: findType(item.type),
        label: item.name
      }
    },
    headerProps: {headerLabel: 'column 1'}
  },
  {
    id: 2,
    columnType: TableCells.TcData,
    componentProps: (item: ChildTableType) => {
      return {text: item.calories}
    },
    headerProps: {headerLabel: 'column 2'}
  },
  {
    id: 3,
    columnType: TableCells.TcData,
    componentProps: (item: ChildTableType) => {
      return {text: item.protein}
    },
    headerProps: {headerLabel: 'column 3'}
  },
  {
    id: 4,
    columnType: TableCells.TcData,
    componentProps: (item: ChildTableType) => {
      return {text: item.fat}
    },
    headerProps: {headerLabel: 'column 4'}
  }
]

const columnConfigWithCheckbox: Array<ColumnConfig<Data>> = [
  {
    id: 1,
    columnType: TableCells.TcTags,
    componentProps: (item) => {
      return {
        type: findType(item.type),
        label: item.name
      }
    },
    headerProps: {
      headerLabel: 'name',
      align: TableCellAlignment.Center
    },
    parentHeaderProps: {
      headerLabel: 'name',
      align: TableCellAlignment.Center
    }
  },
  {
    id: 2,
    columnType: TableCells.TcData,
    componentProps: (item: Data) => {
      return {text: item.calories}
    },
    headerProps: {
      headerLabel: 'calories',
      align: TableCellAlignment.Center
    },
    parentHeaderProps: {
      headerLabel: 'calories',
      align: TableCellAlignment.Center,
      colSpan: 2
    }
  },
  {
    id: 3,
    columnType: TableCells.TcCheckbox,
    componentProps: (item: Data) => {
      return {text: item.fat, onChange: () => {}}
    },
    headerProps: {headerLabel: 'fat', align: TableCellAlignment.Center}
  },
  {
    id: 4,
    columnType: TableCells.TcData,
    componentProps: (item: Data) => {
      return {text: item.carbs}
    },
    headerProps: {headerLabel: 'carbs'},
    parentHeaderProps: {
      headerLabel: 'carbs',
      align: TableCellAlignment.Center,
      colSpan: 2
    }
  },
  {
    id: 5,
    columnType: TableCells.TcData,
    componentProps: (item: Data) => {
      return {text: item.protein}
    },
    headerProps: {headerLabel: 'protein', align: TableCellAlignment.Center}
  }
]

export const BasicDatatable = () => {
  dataTableMockFunc()

  const onClick = () => {}
  return (
    <CompositionWrapper>
      <Datatable<Data>
        enablePagination={false}
        enableSelection={true}
        singleSelection={true}
        size={TableCellSize.Large}
        columnConfig={columnConfig}
        data={mockData}
        indexKeyName={'id'}
        onSelectAllClick={() => {}}
        enableSelectionColumn={false}
        onRowClick={() => {
          onClick()
        }}
      />
    </CompositionWrapper>
  )
}
BasicDatatable.compositionName = 'Data Table'
export const SelectionColumn = () => {
  dataTableMockFunc()
  return (
    <CompositionWrapper>
      <Datatable<Data>
        enablePagination={false}
        enableSelection={true}
        singleSelection={true}
        size={TableCellSize.Large}
        columnConfig={columnConfig}
        data={mockData}
        indexKeyName={'id'}
        onSelectAllClick={() => {}}
        enableSelectionColumn={true}
        onRowClick={(row) => {
          alert(row)
        }}
      />
    </CompositionWrapper>
  )
}
export const DefaultSelection = () => {
  dataTableMockFunc()
  return (
    <CompositionWrapper>
      <Datatable<Data>
        enableSelection={true}
        singleSelection={true}
        size={TableCellSize.Large}
        defaultSelection={[22]}
        columnConfig={columnConfig}
        data={mockData}
        indexKeyName={'id'}
        enableSelectionColumn={true}
        onRowClick={(row) => {
          alert(row)
        }}
      />
    </CompositionWrapper>
  )
}
export const Loading = () => {
  dataTableMockFunc()
  return (
    <CompositionWrapper>
      <Datatable<Data>
        enablePagination={false}
        enableSelection={true}
        size={TableCellSize.Large}
        columnConfig={columnConfig}
        data={[]}
        indexKeyName={'id'}
        onSelectAllClick={() => {}}
        onRowClick={(row) => {
          alert(row)
        }}
        loading={true}
      />
    </CompositionWrapper>
  )
}
export const TcAvatars = () => {
  dataTableMockFunc()
  return (
    <CompositionWrapper>
      <Datatable<Data>
        enablePagination={false}
        enableSelection={true}
        size={TableCellSize.Large}
        columnConfig={avatarsColumnConfig}
        data={mockData}
        indexKeyName={'id'}
        onSelectAllClick={() => {}}
        onRowClick={(row) => {
          alert(row)
        }}
      />
    </CompositionWrapper>
  )
}
export const LeftStickyColumn = () => {
  dataTableMockFunc()
  return (
    <CompositionWrapper>
      <Datatable<Data>
        enableStickyHeader={true}
        enablePagination={false}
        size={TableCellSize.Large}
        columnConfig={stickyColumnConfig}
        data={mockData}
        indexKeyName={'id'}
        onSelectAllClick={() => {}}
        onRowClick={(row) => {
          alert(row)
        }}
        onIconListElementClick={(event, rowIndex, elementIndex) => {
          alert(`${rowIndex}: ${elementIndex}`)
        }}
        onIconButtonClick={(event, index) => {
          alert(index)
        }}
      />
    </CompositionWrapper>
  )
}

export const Pagination = () => {
  const [Data, setData] = React.useState(mockData)

  dataTableMockFunc()
  const [page, setPage] = React.useState<number>(1)
  const [rowsPerPage, setRowsPerPage] = React.useState<{
    label: string
    id: number
  }>({label: '5', id: 5})
  const rowsPerPageHandler = (
    event: React.SyntheticEvent<Element, Event> | null,
    newRow: {label: string; id: number}
  ) => {
    setRowsPerPage(newRow)
  }
  const pageHandler = (newPage: number) => {
    setPage(newPage)
  }
  React.useEffect(() => {
    const tempData = mockData.slice(
      (page - 1) * rowsPerPage.id,
      page * rowsPerPage.id
    )
    setData(tempData)
  }, [rowsPerPage, page])
  const rowPerPageValue = [
    {label: '5', id: 5},
    {label: '10', id: 10},
    {label: '20', id: 20},
    {label: '30', id: 30},
    {label: '40', id: 40},
    {label: '50', id: 50},
    {label: '100', id: 100}
  ]

  return (
    <CompositionWrapper>
      <Datatable<Data>
        enablePagination={true}
        enableSelection={true}
        tableContainerHeight={300}
        size={TableCellSize.Large}
        columnConfig={columnConfig}
        data={Data}
        indexKeyName={'id'}
        onSelectAllClick={() => {}}
        rowPerPageOptions={rowPerPageValue}
        rowsPerPage={rowsPerPage}
        page={page}
        pageHandler={pageHandler}
        defaultRowValue={rowPerPageValue[0]}
        rowsPerPageHandler={rowsPerPageHandler}
        totalRow={10}
        enableStickyHeader={true}
      />
    </CompositionWrapper>
  )
}

export const ChildDatatable = () => {
  dataTableMockFunc()
  return (
    <CompositionWrapper>
      <Datatable<Data, ChildTableType>
        enableChildTable={true}
        childColumnConfig={childColumnConfig}
        enablePagination={false}
        enableSelection={false}
        size={TableCellSize.Large}
        childTableKey={'history'}
        columnConfig={columnConfig}
        data={mockData}
        indexKeyName={'id'}
        onSelectAllClick={() => {}}
      />
    </CompositionWrapper>
  )
}

export const ChildHeaderDatatable = () => {
  dataTableMockFunc()
  return (
    <CompositionWrapper>
      <Datatable<Data>
        enableParentHeader={true}
        enablePagination={false}
        enableSelection={false}
        enableStickyHeader={true}
        size={TableCellSize.Large}
        columnConfig={stickyColumnConfig}
        tableContainerHeight={300}
        data={mockData}
        indexKeyName={'id'}
        onSelectAllClick={() => {}}
      />
    </CompositionWrapper>
  )
}
export const InfiniteScroll = () => {
  dataTableMockFunc()
  const [data, setData] = React.useState(mockData)
  const [infiniteScrollLoader, setInfiniteScrollLoader] = useState(false)

  const handleData = async (): Promise<void> => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setData((prev) => {
          return [...prev, ...mockData]
        })
        resolve() // Resolve the promise after the data is set
      }, 1000)
    })
  }

  const handleOnScroll = (): void => {
    setInfiniteScrollLoader(true)
    handleData()
      .then(() => {
        setInfiniteScrollLoader(false)
      })
      .catch((error) => {
        alert(error)
      })
  }

  return (
    <CompositionWrapper>
      <Datatable<Data>
        enablePagination={false}
        enableSelection={true}
        size={TableCellSize.Large}
        columnConfig={columnConfig}
        data={data}
        indexKeyName={'id'}
        onSelectAllClick={() => {}}
        onRowClick={(row) => {
          alert(row)
        }}
        enableInfiniteScroll={true}
        totalRow={120}
        onScrollToPageEnd={handleOnScroll}
        infiniteScrollLoader={infiniteScrollLoader}
      />
    </CompositionWrapper>
  )
}

export const CheckBoxWithoutSelection = () => {
  dataTableMockFunc()
  const [highlightState, setHighlightState] = useState<number | null>(1)
  setTimeout(() => {
    setHighlightState((value) => (value === 1 ? null : 1))
  }, 5000)
  const [initData, setInitData] = React.useState(mockData)
  const [sortDirection, setSortDirection] = useState(SortOrder.ASC)
  const [activeSortColId, setActiveSortColId] = React.useState<
    string | number
  >()

  return (
    <CompositionWrapper>
      <Datatable<Data>
        enablePagination={false}
        enableSelection={false}
        size={TableCellSize.Large}
        columnConfig={columnConfigWithCheckbox}
        data={initData}
        indexKeyName={'id'}
        lastEditedRowKey={'id'}
        lastEditedRowKeyValue={highlightState}
        orderBy={['fat', 'carbs', 'protein']}
        order={sortDirection}
        activeSortColId={activeSortColId}
        onRequestSort={(
          _event: unknown,
          columnName: string | number,
          order: string
        ) => {
          const dataToSort = [...initData]
          let sortedData
          if (order === SortOrder.ASC) {
            setSortDirection(SortOrder.DESC)
            sortedData = dataToSort.sort((first, second) => {
              const firstVal = first[columnName]
              const secondVal = second[columnName]

              if (
                typeof firstVal === 'number' &&
                typeof secondVal === 'number'
              ) {
                return firstVal - secondVal // Numerical comparison
              } else {
                return String(firstVal).localeCompare(String(secondVal)) // String comparison
              }
            })
          } else {
            setSortDirection(SortOrder.ASC)
            sortedData = dataToSort.sort((first, second) => {
              const firstVal = first[columnName]
              const secondVal = second[columnName]

              if (
                typeof firstVal === 'number' &&
                typeof secondVal === 'number'
              ) {
                return secondVal - firstVal // Numerical comparison in reverse order for DESC
              } else {
                return String(secondVal).localeCompare(String(firstVal)) // String comparison in reverse order for DESC
              }
            })
          }
          setActiveSortColId(columnName)
          setInitData(sortedData)
        }}
      />
    </CompositionWrapper>
  )
}
