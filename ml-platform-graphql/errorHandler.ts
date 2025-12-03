export interface GraphQLErrorType {
  message: string
  path: string
  status: string
  originalError: Object
}

/**
 * used to format error forwarded from API
 * @param {Error} error
 * @return {Object}
 */
export const formatError = (error: GraphQLErrorType) => {
  const apiError: any = error.originalError
  if (!apiError) {
    return error
  }
  try {
    return {
      message: JSON.parse(apiError.error).error.MsgText,
      error: JSON.parse(apiError.error).error,
      path: error.path,
      status: apiError.statusCode,
    }
  } catch (r) {
    return {
      message: apiError.message,
      error: [],
      path: error.path,
      status: apiError.statusCode,
    }
  }
}
