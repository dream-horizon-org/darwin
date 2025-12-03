import {
  Box,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent
} from '@mui/material'
import Tooltip from '@mui/material/Tooltip'
import {withStyles, WithStyles} from '@mui/styles'
import config from 'config'
import React, {useState} from 'react'
import {connect} from 'react-redux'
import {useHistory} from 'react-router'
import {compose} from 'redux'
import {Chip} from '../../../bit-components/chip/index'
import {routes} from '../../../constants'
import {GetFeatureCopyCodesInput} from '../../../modules/featureStoreV2/graphqlAPIs/getFeatureCopyCodes'
import {getFeatureCopyCodes} from '../../../modules/featureStoreV2/graphqlAPIs/getFeatureCopyCodes/index.thunk'
import {setSelectedFeatures} from '../../../modules/featureStoreV2/pages/featureStoreGroupDetails/actions'
import {IFeatureGroupDetailsState} from '../../../modules/featureStoreV2/pages/featureStoreGroupDetails/reducer'
import {getIntialsFromEmail} from '../../../modules/workspace/utils'
import {CommonState} from '../../../reducers/commonReducer'
import {featureFlags} from '../../../utils/featureFlags'
import {getFormattedDateTimeForCompute} from '../../../utils/getDateString'
import {truncate} from '../../../utils/helper'
import BackButton from '../../backButton/backButton'
import MultiCopyCodeButton from '../../multiCopyCodeButton'
import {
  DESCRIPTION_SNIPPET_LENGTH,
  FEATURE_TYPES,
  TAGS_SNIPPET_LENGTH
} from './constants'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  featureGroupDetails: IFeatureGroupDetailsState['featureGroupDetails']
  selectedFeatures: IFeatureGroupDetailsState['selectedFeatures']
  setSelectedFeaturesFunc: (
    data: IFeatureGroupDetailsState['selectedFeatures']
  ) => any
  getFeatureCopyCodesFunc: (payload: GetFeatureCopyCodesInput) => void
}

