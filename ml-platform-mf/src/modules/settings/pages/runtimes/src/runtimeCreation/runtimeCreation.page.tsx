import {WithStyles, withStyles} from '@mui/styles'
import React, {useCallback, useEffect, useState} from 'react'
import {useHistory, useLocation} from 'react-router-dom'
import {
  ActionableIconButtonVariants,
  IconButton
} from '../../../../../../bit-components/icon-button/index'
import {Icons} from '../../../../../../bit-components/icon/index'
import styles from './runtimeCreationJSS'

import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import ReportGmailerrorredOutlinedIcon from '@mui/icons-material/ReportGmailerrorredOutlined'
import {Button} from '@mui/material'
import {Controller, useForm} from 'react-hook-form'
import {useDispatch} from 'react-redux'
import {setShowGlobalSpinner} from '../../../../../../actions/commonActions'
import {Input} from '../../../../../../bit-components/input/index'
import BackButton from '../../../../../../components/backButton/backButton'
import {routes} from '../../../../../../constants'
import {usePreventNavigation} from '../../../../../../hooks'
import {EventTypes, SeverityTypes} from '../../../../../../types/events.types'
import {logEvent} from '../../../../../../utils/events'
import {useGQL} from '../../../../../../utils/useGqlRequest'
import {FilePicker} from '../../../../components'
import {
  CreateRuntime,
  CreateRuntimeInput
} from '../../../../graphqlApi/runtimes/createRuntime'
import {CreateRuntimeSchema} from '../../../../graphqlApi/runtimes/createRuntime/index.gqlTypes'
import {GQL as CreateRuntimeGQL} from '../../../../graphqlApi/runtimes/createRuntime/indexGql'
import {dockerFileString} from './runtimeCreation.helper'
interface CreateRuntimeForm {
  runtimeName: string
  dockerFile: File
}

interface IProps extends WithStyles<typeof styles> {}

