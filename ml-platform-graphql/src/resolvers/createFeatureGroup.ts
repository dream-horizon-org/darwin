import * as R from 'ramda'

export const createFeatureGroup = (io) => (current, args, request) => {
  const newArgs = R.prop('input')(args)
  return request.HTTP.post(
    '/mlp/feature-job/v0/',
    R.merge({service: 'FEATURE_STORE'}, request.headers),
    newArgs
  )
}
