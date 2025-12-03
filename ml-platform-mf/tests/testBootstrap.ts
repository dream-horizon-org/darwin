import '@testing-library/jest-dom'
import Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import 'jest-enzyme'
import * as redux from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {mockGql} from '../src/utils/mockGql'

const globalAny: any = global
Object.defineProperty(globalAny.self, 'crypto', {
  value: {
    subtle: {
      digest: () => ''
    }
  }
})

beforeEach(() => {
  localStorage.setItem('x-access-token', '2222')
  localStorage.setItem('permissionToken', '3333')
})

jest.mock('../src/utils/gqlRequest', () => ({
  gqlRequest: mockGql
}))

export const mockStore = configureMockStore([thunk])
Enzyme.configure({adapter: new Adapter()})

function findAction(store, type) {
  return store.getActions().find((action) => action.type === type)
}

/**
 * This function Listens the actio see example below:
 * @example
 * getAction(store, SET_TOUR_LIST_LOADING) //it return promise
 *
 * @param {mockStore, type} mockStore: object argument Store on which is subscribed
 * type: string argument which is listened
 */

export function getAction(store, type) {
  let action = findAction(store, type)
  if (action) {
    return Promise.resolve(action)
  }

  return new Promise((resolve) => {
    store.subscribe(() => {
      action = findAction(store, type)
      if (action) {
        resolve(action)
      }
    })
  })
}

class LocalStorageMock {
  public store: any

  constructor() {
    this.store = {}
  }

  public clear() {
    this.store = {}
  }

  public getItem(key) {
    return this.store[key] || null
  }

  public setItem(key, value) {
    this.store[key] = value.toString()
  }

  public removeItem(key) {
    delete this.store[key]
  }
}

Object.defineProperty(window, 'localStorage', {value: new LocalStorageMock()})

export class FetchMockClass {
  public config = {
    status: 200,
    returnBody: {success: true}
  }
  private static instance

  public static getInstance() {
    if (!this.instance) {
      this.instance = new FetchMockClass()
    }
    return this.instance
  }

  constructor() {
    window.fetch = jest.fn().mockImplementation(
      () =>
        new Promise((resolve, reject) => {
          if (this.config.status === 200) {
            resolve({
              ok: true,
              status: this.config.status,
              json: () => (this.config.returnBody ? this.config.returnBody : {})
            })
          } else {
            /* eslint-disable prefer-promise-reject-errors */
            reject({
              ok: true,
              status: this.config.status,
              json: () => (this.config.returnBody ? this.config.returnBody : {})
            })
            /* eslint-enable prefer-promise-reject-errors */
          }
        })
    )
  }

  public setMockConfig = (config) => {
    this.config = config
  }

  public getMockConfig() {
    return this.config
  }
}

export const File = class MockFile {
  name: string

  constructor(
    parts: (string | Blob | ArrayBuffer | ArrayBufferView)[],
    filename: string,
    properties?: FilePropertyBag
  ) {
    this.name = filename
  }
}

// mock useDispatch
export const mockUseDispatch = () => {
  const useDispatchSpy = jest.spyOn(redux, 'useDispatch')
  beforeEach(() => {
    useDispatchSpy.mockClear()
  })
  const mockDispatchFn = jest.fn()
  useDispatchSpy.mockReturnValue(mockDispatchFn)
  return mockDispatchFn
}

// mock useSelector
export const mockUseSelector = (mockState) => {
  const useSelectorSpy = jest.spyOn(redux, 'useSelector')
  beforeEach(() => {
    useSelectorSpy.mockClear()
  })
  useSelectorSpy.mockReturnValue(mockState)
}
