import {assert} from 'chai'
import {featureGroupDetailsParser} from './featureGroupDetailsParser'
import {
  featureGroupDetailsAPIData,
  featureGroupDetailsParsedResponse,
} from './mock/featureGroupDetailsData'

describe('convert the response in proper format', () => {
  it('should convert the response in proper format', () => {
    assert.deepEqual(
      featureGroupDetailsParser(featureGroupDetailsAPIData),
      featureGroupDetailsParsedResponse
    )
  })
})