const RuntimeCreationPage = (props: IProps) => {
  const {classes} = props
  const history = useHistory()
  const location = useLocation()
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null)
  const dispatch = useDispatch()
  const CUSTOM_RUNTIMES_ROOT_PATH = `${routes.settings}/runtimes`
  const goBack = () => {
    // This value will be undefined if the user directly lands on the page
    if (location?.key) {
      history.goBack()
    } else {
      history.push(CUSTOM_RUNTIMES_ROOT_PATH)
    }
  }
  const {bypassGuard} = usePreventNavigation(
    'Are you sure?',
    'Are you sure you want to exit ? You will lose all unsaved changes.'
  )

  const createRuntimeForm = useForm<CreateRuntimeForm>({
    defaultValues: {
      runtimeName: '',
      dockerFile: null
    },
    mode: 'onChange'
  })

  const {
    output: {
      response: createRuntimeResponse,
      loading: createRuntimeLoading,
      errors: createRuntimeErrors
    },
    triggerGQLCall: triggerCreateRuntime
  } = useGQL<CreateRuntimeInput, CreateRuntime>()

  const createRuntime = useCallback((input: CreateRuntimeInput) => {
    return triggerCreateRuntime(
      {
        ...CreateRuntimeGQL,
        variables: input
      },
      CreateRuntimeSchema
    )
  }, [])

  useEffect(() => {
    logEvent(EventTypes.CUSTOM_RUNTIME.CREATE_OPEN, SeverityTypes.INFO)
  }, [])

  useEffect(() => {
    if (createRuntimeResponse) {
      if (
        createRuntimeResponse.createRuntime.is_unique &&
        createRuntimeResponse.createRuntime.status === 'SUCCESS'
      ) {
        bypassGuard(
          `/settings/runtimes/details/${
            createRuntimeForm.getValues().runtimeName
          }`
        )
      } else if (!createRuntimeResponse?.createRuntime?.is_unique) {
        createRuntimeForm.setError('runtimeName', {
          type: 'validate',
          message: 'Runtime name already exists'
        })
      } else if (createRuntimeResponse.createRuntime.status === 'FAILED') {
        setFormErrorMessage(createRuntimeResponse?.createRuntime?.message || '')
      }
    } else if (createRuntimeErrors) {
      setFormErrorMessage('Something went wrong')
    }
  }, [createRuntimeResponse, createRuntimeErrors])

  useEffect(() => {
    dispatch(setShowGlobalSpinner(createRuntimeLoading))
  }, [createRuntimeLoading])

  const onSubmit = async (data: CreateRuntimeForm) => {
    setFormErrorMessage(null)
    const runtimeName = data.runtimeName
    await dockerFileString(data.dockerFile)
      .then((dockerString) => {
        createRuntime({
          runtimeName: runtimeName,
          dockerFile: dockerString
        })
      })
      .catch((err) => {
        setFormErrorMessage('Content of the file could not be read')
      })
  }
  return (
    <div className={classes.container}>
      <div className={classes.headerContainer}>
        <div className={classes.iconContainer}>
          <BackButton mode='route' to={CUSTOM_RUNTIMES_ROOT_PATH} />
        </div>
        <h1 className={classes.pageTitle}>Add Runtime</h1>
      </div>
      <form
        className={classes.contentContainer}
        onSubmit={createRuntimeForm.handleSubmit(onSubmit)}
        id='add-runtime-form'
      >
        <div className={classes.runtimeNameContainer}>
          <h1 className={classes.runtimeNameLabel}>Name</h1>
          <Controller
            control={createRuntimeForm.control}
            name='runtimeName'
            rules={{
              required: {
                value: true,
                message: 'Runtime name is required'
              },
              validate: {
                doesNotStartWithSpecialCharacter: (value: string) => {
                  if (value.match(/^[a-zA-Z]/)) {
                    return true
                  }
                  return 'Runtime name should start with a letter'
                },
                doesNotContainSpecialCharacter: (value: string) => {
                  if (value.match(/^[a-zA-Z0-9._-\s]+$/)) {
                    return true
                  }
                  return 'Runtime name should contain only letters, numbers, underscores, periods and hyphens'
                },
                doesNotContainSpace: (value: string) => {
                  if (!value.match(/\s/)) {
                    return true
                  }
                  return 'Runtime name should not contain spaces'
                }
              },
              maxLength: {
                value: 128,
                message: 'Runtime name should be less than 128 characters'
              }
            }}
            render={({field, fieldState}) => (
              <Input
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error && true}
                label='Runtime name'
                showLabelAsPlaceHolder
                data-testid='runtime-name-input'
              />
            )}
          />
          {createRuntimeForm.formState.errors.runtimeName && (
            <p className={classes.errorText}>
              {createRuntimeForm.formState.errors.runtimeName.message}
            </p>
          )}
        </div>
        <Controller
          control={createRuntimeForm.control}
          name='dockerFile'
          rules={{
            required: {
              value: true,
              message: 'Docker file is required'
            },
            validate: {
              value: (value: File) => {
                if (value.type !== '') {
                  return 'Invalid file type'
                }
                if (value.size > 15000) {
                  return 'File size should be less than 15KB'
                }

                return true
              }
            }
          }}
          render={({field, fieldState}) => (
            <FilePicker
              name={field.name}
              file={field.value}
              onFileChange={(file) => {
                field.onChange(file)
              }}
              buttonText='Upload Docker File'
              errorOptions={{
                showError: true,
                errorMessage: fieldState.error?.message
              }}
              fileSizeType='KB'
              dataTestId='docker-file-input'
            />
          )}
        />
        {formErrorMessage && (
          <div className={classes.formErrorContainer}>
            <ReportGmailerrorredOutlinedIcon className={classes.errorIcon} />
            <p className={classes.formErrorText}>{formErrorMessage}</p>
            <CloseOutlinedIcon
              className={classes.closeIcon}
              onClick={() => setFormErrorMessage(null)}
            />
          </div>
        )}
      </form>

      <div className={classes.footerContainer}>
        <Button onClick={goBack} variant='text' size='small'>
          CANCEL
        </Button>
        <Button
          onClick={createRuntimeForm.handleSubmit(onSubmit)}
          type='submit'
          variant='contained'
          size='small'
          disableRipple
          disabled={createRuntimeLoading}
          data-testid='add-runtime-button'
        >
          ADD RUNTIME
        </Button>
      </div>
    </div>
  )
}

const StyledComponent = withStyles(styles, {withTheme: true})(
  RuntimeCreationPage
)

export default StyledComponent
