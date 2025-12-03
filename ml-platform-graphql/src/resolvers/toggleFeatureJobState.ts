import * as R from 'ramda'

export const toggleFeatureJobState = (io) => (current, args, request) => {
  const newArgs = R.prop('input')(args)
  return request.HTTP.patch(
    `/mlp/feature-job/v0/toggle`,
    R.merge({service: 'FEATURE_STORE'}, request.headers),
    newArgs
  )
}
