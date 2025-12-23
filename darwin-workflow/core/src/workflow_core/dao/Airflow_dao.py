from workflow_core.dao.mysql_dao import MysqlDao
from workflow_core.dao.queries.sql_queries import (
    GET_LATEST_DAG_RUNS, GET_DAG_DETAILS, GET_LATEST_STATE, GET_ALL_DAG_DETAILS,
    GET_LATEST_DAG_RUNS_FOR_ALL_DAGS_BEGIN, GET_LATEST_DAG_RUNS_FOR_ALL_DAGS_END, GET_WORKFLOW_TASK_FAILURES,
    GET_WORKFLOW_LATEST_RETRY_TIME, GET_ALL_TASK_INSTANCE_FOR_A_RUN, GET_VARIABLE
)


class AirflowDao:
    def __init__(self, env: str):
        self._mysql_dao = MysqlDao(env)

    async def initialize(self):
        await self._mysql_dao.initialize_database_connection_pool()

    def healthcheck(self):
        return self._mysql_dao.healthcheck()

    def execute_mysql_get_dag_details_async(self, dag_id):
        query = GET_DAG_DETAILS
        params = (dag_id,)
        return self._mysql_dao.execute_mysql_query_async(query, params)

    async def execute_mysql_get_all_dag_details_async(self, dag_id_list):
        if len(dag_id_list) == 0:
            return []
        param_string = ','.join('%s' for _ in dag_id_list)
        query = GET_ALL_DAG_DETAILS + "(" + param_string + ");"
        params = tuple(dag_id_list)
        dag_detail_list_tuple = await self._mysql_dao.execute_mysql_query_async(query, params)
        keys = ['dag_id', 'is_paused', 'next_dagrun']
        dag_detail_list = self.get_list_from_list_of_tuples(dag_detail_list_tuple, keys)
        return dag_detail_list

    def execute_mysql_latest_dag_runs_async(self, dag_id):
        query = GET_LATEST_DAG_RUNS
        params = (dag_id,)
        return self._mysql_dao.execute_mysql_query_async(query, params)

    async def execute_mysql_latest_dag_runs_for_all_dags_async(self, dag_id_list):
        if len(dag_id_list) == 0:
            return []
        param_string = ','.join('%s' for _ in dag_id_list)
        query = GET_LATEST_DAG_RUNS_FOR_ALL_DAGS_BEGIN + param_string + GET_LATEST_DAG_RUNS_FOR_ALL_DAGS_END
        params = tuple(dag_id_list)
        dag_run_list_tuple = await self._mysql_dao.execute_mysql_query_async(query, params)
        keys = ['state', 'dag_id', 'execution_date']
        dag_run_list = self.get_list_from_list_of_tuples(dag_run_list_tuple, keys)
        return dag_run_list

    def execute_mysql_get_latest_state_async(self, dag_id):
        query = GET_LATEST_STATE
        params = (dag_id,)
        return self._mysql_dao.execute_mysql_query_async(query, params)

    def get_list_from_list_of_tuples(self, list_of_tuples, headers):
        return [dict(zip(headers, row)) for row in list_of_tuples]

    def execute_mysql_get_workflow_task_failures(self, dag_id: str, run_id: str, task_id: str):
        query = GET_WORKFLOW_TASK_FAILURES
        params = (dag_id, run_id, task_id)
        return self._mysql_dao.execute_mysql_query_async(query, params)

    def execute_mysql_get_workflow_latest_retry_time(self, dag_id: str, run_id: str, task_id: str):
        query = GET_WORKFLOW_LATEST_RETRY_TIME
        params = (dag_id, run_id, task_id)
        return self._mysql_dao.execute_mysql_query_async(query, params)

    def execute_mysql_get_all_task_instances_for_a_run(self, dag_id: str, run_id: str):
        query = GET_ALL_TASK_INSTANCE_FOR_A_RUN
        params = (dag_id, run_id)
        return self._mysql_dao.execute_mysql_query_async(query, params)

    def execute_mysql_get_variable(self, key: str):
        query = GET_VARIABLE
        params = (key,)
        return self._mysql_dao.execute_mysql_query_async(query, params)