import * as E from 'fp-ts/lib/Either'
import {TypeC} from 'io-ts'
import {useState} from 'react'
import {useDispatch} from 'react-redux'
import {setSnackBar} from '../actions/commonActions'
import {GQLResponse} from '../types/gql.type'
import {GQLParams, gqlRequestTyped} from './gqlRequestTyped'

type Output<R> = {
  loading: boolean
  response: R
  errors: object
}

export const useGQL = <T, R>() => {
  const [output, setOutput] = useState<Output<R>>({
    loading: null,
    response: null,
    errors: null
  })
  const dispatch = useDispatch()

  const validateResponseType = (type, data) => E.isRight(type.decode(data))
  const updateState = (newState) =>
    setOutput((prevState) => ({...prevState, ...newState}))
  const renderSnackbar = (message) =>
    dispatch(
      setSnackBar({
        open: true,
        message,
        severity: 'error',
        closeSnackBar: () => setSnackBar({open: false})
      })
    )

  const triggerGQLCall = (
    gql: GQLParams<T>, // GQL query, name and variables
    type: TypeC<any>, // Type check the response at runtime
    conditional: boolean = true // Constraint GQL call based on condition
  ) => {
    if (!conditional) return
    updateState({loading: true})
    gqlRequestTyped<T, R>(gql)
      .then((res: GQLResponse<R>) => {
        const {data, errors} = res
        if (errors && errors.length) {
          renderSnackbar(
            errors[0] && errors[0].error
              ? errors[0].error
              : 'Something Went Wrong'
          )
          updateState({errors, loading: false})
        } else {
          const valid = validateResponseType(type, data)
          if (valid) updateState({loading: false, response: data})
          else {
            renderSnackbar('Invalid Response!')
            updateState({loading: false, errors: {validationError: true}})
          }
        }
      })
      .catch((errors) => {
        renderSnackbar('Something Went Wrong')
        updateState({errors, loading: false})
      })
  }

  // const clearErrors = () => {
  // 	updateState({ errors: null })
  // }

  // const clearResponse = () => {
  // 	updateState({ response: null })
  // }

  return {output, triggerGQLCall}
}
