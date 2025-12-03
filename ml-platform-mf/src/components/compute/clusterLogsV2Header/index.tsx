import {WithStyles, withStyles} from '@mui/styles'
import React, {useEffect} from 'react'
import {Dropdown} from '../../../bit-components/dropdown/index'
import FilterDrop from '../../filterDrop'

import {IComputeState} from '../../../modules/compute/pages/graphqlApis/reducer'
import {getFormattedDateTimeForCompute} from '../../../utils/getDateString'
import DateTimeSelector from '../../dateTimeSelector'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  logGroups: IComputeState['logGroups']
  components: any
  levels: any
  eventTypesFilter: {[key: string]: boolean}
  selectedLogGroup: IComputeState['logGroups']['data'][0]
  onSelectingLogGroup: (logGroup: IComputeState['logGroups']['data'][0]) => void
  onSelectingComponent: (components: any) => void
  onSelectingLevel: (levels: any) => void
  onSelectingEventType: (eventTypes: any) => void
  startTime: Date
  endTime: Date
  startDate: Date
  endDate: Date
  onStartDateSelected: (date: Date) => void
  onEndDateSelected: (date: Date) => void
  onStartTimeSelected: (date: Date) => void
  onEndTimeSelected: (date: Date) => void
  onApplyDateAndTimeFilters: () => void
  onResetDateAndTimeFilters: () => void
  onSetAppliedDateFilters: (newAppliedFilters: any) => void
  filterActive: boolean
}

const ClusterLogsV2Header = (props: IProps) => {
  const {
    classes,
    logGroups,
    levels,
    eventTypesFilter,
    selectedLogGroup,
    onSelectingLogGroup,
    onSelectingComponent,
    onSelectingLevel,
    onSelectingEventType,
    components,
    startTime,
    endDate,
    startDate,
    endTime,
    onStartDateSelected,
    onEndDateSelected,
    onStartTimeSelected,
    onEndTimeSelected,
    onApplyDateAndTimeFilters,
    onResetDateAndTimeFilters,
    filterActive,
    onSetAppliedDateFilters
  } = props

  const dropdownList =
    logGroups?.data?.map((item) => {
      return {
        label: `${getFormattedDateTimeForCompute(item.start_timestamp)} ${
          item.end_timestamp ? '/' : ''
        } ${getFormattedDateTimeForCompute(item.end_timestamp)}`,
        id: item
      }
    }) || []

  return (
    <div className={classes.container}>
      <div className={classes.left} data-testid='log-group-filter'>
        <Dropdown
          menuLists={dropdownList}
          label={'Log Group'}
          onChange={(ev, val) => {
            onSelectingLogGroup(val)
          }}
          dropDownValue={selectedLogGroup}
          fieldVariant='withOutline'
        />
      </div>
      <div className={classes.right}>
        <div className={classes.filterContainer}>
          <div className={classes.sectionTitle}>Filter by :</div>
          <div data-testid='level-filter'>
            <FilterDrop
              data={{
                name: 'Level',
                values: levels
              }}
              selectFilters={onSelectingLevel}
              data-testid='cluster-details-level-filter-drop'
            />
          </div>
          <div data-testid='timestamp-filter'>
            <DateTimeSelector
              filterName='Timestamp'
              startDate={startDate}
              endDate={endDate}
              startTime={startTime}
              endTime={endTime}
              onStartDateSelected={onStartDateSelected}
              onEndDateSelected={onEndDateSelected}
              onStartTimeSelected={onStartTimeSelected}
              onEndTimeSelected={onEndTimeSelected}
              onApplyDateAndTimeFilters={onApplyDateAndTimeFilters}
              onResetDateAndTimeFilters={onResetDateAndTimeFilters}
              filterActive={filterActive}
              onSetAppliedDateFilters={onSetAppliedDateFilters}
            />
          </div>
          <div data-testid='component-filter'>
            <FilterDrop
              data={{
                name: 'Component',
                values: components
              }}
              selectFilters={onSelectingComponent}
            />
          </div>
          <div data-testid='event-filter'>
            <FilterDrop
              data={{
                name: 'Events',
                values: eventTypesFilter
              }}
              selectFilters={onSelectingEventType}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const styleComponent = withStyles(styles, {withTheme: true})(
  ClusterLogsV2Header
)

export default styleComponent
