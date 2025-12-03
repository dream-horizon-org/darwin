export const camelToSnakeCase = (str) =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)

export const camelToSnakeObject: any = (obj) => {
  if (!obj) return

  return Object.keys(obj).reduce((prev, curr) => {
    let value = obj[curr]
    if (!Array.isArray(value) && typeof value === 'object') {
      value = camelToSnakeObject(value)
    } else if (Array.isArray(value) && typeof value === 'object') {
      value = value.map((v) => {
        if (!Array.isArray(v) && typeof v === 'object') {
          return camelToSnakeObject(v)
        } else {
          return v
        }
      })
    }
    const newKey = camelToSnakeCase(curr)
    prev[newKey] = value
    return prev
  }, {})
}

export const camelToSnakeCaseObjectV2: any = (obj) => {
  if (!obj) return

  return Object.keys(obj).reduce((prev, curr) => {
    let value = obj[curr]
    if (curr === 'inputParameters') {
      const newKey = camelToSnakeCase(curr)
      prev[newKey] = value
      return prev
    }

    if (value && !Array.isArray(value) && typeof value === 'object') {
      value = camelToSnakeCaseObjectV2(value)
    } else if (Array.isArray(value) && typeof value === 'object') {
      value = value.map((v) => {
        if (!Array.isArray(v) && typeof v === 'object') {
          return camelToSnakeCaseObjectV2(v)
        } else {
          return v
        }
      })
    }
    const newKey = camelToSnakeCase(curr)
    prev[newKey] = value
    return prev
  }, {})
}

export const camelToSnakeCaseObjectWithExclusions: any = (
  obj,
  excludedKeys: Array<string>
) => {
  if (!obj) return

  return Object.keys(obj).reduce((prev, curr) => {
    let value = obj[curr]
    if (excludedKeys && excludedKeys.includes(curr)) {
      const newKey = camelToSnakeCase(curr)
      prev[newKey] = value
      return prev
    }

    if (value && !Array.isArray(value) && typeof value === 'object') {
      value = camelToSnakeCaseObjectWithExclusions(value, excludedKeys)
    } else if (Array.isArray(value) && typeof value === 'object') {
      value = value.map((v) => {
        if (!Array.isArray(v) && typeof v === 'object') {
          return camelToSnakeCaseObjectWithExclusions(v, excludedKeys)
        } else {
          return v
        }
      })
    }
    const newKey = camelToSnakeCase(curr)
    prev[newKey] = value
    return prev
  }, {})
}

export const getAppLayerServiceNameForCompute = () => {
  if (process.env.VPC_SUFFIX && process.env.VPC_SUFFIX === '-stag')
    return 'MLP_COMPUTE_STAG'
  else if (process.env.TEAM_SUFFIX && process.env.TEAM_SUFFIX === '-uat')
    return 'MLP_COMPUTE_UAT'
  else return 'MLP_COMPUTE_PROD'
}

export const getAppLayerServiceNameForModelDeployments = () => {
  if (process.env.VPC_SUFFIX && process.env.VPC_SUFFIX === '-stag')
    return 'MLP_ON_EDGE_STAG'
  else if (process.env.TEAM_SUFFIX && process.env.TEAM_SUFFIX === '-uat')
    return 'MLP_ON_EDGE_UAT'
  else return 'MLP_ON_EDGE_PROD'
}

export const getAppLayerServiceNameForMLFlow = () => {
  if (process.env.VPC_SUFFIX && process.env.VPC_SUFFIX === '-stag')
    return 'MLP_ML_FLOW_STAG'
  else if (process.env.TEAM_SUFFIX && process.env.TEAM_SUFFIX === '-uat')
    return 'MLP_ML_FLOW_UAT'
  else return 'MLP_ML_FLOW_PROD'
}

export const getAppLayerServiceNameForWorkspace = () => {
  if (process.env.VPC_SUFFIX && process.env.VPC_SUFFIX === '-stag')
    return 'MLP_WORKSPACE_STAG'
  else if (process.env.TEAM_SUFFIX && process.env.TEAM_SUFFIX === '-uat')
    return 'MLP_WORKSPACE_UAT'
  else return 'MLP_WORKSPACE_PROD'
}

export const getAppLayerServiceNameForWorkflows = () => {
  if (process.env.VPC_SUFFIX && process.env.VPC_SUFFIX === '-stag')
    return 'MLP_WORKFLOWS_STAG'
  else if (process.env.TEAM_SUFFIX && process.env.TEAM_SUFFIX === '-uat')
    return 'MLP_WORKFLOWS_UAT'
  else return 'MLP_WORKFLOWS_PROD'
}

export const getAppLayerServiceNameForBringYourOwnRuntime = () => {
  if (process.env.VPC_SUFFIX && process.env.VPC_SUFFIX === '-stag')
    return 'MLP_BYOR_STAG'
  else if (process.env.TEAM_SUFFIX && process.env.TEAM_SUFFIX === '-uat')
    return 'MLP_BYOR_UAT'
  else return 'MLP_BYOR_PROD'
}

export const getAppLayerServiceNameForCatalog = () => {
  if (process.env.VPC_SUFFIX && process.env.VPC_SUFFIX === '-stag')
    return 'MLP_CATALOG_STAG'
  else if (process.env.TEAM_SUFFIX && process.env.TEAM_SUFFIX === '-uat')
    return 'MLP_CATALOG_UAT'
  else return 'MLP_CATALOG_PROD'
}
