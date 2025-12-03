import {render} from 'enzyme'
import React from 'react'
import {Provider} from 'react-redux'
import {BrowserRouter as Router} from 'react-router-dom'
import {mockStore} from '../../../tests/testBootstrap'
import Welcome from './welcome'

const store = mockStore({
  isMasterLoginEnabled: true
})
describe('Welcome', () => {
  test('should render', () => {
    const component = render(
      <Provider store={store}>
        <Router>
          <Welcome />
        </Router>
      </Provider>
    )
    expect(component).toMatchSnapshot()
  })
})
