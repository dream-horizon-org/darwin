import path from 'path'
import {v4 as uuidv4} from 'uuid'
import * as yup from 'yup'
import {LibrarySource} from '../../gql-enums/library-source.enum'
import {IWorkflowTaskForm} from './types/common.types'
import {IWorkflowCreateForm} from './types/common.types'

function checkWorkflowNameUniqueValidation(value) {
  const isUnique = this.resolve(yup.ref('isWorkflowNameUnique')) as boolean
  if (!isUnique) {
    return false
  }
  return true
}

function checkWorkspacePathValidation(value) {
  const source = this.resolve(yup.ref('source')) as string
  if (source === sourceTypes[0].value && !value) {
    return false
  }
  return true
}

function checkGitRepoValidation(value) {
  const source = this.resolve(yup.ref('source')) as string
  if (source === sourceTypes[1].value && !value) {
    return false
  }
  return true
}

function checkFilePathValidation(value) {
  const source = this.resolve(yup.ref('source')) as string
  if (source === sourceTypes[1].value && !value) {
    return false
  }
  return true
}

function libraryWorkspacePathValidation(value) {
  if (!value) {
    return new yup.ValidationError(
      'Workspace path is mandatory',
      value,
      'workspacePath'
    )
  }
  if (value && !/\.(txt|jar|whl|zip|tar)$/.test(value)) {
    return new yup.ValidationError('Invalid file type', value, 'workspacePath')
  }
  return true
}

function S3PathValidation(value) {
  if (!value) {
    return new yup.ValidationError('s3 path is mandatory', value, 'filePath')
  }
  if (value && !/\.(txt|zip|tar|jar|whl)$/.test(value)) {
    return new yup.ValidationError(
      'Invalid Library Type. Please enter the appropriate file path for the specified Library Type.',
      value,
      'filePath'
    )
  }
  return true
}

function PyPIPathValidation(packageName, indexName) {
  if (!packageName) {
    return new yup.ValidationError(
      'Package is mandatory',
      packageName,
      'Package'
    )
  }
  return true
}

function mavenPathValidation(coordinates, repository) {
  if (!coordinates) {
    return new yup.ValidationError(
      'Coordinates is mandatory',
      coordinates,
      'coordinates'
    )
  } else if (!repository) {
    return new yup.ValidationError(
      'Repository is mandatory',
      repository,
      'repository'
    )
  } else if (coordinates) {
    if (coordinates.split(':').length !== 3) {
      return new yup.ValidationError(
        'Invalid coordinates',
        coordinates,
        'coordinates'
      )
    }
  }
  return true
}

export const computeInstallLibrarySchema = yup.object().shape({
  librarySource: yup
    .string()
    .test(
      'validLibrarySource',
      'Library Source is mandatory',
      function (value) {
        if (this.parent.librarySource === LibrarySource.s3) {
          return S3PathValidation(this.parent.filePath)
        } else if (this.parent.librarySource === LibrarySource.workspace) {
          return libraryWorkspacePathValidation(this.parent.workspacePath)
        } else if (this.parent.librarySource === LibrarySource.pypi) {
          return PyPIPathValidation(this.parent.Package, this.parent.indexName)
        } else if (this.parent.librarySource === LibrarySource.maven) {
          return mavenPathValidation(
            this.parent.coordinates,
            this.parent.repository
          )
        }
        return false
      }
    )
})

function checkParameterValidation(value, ctx, context) {
  if (!value) return true

  const parameters =
    context.parent && context.from ? context.from[1].value.parameters : []

  const currentPath = ctx.path
  const matches = currentPath.match(/\[(\d+)\]/)
  const currentIndex = matches ? parseInt(matches[1]) : null

  const occurrences = parameters.filter(
    (param) => param && param.label === value.label
  ).length

  if (occurrences <= 1) {
    return true
  }

  return ctx.createError({
    message: `Label must be unique`,
    path: `parameters.${currentIndex}.label`
  })
}

const checkInputParameterValidation = (value, ctx, context) => {
  if (!value) return true

  const parameters =
    context.parent && context.from ? context.from[1].value.parameters : []

  const currentPath = ctx.path
  const matches = currentPath.match(/\[(\d+)\]/)
  const currentIndex = matches ? parseInt(matches[1]) : null

  const occurrences = parameters.filter(
    (param) => param && param.label === value.label
  ).length

  if (occurrences <= 1) {
    return true
  }

  return ctx.createError({
    message: `Label must be unique`,
    path: `${context.path}.label`
  })
}

