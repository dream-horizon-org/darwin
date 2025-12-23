import logging

logger = logging.getLogger('darwin_workflow')


def raise_on_failure(err:str, exit_on_failure:bool):
    """
    Handles failure conditions based on the exit_on_failure flag.

    Args:
        err: Error message to raise or print
        exit_on_failure: If True, raises an exception with the error message
                         If False, prints a warning message and continues execution

    Raises:
        Exception: If exit_on_failure is True
    """
    if exit_on_failure:
        raise Exception(err)
    else:
        logger.warning(err)


def get_green_text(text: str) -> str:
    return f"\033[1;92m{text}\033[0m"


def get_final_log_message(success_resp:list, failure_resp:list, dry_run:bool, operation:str):
    """
    Returns a success response message based on the operation type.
    Args:
        failure_resp: List of failure responses
        success_resp: List of success responses
        dry_run: Dry run flag
        operation: Operation is creating or updating
    Returns:
        Success/Error final message string
    """
    if dry_run:
        if failure_resp:
            if success_resp:
                logger.info(f"{get_green_text('SUCCESS')}: Partial Success in validating workflows: {success_resp}, failures in validating workflows: {failure_resp}")
            else:
                logger.error(f"failures in validating workflows: {failure_resp}")
        else:
            logger.info(f"{get_green_text('SUCCESS')}: Validation passed")
    else:
        if failure_resp:
            if success_resp:
                logger.info(f"{get_green_text('SUCCESS')}: Partial Success in {operation} workflows: {success_resp}, failures in {operation} workflows: {failure_resp}")
            else:
                logger.error(f"failures in {operation} workflows: {failure_resp}")
        else:
            logger.info(f"{get_green_text('SUCCESS')}: {operation} workflows: {success_resp}")


def get_error_message(e:Exception, dry_run:bool, workflow_name:str, operation:str):
    """
    Returns an error message based on the exception type and operation.
    Args:
        e: Exception object
        dry_run: Dry run flag
        workflow_name: Name of the workflow
        operation: Operation is creating or updating
    Returns:
        Tuple containing error message and error details
    """
    err_message = f"Failed {operation} workflow - {workflow_name}"
    if dry_run:
        err_message = f"Failed validating workflow - {workflow_name}"
    err_args = e.args
    if len(err_args) == 2:
        if 'message' in err_args[1]:
            # as response message if of type {'message': 'error message', 'status': 'error'}
            err = err_args[1]['message']
        else:
            err = err_args[1]
    else:
        err = e
    return err_message, err
