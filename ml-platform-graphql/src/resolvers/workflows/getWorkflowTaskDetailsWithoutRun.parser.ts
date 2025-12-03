const parseWorkflowTaskWithoutRun = async (request, data) => {
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

export const getWorkflowTaskDetailsWithoutRunParser = async (request, data) => {
  const parsedRes = {
    data: {
      workflow_id: data?.data?.workflow_id,
      run_id: data?.data?.run_id,
      task_id: data?.data?.task_id,
      start_time: data?.data?.start_time,
      end_time: data?.data?.end_time,
      duration: data?.data?.duration,
      source_type: data?.data?.source_type,
      file_path: data?.data?.file_path,
      dynamic_artifact: data?.data?.dynamic_artifact,
      source: data?.data?.source,
      dependent_libraries: data?.data?.dependent_libraries,
      depends_on: data?.data?.depends_on,
      input_parameters: data?.data?.input_parameters,
      retries: data?.data?.retries,
      timeout: data?.data?.timeout,
      attached_cluster: data?.data?.attached_cluster,
      task_validation_status: data?.data?.task_validation_status,
      run_status: data?.data?.run_status,
      trigger: data?.data?.trigger,
      trigger_by: data?.data?.trigger_by,
      latest_try_output: data?.data?.latest_try_output,
      task_events: data?.data?.task_events,
      packages: data?.data?.packages,
      message: data?.data?.message,
      project_id: -1,
      codespace_id: -1,
      notify_on: data?.data?.notify_on,
      notification_preference: data?.data?.notification_preference,
      trigger_rule: data?.data?.trigger_rule,
    },
  }

  if (data?.data?.source_type === 'workspace') {
    try {
      const newPathIds = await parseWorkflowTaskWithoutRun(request, data.data)
      parsedRes.data.codespace_id = newPathIds.codespace_id
      parsedRes.data.project_id = newPathIds.project_id
    } catch (error) {
      parsedRes.data.codespace_id = -1
      parsedRes.data.project_id = -1
    }
  }
  return parsedRes
}