const scheduleSchema = yup
  .object()
  .shape({
    minutes: yup
      .string()
      .nullable()
      .test('isValidCronMinute', 'Invalid cron minute', function (value) {
        if (!value) return true

        const isValid =
          /^(\*|[1-5]?[0-9](-[1-5]?[0-9])?)(\/[1-9][0-9]*)?(,(\*|[1-5]?[0-9](-[1-5]?[0-9])?)(\/[1-9][0-9]*)?)*$/.test(
            value
          )
        return isValid
      }),
    hours: yup
      .string()
      .nullable()
      .test('isValidCronHour', 'Invalid cron hour', function (value) {
        if (!value) return true

        const isValid =
          /^(\*|(1?[0-9]|2[0-3])(-(1?[0-9]|2[0-3]))?)(\/[1-9][0-9]*)?(,(\*|(1?[0-9]|2[0-3])(-(1?[0-9]|2[0-3]))?)(\/[1-9][0-9]*)?)*$/.test(
            value
          )
        return isValid
      }),
    dayOfMonth: yup
      .string()
      .nullable()
      .test('isValidCronDay', 'Invalid cron day of month', function (value) {
        if (!value) return true

        const isValid =
          /^(\*|([1-9]|[1-2][0-9]?|3[0-1])(-([1-9]|[1-2][0-9]?|3[0-1]))?)(\/[1-9][0-9]*)?(,(\*|([1-9]|[1-2][0-9]?|3[0-1])(-([1-9]|[1-2][0-9]?|3[0-1]))?)(\/[1-9][0-9]*)?)*$/.test(
            value
          )
        return isValid
      }),
    month: yup
      .string()
      .nullable()
      .test('isValidCronMonth', 'Invalid cron month', function (value) {
        if (!value) return true

        const isValid =
          /^(\*|([1-9]|1[0-2]?)(-([1-9]|1[0-2]?))?)(\/[1-9][0-9]*)?(,(\*|([1-9]|1[0-2]?)(-([1-9]|1[0-2]?))?)(\/[1-9][0-9]*)?)*$/.test(
            value
          )
        return isValid
      }),
    dayOfWeek: yup
      .string()
      .nullable()
      .test('isValidCronWeek', 'Invalid cron day of week', function (value) {
        if (!value) return true

        const isValid =
          /^(\*|[0-6](-[0-6])?)(\/[1-9][0-9]*)?(,(\*|[0-6](-[0-6])?)(\/[1-9][0-9]*)?)*$/.test(
            value
          )
        return isValid
      })
  })
  .required('Correct Schedule is required')

export const workflowUpdateScheduleSchema = yup.object({
  schedule: scheduleSchema
})

export const workflowUpdateMaxRunsSchema = yup.object({
  maxConcurrentRuns: yup
    .number()
    .required('Max concurrent runs is mandatory')
    .min(0, 'Max concurrent runs cannot be negative')
})

export const workflowUpdateRetriesSchema = yup.object({
  numberOfRetries: yup
    .number()
    .required('Number of retries is mandatory')
    .min(0, 'Number of retries cannot be negative')
})

