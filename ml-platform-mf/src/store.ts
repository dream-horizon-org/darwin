import {
  AnyAction,
  applyMiddleware,
  combineReducers,
  createStore,
  Reducer,
  ReducersMapObject,
  Store
} from 'redux'
import {composeWithDevTools} from 'redux-devtools-extension'
import logger from 'redux-logger'
import thunk, {ThunkDispatch} from 'redux-thunk'
import {staticReducersObj} from './static-reducers'

export interface RootState {}

export type InjectableStore = Store<RootState, AnyAction> & {
  injectPageReducers?: (reducersToInject: {
    [k in string]: Reducer
  }) => void
  asyncReducers?: Partial<ReducersMapObject<RootState, AnyAction>>
} & {
  dispatch: ThunkDispatch<unknown, void, AnyAction>
}

const staticReducers: ReducersMapObject<RootState, AnyAction> = {
  ...staticReducersObj
}

export const initStore = (): InjectableStore => {
  const middleware = [thunk]
  if (
    process.env.NODE_ENV !== 'test' &&
    process.env.NODE_ENV !== 'production'
  ) {
    middleware.push(logger)
  }

  const middlewareEnhancer = applyMiddleware<
    ThunkDispatch<unknown, void, AnyAction>
  >(...middleware)
  const composedEnhancer = composeWithDevTools(middlewareEnhancer)

  const store: InjectableStore = createStore(createReducer(), composedEnhancer)
  store.asyncReducers = {}

  store.injectPageReducers = (reducersToInject: {
    [k in string]: Reducer
  }) => {
    store.asyncReducers = {}
    store.replaceReducer(createReducer(store.asyncReducers))
  }

  return store
}

function createReducer(
  asyncReducers: Partial<ReducersMapObject<RootState, AnyAction>> = {}
) {
  return combineReducers({
    ...staticReducers,
    ...asyncReducers
  })
}

const store = initStore()

export type StoreState = ReturnType<typeof store.getState>

export default store