const FeatureGroupDetailsHeader = (props: IProps) => {
  const {
    classes,
    featureGroupDetails,
    selectedFeatures,
    setSelectedFeaturesFunc,
    getFeatureCopyCodesFunc
  } = props
  const [showMoreDesc, setShowMoreDesc] = useState(false)
  const [showMoreTags, setShowMoreTags] = useState(false)
  const history = useHistory()
  const onBackArrowClickHandler = (ev: React.MouseEvent<HTMLButtonElement>) => {
    history.goBack()
    ev.stopPropagation()
    ev.preventDefault()
  }
  const switchType = (
    type: IFeatureGroupDetailsState['featureGroupDetails']['data']['type']
  ) => {
    setSelectedFeaturesFunc([])
    history.replace(
      routes.feature
        .replaceAll(':id', featureGroupDetails.data?.id)
        .replaceAll(':version', `${featureGroupDetails.data?.version}`)
        .replaceAll(':type', type)
        .replaceAll(':tab', '0')
    )
  }
  const handleVersionChange = (event: SelectChangeEvent<number>) => {
    setSelectedFeaturesFunc([])
    history.replace(
      routes.feature
        .replaceAll(':id', featureGroupDetails.data?.id)
        .replaceAll(':version', event.target.value.toString())
        .replaceAll(':type', `${featureGroupDetails.data?.type}`)
        .replaceAll(':tab', '0')
    )
  }

  const featureDescriptionSnippet =
    featureGroupDetails.data?.description?.substring(
      0,
      DESCRIPTION_SNIPPET_LENGTH
    ) || ''
  const featureDescription =
    featureGroupDetails.data?.description?.substring(
      DESCRIPTION_SNIPPET_LENGTH
    ) || ''

  const tags = featureGroupDetails.data?.tags || []

  return (
    <div className={classes.container}>
      <div className={classes.row1}>
        <div className={classes.col1}>
          <BackButton mode='route' to={routes.featureGroupList} />
        </div>
        <div className={classes.col2}>
          <div className={classes.titleContainer}>
            <div className={classes.title}>
              {featureGroupDetails.data?.title || '...'}
            </div>
            <div className={classes.type}>
              {featureGroupDetails.data?.typesAvailable.length > 1 ? (
                <>
                  <div
                    onClick={() => switchType(FEATURE_TYPES.ONLINE)}
                    className={`${classes.typeLeft} ${
                      featureGroupDetails.data?.type === FEATURE_TYPES.ONLINE
                        ? 'selected'
                        : ''
                    }`}
                  >
                    {FEATURE_TYPES.ONLINE}
                  </div>
                  <div
                    onClick={() => switchType(FEATURE_TYPES.OFFLINE)}
                    className={`${classes.rightLeft} ${
                      featureGroupDetails.data?.type === FEATURE_TYPES.OFFLINE
                        ? 'selected'
                        : ''
                    }`}
                  >
                    {FEATURE_TYPES.OFFLINE}
                  </div>
                </>
              ) : (
                <div className={classes.typeSingleSelected}>
                  {featureGroupDetails.data?.type}
                </div>
              )}
            </div>
            <div className={classes.versions}>
              {featureGroupDetails.data?.allVersions.length > 1 ? (
                <FormControl
                  sx={{width: 55, height: 24, fontSize: '12px'}}
                  size='small'
                >
                  <Select
                    sx={{
                      width: 55,
                      height: 24,
                      fontSize: '12px',
                      padding: '0px'
                    }}
                    labelId='version-select'
                    id='version-select'
                    value={featureGroupDetails.data?.version || 0}
                    onChange={handleVersionChange}
                  >
                    {featureGroupDetails.data?.allVersions.map((v, idx) => (
                      <MenuItem sx={{fontSize: '14px'}} key={`V${v}`} value={v}>
                        V{v}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <div className={classes.singleVersion}>
                  V{featureGroupDetails.data?.version}
                </div>
              )}
            </div>
          </div>
          <div className={classes.descriptionContainer}>
            {(!showMoreDesc
              ? featureDescriptionSnippet
              : featureDescriptionSnippet + featureDescription
            ).trim()}
            {!showMoreDesc && featureDescription?.length ? '...' : '.'}
            {featureDescription?.length ? (
              <span onClick={() => setShowMoreDesc(!showMoreDesc)}>
                {!showMoreDesc ? 'View more' : 'View less'}
              </span>
            ) : null}
          </div>
          {tags.length > 0 ? (
            <div className={classes.tagsContainer}>
              {tags
                .slice(0, showMoreTags ? tags.length : TAGS_SNIPPET_LENGTH)
                .map((tag) => {
                  return (
                    <Tooltip title={tag.length > 25 ? tag : ''}>
                      <Box
                        key={tag}
                        component='div'
                        sx={{
                          marginLeft: '4px',
                          marginTop: '4px',
                          display: 'inline-block'
                        }}
                      >
                        <Chip
                          key={tag}
                          label={truncate(tag, 25)}
                          disabled={true}
                        />
                      </Box>
                    </Tooltip>
                  )
                })}
              {tags.length > TAGS_SNIPPET_LENGTH ? (
                <span
                  className={classes.tagsShowMore}
                  onClick={() => setShowMoreTags(!showMoreTags)}
                >
                  {showMoreTags ? (
                    'View less'
                  ) : (
                    <>+{tags.length - TAGS_SNIPPET_LENGTH} more</>
                  )}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className={classes.col3}>
          <div className={classes.avatarCopyCodeCotainer}>
            <Tooltip title={featureGroupDetails.data?.createdBy}>
              <div className={classes.avatar}>
                {getIntialsFromEmail(featureGroupDetails.data?.createdBy)}
              </div>
            </Tooltip>

            {featureGroupDetails.data?.copyCode.length > 0 ? (
              <MultiCopyCodeButton
                copyCodes={featureGroupDetails.data?.copyCode}
                setSelectedFeatures={setSelectedFeaturesFunc}
                selectedFeatures={selectedFeatures}
                handleCopy={(copyCode: string) => {
                  if (copyCode && selectedFeatures.length > 0) {
                    getFeatureCopyCodesFunc({
                      featureDataSourceId: copyCode,
                      featureTitles: selectedFeatures.map((f) => f.title),
                      featureGroupName: featureGroupDetails.data?.title
                    })
                  }
                }}
              />
            ) : null}
          </div>

          {featureFlags.FEATURE_STORE.DETAILS_PAGE.LAST_UPDATED_AT &&
            featureGroupDetails?.data?.lastValueUpdated && (
              <div className={classes.updatedAt}>
                <img
                  src={`${config.cfMsdAssetUrl}/icons/time-icon.svg`}
                  alt='Dev Usage Icon'
                  className={classes.time}
                />
                Last value updated:{' '}
                {getFormattedDateTimeForCompute(
                  featureGroupDetails.data.lastValueUpdated
                )}
              </div>
            )}
        </div>
      </div>
      <div className={classes.row2}></div>
    </div>
  )
}

const mapStateToProps = (state: CommonState) => ({
  featureGroupDetails: state.featureGroupDetailsReducer.featureGroupDetails,
  selectedFeatures: state.featureGroupDetailsReducer.selectedFeatures
})

const mapDispatchToProps = (dispatch) => {
  return {
    setSelectedFeaturesFunc: (
      data: IFeatureGroupDetailsState['selectedFeatures']
    ) => dispatch(setSelectedFeatures(data)),
    getFeatureCopyCodesFunc: (payload: GetFeatureCopyCodesInput) =>
      getFeatureCopyCodes(dispatch, payload)
  }
}

const StyleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(FeatureGroupDetailsHeader)

export default StyleComponent