export const workflowFormSchema = yup.object({
  name: yup
    .string()
    .required('Name is mandatory')
    .matches(/^\S+$/, 'Name must not contain spaces')
    .test(
      'uniqueWorkflowName',
      'Workflow name must be unique',
      checkWorkflowNameUniqueValidation
    ),
  displayName: yup
    .string()
    .required('Name is mandatory')
    .matches(/^\S+$/, 'Name must not contain spaces')
    .test(
      'uniqueWorkflowName',
      'Workflow name must be unique',
      checkWorkflowNameUniqueValidation
    ),
  isWorkflowNameUnique: yup.boolean(),
  description: yup.string().required('Description is mandatory'),
  tags: yup.array().of(yup.string()).nullable(),
  schedule: scheduleSchema,
  maxConcurrentRuns: yup
    .number()
    .min(0, 'Max concurrent runs cannot be negative')
    .nullable(),
  numberOfRetries: yup.number().min(0, 'Retries cannot be negative').nullable(),
  parameters: yup.array().of(
    yup
      .object()
      .shape({
        id: yup.string().nullable(),
        label: yup.string().nullable(),
        value: yup.string().nullable()
      })
      .nullable()
      .test(
        'uniqueParameterLabel',
        'Parameter label must be unique',
        function (value, ctx) {
          return checkParameterValidation(value, ctx, this)
        }
      )
  ),
  slackChannel: yup
    .string()
    .matches(/^(?!#)/, 'Invalid slack channel, please remove the # ')
    .nullable(),
  notifications: yup
    .number()
    .min(1, 'Run Duration cannot be negative or zero')
    .max(720, 'Run Duration cannot be more than 720 minutes')
    .nullable(),
  queueEnabled: yup.boolean(),
  notification_preference: yup.object().shape({
    on_fail: yup.boolean(),
    on_start: yup.boolean(),
    on_success: yup.boolean(),
    on_skip: yup.boolean()
  }),
  tasks: yup
    .array()
    .of(
      yup.object().shape({
        name: yup
          .string()
          .required('Task name is mandatory')
          .matches(/^\S+$/, 'Task name must not contain spaces'),
        source: yup.string().required('Source is mandatory'),
        workspacePath: yup
          .string()
          .test(
            'validWorkspacePath',
            'Workspace path is mandatory',
            checkWorkspacePathValidation
          ),
        gitRepo: yup
          .string()
          .test(
            'validGitRepo',
            'Git repo is mandatory',
            checkGitRepoValidation
          ),
        filePath: yup
          .string()
          .test(
            'validFilePath',
            'File path is mandatory',
            checkFilePathValidation
          ),
        dynamicCode: yup.string().required('Dynamic code is mandatory'),
        haConfig: yup.object().shape({
          enableHA: yup.boolean()
        }),
        cluster: yup
          .object()
          .shape({
            name: yup.string().required('Cluster is mandatory')
          })
          .typeError('Cluster is required'),
        dependentLibraries: yup.string(),
        dependentOn: yup.array().of(yup.string()),
        parameters: yup.array().of(
          yup
            .object()
            .shape({
              id: yup.string().nullable(),
              label: yup.string().nullable(),
              value: yup.string().nullable()
            })
            .nullable()
            .test(
              'uniqueInputParameterLabel',
              'Task parameter label must be unique',
              function (value, ctx) {
                return checkInputParameterValidation(value, ctx, this)
              }
            )
        ),
        retries: yup
          .number()
          .typeError('Retries must be a number')
          .min(0, 'Retries cannot be negative')
          .nullable(),
        timeout: yup
          .number()
          .typeError('Timeout must be a number')
          .min(0, 'Timeout cannot be negative')
          .nullable(),
        slackChannel: yup
          .string()
          .matches(/^(?!#)/, 'Invalid slack channel, please remove the # ')
          .nullable(),
        notification_preference: yup.object().shape({
          on_fail: yup.boolean()
        })
      })
    )
    .test('uniqueTaskName', 'Task name must be unique', function (value, ctx) {
      const tasks = this.resolve(yup.ref('tasks')) as IWorkflowTaskForm[]
      const nonUniqueTaskIndex = tasks.findIndex(
        (task, index) => index !== tasks.findIndex((t) => t.name === task.name)
      )
      if (nonUniqueTaskIndex === -1) {
        return true
      }

      return ctx.createError({
        message: `Task name must be unique`,
        path: `tasks.${nonUniqueTaskIndex}.name`
      })
    })
})

export const getDefaultTask = () => {
  return {
    id: uuidv4(),
    name: '',
    source: 'workspace',
    workspacePath: '',
    gitRepo: '',
    filePath: '',
    dynamicCode: true,
    cluster: null,
    packages: [],
    dependentLibraries: '',
    dependentOn: [],
    notify_on: '',
    trigger_rule: {
      id: 1,
      label: 'All Success',
      value: 'all_success',
      description: 'All upstream tasks have succeeded (default)'
    },
    notification_preference: {
      on_fail: true
    },
    parameters: [
      {
        id: uuidv4(),
        label: '',
        value: ''
      }
    ],
    retries: 1,
    timeout: 7200
  }
}

export const sourceTypes = [
  {
    label: 'Workspace',
    value: 'workspace'
  },
  {
    label: 'Git',
    value: 'git'
  }
]

export const invalidProjectId = -1
export const invalidCodespaceId = -1

export const TASK_OUTPUT_TYPES = {
  html: 'html',
  commuter: 'commuter',
  string: 'string'
}

export const getDefaultWorkflowParameters = () => {
  return {
    id: uuidv4(),
    label: '',
    value: ''
  }
}
