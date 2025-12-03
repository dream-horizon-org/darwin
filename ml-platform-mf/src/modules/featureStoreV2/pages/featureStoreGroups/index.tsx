import {CircularProgress, Divider} from '@mui/material'
import {withStyles, WithStyles} from '@mui/styles'
import React, {useCallback, useEffect, useRef, useState} from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
import {compose} from 'redux'
import FeatureGroupCard from '../../../../components/featureGroupCard/featureGroupCard'
import FeatureGroupsHeader from '../../../../components/featureStore/featureGroupsHeader'
import {pageResultCount} from '../../../../components/featureStore/featureGroupsHeader/constants'
import {routes} from '../../../../constants'
import {CommonState} from '../../../../reducers/commonReducer'
import {EventTypes, SeverityTypes} from '../../../../types/events.types'
import {API_STATUS} from '../../../../utils/apiUtils'
import {logEvent} from '../../../../utils/events'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  history: any
  match: any
  featureGroups: CommonState['featureGroupsReducer']['featureGroups']
}

const FeatureStoreGroups = (props: IProps) => {
  const {classes, featureGroups, match} = props
  const [featureGroupPageNumber, setFeatureGroupPageNumber] = useState(0)
  const lastPageNumber =
    Number(featureGroups.totalRecordsCount / pageResultCount) - 1

  const [lastElement, setLastElement] = useState(null)

  const observer = useRef(
    new IntersectionObserver((entries) => {
      const first = entries[0]
      if (first.isIntersecting) {
        setFeatureGroupPageNumber((no) => no + 1)
      }
    })
  )

  useEffect(() => {
    logEvent(EventTypes.FEATURE_STORE.LIST_OPEN, SeverityTypes.INFO)
  }, [])

  useEffect(() => {
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
    <div className={classes.container}>
      <div
        className={classes.pageTitle}
        data-testid='feature-store-heading-text'
      >
        Feature Store
      </div>
      <FeatureGroupsHeader
        match={match}
        featureGroupPageNumber={featureGroupPageNumber}
        resetPageNumber={() => setFeatureGroupPageNumber(0)}
      />
      <div className={classes.cardsContainer}>
        {featureGroups.status !== API_STATUS.ERROR &&
          (featureGroups.data || []).map((featureGroup, idx) => (
            <>
              <FeatureGroupCard
                featureGroup={featureGroup}
                key={featureGroup.id}
              />
              {idx === (featureGroups.data || []).length - 1 &&
                featureGroupPageNumber < lastPageNumber && (
                  <div ref={setLastElement}>...loading</div>
                )}
            </>
          ))}
      </div>
      <div className={classes.placeholder}>
        {featureGroups.status === API_STATUS.LOADING ? (
          <div
            className={classes.loader}
            data-testid='feature-group-listing-loader'
          >
            <CircularProgress size={60} />
          </div>
        ) : (
          ''
        )}
        {featureGroups.status === API_STATUS.ERROR
          ? 'Error! Failed to fetch records, try refreshing the page!'
          : ''}
        {featureGroups.status === API_STATUS.SUCCESS ? (
          <Divider className={classes.endDivider}>END</Divider>
        ) : (
          ''
        )}
      </div>
    </div>
  )
}

const mapStateToProps = (state: CommonState) => ({
  featureGroups: state.featureGroupsReducer.featureGroups
})

const mapDispatchToProps = (dispatch) => {
  return {}
}

const StyleComponent = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(FeatureStoreGroups)

export default StyleComponent
