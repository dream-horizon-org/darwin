const parseWorkflowTask = async (request, data) => {
  const res = {
    codespace_id: -1,
    project_id: -1,
  }
  const workspacePath = data.source + '/' + data.file_path

  try {
    const pathDetailsData = await request.loader.getWorkflowPathDetailsLoader.load(
      JSON.stringify({codespace_path: workspacePath})
    )
    if (pathDetailsData.status === 'SUCCESS') {
      res.codespace_id = pathDetailsData?.data[0].codespace_id
      res.project_id = pathDetailsData?.data[0].project_id
    }
  } catch (error) {}

  return res
}

export const getWorkflowTaskDetailsParser = async (request, data) => {
  const parsedRes = {
    data: {
      workflow_id: data?.data?.workflow_id,
      run_id: data?.data?.run_id,
      task_id: data?.data?.task_id,
      source: data?.data?.source,
      source_type: data?.data?.source_type,
      file_path: data?.data?.file_path,
      dynamic_artifact: data?.data?.dynamic_artifact,
      dependent_libraries: data?.data?.dependent_libraries,
      input_parameters: data?.data?.input_parameters,
      retries: data?.data?.retries,
      timeout: data?.data?.timeout,
      task_validation_status: data?.data?.task_validation_status,
      run_status: data?.data?.run_status,
      depends_on: data?.data?.depends_on,
      output: data?.data?.output,
      message: data?.data?.message,
      packages: data?.data?.packages,
      codespace_id: -1,
      project_id: -1,
      notify_on: data?.data?.notify_on,
      notification_preference: data?.data?.notification_preference,
      trigger_rule: data?.data?.trigger_rule,
    },
  }

  if (data?.data?.source_type === 'workspace') {
    try {
      const newPathIds = await parseWorkflowTask(request, data.data)
      parsedRes.data.codespace_id = newPathIds.codespace_id
      parsedRes.data.project_id = newPathIds.project_id
    } catch (error) {
      parsedRes.data.codespace_id = -1
      parsedRes.data.project_id = -1
    }
  }
  return parsedRes
}
