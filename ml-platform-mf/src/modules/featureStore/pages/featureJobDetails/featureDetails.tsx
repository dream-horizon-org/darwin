import config from 'config'
import React, {useEffect, useState} from 'react'
import {RouteComponentProps} from 'react-router-dom'

import {Breadcrumb} from '../../../../components/breadcrumb/breadcrumb'
import Spinner from '../../../../components/spinner/spinner'
import {routes} from '../../../../constants'
import {useGQL} from '../../../../utils/useGqlRequest'
import {SampleSetDialog} from './dialogs/sampleSetDialog'
import {VersionHistoryDialog} from './dialogs/versionHistoryDialog/versionHistoryDialog'
import {styles} from './featureDetailsJss'
import {
  FetchFeatureGroup,
  FetchFeatureGroupInput,
  SelectionOnSinks,
  SelectionOnSources
} from './fetchFeatureGroup'
import {FetchFeatureGroupSchema} from './fetchFeatureGroup.gqlTypes'
import {GQL as featureGroupGql} from './fetchFeatureGroupGql'
import {FeatureDefinition} from './sections/featureDefinition'
import Header from './sections/header/header'
import {OutputSchema} from './sections/outputSchema'
import SourcesList from './sections/sourcesList/sourcesList'
import {Transformation} from './sections/transformation'
import {isListNotEmpty} from './utils'

interface MatchParams {
  featureGroupName: string
  version: string
}

interface IProps extends RouteComponentProps<MatchParams> {}

const FeatureDetails = (props: IProps) => {
  const {history, match} = props
  const {featureGroupName} = match.params
  const version = Number(match.params.version)
  const [sampleSetDialogOpen, setSampleSetDialogOpen] = useState(false)
  const [versionHistoryDialogOpen, setVersionHistoryDialogOpen] =
    useState(false)

  const {
    output: {response: featureGroupResponse, loading = true},
    triggerGQLCall: triggerFeatureGroupGQLCall
  } = useGQL<FetchFeatureGroupInput, FetchFeatureGroup>()

  const [featureGroupResponseLoading, setFeatureGroupResponseLoading] =
    useState(true)

  useEffect(() => {
    if (featureGroupResponse) {
      setFeatureGroupResponseLoading(false)
    }
  }, [featureGroupResponse])

  useEffect(() => {
    setFeatureGroupResponseLoading(true)
    const variables = {featureGroupName, version}
    triggerFeatureGroupGQLCall(
      {...featureGroupGql, variables},
      FetchFeatureGroupSchema
    )
  }, [])

  const redirectToFeatureJobsPage = () =>
    history.push({
      pathname: `${routes.featureJobsListingPage}`
    })

  const toggleVersionHistoryDialog = () =>
    setVersionHistoryDialogOpen(!versionHistoryDialogOpen)

  const toggleSampleSetDialog = () =>
    setSampleSetDialogOpen(!sampleSetDialogOpen)

  const classes = styles({
    state: featureGroupResponse?.fetchFeatureGroup?.data?.featureGroup?.status
  })

  const isSourceNotEmpty = (
    source: SelectionOnSources | SelectionOnSinks
  ): boolean => {
    return Boolean(
      source && Object.values(source).some((data) => isListNotEmpty(data))
    )
  }

  const displaySourceList = (
    sectionTitle: string,
    sources: SelectionOnSources | SelectionOnSinks
  ) =>
    isSourceNotEmpty(sources) && (
      <SourcesList sectionTitle={sectionTitle} sources={sources} />
    )

  return (
    <div className={classes.pageContent}>
      {featureGroupResponseLoading ? (
        <Spinner show={loading} />
      ) : (
        <>
          <div className={classes.linkContainer}>
            <Breadcrumb
              onLinkClick={redirectToFeatureJobsPage}
              currentLink={'Feature Group'}
              linkList={[
                {
                  path: '',
                  label: 'Feature Store'
                }
              ]}
            />
          </div>
          {!featureGroupResponse?.fetchFeatureGroup?.data?.featureGroup ? (
            <h2>Feature Job Not Found</h2>
          ) : (
            <>
              <div className={classes.actionsContainer}>
                <Header
                  featureGroupName={
                    featureGroupResponse?.fetchFeatureGroup?.data?.featureGroup
                      ?.name
                  }
                  featureGroupStatus={
                    featureGroupResponse?.fetchFeatureGroup?.data?.featureGroup
                      ?.status
                  }
                  version={version}
                  toggleVersionHistoryDialog={toggleVersionHistoryDialog}
                  history={history}
                />
              </div>
              <FeatureDefinition
                featureGroupDetails={
                  featureGroupResponse?.fetchFeatureGroup?.data?.featureGroup
                }
              />
              {displaySourceList(
                'Sources',
                featureGroupResponse?.fetchFeatureGroup?.data?.featureGroup
                  .sources
              )}
              {displaySourceList(
                'Sinks',
                featureGroupResponse?.fetchFeatureGroup?.data?.featureGroup
                  .sinks
              )}
              <Transformation
                featureGroupInfo={
                  featureGroupResponse?.fetchFeatureGroup?.data?.featureGroup
                }
              />
              <OutputSchema
                outputSchemaList={
                  featureGroupResponse?.fetchFeatureGroup?.data?.featureGroup
                    ?.features
                }
              />
            </>
          )}
          {sampleSetDialogOpen && (
            <SampleSetDialog
              onClose={toggleSampleSetDialog}
              isOpen={sampleSetDialogOpen}
            />
          )}
          {versionHistoryDialogOpen && (
            <VersionHistoryDialog
              featureGroupName={featureGroupName}
              onClose={toggleVersionHistoryDialog}
              isOpen={versionHistoryDialogOpen}
            />
          )}
        </>
      )}
    </div>
  )
}
export default FeatureDetails
